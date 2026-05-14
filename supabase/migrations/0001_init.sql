-- Inicijalna šema: klijenti, fakture, stavke_fakture
-- View `fakture_lista`, trigger za `updated_at` i RLS politike.

create extension if not exists pgcrypto;

create type public.faktura_status as enum ('nacrt', 'na_cekanju', 'placeno', 'kasni');

create table public.klijenti (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  naziv text not null,
  pib text,
  maticni_broj text,
  email text,
  telefon text,
  ulica text,
  grad text,
  postanski_broj text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint klijenti_user_pib_unique unique (user_id, pib),
  constraint klijenti_user_email_unique unique (user_id, email)
);

create index klijenti_user_id_idx on public.klijenti(user_id);

create table public.fakture (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  klijent_id uuid references public.klijenti(id) on delete restrict,
  broj text not null,
  referenca text,
  datum_izdavanja date,
  datum_placanja date,
  napomene text,
  pdv_procenat numeric(5,2) not null default 20,
  popust numeric(14,2) not null default 0,
  status public.faktura_status not null default 'nacrt',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint fakture_user_broj_unique unique (user_id, broj)
);

create index fakture_user_id_datum_idx on public.fakture(user_id, datum_izdavanja desc);
create index fakture_klijent_id_idx on public.fakture(klijent_id);
create index fakture_status_idx on public.fakture(user_id, status);

create table public.stavke_fakture (
  id uuid primary key default gen_random_uuid(),
  faktura_id uuid not null references public.fakture(id) on delete cascade,
  naziv text not null,
  opis text,
  kolicina numeric(12,3) not null default 0,
  cena numeric(14,2) not null default 0,
  redosled int not null default 0,
  created_at timestamptz not null default now()
);

create index stavke_fakture_faktura_id_idx on public.stavke_fakture(faktura_id, redosled);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger trg_klijenti_updated
  before update on public.klijenti
  for each row execute function public.set_updated_at();

create trigger trg_fakture_updated
  before update on public.fakture
  for each row execute function public.set_updated_at();

-- View `fakture_lista` koristi `security_invoker` da nasledi RLS pozivaoca,
-- pa nije potrebna posebna politika nad view-om.
create or replace view public.fakture_lista
with (security_invoker = on) as
select
  f.id,
  f.user_id,
  f.broj,
  coalesce(k.naziv, '') as klijent_naziv,
  coalesce(k.email, '') as klijent_email,
  f.datum_izdavanja,
  f.datum_placanja,
  f.status,
  coalesce(
    (select sum(s.kolicina * s.cena) from public.stavke_fakture s where s.faktura_id = f.id),
    0
  ) * (1 + f.pdv_procenat / 100) - f.popust as iznos
from public.fakture f
left join public.klijenti k on k.id = f.klijent_id;

alter table public.klijenti enable row level security;
alter table public.fakture enable row level security;
alter table public.stavke_fakture enable row level security;

create policy "klijenti_owner_all" on public.klijenti
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "fakture_owner_all" on public.fakture
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "stavke_owner_all" on public.stavke_fakture
  for all
  using (
    exists (
      select 1 from public.fakture f
      where f.id = stavke_fakture.faktura_id
        and f.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.fakture f
      where f.id = stavke_fakture.faktura_id
        and f.user_id = auth.uid()
    )
  );

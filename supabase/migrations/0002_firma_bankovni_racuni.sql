-- Podaci firme (jedan zapis po korisniku) i bankovni računi

create table public.firma (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  naziv text not null default '',
  pib text,
  maticni_broj text,
  adresa text,
  email text,
  telefon text,
  valuta text not null default 'RSD',
  pdv_procenat numeric(5,2) not null default 20,
  rok_placanja_dana int not null default 15,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint firma_user_id_unique unique (user_id)
);

create index firma_user_id_idx on public.firma(user_id);

create trigger trg_firma_updated
  before update on public.firma
  for each row execute function public.set_updated_at();

create table public.bankovni_racuni (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  naziv_banke text not null,
  broj_racuna text not null,
  na_ime text,
  swift text,
  je_podrazumevani boolean not null default false,
  redosled int not null default 0,
  created_at timestamptz not null default now()
);

create index bankovni_racuni_user_id_idx on public.bankovni_racuni(user_id, redosled);

alter table public.firma enable row level security;
alter table public.bankovni_racuni enable row level security;

create policy "firma_owner_all" on public.firma
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "bankovni_racuni_owner_all" on public.bankovni_racuni
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

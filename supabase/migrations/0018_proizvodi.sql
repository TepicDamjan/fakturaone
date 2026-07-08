-- Katalog proizvoda i usluga po firmi, za brze popunjavanje stavki dokumenata.

create table if not exists public.proizvodi (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  firma_id uuid not null references public.firma(id) on delete cascade,
  naziv text not null,
  opis text,
  jedinica text not null default 'kom',
  cena numeric(12,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists proizvodi_firma_naziv_unique
  on public.proizvodi (firma_id, lower(naziv));

create index if not exists proizvodi_firma_id_idx
  on public.proizvodi (firma_id);

alter table public.proizvodi enable row level security;

drop policy if exists "proizvodi_firma_owner_all" on public.proizvodi;
create policy "proizvodi_firma_owner_all" on public.proizvodi
  for all
  using (public.firma_pripada_korisniku(firma_id))
  with check (public.firma_pripada_korisniku(firma_id));

drop trigger if exists trg_proizvodi_updated_at on public.proizvodi;
create trigger trg_proizvodi_updated_at
  before update on public.proizvodi
  for each row
  execute function public.set_updated_at();

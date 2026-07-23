-- Šabloni dokumenata i ponavljajuće fakture.

create table if not exists public.dokument_sabloni (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  firma_id uuid not null references public.firma(id) on delete cascade,
  naziv text not null,
  tip_dokumenta public.tip_dokumenta not null default 'faktura',
  klijent_id uuid references public.klijenti(id) on delete set null,
  referenca text,
  napomene text,
  pdv_procenat numeric(5,2) not null default 17,
  popust numeric(14,2) not null default 0,
  stavke jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists dokument_sabloni_firma_id_idx
  on public.dokument_sabloni (firma_id);

alter table public.dokument_sabloni enable row level security;

drop policy if exists "dokument_sabloni_firma_owner_all" on public.dokument_sabloni;
create policy "dokument_sabloni_firma_owner_all" on public.dokument_sabloni
  for all
  using (public.firma_pripada_korisniku(firma_id))
  with check (public.firma_pripada_korisniku(firma_id));

drop trigger if exists trg_dokument_sabloni_updated_at on public.dokument_sabloni;
create trigger trg_dokument_sabloni_updated_at
  before update on public.dokument_sabloni
  for each row
  execute function public.set_updated_at();

-- Ponavljajuće fakture (mjesečno / sedmično / godišnje).
create table if not exists public.ponavljajuce_fakture (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  firma_id uuid not null references public.firma(id) on delete cascade,
  klijent_id uuid not null references public.klijenti(id) on delete restrict,
  naziv text not null,
  referenca text,
  napomene text,
  pdv_procenat numeric(5,2) not null default 17,
  popust numeric(14,2) not null default 0,
  stavke jsonb not null default '[]'::jsonb,
  frekvencija text not null
    check (frekvencija in ('sedmicno', 'mjesecno', 'godisnje')),
  rok_placanja_dana integer not null default 15
    check (rok_placanja_dana >= 0 and rok_placanja_dana <= 365),
  sljedeci_datum date not null,
  aktivan boolean not null default true,
  zadnji_faktura_id uuid references public.fakture(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ponavljajuce_fakture_cron_idx
  on public.ponavljajuce_fakture (aktivan, sljedeci_datum)
  where aktivan = true;

create index if not exists ponavljajuce_fakture_firma_id_idx
  on public.ponavljajuce_fakture (firma_id);

alter table public.ponavljajuce_fakture enable row level security;

drop policy if exists "ponavljajuce_fakture_firma_owner_all" on public.ponavljajuce_fakture;
create policy "ponavljajuce_fakture_firma_owner_all" on public.ponavljajuce_fakture
  for all
  using (public.firma_pripada_korisniku(firma_id))
  with check (public.firma_pripada_korisniku(firma_id));

drop trigger if exists trg_ponavljajuce_fakture_updated_at on public.ponavljajuce_fakture;
create trigger trg_ponavljajuce_fakture_updated_at
  before update on public.ponavljajuce_fakture
  for each row
  execute function public.set_updated_at();

-- Broj dokumenta za service-role cron (bez auth.uid() provjere).
create or replace function public.sledeci_broj_dokumenta_servis(
  p_firma_id uuid,
  p_tip public.tip_dokumenta
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_godina integer := extract(year from current_date)::integer;
  v_broj integer;
  v_prefiks text;
begin
  insert into public.brojaci_dokumenata (firma_id, tip_dokumenta, godina, sledeci)
  values (p_firma_id, p_tip, v_godina, 2)
  on conflict (firma_id, tip_dokumenta, godina)
  do update set sledeci = brojaci_dokumenata.sledeci + 1
  returning sledeci - 1 into v_broj;

  v_prefiks := case p_tip
    when 'faktura' then 'FAK'
    when 'predracun' then 'PRE'
    when 'otpremnica' then 'OTP'
    when 'kreditna_nota' then 'KRE'
  end;

  return v_prefiks || '-' || v_godina || '-' || lpad(v_broj::text, 4, '0');
end;
$$;

revoke all on function public.sledeci_broj_dokumenta_servis(uuid, public.tip_dokumenta) from public;
grant execute on function public.sledeci_broj_dokumenta_servis(uuid, public.tip_dokumenta) to service_role;

-- BiH unapređenja: avansna faktura, PDV po stavci, knjiga uplata,
-- oslobođenje od PDV-a, opcije ponavljajućih faktura.

alter type public.tip_dokumenta add value if not exists 'avansna';

alter table public.fakture
  add column if not exists pdv_oslobodjenje_napomena text;

alter table public.stavke_fakture
  add column if not exists pdv_procenat numeric(5, 2);

alter table public.ponavljajuce_fakture
  add column if not exists posalji_email boolean not null default false,
  add column if not exists zavrsni_datum date,
  add column if not exists max_ponavljanja integer,
  add column if not exists broj_generisanih integer not null default 0;

create table if not exists public.uplate (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  firma_id uuid not null references public.firma(id) on delete cascade,
  faktura_id uuid not null references public.fakture(id) on delete cascade,
  iznos numeric(14, 2) not null check (iznos > 0),
  datum date not null default current_date,
  nacin text not null default 'ostalo',
  napomena text,
  created_at timestamptz not null default now()
);

create index if not exists uplate_faktura_id_idx on public.uplate (faktura_id);
create index if not exists uplate_firma_id_idx on public.uplate (firma_id);

alter table public.uplate enable row level security;

drop policy if exists "uplate_firma_owner_all" on public.uplate;
create policy "uplate_firma_owner_all" on public.uplate
  for all
  using (public.firma_pripada_korisniku(firma_id))
  with check (public.firma_pripada_korisniku(firma_id));

create or replace function public.sledeci_broj_dokumenta(
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
  if not public.firma_pripada_korisniku(p_firma_id) then
    raise exception 'Firma ne pripada korisniku';
  end if;

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
    when 'avansna' then 'AVA'
    else 'DOK'
  end;

  return v_prefiks || '-' || v_godina || '-' || lpad(v_broj::text, 4, '0');
end;
$$;

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
    when 'avansna' then 'AVA'
    else 'DOK'
  end;

  return v_prefiks || '-' || v_godina || '-' || lpad(v_broj::text, 4, '0');
end;
$$;

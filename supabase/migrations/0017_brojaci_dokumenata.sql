-- Sekvencijalna numeracija dokumenata po firmi, tipu i godini.
-- Broj se dodeljuje atomski (insert ... on conflict do update), pa nema
-- duplikata ni pri istovremenom kreiranju vise dokumenata.

create table if not exists public.brojaci_dokumenata (
  firma_id uuid not null references public.firma(id) on delete cascade,
  tip_dokumenta public.tip_dokumenta not null,
  godina integer not null,
  sledeci integer not null default 1,
  primary key (firma_id, tip_dokumenta, godina)
);

alter table public.brojaci_dokumenata enable row level security;

drop policy if exists "brojaci_firma_owner_all" on public.brojaci_dokumenata;
create policy "brojaci_firma_owner_all" on public.brojaci_dokumenata
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
  -- security definer zaobilazi RLS, pa se vlasnistvo proverava eksplicitno
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
  end;

  return v_prefiks || '-' || v_godina || '-' || lpad(v_broj::text, 4, '0');
end;
$$;

grant execute on function public.sledeci_broj_dokumenta(uuid, public.tip_dokumenta) to authenticated;

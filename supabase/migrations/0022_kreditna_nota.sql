-- Kreditna nota (storno) kao tip dokumenta.

alter type public.tip_dokumenta add value if not exists 'kreditna_nota';

-- Prefiks KRE-YYYY-NNNN mora biti u istoj funkciji (recreate).
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
  end;

  return v_prefiks || '-' || v_godina || '-' || lpad(v_broj::text, 4, '0');
end;
$$;

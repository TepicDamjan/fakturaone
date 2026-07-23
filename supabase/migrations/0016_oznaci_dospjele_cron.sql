-- Verzija oznaci_dospjele_fakture za pozadinski cron (service role):
-- azurira dospele fakture SVIH korisnika, pa se skida sa read putanje u aplikaciji.

create or replace function public.oznaci_dospjele_fakture_sve()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_count integer;
begin
  update public.fakture
  set status = 'kasni'
  where status = 'na_cekanju'
    and tip_dokumenta = 'faktura'
    and datum_placanja is not null
    and datum_placanja < current_date;

  get diagnostics updated_count = row_count;
  return updated_count;
end;
$$;

-- Samo service role sme da poziva (service role zaobilazi grantove).
revoke execute on function public.oznaci_dospjele_fakture_sve() from public;
revoke execute on function public.oznaci_dospjele_fakture_sve() from anon;
revoke execute on function public.oznaci_dospjele_fakture_sve() from authenticated;

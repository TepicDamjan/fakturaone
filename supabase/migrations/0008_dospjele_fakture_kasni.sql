-- Automatski status "kasni" kada prođe rok plaćanja (datum_placanja).

create or replace function public.fakture_proveri_dospijece()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'na_cekanju'
    and new.tip_dokumenta = 'faktura'
    and new.datum_placanja is not null
    and new.datum_placanja < current_date
  then
    new.status := 'kasni';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_fakture_proveri_dospijece on public.fakture;

create trigger trg_fakture_proveri_dospijece
  before insert or update on public.fakture
  for each row
  execute function public.fakture_proveri_dospijece();

-- Poziva se iz aplikacije pri učitavanju lista (RLS: samo fakture ulogovanog korisnika).
create or replace function public.oznaci_dospjele_fakture()
returns integer
language plpgsql
security invoker
set search_path = public
as $$
declare
  updated_count integer;
begin
  update public.fakture
  set status = 'kasni'
  where user_id = auth.uid()
    and status = 'na_cekanju'
    and tip_dokumenta = 'faktura'
    and datum_placanja is not null
    and datum_placanja < current_date;

  get diagnostics updated_count = row_count;
  return updated_count;
end;
$$;

grant execute on function public.oznaci_dospjele_fakture() to authenticated;

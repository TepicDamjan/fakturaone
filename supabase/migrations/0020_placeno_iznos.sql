-- Djelimična plaćanja: koliko je do sada uplaćeno na fakturi.

alter table public.fakture
  add column if not exists placeno_iznos numeric(14, 2) not null default 0
  check (placeno_iznos >= 0);

comment on column public.fakture.placeno_iznos is
  'Ukupan iznos do sada evidentiranih uplata (BAM).';

drop view if exists public.fakture_lista;

create view public.fakture_lista
with (security_invoker = on) as
select
  f.id,
  f.user_id,
  f.firma_id,
  f.broj,
  f.tip_dokumenta,
  coalesce(k.naziv, '') as klijent_naziv,
  coalesce(k.email, '') as klijent_email,
  f.datum_izdavanja,
  f.datum_placanja,
  f.status,
  f.placeno_iznos,
  coalesce(
    (select sum(s.kolicina * s.cena) from public.stavke_fakture s where s.faktura_id = f.id),
    0
  ) * (1 + f.pdv_procenat / 100) - f.popust as iznos
from public.fakture f
left join public.klijenti k on k.id = f.klijent_id;

-- Tip dokumenta (faktura | predračun | otpremnica) na tabeli `fakture`.
-- Tabela ostaje `fakture` zbog kompatibilnosti, ali je sada zapravo kontejner
-- za sve tipove izlaznih dokumenata.
-- Migracija je idempotentna — može se bezbedno pokretati više puta.

do $$
begin
  if not exists (select 1 from pg_type where typname = 'tip_dokumenta') then
    create type public.tip_dokumenta as enum (
      'faktura',
      'predracun',
      'otpremnica'
    );
  end if;
end $$;

alter table public.fakture
  add column if not exists tip_dokumenta public.tip_dokumenta
  not null default 'faktura';

create index if not exists fakture_user_tip_idx
  on public.fakture(user_id, tip_dokumenta);

-- Ažuriraj view da uključi tip dokumenta.
-- Napomena: `create or replace view` ne dozvoljava ubacivanje kolone u sredinu
-- postojećeg redosleda — moramo dropovati pa ponovo kreirati.
drop view if exists public.fakture_lista;

create view public.fakture_lista
with (security_invoker = on) as
select
  f.id,
  f.user_id,
  f.broj,
  f.tip_dokumenta,
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

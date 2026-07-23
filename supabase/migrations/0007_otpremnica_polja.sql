-- Dodatna polja potrebna za otpremnicu i jedinica mere za stavke.
-- Migracija je idempotentna.

alter table public.stavke_fakture
  add column if not exists jedinica text not null default 'kom';

alter table public.fakture
  add column if not exists nacin_transporta text;

alter table public.fakture
  add column if not exists adresa_dostave text;

alter table public.fakture
  add column if not exists registracija_vozila text;

alter table public.fakture
  add column if not exists vozac text;

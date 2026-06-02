-- Više firmi po korisniku + grad i poštanski broj za formu preduzeća.

alter table public.firma
  drop constraint if exists firma_user_id_unique;

alter table public.firma
  add column if not exists grad text,
  add column if not exists postanski_broj text;

create index if not exists firma_user_created_idx
  on public.firma(user_id, created_at desc);

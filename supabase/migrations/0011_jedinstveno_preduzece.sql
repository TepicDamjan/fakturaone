-- Jedno preduzeće (PIB) po korisniku — kroz sve firme i klijente.

alter table public.klijenti drop constraint if exists klijenti_firma_pib_unique;
alter table public.klijenti drop constraint if exists klijenti_firma_email_unique;

drop index if exists public.klijenti_user_pib_unique;
create unique index klijenti_user_pib_unique
  on public.klijenti (user_id, pib)
  where pib is not null;

drop index if exists public.klijenti_user_email_unique;
create unique index klijenti_user_email_unique
  on public.klijenti (user_id, email)
  where email is not null;

drop index if exists public.firma_user_pib_unique;
create unique index firma_user_pib_unique
  on public.firma (user_id, pib)
  where pib is not null;

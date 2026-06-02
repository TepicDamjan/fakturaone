-- Klijent: jedinstven PIB/email po firmi (ne po korisniku).
-- Isti klijent (PIB) može postojati u više firmi i kod više korisnika.

drop index if exists public.klijenti_user_pib_unique;
drop index if exists public.klijenti_user_email_unique;

alter table public.klijenti drop constraint if exists klijenti_firma_pib_unique;
alter table public.klijenti drop constraint if exists klijenti_firma_email_unique;

drop index if exists public.klijenti_firma_pib_unique;
create unique index klijenti_firma_pib_unique
  on public.klijenti (firma_id, pib)
  where pib is not null;

drop index if exists public.klijenti_firma_email_unique;
create unique index klijenti_firma_email_unique
  on public.klijenti (firma_id, email)
  where email is not null;

-- firma_user_pib_unique ostaje: vaša preduzeća ne smiju dijeliti PIB na istom nalogu.

-- Prebacivanje podrazumevane valute na BAM (Konvertibilna marka) za BiH tržište.
-- Takođe ažuriramo podrazumevani PDV sa 20% (Srbija) na 17% (BiH).

alter table public.firma
  alter column valuta set default 'BAM';

alter table public.firma
  alter column pdv_procenat set default 17;

-- Migriraj postojeće zapise koji su još uvek na starim podrazumevanim vrednostima.
update public.firma
set valuta = 'BAM'
where valuta = 'RSD';

update public.firma
set pdv_procenat = 17
where pdv_procenat = 20;

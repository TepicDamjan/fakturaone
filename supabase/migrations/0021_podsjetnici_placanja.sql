-- Email podsjetnici za plaćanje faktura.

alter table public.firma
  add column if not exists podsjetnici_ukljuceni boolean not null default true;

alter table public.firma
  add column if not exists podsjetnik_dana_prije integer not null default 3
  check (podsjetnik_dana_prije >= 0 and podsjetnik_dana_prije <= 30);

alter table public.fakture
  add column if not exists posljednji_podsjetnik_at timestamptz;

alter table public.fakture
  add column if not exists posljednji_podsjetnik_vrsta text
  check (
    posljednji_podsjetnik_vrsta is null
    or posljednji_podsjetnik_vrsta in ('prije', 'dospjelo')
  );

comment on column public.firma.podsjetnici_ukljuceni is
  'Automatski email podsjetnici klijentima za neplaćene fakture.';
comment on column public.firma.podsjetnik_dana_prije is
  'Koliko dana prije dospijeća poslati podsjetnik (0 = samo dospjeli).';

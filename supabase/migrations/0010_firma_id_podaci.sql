-- Podaci (klijenti, fakture, bankovni računi) vezani za firmu, ne samo korisnika.

-- 1) Kolone firma_id
alter table public.klijenti
  add column if not exists firma_id uuid references public.firma(id) on delete cascade;

alter table public.fakture
  add column if not exists firma_id uuid references public.firma(id) on delete cascade;

alter table public.bankovni_racuni
  add column if not exists firma_id uuid references public.firma(id) on delete cascade;

-- 2) Podrazumijevana firma za korisnike koji imaju podatke bez firme
insert into public.firma (user_id, naziv)
select distinct src.user_id, 'Moja firma'
from (
  select user_id from public.klijenti where firma_id is null
  union
  select user_id from public.fakture where firma_id is null
  union
  select user_id from public.bankovni_racuni where firma_id is null
) src
where not exists (
  select 1 from public.firma f where f.user_id = src.user_id
);

-- 3) Backfill — postojeći podaci idu na najstariju firmu korisnika
update public.klijenti k
set firma_id = sub.firma_id
from (
  select k2.id as klijent_id,
    (
      select f.id
      from public.firma f
      where f.user_id = k2.user_id
      order by f.created_at asc
      limit 1
    ) as firma_id
  from public.klijenti k2
  where k2.firma_id is null
) sub
where k.id = sub.klijent_id
  and sub.firma_id is not null;

update public.fakture fa
set firma_id = sub.firma_id
from (
  select fa2.id as faktura_id,
    (
      select f.id
      from public.firma f
      where f.user_id = fa2.user_id
      order by f.created_at asc
      limit 1
    ) as firma_id
  from public.fakture fa2
  where fa2.firma_id is null
) sub
where fa.id = sub.faktura_id
  and sub.firma_id is not null;

update public.bankovni_racuni br
set firma_id = sub.firma_id
from (
  select br2.id as racun_id,
    (
      select f.id
      from public.firma f
      where f.user_id = br2.user_id
      order by f.created_at asc
      limit 1
    ) as firma_id
  from public.bankovni_racuni br2
  where br2.firma_id is null
) sub
where br.id = sub.racun_id
  and sub.firma_id is not null;

-- 4) NOT NULL (samo ako nema osiroćenih redova)
alter table public.klijenti
  alter column firma_id set not null;

alter table public.fakture
  alter column firma_id set not null;

alter table public.bankovni_racuni
  alter column firma_id set not null;

-- 5) Unique constrainti po firmi
alter table public.klijenti drop constraint if exists klijenti_user_pib_unique;
alter table public.klijenti drop constraint if exists klijenti_user_email_unique;
alter table public.fakture drop constraint if exists fakture_user_broj_unique;

alter table public.klijenti
  add constraint klijenti_firma_pib_unique unique (firma_id, pib);

alter table public.klijenti
  add constraint klijenti_firma_email_unique unique (firma_id, email);

alter table public.fakture
  add constraint fakture_firma_broj_unique unique (firma_id, broj);

-- 6) Indeksi
create index if not exists klijenti_firma_id_idx on public.klijenti(firma_id);
create index if not exists fakture_firma_id_datum_idx on public.fakture(firma_id, datum_izdavanja desc);
create index if not exists fakture_firma_status_idx on public.fakture(firma_id, status);
create index if not exists bankovni_racuni_firma_id_idx on public.bankovni_racuni(firma_id, redosled);

drop index if exists public.fakture_user_id_datum_idx;
drop index if exists public.fakture_status_idx;
drop index if exists public.fakture_user_tip_idx;

create index if not exists fakture_firma_tip_idx
  on public.fakture(firma_id, tip_dokumenta);

-- 7) RLS helper
create or replace function public.firma_pripada_korisniku(p_firma_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.firma f
    where f.id = p_firma_id
      and f.user_id = auth.uid()
  );
$$;

-- 8) RLS politike
drop policy if exists "klijenti_owner_all" on public.klijenti;
drop policy if exists "fakture_owner_all" on public.fakture;
drop policy if exists "bankovni_racuni_owner_all" on public.bankovni_racuni;
drop policy if exists "stavke_owner_all" on public.stavke_fakture;

create policy "klijenti_firma_owner_all" on public.klijenti
  for all
  using (public.firma_pripada_korisniku(firma_id))
  with check (public.firma_pripada_korisniku(firma_id));

create policy "fakture_firma_owner_all" on public.fakture
  for all
  using (public.firma_pripada_korisniku(firma_id))
  with check (public.firma_pripada_korisniku(firma_id));

create policy "bankovni_racuni_firma_owner_all" on public.bankovni_racuni
  for all
  using (public.firma_pripada_korisniku(firma_id))
  with check (public.firma_pripada_korisniku(firma_id));

create policy "stavke_firma_owner_all" on public.stavke_fakture
  for all
  using (
    exists (
      select 1
      from public.fakture f
      where f.id = stavke_fakture.faktura_id
        and public.firma_pripada_korisniku(f.firma_id)
    )
  )
  with check (
    exists (
      select 1
      from public.fakture f
      where f.id = stavke_fakture.faktura_id
        and public.firma_pripada_korisniku(f.firma_id)
    )
  );

-- 9) View fakture_lista
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
  coalesce(
    (select sum(s.kolicina * s.cena) from public.stavke_fakture s where s.faktura_id = f.id),
    0
  ) * (1 + f.pdv_procenat / 100) - f.popust as iznos
from public.fakture f
left join public.klijenti k on k.id = f.klijent_id;

-- 10) Dospjele fakture — ostaje po korisniku (ažurira sve firme korisnika)
-- funkcija oznaci_dospjele_fakture() ne mora mijenjati filter

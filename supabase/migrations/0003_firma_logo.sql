-- Dodaje podršku za logo firme: kolona u tabeli + storage bucket sa RLS politikama.

alter table public.firma
  add column if not exists logo_url text;

-- Public bucket za logoe firmi.
insert into storage.buckets (id, name, public)
values ('firma-logos', 'firma-logos', true)
on conflict (id) do nothing;

-- Politike za storage objekte: putanja je <user_id>/<filename>
drop policy if exists "firma_logos_public_read" on storage.objects;
create policy "firma_logos_public_read" on storage.objects
  for select
  using (bucket_id = 'firma-logos');

drop policy if exists "firma_logos_owner_insert" on storage.objects;
create policy "firma_logos_owner_insert" on storage.objects
  for insert
  with check (
    bucket_id = 'firma-logos'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "firma_logos_owner_update" on storage.objects;
create policy "firma_logos_owner_update" on storage.objects
  for update
  using (
    bucket_id = 'firma-logos'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'firma-logos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "firma_logos_owner_delete" on storage.objects;
create policy "firma_logos_owner_delete" on storage.objects
  for delete
  using (
    bucket_id = 'firma-logos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

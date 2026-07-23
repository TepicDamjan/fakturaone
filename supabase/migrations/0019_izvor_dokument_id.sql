-- Veza dokumenta nastalog iz drugog (npr. faktura od predračuna).

alter table public.fakture
  add column if not exists izvor_dokument_id uuid
  references public.fakture(id) on delete set null;

create index if not exists fakture_izvor_dokument_id_idx
  on public.fakture(izvor_dokument_id);

-- Najviše jedna faktura po izvornom dokumentu.
create unique index if not exists fakture_jedna_konverzija_po_izvoru
  on public.fakture(izvor_dokument_id)
  where izvor_dokument_id is not null and tip_dokumenta = 'faktura';

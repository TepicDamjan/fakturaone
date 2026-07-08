import { z } from "zod";

/** Datum u formatu YYYY-MM-DD ili prazan string. */
const datumSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .or(z.literal(""));

const stavkaSchema = z.object({
  naziv: z.string().max(200),
  opis: z.string().max(1000),
  kolicina: z.number().finite().min(0).max(1e9),
  cena: z.number().finite().min(0).max(1e9),
  jedinica: z.string().max(20).optional(),
});

export const sacuvajFakturuSchema = z.object({
  klijentId: z.union([z.literal(""), z.uuid()]),
  brojFakture: z.string().max(50),
  referenca: z.string().max(500),
  datumIzdavanja: datumSchema,
  datumPlacanja: datumSchema,
  napomene: z.string().max(2000),
  pdvProcenat: z.number().finite().min(0).max(100),
  popust: z.number().finite().min(0).max(1e9),
  stavke: z.array(stavkaSchema).max(200),
  status: z.enum(["nacrt", "na_cekanju", "placeno", "kasni"]),
  tipDokumenta: z.enum(["faktura", "predracun", "otpremnica"]),
  nacinTransporta: z.string().max(200).optional(),
  adresaDostave: z.string().max(500).optional(),
  registracijaVozila: z.string().max(50).optional(),
  vozac: z.string().max(100).optional(),
});

export { idSchema, NEISPRAVNI_PODACI_GRESKA } from "@/lib/validacija/zajednicko";

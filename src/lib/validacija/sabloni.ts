import { z } from "zod";

const stavkaSablonSchema = z.object({
  naziv: z.string().max(200),
  opis: z.string().max(1000),
  kolicina: z.number().finite().min(0).max(1e9),
  cena: z.number().finite().min(-1e9).max(1e9),
  jedinica: z.string().max(20),
});

export const sacuvajSablonSchema = z.object({
  naziv: z.string().trim().min(1).max(200),
  tipDokumenta: z.enum(["faktura", "predracun", "otpremnica", "kreditna_nota"]),
  klijentId: z.union([z.literal(""), z.uuid()]),
  referenca: z.string().max(500),
  napomene: z.string().max(2000),
  pdvProcenat: z.number().finite().min(0).max(100),
  popust: z.number().finite().min(-1e9).max(1e9),
  stavke: z.array(stavkaSablonSchema).max(200),
});

export const sacuvajPonavljajucuSchema = z.object({
  naziv: z.string().trim().min(1).max(200),
  klijentId: z.uuid(),
  referenca: z.string().max(500),
  napomene: z.string().max(2000),
  pdvProcenat: z.number().finite().min(0).max(100),
  popust: z.number().finite().min(-1e9).max(1e9),
  stavke: z.array(stavkaSablonSchema).min(1).max(200),
  frekvencija: z.enum(["sedmicno", "mjesecno", "godisnje"]),
  rokPlacanjaDana: z.number().int().min(0).max(365),
  sljedeciDatum: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  aktivan: z.boolean(),
});

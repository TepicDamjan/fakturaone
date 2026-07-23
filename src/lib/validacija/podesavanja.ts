import { z } from "zod";

export const sacuvajFirmuSchema = z.object({
  naziv: z.string().max(200),
  pib: z.string().max(20),
  maticniBroj: z.string().max(20),
  adresa: z.string().max(300),
  email: z.string().max(200),
  telefon: z.string().max(50),
  valuta: z.string().max(10),
  pdvProcenat: z.number().finite().min(0).max(100),
  rokPlacanjaDana: z.number().finite().min(0).max(365),
});

export const bankovniRacunSchema = z.object({
  id: z.uuid().optional(),
  nazivBanke: z.string().max(200),
  brojRacuna: z.string().max(50),
  naIme: z.string().max(200),
  swift: z.string().max(20),
  jePodrazumevani: z.boolean(),
});

export const bankovniRacuniSchema = z.array(bankovniRacunSchema).max(20);

export const sacuvajObavestenjaSchema = z.object({
  podsjetniciUkljuceni: z.boolean(),
  podsjetnikDanaPrije: z.number().int().min(0).max(30),
});


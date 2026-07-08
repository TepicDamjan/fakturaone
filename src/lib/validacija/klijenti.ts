import { z } from "zod";

export const sacuvajKlijentaSchema = z.object({
  naziv: z.string().max(200),
  pib: z.string().max(20),
  maticniBroj: z.string().max(20),
  email: z.string().max(200),
  telefon: z.string().max(50),
  ulica: z.string().max(200),
  grad: z.string().max(100),
  postanskiBroj: z.string().max(20),
});

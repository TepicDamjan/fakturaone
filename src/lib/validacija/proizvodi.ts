import { z } from "zod";

export const sacuvajProizvodSchema = z.object({
  naziv: z.string().max(200),
  opis: z.string().max(1000),
  jedinica: z.string().max(20),
  cena: z.number().finite().min(0).max(1e9),
});

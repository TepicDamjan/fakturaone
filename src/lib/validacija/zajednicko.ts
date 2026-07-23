import { z } from "zod";

export const idSchema = z.uuid();

export const NEISPRAVNI_PODACI_GRESKA =
  "Uneseni podaci nisu ispravni. Proverite formu i pokušajte ponovo.";

import { z } from "zod";

export const idSchema = z.uuid();

export const NEISPRAVNI_PODACI_GRESKA =
  "Uneseni podaci nisu ispravni. Provjerite formu i pokušajte ponovo.";

export function zodFieldErrors(
  error: z.ZodError
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.map(String).join(".") || "_form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

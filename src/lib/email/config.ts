export type EmailConfig = {
  apiKey: string;
  from: string;
};

export function getEmailConfig():
  | { ok: true; config: EmailConfig }
  | { ok: false; error: string } {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim();

  if (!apiKey) {
    return {
      ok: false,
      error:
        "Email nije podešen (RESEND_API_KEY). Dodajte ključ u .env.local — vidi .env.example.",
    };
  }

  if (!from) {
    return {
      ok: false,
      error:
        "Email nije podešen (EMAIL_FROM). Npr. FakturaOne <noreply@vas-domen.com>",
    };
  }

  return { ok: true, config: { apiKey, from } };
}

export type PasswordStrength = {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
};

export function getPasswordStrength(password: string): PasswordStrength {
  if (!password) return { score: 0, label: "" };

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  const normalized = Math.min(4, Math.max(1, Math.ceil(score * 0.8))) as 1 | 2 | 3 | 4;

  const labels: Record<number, string> = {
    1: "Slaba",
    2: "Osrednja",
    3: "Dobra",
    4: "Jaka",
  };

  return { score: normalized, label: labels[normalized] };
}

export function isPasswordStrongEnough(password: string): boolean {
  return password.length >= 8 && getPasswordStrength(password).score >= 2;
}

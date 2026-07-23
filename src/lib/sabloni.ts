import type { Json } from "@/types/database";

export type SablonStavka = {
  naziv: string;
  opis: string;
  kolicina: number;
  cena: number;
  jedinica: string;
};

export type FrekvencijaPonavljanja = "sedmicno" | "mjesecno" | "godisnje";

export const FREKVENCIJE: { id: FrekvencijaPonavljanja; label: string }[] = [
  { id: "sedmicno", label: "Sedmično" },
  { id: "mjesecno", label: "Mjesečno" },
  { id: "godisnje", label: "Godišnje" },
];

export function parseStavkeJson(raw: Json | null | undefined): SablonStavka[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) return null;
      const o = item as Record<string, unknown>;
      return {
        naziv: String(o.naziv ?? "").trim() || "Stavka",
        opis: String(o.opis ?? ""),
        kolicina: Number(o.kolicina) || 0,
        cena: Number(o.cena) || 0,
        jedinica: String(o.jedinica ?? "kom").trim() || "kom",
      };
    })
    .filter((s): s is SablonStavka => s != null);
}

export function stavkeToJson(stavke: SablonStavka[]): Json {
  return stavke.map((s) => ({
    naziv: s.naziv,
    opis: s.opis,
    kolicina: s.kolicina,
    cena: s.cena,
    jedinica: s.jedinica,
  }));
}

export function dodajFrekvenciju(
  iso: string,
  frekvencija: FrekvencijaPonavljanja
): string {
  const d = new Date(`${iso}T12:00:00`);
  if (frekvencija === "sedmicno") d.setDate(d.getDate() + 7);
  else if (frekvencija === "mjesecno") d.setMonth(d.getMonth() + 1);
  else d.setFullYear(d.getFullYear() + 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function danasISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

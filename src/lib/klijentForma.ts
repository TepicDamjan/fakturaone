import type { KlijentForma } from "@/app/components/KlijentFormFields";
import type { Klijent } from "@/lib/klijenti";

export function klijentToForma(k: Klijent): KlijentForma {
  return {
    naziv: k.naziv,
    pib: k.pib ?? "",
    maticniBroj: k.maticni_broj ?? "",
    email: k.email ?? "",
    telefon: k.telefon ?? "",
    ulica: k.ulica ?? "",
    grad: k.grad ?? "",
    postanskiBroj: k.postanski_broj ?? "",
  };
}

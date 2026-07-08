export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

export type Database = {
    public: {
        Tables: {
            brojaci_dokumenata: {
                Row: {
                    firma_id: string;
                    tip_dokumenta: "faktura" | "predracun" | "otpremnica";
                    godina: number;
                    sledeci: number;
                };
                Insert: {
                    firma_id: string;
                    tip_dokumenta: "faktura" | "predracun" | "otpremnica";
                    godina: number;
                    sledeci?: number;
                };
                Update: {
                    firma_id?: string;
                    tip_dokumenta?: "faktura" | "predracun" | "otpremnica";
                    godina?: number;
                    sledeci?: number;
                };
                Relationships: [
                    {
                        foreignKeyName: "brojaci_dokumenata_firma_id_fkey";
                        columns: ["firma_id"];
                        referencedRelation: "firma";
                        referencedColumns: ["id"];
                    },
                ];
            };
            klijenti: {
                Row: {
                    id: string;
                    user_id: string;
                    firma_id: string;
                    naziv: string;
                    pib: string | null;
                    maticni_broj: string | null;
                    email: string | null;
                    telefon: string | null;
                    ulica: string | null;
                    grad: string | null;
                    postanski_broj: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    firma_id: string;
                    naziv: string;
                    pib?: string | null;
                    maticni_broj?: string | null;
                    email?: string | null;
                    telefon?: string | null;
                    ulica?: string | null;
                    grad?: string | null;
                    postanski_broj?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    firma_id?: string;
                    naziv?: string;
                    pib?: string | null;
                    maticni_broj?: string | null;
                    email?: string | null;
                    telefon?: string | null;
                    ulica?: string | null;
                    grad?: string | null;
                    postanski_broj?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "klijenti_firma_id_fkey";
                        columns: ["firma_id"];
                        referencedRelation: "firma";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "klijenti_user_id_fkey";
                        columns: ["user_id"];
                        referencedRelation: "users";
                        referencedColumns: ["id"];
                    }
                ];
            };
            fakture: {
                Row: {
                    id: string;
                    user_id: string;
                    firma_id: string;
                    klijent_id: string | null;
                    broj: string;
                    referenca: string | null;
                    datum_izdavanja: string | null;
                    datum_placanja: string | null;
                    napomene: string | null;
                    pdv_procenat: number;
                    popust: number;
                    status: Database["public"]["Enums"]["faktura_status"];
                    tip_dokumenta: Database["public"]["Enums"]["tip_dokumenta"];
                    nacin_transporta: string | null;
                    adresa_dostave: string | null;
                    registracija_vozila: string | null;
                    vozac: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    firma_id: string;
                    klijent_id?: string | null;
                    broj: string;
                    referenca?: string | null;
                    datum_izdavanja?: string | null;
                    datum_placanja?: string | null;
                    napomene?: string | null;
                    pdv_procenat?: number;
                    popust?: number;
                    status?: Database["public"]["Enums"]["faktura_status"];
                    tip_dokumenta?: Database["public"]["Enums"]["tip_dokumenta"];
                    nacin_transporta?: string | null;
                    adresa_dostave?: string | null;
                    registracija_vozila?: string | null;
                    vozac?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    firma_id?: string;
                    klijent_id?: string | null;
                    broj?: string;
                    referenca?: string | null;
                    datum_izdavanja?: string | null;
                    datum_placanja?: string | null;
                    napomene?: string | null;
                    pdv_procenat?: number;
                    popust?: number;
                    status?: Database["public"]["Enums"]["faktura_status"];
                    tip_dokumenta?: Database["public"]["Enums"]["tip_dokumenta"];
                    nacin_transporta?: string | null;
                    adresa_dostave?: string | null;
                    registracija_vozila?: string | null;
                    vozac?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "fakture_firma_id_fkey";
                        columns: ["firma_id"];
                        referencedRelation: "firma";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "fakture_klijent_id_fkey";
                        columns: ["klijent_id"];
                        referencedRelation: "klijenti";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "fakture_user_id_fkey";
                        columns: ["user_id"];
                        referencedRelation: "users";
                        referencedColumns: ["id"];
                    }
                ];
            };
            firma: {
                Row: {
                    id: string;
                    user_id: string;
                    naziv: string;
                    pib: string | null;
                    maticni_broj: string | null;
                    adresa: string | null;
                    grad: string | null;
                    postanski_broj: string | null;
                    email: string | null;
                    telefon: string | null;
                    valuta: string;
                    pdv_procenat: number;
                    rok_placanja_dana: number;
                    logo_url: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    naziv?: string;
                    pib?: string | null;
                    maticni_broj?: string | null;
                    adresa?: string | null;
                    grad?: string | null;
                    postanski_broj?: string | null;
                    email?: string | null;
                    telefon?: string | null;
                    valuta?: string;
                    pdv_procenat?: number;
                    rok_placanja_dana?: number;
                    logo_url?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    naziv?: string;
                    pib?: string | null;
                    maticni_broj?: string | null;
                    adresa?: string | null;
                    grad?: string | null;
                    postanski_broj?: string | null;
                    email?: string | null;
                    telefon?: string | null;
                    valuta?: string;
                    pdv_procenat?: number;
                    rok_placanja_dana?: number;
                    logo_url?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "firma_user_id_fkey";
                        columns: ["user_id"];
                        referencedRelation: "users";
                        referencedColumns: ["id"];
                    }
                ];
            };
            bankovni_racuni: {
                Row: {
                    id: string;
                    user_id: string;
                    firma_id: string;
                    naziv_banke: string;
                    broj_racuna: string;
                    na_ime: string | null;
                    swift: string | null;
                    je_podrazumevani: boolean;
                    redosled: number;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    firma_id: string;
                    naziv_banke: string;
                    broj_racuna: string;
                    na_ime?: string | null;
                    swift?: string | null;
                    je_podrazumevani?: boolean;
                    redosled?: number;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    firma_id?: string;
                    naziv_banke?: string;
                    broj_racuna?: string;
                    na_ime?: string | null;
                    swift?: string | null;
                    je_podrazumevani?: boolean;
                    redosled?: number;
                    created_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "bankovni_racuni_firma_id_fkey";
                        columns: ["firma_id"];
                        referencedRelation: "firma";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "bankovni_racuni_user_id_fkey";
                        columns: ["user_id"];
                        referencedRelation: "users";
                        referencedColumns: ["id"];
                    }
                ];
            };
            pretplate: {
                Row: {
                    id: string;
                    user_id: string;
                    plan: Database["public"]["Enums"]["plan_tier"];
                    status: Database["public"]["Enums"]["subscription_status"];
                    trial_ends_at: string | null;
                    current_period_end: string | null;
                    freemius_license_id: string | null;
                    freemius_user_id: string | null;
                    freemius_plan_id: string | null;
                    freemius_subscription_id: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    plan?: Database["public"]["Enums"]["plan_tier"];
                    status?: Database["public"]["Enums"]["subscription_status"];
                    trial_ends_at?: string | null;
                    current_period_end?: string | null;
                    freemius_license_id?: string | null;
                    freemius_user_id?: string | null;
                    freemius_plan_id?: string | null;
                    freemius_subscription_id?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    plan?: Database["public"]["Enums"]["plan_tier"];
                    status?: Database["public"]["Enums"]["subscription_status"];
                    trial_ends_at?: string | null;
                    current_period_end?: string | null;
                    freemius_license_id?: string | null;
                    freemius_user_id?: string | null;
                    freemius_plan_id?: string | null;
                    freemius_subscription_id?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "pretplate_user_id_fkey";
                        columns: ["user_id"];
                        referencedRelation: "users";
                        referencedColumns: ["id"];
                    }
                ];
            };
            stavke_fakture: {
                Row: {
                    id: string;
                    faktura_id: string;
                    naziv: string;
                    opis: string | null;
                    kolicina: number;
                    cena: number;
                    jedinica: string;
                    redosled: number;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    faktura_id: string;
                    naziv: string;
                    opis?: string | null;
                    kolicina?: number;
                    cena?: number;
                    jedinica?: string;
                    redosled?: number;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    faktura_id?: string;
                    naziv?: string;
                    opis?: string | null;
                    kolicina?: number;
                    cena?: number;
                    jedinica?: string;
                    redosled?: number;
                    created_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "stavke_fakture_faktura_id_fkey";
                        columns: ["faktura_id"];
                        referencedRelation: "fakture";
                        referencedColumns: ["id"];
                    }
                ];
            };
        };
        Views: {
            fakture_lista: {
                Row: {
                    id: string | null;
                    user_id: string | null;
                    firma_id: string | null;
                    broj: string | null;
                    tip_dokumenta: Database["public"]["Enums"]["tip_dokumenta"] | null;
                    klijent_naziv: string | null;
                    klijent_email: string | null;
                    datum_izdavanja: string | null;
                    datum_placanja: string | null;
                    status: Database["public"]["Enums"]["faktura_status"] | null;
                    iznos: number | null;
                };
                Relationships: [];
            };
        };
        Functions: {
            oznaci_dospjele_fakture: {
                Args: Record<PropertyKey, never>;
                Returns: number;
            };
            oznaci_dospjele_fakture_sve: {
                Args: Record<PropertyKey, never>;
                Returns: number;
            };
            sledeci_broj_dokumenta: {
                Args: {
                    p_firma_id: string;
                    p_tip: "faktura" | "predracun" | "otpremnica";
                };
                Returns: string;
            };
            user_id_by_email: {
                Args: { p_email: string };
                Returns: string | null;
            };
        };
        Enums: {
            faktura_status: "nacrt" | "na_cekanju" | "placeno" | "kasni";
            tip_dokumenta: "faktura" | "predracun" | "otpremnica";
            plan_tier: "starter" | "professional" | "business" | "enterprise";
            subscription_status: "trialing" | "active" | "past_due" | "canceled" | "expired";
        };
        CompositeTypes: Record<string, never>;
    };
};

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
            klijenti: {
                Row: {
                    id: string;
                    user_id: string;
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
                    klijent_id: string | null;
                    broj: string;
                    referenca: string | null;
                    datum_izdavanja: string | null;
                    datum_placanja: string | null;
                    napomene: string | null;
                    pdv_procenat: number;
                    popust: number;
                    status: Database["public"]["Enums"]["faktura_status"];
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    klijent_id?: string | null;
                    broj: string;
                    referenca?: string | null;
                    datum_izdavanja?: string | null;
                    datum_placanja?: string | null;
                    napomene?: string | null;
                    pdv_procenat?: number;
                    popust?: number;
                    status?: Database["public"]["Enums"]["faktura_status"];
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    klijent_id?: string | null;
                    broj?: string;
                    referenca?: string | null;
                    datum_izdavanja?: string | null;
                    datum_placanja?: string | null;
                    napomene?: string | null;
                    pdv_procenat?: number;
                    popust?: number;
                    status?: Database["public"]["Enums"]["faktura_status"];
                    created_at?: string;
                    updated_at?: string;
                };
                Relationships: [
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
                    email: string | null;
                    telefon: string | null;
                    valuta: string;
                    pdv_procenat: number;
                    rok_placanja_dana: number;
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
                    email?: string | null;
                    telefon?: string | null;
                    valuta?: string;
                    pdv_procenat?: number;
                    rok_placanja_dana?: number;
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
                    email?: string | null;
                    telefon?: string | null;
                    valuta?: string;
                    pdv_procenat?: number;
                    rok_placanja_dana?: number;
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
                        foreignKeyName: "bankovni_racuni_user_id_fkey";
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
                    broj: string | null;
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
        Functions: Record<string, never>;
        Enums: {
            faktura_status: "nacrt" | "na_cekanju" | "placeno" | "kasni";
        };
        CompositeTypes: Record<string, never>;
    };
};

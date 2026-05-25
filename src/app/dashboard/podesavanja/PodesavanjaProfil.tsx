"use client";

import { useRef, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  azurirajProfil,
  otpremiAvatar,
  promeniLozinku,
  ukloniAvatar,
} from "@/app/dashboard/podesavanja/profilActions";
import { getPasswordStrength } from "@/lib/passwordStrength";
import { dicebearAvatar } from "@/lib/useAuthUser";
import { createClient } from "@/utils/supabase/client";

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const DOZVOLJENI_AVATAR_TIPOVI = ["image/jpeg", "image/png", "image/gif", "image/webp"];

type ProfilForma = {
  ime: string;
  email: string;
  telefon: string;
  pozicija: string;
};

type Props = {
  initialIme: string;
  initialEmail: string;
  initialTelefon: string;
  initialPozicija: string;
  initialAvatarUrl?: string | null;
};

export default function PodesavanjaProfil({
  initialIme,
  initialEmail,
  initialTelefon,
  initialPozicija,
  initialAvatarUrl,
}: Props) {
  const router = useRouter();
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const [forma, setForma] = useState<ProfilForma>({
    ime: initialIme,
    email: initialEmail,
    telefon: initialTelefon,
    pozicija: initialPozicija,
  });
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl ?? null);
  const [avatarGreska, setAvatarGreska] = useState<string | null>(null);
  const [avatarPending, startAvatarTransition] = useTransition();
  const [poruka, setPoruka] = useState<{
    tip: "uspeh" | "greska";
    tekst: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  const [lozinkaOpen, setLozinkaOpen] = useState(false);
  const [twoFaOpen, setTwoFaOpen] = useState(false);
  const [deaktivirajOpen, setDeaktivirajOpen] = useState(false);

  const sinkronizujKlijentSesiju = async () => {
    try {
      await createClient().auth.refreshSession();
    } catch {
      // tolerantno — sidebar će se ažurirati pri sledećoj navigaciji
    }
  };

  const handleAvatarSelect = (file: File) => {
    setAvatarGreska(null);
    if (file.size > MAX_AVATAR_BYTES) {
      setAvatarGreska("Slika ne sme biti veća od 2 MB.");
      return;
    }
    if (!DOZVOLJENI_AVATAR_TIPOVI.includes(file.type)) {
      setAvatarGreska("Dozvoljeni formati su JPG, PNG, GIF ili WEBP.");
      return;
    }

    const formData = new FormData();
    formData.append("avatar", file);
    startAvatarTransition(async () => {
      const res = await otpremiAvatar(formData);
      if (!res.ok) {
        setAvatarGreska(res.error);
        return;
      }
      setAvatarUrl(res.avatarUrl);
      await sinkronizujKlijentSesiju();
      router.refresh();
    });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleAvatarSelect(file);
    e.target.value = "";
  };

  const handleUkloniAvatar = () => {
    if (!window.confirm("Ukloniti profilnu sliku?")) return;
    setAvatarGreska(null);
    startAvatarTransition(async () => {
      const res = await ukloniAvatar();
      if (!res.ok) {
        setAvatarGreska(res.error);
        return;
      }
      setAvatarUrl(null);
      await sinkronizujKlijentSesiju();
      router.refresh();
    });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setPoruka(null);
    startTransition(async () => {
      const res = await azurirajProfil(forma);
      if (!res.ok) {
        setPoruka({ tip: "greska", tekst: res.error });
        return;
      }
      setPoruka({
        tip: "uspeh",
        tekst: res.emailPromenjen
          ? "Profil je sačuvan. Proverite novi email da biste potvrdili izmenu."
          : "Profil je sačuvan.",
      });
      router.refresh();
    });
  };

  const inicijal = (forma.ime || forma.email || "?").trim().charAt(0).toUpperCase();
  const slika = avatarUrl ?? dicebearAvatar(forma.email || forma.ime);

  return (
    <>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-fcrna">Podešavanja profila</h1>
          <p className="text-sm text-[#64748B] mt-1">
            Upravljajte svojim ličnim informacijama i bezbednosnim postavkama.
          </p>
        </div>
        <button
          type="submit"
          form="profil-forma"
          disabled={isPending}
          className="bg-fplava hover:bg-blue-600 text-white text-sm font-semibold py-2.5 px-5 rounded-lg shadow-sm transition-colors disabled:opacity-60"
        >
          {isPending ? "Čuvanje…" : "Sačuvaj izmene"}
        </button>
      </div>

      {poruka ? (
        <div
          role="alert"
          className={`mb-6 rounded-lg border px-4 py-3 text-sm ${
            poruka.tip === "uspeh"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {poruka.tekst}
        </div>
      ) : null}

      <form
        id="profil-forma"
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6"
      >
        <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={slika}
                alt={forma.ime || "Avatar"}
                className={`w-32 h-32 rounded-full border-4 border-white shadow-md bg-fsiva object-cover transition-opacity ${
                  avatarPending ? "opacity-60" : ""
                }`}
              />
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={avatarPending}
                aria-label="Promeni profilnu sliku"
                className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-fplava border border-white shadow-md flex items-center justify-center text-white hover:bg-blue-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {avatarPending ? (
                  <svg
                    className="animate-spin"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden
                  >
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.3" strokeWidth="3" />
                    <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path
                      d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="2" />
                  </svg>
                )}
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/png,image/jpeg,image/gif,image/webp"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
            <p className="mt-4 font-bold text-fcrna">{forma.ime || inicijal}</p>
            <p className="text-xs text-[#64748B]">{forma.email}</p>

            {avatarUrl ? (
              <button
                type="button"
                onClick={handleUkloniAvatar}
                disabled={avatarPending}
                className="mt-2 text-xs font-semibold text-red-600 hover:text-red-700 transition-colors disabled:opacity-60"
              >
                Ukloni profilnu sliku
              </button>
            ) : (
              <p className="mt-2 text-xs text-[#94A3B8]">
                JPG, PNG, GIF ili WEBP. Maksimalno 2 MB.
              </p>
            )}

            {avatarGreska ? (
              <p className="mt-2 text-xs text-red-600" role="alert">
                {avatarGreska}
              </p>
            ) : null}

            <div className="w-full text-left mt-6">
              <p className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">
                Status naloga
              </p>
              <span className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-sm font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Aktivan
              </span>
            </div>
          </div>
        </section>

        <div className="space-y-6">
          <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-fcrna flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Lični podaci
            </h2>

            <div className="grid sm:grid-cols-2 gap-4 mt-5">
              <Field
                label="Ime i prezime"
                value={forma.ime}
                onChange={(v) => setForma((f) => ({ ...f, ime: v }))}
                placeholder="Jane Doe"
              />
              <Field
                label="Email adresa"
                type="email"
                value={forma.email}
                onChange={(v) => setForma((f) => ({ ...f, email: v }))}
                placeholder="ime@firma.com"
              />
              <Field
                label="Broj telefona"
                type="tel"
                value={forma.telefon}
                onChange={(v) => setForma((f) => ({ ...f, telefon: v }))}
                placeholder="+387 61 123 456"
              />
              <Field
                label="Pozicija"
                value={forma.pozicija}
                onChange={(v) => setForma((f) => ({ ...f, pozicija: v }))}
                placeholder="Menadžer prodaje"
              />
            </div>
          </section>

          <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-fcrna flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M12 2L3 7v5c0 5 3.5 8.5 9 10 5.5-1.5 9-5 9-10V7l-9-5z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Bezbednost
            </h2>

            <div className="mt-5 space-y-3">
              <SecurityRow
                icon={
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                }
                title="Lozinka"
                subtitle="Promenite lozinku radi sigurnosti naloga"
                actionLabel="Promeni lozinku"
                onAction={() => setLozinkaOpen(true)}
              />
              <SecurityRow
                icon={
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <rect x="5" y="2" width="14" height="20" rx="2" stroke="currentColor" strokeWidth="2" />
                    <path d="M12 18h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                }
                title="Dvofaktorska autentifikacija"
                subtitle="Dodatni nivo zaštite vašeg naloga"
                actionLabel="Podesi"
                onAction={() => setTwoFaOpen(true)}
              />
            </div>
          </section>

          <section className="rounded-xl border border-red-200 bg-red-50/70 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-red-700">Deaktiviraj nalog</h3>
              <p className="text-sm text-red-700/80 mt-1">
                Ova radnja će suspendovati vaš pristup sistemu. Podaci će biti sačuvani u skladu sa
                polisom privatnosti.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setDeaktivirajOpen(true)}
              className="shrink-0 inline-flex items-center justify-center px-4 py-2 rounded-lg border border-red-300 text-red-700 font-semibold text-sm hover:bg-red-100 transition-colors"
            >
              Deaktiviraj
            </button>
          </section>
        </div>
      </form>

      {lozinkaOpen ? (
        <PromeniLozinkuModal onClose={() => setLozinkaOpen(false)} />
      ) : null}
      {twoFaOpen ? (
        <InfoModal
          title="Dvofaktorska autentifikacija"
          opis="2FA još uvek nije aktiviran. Funkcija će biti dostupna uskoro."
          onClose={() => setTwoFaOpen(false)}
        />
      ) : null}
      {deaktivirajOpen ? (
        <InfoModal
          title="Deaktivacija naloga"
          opis="Za deaktivaciju naloga kontaktirajte podršku na podrska@fakturaone.ba."
          onClose={() => setDeaktivirajOpen(false)}
        />
      ) : null}
    </>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-[#64748B] mb-1.5">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-fsiva border border-ftsiva rounded-lg text-sm text-fcrna placeholder:text-[#94A3B8] outline-none focus:border-fplava focus:ring-2 focus:ring-fplava/15 py-2.5 px-3"
      />
    </label>
  );
}

function SecurityRow({
  icon,
  title,
  subtitle,
  actionLabel,
  onAction,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-gray-100 bg-fsiva/40 px-4 py-3">
      <div className="w-10 h-10 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-fcrna">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-fcrna">{title}</p>
        <p className="text-xs text-[#64748B] mt-0.5">{subtitle}</p>
      </div>
      <button
        type="button"
        onClick={onAction}
        className="shrink-0 text-sm font-semibold text-fplava hover:text-blue-700 transition-colors"
      >
        {actionLabel}
      </button>
    </div>
  );
}

function PromeniLozinkuModal({ onClose }: { onClose: () => void }) {
  const [nova, setNova] = useState("");
  const [potvrda, setPotvrda] = useState("");
  const [vidi, setVidi] = useState(false);
  const [greska, setGreska] = useState<string | null>(null);
  const [uspeh, setUspeh] = useState(false);
  const [isPending, startTransition] = useTransition();

  const strength = getPasswordStrength(nova);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setGreska(null);
    startTransition(async () => {
      const res = await promeniLozinku({ novaLozinka: nova, potvrdaLozinke: potvrda });
      if (!res.ok) {
        setGreska(res.error);
        return;
      }
      setUspeh(true);
      setNova("");
      setPotvrda("");
    });
  };

  return (
    <ModalShell onClose={onClose} title="Promeni lozinku">
      {uspeh ? (
        <div className="space-y-4">
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            Lozinka je uspešno promenjena.
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="bg-fplava hover:bg-blue-600 text-white text-sm font-semibold py-2 px-4 rounded-lg"
            >
              Zatvori
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="block text-xs font-semibold text-[#64748B] mb-1.5">Nova lozinka</span>
            <div className="relative">
              <input
                type={vidi ? "text" : "password"}
                value={nova}
                onChange={(e) => setNova(e.target.value)}
                minLength={8}
                required
                autoComplete="new-password"
                className="w-full bg-fsiva border border-ftsiva rounded-lg text-sm text-fcrna outline-none focus:border-fplava py-2.5 pl-3 pr-11"
              />
              <button
                type="button"
                onClick={() => setVidi((v) => !v)}
                aria-label={vidi ? "Sakrij" : "Prikaži"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-fcrna"
              >
                {vidi ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" />
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                  </svg>
                )}
              </button>
            </div>
            {nova.length > 0 ? (
              <div className="flex items-center gap-3 mt-2">
                <div className="flex flex-1 gap-1">
                  {[1, 2, 3, 4].map((s) => (
                    <div
                      key={s}
                      className={`h-1 flex-1 rounded-full ${
                        strength.score >= s ? "bg-fplava" : "bg-ftsiva"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-medium text-[#64748B]">{strength.label}</span>
              </div>
            ) : null}
          </label>

          <label className="block">
            <span className="block text-xs font-semibold text-[#64748B] mb-1.5">
              Potvrdi novu lozinku
            </span>
            <input
              type={vidi ? "text" : "password"}
              value={potvrda}
              onChange={(e) => setPotvrda(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              className="w-full bg-fsiva border border-ftsiva rounded-lg text-sm text-fcrna outline-none focus:border-fplava py-2.5 px-3"
            />
          </label>

          {greska ? (
            <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {greska}
            </p>
          ) : null}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="text-sm font-medium text-[#64748B] hover:text-fcrna px-4 py-2"
            >
              Otkaži
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="bg-fplava hover:bg-blue-600 text-white text-sm font-semibold py-2 px-4 rounded-lg disabled:opacity-60"
            >
              {isPending ? "Čuvanje…" : "Sačuvaj lozinku"}
            </button>
          </div>
        </form>
      )}
    </ModalShell>
  );
}

function InfoModal({
  title,
  opis,
  onClose,
}: {
  title: string;
  opis: string;
  onClose: () => void;
}) {
  return (
    <ModalShell onClose={onClose} title={title}>
      <p className="text-sm text-[#64748B]">{opis}</p>
      <div className="flex justify-end mt-5">
        <button
          type="button"
          onClick={onClose}
          className="bg-fplava hover:bg-blue-600 text-white text-sm font-semibold py-2 px-4 rounded-lg"
        >
          U redu
        </button>
      </div>
    </ModalShell>
  );
}

function ModalShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-fcrna">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#64748B] hover:bg-gray-100 hover:text-fcrna"
            aria-label="Zatvori"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

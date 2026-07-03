# FakturaOne

Online fakturisanje za mala preduzeća — Next.js 16, Supabase, Freemius.

## Lokalni razvoj

```bash
npm install
cp .env.example .env.local   # popuni vrednosti
npm run dev
```

Otvori [http://localhost:3000](http://localhost:3000).

### Supabase migracije

```bash
supabase db push
```

Potrebne migracije: `0013_pretplate`, `0014_freemius_pretplate`, `0015_pro_trial_14_dana`.

### Provera Freemius konfiguracije

```bash
node scripts/verify-freemius-setup.mjs
```

## Deploy na Vercel

### 1. Push na GitHub

Repozitorijum ne sme sadržati `.env.local` (već je u `.gitignore`).

```bash
git add .
git commit -m "Prepare for Vercel production"
git push origin master
```

### 2. Novi projekat na Vercel

1. [vercel.com/new](https://vercel.com/new) → Import Git repozitorijum
2. Framework: **Next.js** (auto-detekcija)
3. Build Command: `npm run build` (default)
4. Root Directory: `./`

### 3. Environment Variables (Production)

Postavi u **Settings → Environment Variables** za **Production** (i Preview po želji):

| Promenljiva | Obavezno | Napomena |
|-------------|----------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Da | Supabase → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Da | Supabase → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Da | Samo server — webhook/pretplate |
| `NEXT_PUBLIC_SITE_URL` | Da | `https://fakturaone.app` |
| `RESEND_API_KEY` | Da | Za slanje emailom |
| `EMAIL_FROM` | Da | npr. `FakturaOne <noreply@fakturaone.app>` |
| `FREEMIUS_PRODUCT_ID` | Da | Freemius Dashboard |
| `FREEMIUS_SECRET_KEY` | Da | U navodnicima ako ima spec. karaktere |
| `FREEMIUS_API_BEARER_TOKEN` | Da | Freemius API token |
| `FREEMIUS_PLAN_PROFESSIONAL` | Da | Plan ID |
| `FREEMIUS_PLAN_BUSINESS` | Da | Plan ID |
| `FREEMIUS_CHECKOUT_REDIRECT_URL` | Da | `https://fakturaone.app/api/freemius/checkout` |

### 4. Domen

Vercel → **Settings → Domains** → dodaj `fakturaone.app` i `www.fakturaone.app`.

DNS (kod registrara):

- `A` zapis → `76.76.21.21` (Vercel)
- ili `CNAME` `www` → `cname.vercel-dns.com`

### 5. Supabase (produkcija)

**Authentication → URL Configuration:**

- Site URL: `https://fakturaone.app`
- Redirect URLs: `https://fakturaone.app/auth/callback`

### 6. Freemius (produkcija)

- **Redirect URL:** `https://fakturaone.app/api/freemius/checkout`
- **Webhook:** `https://fakturaone.app/api/webhooks/freemius`

### 7. Resend

Verifikuj domen `fakturaone.app` i koristi ga u `EMAIL_FROM`.

### 8. Deploy

Klik **Deploy** ili push na `master` pokreće automatski build.

Posle deploya proveri:

- [ ] Landing `/`
- [ ] Registracija + email potvrda
- [ ] Login → dashboard
- [ ] `/dashboard/nadogradi` → Freemius checkout

## Skripte

| Komanda | Opis |
|---------|------|
| `npm run dev` | Dev server |
| `npm run build` | Produkcijski build |
| `npm run start` | Lokalno pokretanje build-a |
| `npm run lint` | ESLint |

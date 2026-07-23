import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";

function loadEnv() {
  const raw = readFileSync(".env.local", "utf8");
  const env = {};
  for (const line of raw.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    let key = t.slice(0, i).trim();
    let val = t.slice(i + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  }
  return env;
}

const env = loadEnv();
const checks = [];

function ok(name, pass, detail = "") {
  checks.push({ name, pass, detail });
}

ok(
  "FREEMIUS vars",
  Boolean(
    env.FREEMIUS_PRODUCT_ID &&
      env.FREEMIUS_SECRET_KEY &&
      env.FREEMIUS_API_BEARER_TOKEN &&
      env.FREEMIUS_PLAN_PROFESSIONAL &&
      env.FREEMIUS_PLAN_BUSINESS
  )
);

ok("SUPABASE_SERVICE_ROLE_KEY", Boolean(env.SUPABASE_SERVICE_ROLE_KEY));

const productId = env.FREEMIUS_PRODUCT_ID;
const token = env.FREEMIUS_API_BEARER_TOKEN;

let apiRes;
try {
  apiRes = await fetch(
    `https://api.freemius.com/v1/products/${productId}.json`,
    {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  ok("Freemius API product", apiRes.ok, `HTTP ${apiRes.status}`);
} catch (e) {
  ok("Freemius API product", false, String(e));
}

for (const [label, planId] of [
  ["Professional plan", env.FREEMIUS_PLAN_PROFESSIONAL],
  ["Business plan", env.FREEMIUS_PLAN_BUSINESS],
]) {
  try {
    const r = await fetch(
      `https://api.freemius.com/v1/products/${productId}/plans/${planId}.json`,
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    ok(label, r.ok, `HTTP ${r.status}`);
  } catch (e) {
    ok(label, false, String(e));
  }
}

try {
  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { error } = await supabase.from("pretplate").select("id").limit(1);
  ok("Supabase pretplate tabela", !error, error?.message ?? "OK");
  const { error: rpcErr } = await supabase.rpc("user_id_by_email", {
    p_email: "test@example.com",
  });
  ok("RPC user_id_by_email", !rpcErr, rpcErr?.message ?? "OK");
} catch (e) {
  ok("Supabase admin", false, String(e));
}

const checkoutUrl = `https://checkout.freemius.com/product/${productId}/plan/${env.FREEMIUS_PLAN_PROFESSIONAL}/currency/eur/`;
ok("Checkout URL generisan", checkoutUrl.includes("checkout.freemius.com"), checkoutUrl);

let failed = 0;
for (const c of checks) {
  const mark = c.pass ? "OK" : "FAIL";
  if (!c.pass) failed++;
  console.log(`${mark}  ${c.name}${c.detail ? ` — ${c.detail}` : ""}`);
}

process.exit(failed > 0 ? 1 : 0);

-- Freemius integracija: zamena Stripe polja i lookup korisnika po emailu

alter table public.pretplate
  drop column if exists stripe_customer_id,
  drop column if exists stripe_subscription_id;

alter table public.pretplate
  add column if not exists freemius_license_id text,
  add column if not exists freemius_user_id text,
  add column if not exists freemius_plan_id text,
  add column if not exists freemius_subscription_id text;

create unique index if not exists pretplate_freemius_license_id_idx
  on public.pretplate(freemius_license_id)
  where freemius_license_id is not null;

-- Za webhook: pronađi auth korisnika po emailu (samo service role)
create or replace function public.user_id_by_email(p_email text)
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select id
  from auth.users
  where lower(email) = lower(trim(p_email))
  limit 1;
$$;

revoke all on function public.user_id_by_email(text) from public;
grant execute on function public.user_id_by_email(text) to service_role;

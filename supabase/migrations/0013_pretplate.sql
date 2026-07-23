-- Pretplate i planovi korisnika

create type public.plan_tier as enum ('starter', 'professional', 'business', 'enterprise');

create type public.subscription_status as enum (
  'trialing',
  'active',
  'past_due',
  'canceled',
  'expired'
);

create table public.pretplate (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan public.plan_tier not null default 'professional',
  status public.subscription_status not null default 'trialing',
  trial_ends_at timestamptz,
  current_period_end timestamptz,
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint pretplate_user_id_unique unique (user_id)
);

create index pretplate_user_id_idx on public.pretplate(user_id);
create index pretplate_status_idx on public.pretplate(status);

create trigger trg_pretplate_updated
  before update on public.pretplate
  for each row execute function public.set_updated_at();

alter table public.pretplate enable row level security;

create policy "pretplate_owner_select" on public.pretplate
  for select
  using (auth.uid() = user_id);

create policy "pretplate_owner_insert" on public.pretplate
  for insert
  with check (auth.uid() = user_id);

-- Novi korisnik dobija 14 dana Professional probnog perioda
create or replace function public.kreiraj_pretplatu_za_novog_korisnika()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.pretplate (user_id, plan, status, trial_ends_at)
  values (new.id, 'professional', 'trialing', now() + interval '14 days')
  on conflict (user_id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created_pretplata
  after insert on auth.users
  for each row execute function public.kreiraj_pretplatu_za_novog_korisnika();

-- Postojeći korisnici bez pretplate
insert into public.pretplate (user_id, plan, status, trial_ends_at)
select id, 'professional', 'trialing', now() + interval '14 days'
from auth.users u
where not exists (
  select 1 from public.pretplate p where p.user_id = u.id
);

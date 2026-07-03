-- Jednokratno: 14 dana besplatnog Professional plana korisnicima bez plaćene pretplate

update public.pretplate
set
  plan = 'professional',
  status = 'trialing',
  trial_ends_at = now() + interval '14 days'
where freemius_license_id is null
  and status not in ('active', 'past_due')
  and (
    trial_ends_at is null
    or trial_ends_at < now()
    or status in ('expired', 'canceled')
  );

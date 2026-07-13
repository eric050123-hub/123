create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role text not null default 'admin' check (role in ('admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.course_types (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  is_active boolean not null default true,
  sort_order integer not null default 99,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.class_proposals (
  id uuid primary key default gen_random_uuid(),
  course_type_id uuid not null references public.course_types(id),
  requested_weekday integer not null check (requested_weekday between 1 and 7),
  requested_start_time time not null,
  requested_end_time time not null,
  requested_period text not null check (requested_period in ('morning','afternoon','evening')),
  alternative_slots jsonb not null default '[]'::jsonb,
  applicant_name text not null,
  line_name text not null,
  phone text not null check (phone ~ '^09[0-9]{8}$'),
  email text,
  experience_level text not null,
  notes text,
  pin_hash text not null,
  status text not null default 'pending' check (status in ('pending','approved','merged','rejected','cancelled')),
  admin_notes text,
  approved_class_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  course_type_id uuid not null references public.course_types(id),
  title text not null,
  description text,
  weekday integer not null check (weekday between 1 and 7),
  start_time time not null,
  end_time time not null,
  period text not null check (period in ('morning','afternoon','evening')),
  location text,
  coach_name text,
  price numeric(10,0) default 0,
  minimum_students integer not null default 4 check (minimum_students > 0),
  maximum_students integer not null default 8 check (maximum_students >= minimum_students),
  registration_deadline date,
  status text not null default 'draft' check (status in ('draft','recruiting','threshold_reached','confirmed','full','closed','completed','cancelled')),
  is_public boolean not null default false,
  admin_notes text,
  created_from_proposal_id uuid references public.class_proposals(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'class_proposals_approved_class_fk'
  ) then
    alter table public.class_proposals
      add constraint class_proposals_approved_class_fk
      foreign key (approved_class_id) references public.classes(id);
  end if;
end $$;

create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  full_name text not null,
  line_name text not null,
  phone text not null check (phone ~ '^09[0-9]{8}$'),
  email text,
  age_group text,
  experience_level text not null,
  needs_paddle boolean not null default false,
  party_size integer not null default 1 check (party_size between 1 and 8),
  notes text,
  pin_hash text not null,
  status text not null default 'active' check (status in ('active','cancelled','confirmed','locked')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.registrations alter column phone drop not null;
alter table public.registrations add column if not exists party_size integer not null default 1 check (party_size between 1 and 8);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid references auth.users(id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.system_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace view public.public_class_summaries as
select
  c.id,
  c.course_type_id,
  ct.name as course_name,
  c.title,
  c.description,
  c.weekday,
  to_char(c.start_time, 'HH24:MI') as start_time,
  to_char(c.end_time, 'HH24:MI') as end_time,
  c.period,
  c.location,
  c.coach_name,
  c.price,
  c.minimum_students,
  c.maximum_students,
  c.registration_deadline,
  c.status,
  coalesce(sum(r.party_size) filter (where r.status in ('active','confirmed')), 0)::int as active_count,
  greatest(c.maximum_students - coalesce(sum(r.party_size) filter (where r.status in ('active','confirmed')), 0), 0)::int as seats_left,
  c.created_at
from public.classes c
join public.course_types ct on ct.id = c.course_type_id
left join public.registrations r on r.class_id = c.id
where c.is_public = true
  and c.status in ('recruiting','threshold_reached','confirmed','full')
group by c.id, ct.name;

drop view if exists public.public_registration_names;

create or replace view public.public_registration_masked_names as
select
  r.id,
  r.class_id,
  case
    when length(trim(r.full_name)) > 0 then left(trim(r.full_name), 1) || '○○'
    else '學員○○'
  end as masked_name,
  r.party_size,
  r.status,
  r.created_at
from public.registrations r
join public.classes c on c.id = r.class_id
where c.is_public = true
  and c.status in ('recruiting','threshold_reached','confirmed','full')
  and r.status in ('active','confirmed');

create or replace function public.refresh_class_status(target_class_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  active_total integer;
  min_total integer;
  max_total integer;
  current_status text;
begin
  select coalesce(sum(party_size), 0)::int into active_total
  from public.registrations
  where class_id = target_class_id and status in ('active','confirmed');

  select minimum_students, maximum_students, status into min_total, max_total, current_status
  from public.classes
  where id = target_class_id;

  if current_status in ('confirmed','closed','completed','cancelled','draft') then
    return;
  end if;

  update public.classes
  set status = case
    when active_total >= max_total then 'full'
    when active_total >= min_total then 'threshold_reached'
    else 'recruiting'
  end,
  updated_at = now()
  where id = target_class_id;
end;
$$;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists touch_course_types on public.course_types;
create trigger touch_course_types before update on public.course_types for each row execute function public.touch_updated_at();
drop trigger if exists touch_classes on public.classes;
create trigger touch_classes before update on public.classes for each row execute function public.touch_updated_at();
drop trigger if exists touch_class_proposals on public.class_proposals;
create trigger touch_class_proposals before update on public.class_proposals for each row execute function public.touch_updated_at();
drop trigger if exists touch_registrations on public.registrations;
create trigger touch_registrations before update on public.registrations for each row execute function public.touch_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', new.email), 'admin')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.course_types enable row level security;
alter table public.classes enable row level security;
alter table public.class_proposals enable row level security;
alter table public.registrations enable row level security;
alter table public.audit_logs enable row level security;
alter table public.system_settings enable row level security;

drop policy if exists "admins manage profiles" on public.profiles;
create policy "admins manage profiles" on public.profiles for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "public read active course types" on public.course_types;
create policy "public read active course types" on public.course_types for select using (is_active = true);
drop policy if exists "admins manage course types" on public.course_types;
create policy "admins manage course types" on public.course_types for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "public read public classes" on public.classes;
create policy "public read public classes" on public.classes for select using (
  is_public = true and status in ('recruiting','threshold_reached','confirmed','full')
);
drop policy if exists "admins manage classes" on public.classes;
create policy "admins manage classes" on public.classes for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "anonymous insert proposals" on public.class_proposals;
create policy "anonymous insert proposals" on public.class_proposals for insert with check (true);
drop policy if exists "admins manage proposals" on public.class_proposals;
create policy "admins manage proposals" on public.class_proposals for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "anonymous insert registrations" on public.registrations;
create policy "anonymous insert registrations" on public.registrations for insert with check (true);
drop policy if exists "admins manage registrations" on public.registrations;
create policy "admins manage registrations" on public.registrations for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admins read audit logs" on public.audit_logs;
create policy "admins read audit logs" on public.audit_logs for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admins manage settings" on public.system_settings;
create policy "admins manage settings" on public.system_settings for all using (public.is_admin()) with check (public.is_admin());

grant usage on schema public to anon, authenticated;
grant select on public.public_class_summaries to anon, authenticated;
grant select on public.public_registration_masked_names to anon, authenticated;
grant select on public.course_types to anon, authenticated;
grant insert on public.registrations to anon;
grant insert on public.class_proposals to anon;

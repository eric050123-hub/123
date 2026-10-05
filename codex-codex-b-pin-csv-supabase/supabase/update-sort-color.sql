alter table public.classes
  add column if not exists display_order integer not null default 1000;

alter table public.classes
  add column if not exists accent_color text not null default 'green';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'classes_accent_color_check'
  ) then
    alter table public.classes
      add constraint classes_accent_color_check
      check (accent_color in ('green','blue','pink'));
  end if;
end $$;

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
  c.display_order,
  c.accent_color,
  coalesce(sum(r.party_size) filter (where r.status in ('active','confirmed')), 0)::int as active_count,
  greatest(c.maximum_students - coalesce(sum(r.party_size) filter (where r.status in ('active','confirmed')), 0), 0)::int as seats_left,
  c.created_at
from public.classes c
join public.course_types ct on ct.id = c.course_type_id
left join public.registrations r on r.class_id = c.id
where c.is_public = true
  and c.status in ('recruiting','threshold_reached','confirmed','full')
group by c.id, ct.name;

grant select on public.public_class_summaries to anon, authenticated;

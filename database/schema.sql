-- Supabase PostgreSQL schema for Absensi QR Next.js
-- Run this file in Supabase SQL Editor for a fresh setup.

create extension if not exists pgcrypto;

create table if not exists app_users (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  password_hash text not null,
  role text not null check (role in ('dosen', 'mahasiswa')),
  full_name text not null,
  nim text unique,
  created_at timestamptz not null default now()
);

create table if not exists classes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null,
  lecturer_id uuid not null references app_users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (lecturer_id, code)
);

create table if not exists class_members (
  class_id uuid not null references classes(id) on delete cascade,
  student_id uuid not null references app_users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (class_id, student_id)
);

create table if not exists attendance_sessions (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references classes(id) on delete cascade,
  course_name text not null,
  meeting_no int not null check (meeting_no > 0),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  token uuid not null unique default gen_random_uuid(),
  created_by uuid not null references app_users(id) on delete cascade,
  created_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create table if not exists attendances (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references attendance_sessions(id) on delete cascade,
  student_id uuid not null references app_users(id) on delete cascade,
  attended_at timestamptz not null default now(),
  unique (session_id, student_id)
);

create or replace function verify_login(p_username text, p_password text)
returns table (
  id uuid,
  username text,
  role text,
  full_name text,
  nim text
)
language sql
security definer
as $$
  select u.id, u.username, u.role, u.full_name, u.nim
  from app_users u
  where u.username = p_username
    and u.password_hash = crypt(p_password, u.password_hash)
  limit 1;
$$;

create or replace function register_user(
  p_username text,
  p_password text,
  p_role text,
  p_full_name text,
  p_nim text default null
)
returns table (
  id uuid,
  username text,
  role text,
  full_name text,
  nim text
)
language plpgsql
security definer
as $$
declare
  new_user_id uuid;
  default_class_id uuid;
begin
  if p_role not in ('dosen', 'mahasiswa') then
    raise exception 'Role tidak valid';
  end if;

  insert into app_users (username, password_hash, role, full_name, nim)
  values (
    trim(p_username),
    crypt(p_password, gen_salt('bf')),
    p_role,
    trim(p_full_name),
    case when p_role = 'mahasiswa' then nullif(trim(coalesce(p_nim, p_username)), '') else null end
  )
  returning app_users.id into new_user_id;

  if p_role = 'mahasiswa' then
    select classes.id into default_class_id
    from classes
    where code = 'KH-001'
    order by created_at asc
    limit 1;

    if default_class_id is not null then
      insert into class_members (class_id, student_id)
      values (default_class_id, new_user_id)
      on conflict do nothing;
    end if;
  else
    insert into classes (name, code, lecturer_id)
    values
      ('Kelas KH-001', 'KH-001', new_user_id),
      ('Kelas KH-002', 'KH-002', new_user_id),
      ('Kelas KH-003', 'KH-003', new_user_id)
    on conflict (lecturer_id, code) do nothing;
  end if;

  return query
  select u.id, u.username, u.role, u.full_name, u.nim
  from app_users u
  where u.id = new_user_id;
end;
$$;

alter table app_users enable row level security;
alter table classes enable row level security;
alter table class_members enable row level security;
alter table attendance_sessions enable row level security;
alter table attendances enable row level security;

-- The app uses SUPABASE_SERVICE_ROLE_KEY on the server, so RLS is bypassed by server code.
-- Do not expose SUPABASE_SERVICE_ROLE_KEY in browser/client code.

truncate table attendances, attendance_sessions, class_members, classes, app_users restart identity cascade;

insert into app_users (username, password_hash, role, full_name, nim) values
('dosen1', crypt('dosen123', gen_salt('bf')), 'dosen', 'HERMANSYAH,S.KOM,M.KOM', null),
('2201001', crypt('mhs123', gen_salt('bf')), 'mahasiswa', 'Andi Pratama', '2201001'),
('2201002', crypt('mhs123', gen_salt('bf')), 'mahasiswa', 'Bela Sari', '2201002'),
('2201003', crypt('mhs123', gen_salt('bf')), 'mahasiswa', 'Cahyo Nugroho', '2201003'),
('2201004', crypt('mhs123', gen_salt('bf')), 'mahasiswa', 'Dewi Rahayu', '2201004'),
('2201005', crypt('mhs123', gen_salt('bf')), 'mahasiswa', 'Eko Firmansyah', '2201005');

insert into classes (name, code, lecturer_id)
select 'Kelas KH-001', 'KH-001', id
from app_users
where username = 'dosen1';

insert into classes (name, code, lecturer_id)
select 'Kelas KH-002', 'KH-002', id
from app_users
where username = 'dosen1';

insert into classes (name, code, lecturer_id)
select 'Kelas KH-003', 'KH-003', id
from app_users
where username = 'dosen1';

insert into class_members (class_id, student_id)
select c.id, u.id
from classes c
cross join app_users u
where c.code = 'KH-001' and u.role = 'mahasiswa';

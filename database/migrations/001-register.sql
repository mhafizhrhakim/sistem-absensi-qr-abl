-- Run this in Supabase SQL Editor to add registration without resetting existing data.


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
    where code = 'ABL-01'
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


update app_users
set full_name = 'HERMANSYAH,S.KOM,M.KOM'
where username = 'dosen1';

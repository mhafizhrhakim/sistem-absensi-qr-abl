-- Run this in Supabase SQL Editor if old class codes like ABL-USERNAME still appear.
-- It converts one old/non-KH class per lecturer into KH-001 and ensures KH-001/KH-002/KH-003 exist.

alter table classes drop constraint if exists classes_code_key;

create unique index if not exists classes_lecturer_code_key
on classes (lecturer_id, code);

with candidate as (
  select c.id,
         row_number() over (partition by c.lecturer_id order by c.created_at asc) as rn
  from classes c
  where c.code not in ('KH-001', 'KH-002', 'KH-003')
    and not exists (
      select 1
      from classes existing
      where existing.lecturer_id = c.lecturer_id
        and existing.code = 'KH-001'
    )
)
update classes
set name = 'Kelas KH-001', code = 'KH-001'
where id in (select id from candidate where rn = 1);

insert into classes (name, code, lecturer_id)
select 'Kelas KH-001', 'KH-001', u.id
from app_users u
where u.role = 'dosen'
  and not exists (
    select 1 from classes c
    where c.lecturer_id = u.id and c.code = 'KH-001'
  )
on conflict (lecturer_id, code) do nothing;

insert into classes (name, code, lecturer_id)
select 'Kelas KH-002', 'KH-002', u.id
from app_users u
where u.role = 'dosen'
  and not exists (
    select 1 from classes c
    where c.lecturer_id = u.id and c.code = 'KH-002'
  )
on conflict (lecturer_id, code) do nothing;

insert into classes (name, code, lecturer_id)
select 'Kelas KH-003', 'KH-003', u.id
from app_users u
where u.role = 'dosen'
  and not exists (
    select 1 from classes c
    where c.lecturer_id = u.id and c.code = 'KH-003'
  )
on conflict (lecturer_id, code) do nothing;

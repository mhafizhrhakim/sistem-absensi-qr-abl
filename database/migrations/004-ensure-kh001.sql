-- Run this in Supabase SQL Editor if KH-001 is missing from lecturer class dropdown.
-- It adds KH-001 for every lecturer who does not have it yet.

insert into classes (name, code, lecturer_id)
select 'Kelas KH-001', 'KH-001', u.id
from app_users u
where u.role = 'dosen'
  and not exists (
    select 1
    from classes c
    where c.lecturer_id = u.id
      and c.code = 'KH-001'
  );

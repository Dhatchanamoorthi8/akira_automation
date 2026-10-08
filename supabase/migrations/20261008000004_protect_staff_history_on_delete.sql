-- Preserve field visit and attendance history if a profile deletion races
-- with the server-side dependency check. The CLI migration version is unique
-- among this repository's migration files.
ALTER TABLE public.field_visits
  DROP CONSTRAINT IF EXISTS field_visits_staff_id_fkey,
  ADD CONSTRAINT field_visits_staff_id_fkey
    FOREIGN KEY (staff_id)
    REFERENCES public.profiles(id)
    ON DELETE RESTRICT;

ALTER TABLE public.staff_attendance
  DROP CONSTRAINT IF EXISTS staff_attendance_staff_id_fkey,
  ADD CONSTRAINT staff_attendance_staff_id_fkey
    FOREIGN KEY (staff_id)
    REFERENCES public.profiles(id)
    ON DELETE RESTRICT;

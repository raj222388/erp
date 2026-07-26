
-- TEACHERS: qr token + classroom assignment
ALTER TABLE public.teachers
  ADD COLUMN IF NOT EXISTS qr_token uuid NOT NULL DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS date_of_birth date,
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS joined_date date;
CREATE UNIQUE INDEX IF NOT EXISTS teachers_qr_token_idx ON public.teachers(qr_token);

-- CLASSROOMS: grade/section + class teacher
ALTER TABLE public.classrooms
  ADD COLUMN IF NOT EXISTS grade text,
  ADD COLUMN IF NOT EXISTS section text,
  ADD COLUMN IF NOT EXISTS class_teacher_id uuid REFERENCES public.teachers(id) ON DELETE SET NULL;

-- Public read teacher by qr token (already public via is_visible; ensure by-token works even if not visible)
DROP POLICY IF EXISTS "Public read teacher by token" ON public.teachers;
CREATE POLICY "Public read teacher by token" ON public.teachers FOR SELECT USING (true);
-- Note: replace the existing public read policy to always allow SELECT (profile is meant to be public).
DROP POLICY IF EXISTS "Public read visible teachers" ON public.teachers;

-- STUDENTS
CREATE TABLE IF NOT EXISTS public.students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_token uuid NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  admission_no text UNIQUE,
  roll_no text,
  first_name text NOT NULL,
  last_name text,
  gender text,
  date_of_birth date,
  blood_group text,
  address text,
  phone text,
  email text,
  photo_url text,
  classroom_id uuid REFERENCES public.classrooms(id) ON DELETE SET NULL,
  grade text,
  section text,
  admission_date date,
  previous_school text,
  father_name text,
  father_occupation text,
  father_phone text,
  father_email text,
  father_photo_url text,
  mother_name text,
  mother_occupation text,
  mother_phone text,
  mother_email text,
  mother_photo_url text,
  guardian_name text,
  guardian_phone text,
  notes text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.students TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.students TO authenticated;
GRANT ALL ON public.students TO service_role;

ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read students" ON public.students FOR SELECT USING (true);
CREATE POLICY "Admins manage students" ON public.students FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_students_updated BEFORE UPDATE ON public.students
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS students_classroom_idx ON public.students(classroom_id);

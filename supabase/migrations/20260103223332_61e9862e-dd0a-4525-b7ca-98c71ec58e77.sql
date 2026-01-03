-- Create universities table
CREATE TABLE IF NOT EXISTS public.universities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  short_name text,
  created_at timestamp with time zone DEFAULT now()
);

-- Create faculties table
CREATE TABLE IF NOT EXISTS public.faculties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id uuid REFERENCES public.universities(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(university_id, name)
);

-- Create departments table
CREATE TABLE IF NOT EXISTS public.departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  faculty_id uuid REFERENCES public.faculties(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(faculty_id, name)
);

-- Create course_catalog table for pre-populated courses
CREATE TABLE IF NOT EXISTS public.course_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id uuid REFERENCES public.departments(id) ON DELETE CASCADE NOT NULL,
  course_code text NOT NULL,
  title text NOT NULL,
  unit_load integer NOT NULL DEFAULT 3,
  level text NOT NULL,
  semester text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(department_id, course_code)
);

-- Create student_courses table to track student's enrolled courses
CREATE TABLE IF NOT EXISTS public.student_courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  course_catalog_id uuid REFERENCES public.course_catalog(id) ON DELETE CASCADE NOT NULL,
  score numeric,
  grade text,
  is_carryover boolean DEFAULT false,
  original_semester text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, course_catalog_id)
);

-- Add new columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS university_id uuid REFERENCES public.universities(id),
ADD COLUMN IF NOT EXISTS faculty_id uuid REFERENCES public.faculties(id),
ADD COLUMN IF NOT EXISTS department_id uuid REFERENCES public.departments(id);

-- Enable RLS on new tables
ALTER TABLE public.universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_courses ENABLE ROW LEVEL SECURITY;

-- Universities: public read access
CREATE POLICY "Universities are viewable by everyone" ON public.universities FOR SELECT USING (true);

-- Faculties: public read access
CREATE POLICY "Faculties are viewable by everyone" ON public.faculties FOR SELECT USING (true);

-- Departments: public read access
CREATE POLICY "Departments are viewable by everyone" ON public.departments FOR SELECT USING (true);

-- Course catalog: public read access
CREATE POLICY "Course catalog is viewable by everyone" ON public.course_catalog FOR SELECT USING (true);

-- Student courses: users can only access their own
CREATE POLICY "Users can view own student courses" ON public.student_courses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own student courses" ON public.student_courses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own student courses" ON public.student_courses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own student courses" ON public.student_courses FOR DELETE USING (auth.uid() = user_id);

-- Admin policies for management
CREATE POLICY "Admins can manage universities" ON public.universities FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can manage faculties" ON public.faculties FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can manage departments" ON public.departments FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can manage course catalog" ON public.course_catalog FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can view all student courses" ON public.student_courses FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- Update handle_new_user function to include new fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, level, semester, university_id, faculty_id, department_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Student'),
    COALESCE(NEW.raw_user_meta_data->>'level', '100L'),
    COALESCE(NEW.raw_user_meta_data->>'semester', '1st'),
    NULLIF(NEW.raw_user_meta_data->>'university_id', '')::uuid,
    NULLIF(NEW.raw_user_meta_data->>'faculty_id', '')::uuid,
    NULLIF(NEW.raw_user_meta_data->>'department_id', '')::uuid
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'student');
  
  RETURN NEW;
END;
$$;

-- Create trigger for updating timestamps on student_courses
CREATE TRIGGER update_student_courses_updated_at
BEFORE UPDATE ON public.student_courses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- Insert UNN as initial university with some sample data
INSERT INTO public.universities (name, short_name) VALUES ('University of Nigeria, Nsukka', 'UNN') ON CONFLICT DO NOTHING;
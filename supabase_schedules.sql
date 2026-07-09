-- Create class_schedules table
CREATE TABLE public.class_schedules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    lecturer_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    title text NOT NULL,
    start_time timestamptz NOT NULL,
    end_time timestamptz NOT NULL,
    location text,
    created_at timestamptz DEFAULT now() NOT NULL
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.class_schedules ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read schedules
CREATE POLICY "Enable read access for all authenticated users on class_schedules"
ON public.class_schedules FOR SELECT
TO authenticated
USING (true);

-- Allow admins and lecturers to insert schedules
CREATE POLICY "Enable insert access for admins and lecturers on class_schedules"
ON public.class_schedules FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid() AND (users.role = 'admin' OR users.role = 'lecturer')
  )
);

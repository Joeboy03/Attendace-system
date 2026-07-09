-- Run this in your Supabase SQL Editor to add the missing columns
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS faculty text,
ADD COLUMN IF NOT EXISTS department text,
ADD COLUMN IF NOT EXISTS level text;

-- Profiles table for user settings
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  bio TEXT,
  theme TEXT DEFAULT 'dark',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE USING (auth.uid() = id);

-- Habits table
CREATE TABLE IF NOT EXISTS public.habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  frequency TEXT NOT NULL DEFAULT 'daily',
  color TEXT DEFAULT '#22c55e',
  target_days INTEGER DEFAULT 7,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "habits_select_own" ON public.habits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "habits_insert_own" ON public.habits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "habits_update_own" ON public.habits FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "habits_delete_own" ON public.habits FOR DELETE USING (auth.uid() = user_id);

-- Habit completions (daily check-ins)
CREATE TABLE IF NOT EXISTS public.habit_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  completed_at DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(habit_id, completed_at)
);

ALTER TABLE public.habit_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "completions_select_own" ON public.habit_completions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "completions_insert_own" ON public.habit_completions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "completions_update_own" ON public.habit_completions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "completions_delete_own" ON public.habit_completions FOR DELETE USING (auth.uid() = user_id);

-- Auto-create profile trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

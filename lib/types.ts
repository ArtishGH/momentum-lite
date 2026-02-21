/**
 * Momentum Lite - TypeScript Types
 * Demonstrates: union types, intersection types, generics, type predicates,
 * function overloading, and built-in generic types (Pick, Partial, Record, etc.)
 */

// --- Base database row types ---
export type Profile = {
  id: string
  display_name: string | null
  bio: string | null
  theme: 'dark' | 'light' // Union type for theme
  created_at: string
  updated_at: string
}

export type Habit = {
  id: string
  user_id: string
  title: string
  description: string | null
  category: HabitCategory
  color: string
  frequency: HabitFrequency
  target_days: number
  icon: string
  is_archived: boolean
  custom_days: number[] | null // Array of day numbers (0=Sunday, 1=Monday, ..., 6=Saturday)
  created_at: string
  updated_at: string
}

export type HabitCompletion = {
  id: string
  habit_id: string
  user_id: string
  completed_at: string
  notes: string | null // Matches database column name
  created_at: string
}

// --- Union types ---
export type HabitCategory = 'health' | 'productivity' | 'mindfulness' | 'fitness' | 'learning' | 'general'
export type HabitFrequency = 'daily' | 'weekly' | 'custom'
export type FormStep = 'basics' | 'details' | 'confirmation'

// --- Intersection type: Habit with its completions ---
export type HabitWithCompletions = Habit & {
  completions: HabitCompletion[]
  completionRate: number
}

// --- Built-in generic types ---
export type HabitInsert = Omit<Habit, 'id' | 'created_at' | 'updated_at'>
export type HabitUpdate = Partial<Pick<Habit, 'title' | 'description' | 'category' | 'color' | 'frequency' | 'target_days' | 'icon' | 'is_archived' | 'custom_days'>>
export type ProfileUpdate = Partial<Pick<Profile, 'display_name' | 'bio' | 'theme'>>

// Record type for chart data
export type WeeklyStats = Record<string, number>

// Readonly config type
export type AppConfig = Readonly<{
  appName: string
  defaultTheme: 'dark' | 'light'
  maxHabits: number
  categories: readonly HabitCategory[]
}>

export const APP_CONFIG: AppConfig = {
  appName: 'Momentum Lite',
  defaultTheme: 'dark',
  maxHabits: 20,
  categories: ['health', 'productivity', 'mindfulness', 'fitness', 'learning', 'general'] as const,
}

// --- Type predicate ---
export function isHabitWithCompletions(
  habit: Habit | HabitWithCompletions
): habit is HabitWithCompletions {
  return 'completions' in habit && 'completionRate' in habit
}

// --- Function overloading ---
export function formatHabitData(habit: Habit): string
export function formatHabitData(habit: Habit, withDetails: true): { title: string; description: string; category: HabitCategory }
export function formatHabitData(
  habit: Habit,
  withDetails?: boolean
): string | { title: string; description: string; category: HabitCategory } {
  if (withDetails) {
    return {
      title: habit.title,
      description: habit.description ?? 'No description',
      category: habit.category,
    }
  }
  return habit.title
}

// --- Chart data types ---
export type ChartDataPoint = {
  date: string
  completed: number
  total: number
  rate: number
}

// --- API response type (generic) ---
export type ApiResponse<T> = {
  data: T | null
  error: string | null
  loading: boolean
}

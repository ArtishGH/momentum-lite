import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Archive } from 'lucide-react'
import { HabitCard } from '@/components/habit-card'
import { GenericList } from '@/components/generic-list'
import type { Metadata } from 'next'
import type { Habit, HabitCompletion, HabitWithCompletions } from '@/lib/types'
import { isHabitWithCompletions } from '@/lib/types'
import { format } from 'date-fns'
import { ArchivedHabitsClient } from './archived-habits-client'

export const metadata: Metadata = {
  title: 'Archived Habits',
}

export default async function ArchivedHabitsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Fetch archived habits
  const { data: habits } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_archived', true)
    .order('updated_at', { ascending: false })

  // Fetch completions from the last 30 days for archived habits
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const habitIds = habits?.map((h) => h.id) || []
  const { data: completions } = habitIds.length > 0
    ? await supabase
        .from('habit_completions')
        .select('*')
        .eq('user_id', user.id)
        .in('habit_id', habitIds)
        .gte('completed_at', thirtyDaysAgo.toISOString().split('T')[0])
    : { data: [] }

  return (
    <ArchivedHabitsClient
      habits={habits || []}
      completions={completions || []}
      userId={user.id}
    />
  )
}

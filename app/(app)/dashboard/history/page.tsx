import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { HistoryClient } from './history-client'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'History | Momentum Lite',
  description: 'View your habit completion history.',
}

export default async function HistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Fetch all habits and completions for the user
  const [habitsRes, completionsRes] = await Promise.all([
    supabase
      .from('habits')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('habit_completions')
      .select('*')
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false }),
  ])

  if (habitsRes.error || completionsRes.error) {
    return <div>Error loading history</div>
  }

  return (
    <HistoryClient 
      habits={habitsRes.data || []} 
      completions={completionsRes.data || []} 
    />
  )
}

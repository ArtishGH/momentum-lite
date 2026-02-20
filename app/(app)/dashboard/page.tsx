import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardClient } from './dashboard-client'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Fetch habits
  const { data: habits } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_archived', false)
    .order('created_at', { ascending: false })

  // Fetch completions from the last 7 days
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const { data: completions } = await supabase
    .from('habit_completions')
    .select('*')
    .eq('user_id', user.id)
    .gte('completed_at', sevenDaysAgo.toISOString().split('T')[0])

  return (
    <DashboardClient
      habits={habits ?? []}
      completions={completions ?? []}
      userId={user.id}
    />
  )
}

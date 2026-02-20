import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { HabitForm } from '@/components/habit-form'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'New Habit',
}

export default async function NewHabitPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Create New Habit</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Build a new habit in 3 easy steps
        </p>
      </div>
      <HabitForm userId={user.id} />
    </div>
  )
}

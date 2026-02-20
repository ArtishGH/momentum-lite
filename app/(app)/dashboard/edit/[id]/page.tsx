import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { HabitForm } from '@/components/habit-form'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Edit Habit',
}

export default async function EditHabitPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: habit } = await supabase
    .from('habits')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!habit) {
    notFound()
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Edit Habit</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update your habit details
        </p>
      </div>
      <HabitForm editHabit={habit} userId={user.id} />
    </div>
  )
}

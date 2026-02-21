import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { NewHabitClient } from './new-habit-client'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'New Habit',
}

type NewHabitPageProps = {
  searchParams: Promise<{ template?: string; [key: string]: string | undefined }>
}

export default async function NewHabitPage({ searchParams }: NewHabitPageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const params = await searchParams
  const hasTemplate = params.template

  // If template is selected via URL, pre-fill form with template data
  const initialTemplate = hasTemplate ? {
    title: params.title || '',
    description: params.description || '',
    category: params.category || 'general',
    frequency: params.frequency || 'daily',
    color: params.color || '#22c55e',
    icon: params.icon || 'check',
    target_days: params.target_days ? parseInt(params.target_days) : 7,
  } : null

  return <NewHabitClient userId={user.id} initialTemplate={initialTemplate} />
}

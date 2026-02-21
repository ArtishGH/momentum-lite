'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { Archive, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

import { createClient } from '@/lib/supabase/client'
import type { Habit, HabitCompletion, HabitWithCompletions } from '@/lib/types'
import { isHabitWithCompletions } from '@/lib/types'
import { HabitCard } from '@/components/habit-card'
import { GenericList } from '@/components/generic-list'
import { Button } from '@/components/ui/button'

type ArchivedHabitsClientProps = {
  habits: Habit[]
  completions: HabitCompletion[]
  userId: string
}

export function ArchivedHabitsClient({ habits: initialHabits, completions: initialCompletions, userId }: ArchivedHabitsClientProps) {
  const [habits, setHabits] = useState<Habit[]>(initialHabits)
  const [completions, setCompletions] = useState<HabitCompletion[]>(initialCompletions)
  const router = useRouter()
  const today = format(new Date(), 'yyyy-MM-dd')

  // Build habits with completions data
  const habitsWithCompletions: HabitWithCompletions[] = useMemo(() => {
    return habits.map((habit) => {
      const habitCompletions = completions.filter((c) => c.habit_id === habit.id)
      const totalDays = 30
      const completedDays = new Set(habitCompletions.map((c) => c.completed_at)).size
      return {
        ...habit,
        completions: habitCompletions,
        completionRate: totalDays > 0 ? completedDays / totalDays : 0,
      }
    })
  }, [habits, completions])

  const isTodayCompleted = (habitId: string): boolean => {
    return completions.some((c) => c.habit_id === habitId && c.completed_at === today)
  }

  const handleToggle = async (habitId: string) => {
    const supabase = createClient()
    const isCompleted = isTodayCompleted(habitId)

    if (isCompleted) {
      const { error } = await supabase
        .from('habit_completions')
        .delete()
        .eq('habit_id', habitId)
        .eq('completed_at', today)
        .eq('user_id', userId)

      if (error) {
        toast.error('Failed to update habit')
        return
      }
      setCompletions((prev) => prev.filter((c) => !(c.habit_id === habitId && c.completed_at === today)))
    } else {
      const { data, error } = await supabase
        .from('habit_completions')
        .insert({
          habit_id: habitId,
          user_id: userId,
          completed_at: today,
        })
        .select()
        .single()

      if (error) {
        toast.error('Failed to update habit')
        return
      }
      setCompletions((prev) => [...prev, data])
    }
  }

  const handleUnarchive = async (habitId: string) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('habits')
      .update({ is_archived: false })
      .eq('id', habitId)
      .eq('user_id', userId)

    if (error) {
      toast.error('Failed to unarchive habit')
      return
    }

    setHabits((prev) => prev.filter((h) => h.id !== habitId))
    toast.success('Habit unarchived')
    router.refresh()
  }

  const handleDelete = async (habitId: string) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('habits')
      .delete()
      .eq('id', habitId)
      .eq('user_id', userId)

    if (error) {
      toast.error('Failed to delete habit')
      return
    }

    setHabits((prev) => prev.filter((h) => h.id !== habitId))
    setCompletions((prev) => prev.filter((c) => c.habit_id !== habitId))
    toast.success('Habit deleted')
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Archive className="h-6 w-6" />
              Archived Habits
            </h1>
            <p className="mt-1 text-sm text-muted-foreground font-mono">
              {habits.length} archived {habits.length === 1 ? 'habit' : 'habits'}
            </p>
          </div>
        </div>
      </div>

      {habits.length === 0 ? (
        <div className="text-center py-12">
          <Archive className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No archived habits yet</p>
          <Link href="/dashboard">
            <Button variant="outline" className="mt-4">
              Go to Dashboard
            </Button>
          </Link>
        </div>
      ) : (
        <GenericList<HabitWithCompletions>
          items={habitsWithCompletions}
          emptyMessage="No archived habits"
          className="space-y-2"
          renderItem={(habit) => (
            <HabitCard
              habit={habit}
              todayCompleted={isTodayCompleted(habit.id)}
              onToggle={handleToggle}
              onEdit={(id) => router.push(`/dashboard/edit/${id}`)}
              onDelete={handleDelete}
              onArchive={handleUnarchive}
            />
          )}
        />
      )}
    </div>
  )
}

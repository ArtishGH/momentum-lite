'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { format, subDays, startOfDay } from 'date-fns'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

import { createClient } from '@/lib/supabase/client'
import type { Habit, HabitCompletion, HabitWithCompletions, ChartDataPoint } from '@/lib/types'
import { isHabitWithCompletions } from '@/lib/types'
import { HabitCard } from '@/components/habit-card'
import { HabitChart } from '@/components/habit-chart'
import { StatsOverview } from '@/components/stats-cards'
import { GenericList } from '@/components/generic-list'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

type DashboardClientProps = {
  habits: Habit[]
  completions: HabitCompletion[]
  userId: string
}

export function DashboardClient({ habits: initialHabits, completions: initialCompletions, userId }: DashboardClientProps) {
  const [habits, setHabits] = useState<Habit[]>(initialHabits)
  const [completions, setCompletions] = useState<HabitCompletion[]>(initialCompletions)
  const router = useRouter()
  const today = format(new Date(), 'yyyy-MM-dd')

  // Build habits with completions data using type predicate
  const habitsWithCompletions: HabitWithCompletions[] = useMemo(() => {
    return habits.map((habit) => {
      const habitCompletions = completions.filter((c) => c.habit_id === habit.id)
      const totalDays = 7
      const completedDays = new Set(habitCompletions.map((c) => c.completed_at)).size
      const enriched: HabitWithCompletions = {
        ...habit,
        completions: habitCompletions,
        completionRate: totalDays > 0 ? completedDays / totalDays : 0,
      }
      // Verify with type predicate
      if (isHabitWithCompletions(enriched)) {
        return enriched
      }
      return enriched
    })
  }, [habits, completions])

  // Check if a habit is completed today
  const isTodayCompleted = (habitId: string): boolean => {
    return completions.some((c) => c.habit_id === habitId && c.completed_at === today)
  }

  // Toggle habit completion
  const handleToggle = async (habitId: string) => {
    const supabase = createClient()
    const isCompleted = isTodayCompleted(habitId)

    if (isCompleted) {
      // Remove today's completion
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
      // Add completion
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

  // Delete habit
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

  // Calculate stats
  const completedToday = habits.filter((h) => isTodayCompleted(h.id)).length
  const weeklyRate = habits.length > 0
    ? Math.round((completions.length / (habits.length * 7)) * 100)
    : 0

  // Calculate streak (consecutive days with all habits complete)
  const currentStreak = useMemo(() => {
    if (habits.length === 0) return 0
    let streak = 0
    for (let i = 0; i < 30; i++) {
      const day = format(subDays(startOfDay(new Date()), i), 'yyyy-MM-dd')
      const dayCompletions = completions.filter((c) => c.completed_at === day)
      const uniqueHabits = new Set(dayCompletions.map((c) => c.habit_id))
      if (uniqueHabits.size >= habits.length) {
        streak++
      } else if (i > 0) {
        break
      }
    }
    return streak
  }, [habits, completions])

  // Chart data for last 7 days
  const chartData: ChartDataPoint[] = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i)
      const dateStr = format(date, 'yyyy-MM-dd')
      const dayCompletions = completions.filter((c) => c.completed_at === dateStr)
      const completed = new Set(dayCompletions.map((c) => c.habit_id)).size
      return {
        date: format(date, 'EEE'),
        completed,
        total: habits.length,
        rate: habits.length > 0 ? Math.round((completed / habits.length) * 100) : 0,
      }
    })
  }, [habits, completions])

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-balance">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground font-mono">
            {format(new Date(), 'EEEE, MMMM d')}
          </p>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Habit</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-3" align="end">
            <p className="mb-2 text-xs font-medium text-muted-foreground">Quick add or use full form</p>
            <Link href="/dashboard/new">
              <Button size="sm" className="w-full gap-2">
                <Plus className="h-4 w-4" />
                Create New Habit
              </Button>
            </Link>
          </PopoverContent>
        </Popover>
      </div>

      {/* Stats Overview */}
      <StatsOverview
        totalHabits={habits.length}
        completedToday={completedToday}
        currentStreak={currentStreak}
        weeklyRate={Math.min(weeklyRate, 100)}
      />

      {/* Chart */}
      <HabitChart data={chartData} />

      {/* Habit list using GenericList */}
      <div>
        <h2 className="mb-3 text-base font-semibold">Today&apos;s Habits</h2>
        <GenericList<HabitWithCompletions>
          items={habitsWithCompletions}
          emptyMessage="No habits yet. Create one to get started!"
          className="space-y-2"
          renderItem={(habit) => (
            <HabitCard
              habit={habit}
              todayCompleted={isTodayCompleted(habit.id)}
              onToggle={handleToggle}
              onEdit={(id) => router.push(`/dashboard/edit/${id}`)}
              onDelete={handleDelete}
            />
          )}
        />
      </div>
    </div>
  )
}

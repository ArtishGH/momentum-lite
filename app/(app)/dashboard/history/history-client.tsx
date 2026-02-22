'use client'

import { useState, useMemo } from 'react'
import { CompletionsTable } from '@/components/completions-table'
import type { Habit, HabitCompletion } from '@/lib/types'
import { History as HistoryIcon, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

type HistoryClientProps = {
  completions: HabitCompletion[]
  habits: Habit[]
}

export function HistoryClient({ completions, habits }: HistoryClientProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredCompletions = useMemo(() => {
    return completions.filter((completion) => {
      const habit = habits.find((h) => h.id === completion.habit_id)
      const matchesSearch =
        (habit?.title.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
        (completion.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
      return matchesSearch
    })
  }, [completions, habits, searchQuery])

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <HistoryIcon className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Completions History</h1>
            <p className="text-sm text-muted-foreground">
              A comprehensive list of all your habit completions and notes.
            </p>
          </div>
        </div>
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search habits or notes..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <CompletionsTable completions={filteredCompletions} habits={habits} />
    </div>
  )
}

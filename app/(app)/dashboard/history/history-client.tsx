'use client'

import { CompletionsTable } from '@/components/completions-table'
import type { Habit, HabitCompletion } from '@/lib/types'
import { History as HistoryIcon } from 'lucide-react'

type HistoryClientProps = {
  completions: HabitCompletion[]
  habits: Habit[]
}

export function HistoryClient({ completions, habits }: HistoryClientProps) {
  return (
    <div className="space-y-6 animate-fade-in">
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

      <CompletionsTable completions={completions} habits={habits} />
    </div>
  )
}

'use client'

import { format } from 'date-fns'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Habit, HabitCompletion } from '@/lib/types'
import { getIcon } from '@/lib/icon-utils'
import { Badge } from '@/components/ui/badge'

type CompletionsTableProps = {
  completions: HabitCompletion[]
  habits: Habit[]
}

export function CompletionsTable({ completions, habits }: CompletionsTableProps) {
  const getHabitById = (id: string) => habits.find((h) => h.id === id)

  // Sort completions by date (newest first)
  const sortedCompletions = [...completions].sort(
    (a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
  )

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableCaption>A list of your recent habit completions.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Date</TableHead>
            <TableHead>Habit</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Notes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedCompletions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                No completions found.
              </TableCell>
            </TableRow>
          ) : (
            sortedCompletions.map((completion) => {
              const habit = getHabitById(completion.habit_id)
              if (!habit) return null

              const IconComponent = getIcon(habit.icon)

              return (
                <TableRow key={completion.id}>
                  <TableCell className="font-medium whitespace-nowrap">
                    {format(new Date(completion.completed_at), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className="flex h-6 w-6 items-center justify-center rounded bg-primary/10"
                        style={{ color: habit.color }}
                      >
                        <IconComponent className="h-3.5 w-3.5" />
                      </div>
                      <span className="font-medium">{habit.title}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {habit.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate italic text-muted-foreground">
                    {completion.notes || '-'}
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}

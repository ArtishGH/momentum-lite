'use client'

import { useMemo } from 'react'
import { format, subDays, eachDayOfInterval, startOfDay, isSameDay } from 'date-fns'
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import type { HabitCompletion } from '@/lib/types'

type ContributionGraphProps = {
  completions: HabitCompletion[]
  habitsCount: number
}

/**
 * ContributionGraph - GitHub-style heatmap for habit completions.
 * Renders a full year (52 weeks) of progress.
 * Intensity is based on the ratio of completed habits vs total habits.
 */
export function ContributionGraph({ completions, habitsCount }: ContributionGraphProps) {
  const days = useMemo(() => {
    const end = startOfDay(new Date())
    const start = subDays(end, 364) // Last 365 days
    
    return eachDayOfInterval({ start, end }).map(date => {
      const dateStr = format(date, 'yyyy-MM-dd')
      const dayCompletions = completions.filter(c => c.completed_at === dateStr)
      const count = new Set(dayCompletions.map(c => c.habit_id)).size
      
      // Calculate intensity (0-4)
      let intensity = 0
      if (habitsCount > 0 && count > 0) {
        const ratio = count / habitsCount
        if (ratio > 0.75) intensity = 4
        else if (ratio > 0.5) intensity = 3
        else if (ratio > 0.25) intensity = 2
        else intensity = 1
      }
      
      return {
        date,
        dateStr,
        count,
        intensity
      }
    })
  }, [completions, habitsCount])

  // Group days into weeks for the grid
  const weeks = useMemo(() => {
    const result = []
    for (let i = 0; i < days.length; i += 7) {
      result.push(days.slice(i, i + 7))
    }
    return result
  }, [days])

  const getIntensityClass = (level: number) => {
    switch (level) {
      case 1: return 'bg-emerald-500/20'
      case 2: return 'bg-emerald-500/40'
      case 3: return 'bg-emerald-500/70'
      case 4: return 'bg-emerald-500'
      default: return 'bg-muted/30'
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card/30 p-4 backdrop-blur-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium">Activity Heatmap</h3>
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="h-2.5 w-2.5 rounded-sm bg-muted/30" />
            <div className="h-2.5 w-2.5 rounded-sm bg-emerald-500/20" />
            <div className="h-2.5 w-2.5 rounded-sm bg-emerald-500/40" />
            <div className="h-2.5 w-2.5 rounded-sm bg-emerald-500/70" />
            <div className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
          </div>
          <span>More</span>
        </div>
      </div>

      <div className="overflow-hidden pb-2">
        <div className="flex w-full gap-1">
          <TooltipProvider delayDuration={0}>
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-1 flex-col gap-1">
                {week.map((day) => (
                  <Tooltip key={day.dateStr}>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          'w-full aspect-square shrink-0 rounded-sm transition-all duration-300 hover:ring-1 hover:ring-primary/50',
                          getIntensityClass(day.intensity)
                        )}
                      />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-[10px] py-1 px-2">
                      <p className="font-bold">{day.count} {day.count === 1 ? 'habit' : 'habits'} completed</p>
                      <p className="text-muted-foreground">{format(day.date, 'MMM d, yyyy')}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            ))}
          </TooltipProvider>
        </div>
      </div>
    </div>
  )
}

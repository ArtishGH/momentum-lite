'use client'

import { Flame, Target, TrendingUp, CheckCircle2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

/**
 * CompoundCard - A compound component pattern for stat cards.
 * Demonstrates: Compound component with Root, Icon, Label, Value sub-components.
 */
function StatCardRoot({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <Card className={`group overflow-hidden transition-all duration-200 hover:border-primary/20 hover:shadow-sm ${className ?? ''}`}>
      <CardContent className="flex items-center gap-4 p-4">
        {children}
      </CardContent>
    </Card>
  )
}

function StatCardIcon({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform duration-200 group-hover:scale-105">
      {children}
    </div>
  )
}

function StatCardLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-muted-foreground">{children}</p>
}

function StatCardValue({ children }: { children: React.ReactNode }) {
  return <p className="text-xl font-bold font-mono leading-none">{children}</p>
}

// Compound component export
export const StatCard = {
  Root: StatCardRoot,
  Icon: StatCardIcon,
  Label: StatCardLabel,
  Value: StatCardValue,
}

type StatsOverviewProps = {
  totalHabits: number
  completedToday: number
  currentStreak: number
  weeklyRate: number
}

export function StatsOverview({ totalHabits, completedToday, currentStreak, weeklyRate }: StatsOverviewProps) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatCard.Root>
        <StatCard.Icon>
          <Target className="h-5 w-5" />
        </StatCard.Icon>
        <div>
          <StatCard.Label>Total Habits</StatCard.Label>
          <StatCard.Value>{totalHabits}</StatCard.Value>
        </div>
      </StatCard.Root>

      <StatCard.Root>
        <StatCard.Icon>
          <CheckCircle2 className="h-5 w-5" />
        </StatCard.Icon>
        <div>
          <StatCard.Label>Done Today</StatCard.Label>
          <StatCard.Value>{completedToday}/{totalHabits}</StatCard.Value>
        </div>
      </StatCard.Root>

      <StatCard.Root>
        <StatCard.Icon>
          <Flame className="h-5 w-5" />
        </StatCard.Icon>
        <div>
          <StatCard.Label>Current Streak</StatCard.Label>
          <StatCard.Value>{currentStreak}d</StatCard.Value>
        </div>
      </StatCard.Root>

      <StatCard.Root>
        <StatCard.Icon>
          <TrendingUp className="h-5 w-5" />
        </StatCard.Icon>
        <div>
          <StatCard.Label>Weekly Rate</StatCard.Label>
          <StatCard.Value>{weeklyRate}%</StatCard.Value>
        </div>
      </StatCard.Root>
    </div>
  )
}

'use client'

import { useState, useRef, type RefObject } from 'react'
import { Check, MoreHorizontal, Pencil, Trash2, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { HabitWithCompletions } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

type HabitCardProps = {
  habit: HabitWithCompletions
  todayCompleted: boolean
  onToggle: (habitId: string) => void
  onEdit: (habitId: string) => void
  onDelete: (habitId: string) => void
}

// State type for the check animation
type CheckState = 'idle' | 'checking' | 'checked'

/**
 * HabitCard - Displays a single habit with a glassmorphic card design.
 * Interactive animations on check/uncheck with green intensity scaling.
 * Uses group class for hover effects, custom animation on toggle.
 */
export function HabitCard({ habit, todayCompleted, onToggle, onEdit, onDelete }: HabitCardProps) {
  // Typed state and ref
  const [checkState, setCheckState] = useState<CheckState>(todayCompleted ? 'checked' : 'idle')
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const cardRef: RefObject<HTMLDivElement | null> = useRef<HTMLDivElement>(null)

  const completionRate = habit.completionRate

  // Green intensity scales with completion rate (GitHub contribution style)
  const getGreenIntensity = (): string => {
    if (!todayCompleted) return 'bg-secondary'
    if (completionRate >= 0.8) return 'bg-success/30'
    if (completionRate >= 0.5) return 'bg-success/20'
    return 'bg-success/10'
  }

  const handleToggle = () => {
    setCheckState('checking')
    setTimeout(() => {
      setCheckState(todayCompleted ? 'idle' : 'checked')
      onToggle(habit.id)
    }, 200)
  }

  return (
    <>
      <Card
        ref={cardRef}
        className={cn(
          'group relative overflow-hidden border transition-all duration-300',
          'hover:border-primary/30 hover:shadow-md hover:shadow-primary/5',
          getGreenIntensity()
        )}
      >
        <CardContent className="flex items-center gap-4 p-4">
          {/* Check button with animation */}
          <button
            onClick={handleToggle}
            className={cn(
              'relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border-2 transition-all duration-300',
              'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background',
              'active:scale-90',
              todayCompleted
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-muted-foreground/30 hover:border-primary/60'
            )}
            aria-label={todayCompleted ? `Uncheck ${habit.title}` : `Check ${habit.title}`}
          >
            {(checkState === 'checked' || todayCompleted) && (
              <Check className="h-4 w-4 animate-check-bounce" />
            )}
            {checkState === 'checking' && (
              <RotateCcw className="h-4 w-4 animate-spin" />
            )}
          </button>

          {/* Habit info */}
          <div className="min-w-0 flex-1">
            <p className={cn(
              'font-medium text-sm leading-relaxed transition-all duration-200',
              todayCompleted && 'line-through text-muted-foreground'
            )}>
              {habit.title}
            </p>
            {habit.description && (
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {habit.description}
              </p>
            )}
          </div>

          {/* Streak / completion indicator */}
          <div className="hidden items-center gap-2 sm:flex">
            <div className="flex gap-0.5">
              {[...Array(7)].map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'h-3 w-3 rounded-sm transition-colors',
                    i < Math.round(completionRate * 7)
                      ? 'bg-primary'
                      : 'bg-muted'
                  )}
                />
              ))}
            </div>
            <span className="text-xs font-mono text-muted-foreground">
              {Math.round(completionRate * 100)}%
            </span>
          </div>

          {/* Actions dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-all duration-200 hover:bg-muted hover:text-foreground focus:outline-none group-hover:opacity-100">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Actions for {habit.title}</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => onEdit(habit.id)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setShowDeleteDialog(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardContent>
      </Card>

      {/* Delete confirmation (AlertDialog) */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete habit</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{habit.title}&quot;? This action cannot be undone and all completion history will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDelete(habit.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

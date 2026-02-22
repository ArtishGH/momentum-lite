'use client'

import { useState, useRef, type RefObject } from 'react'
import { Check, MoreHorizontal, Pencil, Trash2, RotateCcw, FileText, Flame } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getIcon } from '@/lib/icon-utils'
import type { HabitWithCompletions } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
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
import { CompletionNotesDialog } from '@/components/completion-notes-dialog'
import { HabitDetailsDrawer } from '@/components/habit-details-drawer'

type HabitCardProps = {
  habit: HabitWithCompletions
  todayCompleted: boolean
  onToggle: (habitId: string) => void
  onEdit: (habitId: string) => void
  onDelete: (habitId: string) => void
  onSaveNote?: (habitId: string, notes: string) => Promise<void>
}

// State type for the check animation
type CheckState = 'idle' | 'checking' | 'checked'

/**
 * HabitCard - Displays a single habit with a glassmorphic card design.
 * Interactive animations on check/uncheck with green intensity scaling.
 * Uses group class for hover effects, custom animation on toggle.
 */
export function HabitCard({ habit, todayCompleted, onToggle, onEdit, onDelete, onSaveNote }: HabitCardProps) {
  // Typed state and ref
  const [checkState, setCheckState] = useState<CheckState>(todayCompleted ? 'checked' : 'idle')
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showNotesDialog, setShowNotesDialog] = useState(false)
  const [showDetailsDrawer, setShowDetailsDrawer] = useState(false)
  const cardRef: RefObject<HTMLDivElement | null> = useRef<HTMLDivElement>(null)

  const completionRate = habit.completionRate
  const IconComponent = getIcon(habit.icon || 'check')
  
  // Get today's completion notes if any
  const today = new Date().toISOString().split('T')[0]
  const todayCompletion = habit.completions.find(c => c.completed_at === today)
  const todayNotes = todayCompletion?.notes || null

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
        <CardContent className="flex items-center gap-3 py-1.5 px-4">
          {/* Habit Icon */}
          <div 
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${habit.color}20`, color: habit.color }}
          >
            <IconComponent className="h-4 w-4" />
          </div>

          {/* Check button with animation */}
          <button
            onClick={handleToggle}
            className={cn(
              'relative flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 transition-all duration-300',
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
            {todayNotes && todayCompleted && (
              <p className="mt-1 text-xs text-muted-foreground italic truncate">
                &quot;{todayNotes}&quot;
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

          {/* Direct Actions (Visible on Hover) */}
          <div className="flex items-center gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            {onSaveNote && (
              <button
                onClick={() => setShowNotesDialog(true)}
                className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-all hover:bg-muted hover:text-foreground active:scale-95"
                title={todayNotes ? 'Edit Note' : 'Add Note'}
              >
                <FileText className="h-4 w-4" />
                <span className="sr-only">{todayNotes ? 'Edit Note' : 'Add Note'}</span>
              </button>
            )}
            
            <button
              onClick={() => setShowDetailsDrawer(true)}
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-all hover:bg-orange-500/10 hover:text-orange-500 active:scale-95"
              title="View Insights"
            >
              <Flame className="h-4 w-4" />
              <span className="sr-only">View Insights</span>
            </button>

            <button
              onClick={() => onEdit(habit.id)}
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-all hover:bg-muted hover:text-foreground active:scale-95"
              title="Edit Habit"
            >
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </button>

            <button
              onClick={() => setShowDeleteDialog(true)}
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive active:scale-95"
              title="Delete Habit"
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete</span>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Habit Details (Drawer) */}
      <HabitDetailsDrawer 
        habit={habit} 
        open={showDetailsDrawer} 
        onOpenChange={setShowDetailsDrawer} 
      />

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

      {/* Completion Notes Dialog */}
      {onSaveNote && (
        <CompletionNotesDialog
          habitTitle={habit.title}
          existingNotes={todayNotes}
          onSave={async (notes) => {
            await onSaveNote(habit.id, notes)
            setShowNotesDialog(false)
          }}
          open={showNotesDialog}
          onOpenChange={setShowNotesDialog}
        />
      )}
    </>
  )
}

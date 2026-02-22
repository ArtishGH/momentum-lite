'use client'

import * as React from 'react'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import type { HabitWithCompletions } from '@/lib/types'
import { getIcon } from '@/lib/icon-utils'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'

type HabitDetailsDrawerProps = {
  habit: HabitWithCompletions
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function HabitDetailsDrawer({
  habit,
  trigger,
  open,
  onOpenChange,
}: HabitDetailsDrawerProps) {
  const IconComponent = getIcon(habit.icon)

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <div className="flex items-center gap-4">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${habit.color}15`, color: habit.color }}
              >
                <IconComponent className="h-6 w-6" />
              </div>
              <div className="text-left">
                <DrawerTitle>{habit.title}</DrawerTitle>
                <DrawerDescription className="capitalize">
                  {habit.category} • {habit.frequency}
                </DrawerDescription>
              </div>
            </div>
          </DrawerHeader>

          <div className="p-4 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border bg-card p-3">
                <p className="text-xs text-muted-foreground uppercase font-semibold">
                  Completion Rate
                </p>
                <p className="text-2xl font-bold">
                  {Math.round(habit.completionRate * 100)}%
                </p>
              </div>
              <div className="rounded-lg border bg-card p-3">
                <p className="text-xs text-muted-foreground uppercase font-semibold">
                  Completions
                </p>
                <p className="text-2xl font-bold">{habit.completions.length}</p>
              </div>
            </div>

            {habit.description && (
              <div className="space-y-1">
                <p className="text-sm font-semibold">Description</p>
                <p className="text-sm text-muted-foreground">{habit.description}</p>
              </div>
            )}

            <div className="space-y-2">
              <p className="text-sm font-semibold">Recent Activity</p>
              <div className="space-y-1">
                {habit.completions.slice(0, 5).map((completion) => (
                  <div
                    key={completion.id}
                    className="flex items-center justify-between text-xs"
                  >
                    <span>{format(new Date(completion.completed_at), 'MMMM d, yyyy')}</span>
                    {completion.notes && (
                      <span className="text-muted-foreground truncate max-w-[150px]">
                        {completion.notes}
                      </span>
                    )}
                  </div>
                ))}
                {habit.completions.length === 0 && (
                  <p className="text-xs text-muted-foreground italic">
                    No completions recorded yet.
                  </p>
                )}
              </div>
            </div>
          </div>

          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline">Close</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

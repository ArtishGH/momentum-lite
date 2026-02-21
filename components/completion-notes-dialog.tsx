'use client'

import { useState } from 'react'
import { FileText } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

type CompletionNotesDialogProps = {
  habitTitle: string
  existingNotes?: string | null
  onSave: (notes: string) => Promise<void>
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

/**
 * CompletionNotesDialog - Dialog for adding/editing notes when completing a habit
 */
export function CompletionNotesDialog({
  habitTitle,
  existingNotes,
  onSave,
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: CompletionNotesDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [notes, setNotes] = useState(existingNotes || '')
  const [isSaving, setIsSaving] = useState(false)

  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const setOpen = isControlled ? controlledOnOpenChange || (() => {}) : setInternalOpen

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave(notes)
      setOpen(false)
    } catch (error) {
      // Error handling is done in parent
    } finally {
      setIsSaving(false)
    }
  }

  const defaultTrigger = (
    <Button variant="ghost" size="sm" className="gap-2">
      <FileText className="h-4 w-4" />
      <span className="hidden sm:inline">Add Note</span>
    </Button>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild={trigger ? undefined : true}>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Note for {habitTitle}</DialogTitle>
          <DialogDescription>
            Record your thoughts, progress, or any details about completing this habit today.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="How did it go? What did you learn? Any challenges?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Note'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

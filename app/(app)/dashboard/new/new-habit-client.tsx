'use client'

import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { HabitForm } from '@/components/habit-form'
import { HabitTemplatesSidebar } from '@/components/habit-templates-sidebar'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import type { HabitTemplate } from '@/lib/habit-templates'

type NewHabitClientProps = {
  userId: string
  initialTemplate?: {
    title: string
    description: string
    category: string
    frequency: string
    color: string
    icon: string
    target_days: number
  } | null
}

/**
 * NewHabitClient - Client component managing the sidebar + form layout
 */
export function NewHabitClient({ userId, initialTemplate }: NewHabitClientProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<HabitTemplate | null>(
    initialTemplate ? {
      id: 'custom',
      title: initialTemplate.title,
      description: initialTemplate.description,
      category: initialTemplate.category as any,
      frequency: initialTemplate.frequency as any,
      color: initialTemplate.color,
      icon: initialTemplate.icon,
      target_days: initialTemplate.target_days,
    } : null
  )
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false)

  const handleTemplateSelect = (template: HabitTemplate) => {
    setSelectedTemplate(template)
    setMobileSheetOpen(false) // Close mobile sheet after selection
  }

  // Convert template to form data format
  const templateHabit = selectedTemplate ? {
    title: selectedTemplate.title,
    description: selectedTemplate.description,
    category: selectedTemplate.category,
    frequency: selectedTemplate.frequency,
    color: selectedTemplate.color,
    icon: selectedTemplate.icon,
    target_days: selectedTemplate.target_days,
  } : null

  return (
    <div className="flex gap-6 animate-fade-in">
      {/* Desktop Sidebar with Templates */}
      <aside className="hidden lg:block w-80 shrink-0">
        <div className="sticky top-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Templates
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Click a template to fill the form
            </p>
          </div>
          <HabitTemplatesSidebar
            selectedTemplateId={selectedTemplate?.id}
            onSelectTemplate={handleTemplateSelect}
          />
        </div>
      </aside>

      {/* Main Form Area */}
      <main className="flex-1 min-w-0">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Create New Habit</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {selectedTemplate 
                ? `Using template: ${selectedTemplate.title}` 
                : 'Fill out the form or select a template'}
            </p>
          </div>
          
          {/* Mobile Template Button */}
          <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="lg:hidden gap-2">
                <Sparkles className="h-4 w-4" />
                Templates
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-6">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Templates
                </SheetTitle>
                <SheetDescription>
                  Click a template to fill the form
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6">
                <HabitTemplatesSidebar
                  selectedTemplateId={selectedTemplate?.id}
                  onSelectTemplate={handleTemplateSelect}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
        <HabitForm 
          userId={userId} 
          editHabit={templateHabit}
        />
      </main>
    </div>
  )
}

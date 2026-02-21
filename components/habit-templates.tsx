'use client'

import { useState } from 'react'
import { Sparkles, Check } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { HABIT_TEMPLATES, type HabitTemplate } from '@/lib/habit-templates'
import { getIcon } from '@/lib/icon-utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type HabitTemplatesProps = {
  onSelectTemplate?: (template: HabitTemplate) => void
  showTitle?: boolean
}

/**
 * HabitTemplates - Display grid of habit templates for quick creation
 */
export function HabitTemplates({ onSelectTemplate, showTitle = true }: HabitTemplatesProps) {
  const router = useRouter()
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)

  const handleSelect = (template: HabitTemplate) => {
    setSelectedTemplate(template.id)
    if (onSelectTemplate) {
      onSelectTemplate(template)
    } else {
      // Navigate to new habit page with template data in query params
      const params = new URLSearchParams({
        template: template.id,
        title: template.title,
        description: template.description,
        category: template.category,
        frequency: template.frequency,
        color: template.color,
        icon: template.icon,
        target_days: template.target_days.toString(),
      })
      router.push(`/dashboard/new?${params.toString()}`)
    }
  }

  return (
    <div className="space-y-4">
      {showTitle && (
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Quick Start Templates
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Choose a template to get started quickly, or create a custom habit
          </p>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {HABIT_TEMPLATES.map((template) => {
          const IconComponent = getIcon(template.icon)
          const isSelected = selectedTemplate === template.id

          return (
            <Card
              key={template.id}
              className={cn(
                'cursor-pointer transition-all hover:border-primary/50 hover:shadow-md',
                isSelected && 'border-primary ring-2 ring-primary/20'
              )}
              onClick={() => handleSelect(template)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${template.color}20`, color: template.color }}
                  >
                    <IconComponent className="h-5 w-5" />
                  </div>
                  {isSelected && (
                    <Check className="h-5 w-5 text-primary" />
                  )}
                </div>
                <CardTitle className="text-base mt-3">{template.title}</CardTitle>
                <CardDescription className="text-xs">
                  {template.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-xs">
                    {template.category}
                  </Badge>
                  <span className="text-xs text-muted-foreground font-mono">
                    {template.frequency}
                  </span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

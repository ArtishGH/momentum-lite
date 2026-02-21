'use client'

import { Check } from 'lucide-react'
import { HABIT_TEMPLATES, type HabitTemplate } from '@/lib/habit-templates'
import { getIcon } from '@/lib/icon-utils'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'

type HabitTemplatesSidebarProps = {
  selectedTemplateId?: string | null
  onSelectTemplate: (template: HabitTemplate) => void
}

/**
 * HabitTemplatesSidebar - Vertical scrollable sidebar with habit templates
 */
export function HabitTemplatesSidebar({ selectedTemplateId, onSelectTemplate }: HabitTemplatesSidebarProps) {
  return (
    <ScrollArea className="h-[calc(100vh-8rem)] pr-4">
      <div className="space-y-2">
        {HABIT_TEMPLATES.map((template) => {
          const IconComponent = getIcon(template.icon)
          const isSelected = selectedTemplateId === template.id

          return (
            <button
              key={template.id}
              onClick={() => onSelectTemplate(template)}
              className={cn(
                'w-full text-left p-3 rounded-lg border transition-all',
                'hover:border-primary/50 hover:bg-accent/50',
                'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2',
                isSelected && 'border-primary bg-primary/5 ring-2 ring-primary/20'
              )}
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${template.color}20`, color: template.color }}
                >
                  <IconComponent className="h-5 w-5" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-sm leading-tight">
                      {template.title}
                    </h3>
                    {isSelected && (
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {template.description}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs px-2 py-0.5 rounded bg-secondary text-secondary-foreground">
                      {template.category}
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">
                      {template.frequency}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </ScrollArea>
  )
}

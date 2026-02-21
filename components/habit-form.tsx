'use client'

import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowLeft, ArrowRight, Loader2, Sparkles, Calendar, Target } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RecaptchaField } from '@/components/recaptcha-field'
import { createClient } from '@/lib/supabase/client'
import { fullHabitSchema, type FullHabitFormValues } from '@/lib/schemas'
import type { FormStep, HabitCategory, Habit } from '@/lib/types'
import { cn } from '@/lib/utils'
import { APP_CONFIG } from '@/lib/types'
import { getIcon } from '@/lib/icon-utils'

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
const ICONS = ['check', 'star', 'heart', 'zap', 'book', 'dumbbell']
const STEPS: FormStep[] = ['basics', 'details', 'confirmation']

type HabitFormProps = {
  editHabit?: Partial<Habit> | null
  userId: string
}

/**
 * HabitForm - Multi-step form (3 steps) using useForm + Zod.
 * Integrates Shadcn UI form components with React Hook Form.
 * Connected to Supabase for saving progress.
 */
export function HabitForm({ editHabit, userId }: HabitFormProps) {
  const [currentStep, setCurrentStep] = useState<FormStep>('basics')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const stepIndex = STEPS.indexOf(currentStep)

  const {
    register,
    control,
    handleSubmit,
    trigger,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FullHabitFormValues>({
    resolver: zodResolver(fullHabitSchema),
    defaultValues: {
      title: editHabit?.title ?? '',
      description: editHabit?.description ?? '',
      category: (editHabit?.category as HabitCategory) ?? 'general',
      frequency: editHabit?.frequency === 'weekly' ? 'weekly' : editHabit?.frequency === 'custom' ? 'custom' : 'daily',
      target_days: editHabit?.target_days ?? 7,
      custom_days: editHabit?.custom_days ?? [],
      color: editHabit?.color ?? '#22c55e',
      icon: editHabit?.icon ?? 'check',
      recaptchaToken: '',
    },
  })

  // Reset form when editHabit changes (e.g., when template is selected)
  useEffect(() => {
    if (editHabit) {
      reset({
        title: editHabit.title ?? '',
        description: editHabit.description ?? '',
        category: (editHabit.category as HabitCategory) ?? 'general',
        frequency: editHabit.frequency === 'weekly' ? 'weekly' : editHabit.frequency === 'custom' ? 'custom' : 'daily',
        target_days: editHabit.target_days ?? 7,
        custom_days: editHabit.custom_days ?? [],
        color: editHabit.color ?? '#22c55e',
        icon: editHabit.icon ?? 'check',
        recaptchaToken: '',
      })
      // Reset to first step when template is applied
      setCurrentStep('basics')
    }
  }, [editHabit, reset])

  const watchedColor = watch('color')
  const watchedFrequency = watch('frequency')
  const watchedTargetDays = watch('target_days')
  const watchedCustomDays = watch('custom_days')

  const DAYS_OF_WEEK = [
    { value: 0, label: 'Sun', fullLabel: 'Sunday' },
    { value: 1, label: 'Mon', fullLabel: 'Monday' },
    { value: 2, label: 'Tue', fullLabel: 'Tuesday' },
    { value: 3, label: 'Wed', fullLabel: 'Wednesday' },
    { value: 4, label: 'Thu', fullLabel: 'Thursday' },
    { value: 5, label: 'Fri', fullLabel: 'Friday' },
    { value: 6, label: 'Sat', fullLabel: 'Saturday' },
  ]

  const goNext = async () => {
    let fieldsToValidate: (keyof FullHabitFormValues)[] = []

    if (currentStep === 'basics') {
      fieldsToValidate = ['title', 'description', 'category']
    } else if (currentStep === 'details') {
      const fields: (keyof FullHabitFormValues)[] = ['frequency', 'target_days', 'color', 'icon']
      if (watchedFrequency === 'custom') {
        fields.push('custom_days')
      }
      fieldsToValidate = fields
    }

    const valid = await trigger(fieldsToValidate)
    if (valid) {
      setCurrentStep(STEPS[stepIndex + 1])
    }
  }

  const goBack = () => {
    setCurrentStep(STEPS[stepIndex - 1])
  }

  const onSubmit = async (data: FullHabitFormValues) => {
    setIsSubmitting(true)
    try {
      const supabase = createClient()

      // Auto-calculate target_days based on frequency
      const targetDays = 7 // Default to 7 days (one week) for all frequencies

      if (editHabit?.id) {
        const { error } = await supabase
          .from('habits')
          .update({
            title: data.title,
            description: data.description || null,
            category: data.category,
            frequency: data.frequency,
            target_days: targetDays,
            custom_days: data.frequency === 'custom' ? data.custom_days || null : null,
            color: data.color,
            icon: data.icon,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editHabit.id)
          .eq('user_id', userId)

        if (error) throw error
        toast.success('Habit updated successfully')
      } else {
        const { error } = await supabase
          .from('habits')
          .insert({
            user_id: userId,
            title: data.title,
            description: data.description || null,
            category: data.category,
            frequency: data.frequency,
            target_days: targetDays,
            custom_days: data.frequency === 'custom' ? data.custom_days || null : null,
            color: data.color,
            icon: data.icon,
          })

        if (error) throw error
        toast.success('Habit created successfully')
      }

      router.push('/dashboard')
      router.refresh()
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      {/* Step indicator */}
      <div className="mb-6 flex items-center gap-2">
        {STEPS.map((step, i) => (
          <div key={step} className="flex flex-1 items-center gap-2">
            <div
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold font-mono transition-all duration-300',
                i <= stepIndex
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              {i + 1}
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn(
                'h-0.5 flex-1 rounded transition-colors duration-300',
                i < stepIndex ? 'bg-primary' : 'bg-muted'
              )} />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Step 1: Basics */}
        {currentStep === 'basics' && (
          <Card className="animate-slide-up">
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
              <CardDescription>What habit do you want to build?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Morning workout"
                  {...register('title')}
                  className="focus:border-primary"
                />
                {errors.title && (
                  <p className="text-xs text-destructive">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  placeholder="A brief note about this habit..."
                  {...register('description')}
                  className="resize-none focus:border-primary"
                  rows={3}
                />
                {errors.description && (
                  <p className="text-xs text-destructive">{errors.description.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="focus:border-primary">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {APP_CONFIG.categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.category && (
                  <p className="text-xs text-destructive">{errors.category.message}</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Details */}
        {currentStep === 'details' && (
          <Card className="animate-slide-up">
            <CardHeader>
              <CardTitle className="text-lg">Details & Customization</CardTitle>
              <CardDescription>Configure your habit tracking details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
              <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Frequency
                  </Label>
                <Controller
                  name="frequency"
                  control={control}
                  render={({ field }) => (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            field.onChange('daily')
                            setValue('target_days', 7)
                            setValue('custom_days', [])
                          }}
                          className={cn(
                            'flex items-center gap-2 p-4 rounded-lg border-2 transition-all',
                            'hover:border-primary/50 hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-primary/50',
                            field.value === 'daily'
                              ? 'border-primary bg-primary/5 shadow-sm'
                              : 'border-border'
                          )}
                        >
                          <div className={cn(
                            'h-2 w-2 rounded-full',
                            field.value === 'daily' ? 'bg-primary' : 'bg-muted-foreground'
                          )} />
                          <span className="font-semibold text-sm">Daily</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            field.onChange('weekly')
                            setValue('target_days', 7)
                            setValue('custom_days', [])
                          }}
                          className={cn(
                            'flex items-center gap-2 p-4 rounded-lg border-2 transition-all',
                            'hover:border-primary/50 hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-primary/50',
                            field.value === 'weekly'
                              ? 'border-primary bg-primary/5 shadow-sm'
                              : 'border-border'
                          )}
                        >
                          <div className={cn(
                            'h-2 w-2 rounded-full',
                            field.value === 'weekly' ? 'bg-primary' : 'bg-muted-foreground'
                          )} />
                          <span className="font-semibold text-sm">Weekly</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            field.onChange('custom')
                            // Don't auto-select days - let user choose
                            if (!watchedCustomDays) {
                              setValue('custom_days', [])
                            }
                          }}
                          className={cn(
                            'flex items-center gap-2 p-4 rounded-lg border-2 transition-all',
                            'hover:border-primary/50 hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-primary/50',
                            field.value === 'custom'
                              ? 'border-primary bg-primary/5 shadow-sm'
                              : 'border-border'
                          )}
                        >
                          <div className={cn(
                            'h-2 w-2 rounded-full',
                            field.value === 'custom' ? 'bg-primary' : 'bg-muted-foreground'
                          )} />
                          <span className="font-semibold text-sm">Custom</span>
                        </button>
                      </div>
                  )}
                />
                {errors.frequency && (
                  <p className="text-xs text-destructive">{errors.frequency.message}</p>
                )}
              </div>

                {watchedFrequency === 'custom' && (
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Select Days
                    </Label>
                    <Controller
                      name="custom_days"
                      control={control}
                      render={({ field }) => {
                        const selectedDays = field.value || []
                        const weekdays = [1, 2, 3, 4, 5] // Mon-Fri
                        const weekend = [0, 6] // Sun, Sat
                        const allDays = [0, 1, 2, 3, 4, 5, 6]
                        
                        const isWeekdaysSelected = weekdays.every(d => selectedDays.includes(d))
                        const isWeekendSelected = weekend.every(d => selectedDays.includes(d))
                        const isAllSelected = allDays.every(d => selectedDays.includes(d))

                        return (
                          <div className="space-y-3">
                            {/* Quick select buttons */}
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  if (isWeekdaysSelected) {
                                    const updated = selectedDays.filter(d => !weekdays.includes(d))
                                    field.onChange(updated)
                                  } else {
                                    const updated = [...new Set([...selectedDays, ...weekdays])].sort()
                                    field.onChange(updated)
                                  }
                                }}
                                className={cn(
                                  'px-3 py-1.5 text-xs rounded-md border transition-all',
                                  'hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary/50',
                                  isWeekdaysSelected
                                    ? 'border-primary bg-primary/10 text-primary font-medium'
                                    : 'border-border text-muted-foreground'
                                )}
                              >
                                Weekdays
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (isWeekendSelected) {
                                    const updated = selectedDays.filter(d => !weekend.includes(d))
                                    field.onChange(updated)
                                  } else {
                                    const updated = [...new Set([...selectedDays, ...weekend])].sort()
                                    field.onChange(updated)
                                  }
                                }}
                                className={cn(
                                  'px-3 py-1.5 text-xs rounded-md border transition-all',
                                  'hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary/50',
                                  isWeekendSelected
                                    ? 'border-primary bg-primary/10 text-primary font-medium'
                                    : 'border-border text-muted-foreground'
                                )}
                              >
                                Weekend
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (isAllSelected) {
                                    field.onChange([])
                                  } else {
                                    field.onChange(allDays)
                                  }
                                }}
                                className={cn(
                                  'px-3 py-1.5 text-xs rounded-md border transition-all',
                                  'hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary/50',
                                  isAllSelected
                                    ? 'border-primary bg-primary/10 text-primary font-medium'
                                    : 'border-border text-muted-foreground'
                                )}
                              >
                                All Days
                              </button>
                            </div>

                            {/* Day buttons */}
                            <div className="grid grid-cols-7 gap-2">
                              {DAYS_OF_WEEK.map((day) => {
                                const isSelected = selectedDays.includes(day.value)
                                return (
                                  <button
                                    key={day.value}
                                    type="button"
                                    onClick={() => {
                                      const current = selectedDays
                                      const updated = isSelected
                                        ? current.filter((d) => d !== day.value)
                                        : [...current, day.value].sort()
                                      field.onChange(updated)
                                    }}
                                    className={cn(
                                      'flex flex-col items-center justify-center gap-1 p-2 rounded-lg border-2 transition-all',
                                      'hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/50',
                                      isSelected
                                        ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                                        : 'border-border hover:border-primary/50 bg-card'
                                    )}
                                    title={day.fullLabel}
                                  >
                                    <span className="text-xs font-medium font-mono">{day.label}</span>
                                    {isSelected && (
                                      <div className="h-1 w-1 rounded-full bg-primary-foreground" />
                                    )}
                                  </button>
                                )
                              })}
                            </div>

                            {/* Selection summary */}
                            {selectedDays.length > 0 ? (
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">
                                  {selectedDays.length} {selectedDays.length === 1 ? 'day' : 'days'} selected
                                </span>
                                <span className="text-muted-foreground font-mono">
                                  {selectedDays.map(d => DAYS_OF_WEEK.find(day => day.value === d)?.label).join(', ')}
                                </span>
                              </div>
                            ) : (
                              <div className="text-xs text-destructive">
                                Please select at least one day
                              </div>
                            )}
                          </div>
                        )
                      }}
                    />
                    {errors.custom_days && (
                      <p className="text-xs text-destructive">{errors.custom_days.message}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Color</Label>
                <Controller
                  name="color"
                  control={control}
                  render={({ field }) => (
                    <div className="flex flex-wrap gap-2">
                      {COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => field.onChange(color)}
                          className={cn(
                            'h-8 w-8 rounded-full border-2 transition-all duration-200',
                            'hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background active:scale-95',
                            field.value === color
                              ? 'border-foreground scale-110'
                              : 'border-transparent'
                          )}
                          style={{ backgroundColor: color }}
                          aria-label={`Select color ${color}`}
                        />
                      ))}
                    </div>
                  )}
                />
                {errors.color && (
                  <p className="text-xs text-destructive">{errors.color.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Icon</Label>
                <Controller
                  name="icon"
                  control={control}
                  render={({ field }) => {
                    const selectedColor = watchedColor || '#22c55e'
                    return (
                    <div className="flex flex-wrap gap-2">
                        {ICONS.map((iconName) => {
                          const IconComponent = getIcon(iconName)
                          const isSelected = field.value === iconName
                          return (
                        <button
                              key={iconName}
                          type="button"
                              onClick={() => field.onChange(iconName)}
                          className={cn(
                                'flex h-12 w-12 items-center justify-center rounded-lg border-2 transition-all duration-200',
                                'hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 active:scale-95',
                                isSelected
                                  ? 'border-primary shadow-md shadow-primary/20'
                                  : 'border-border hover:border-primary/50'
                              )}
                              style={
                                isSelected
                                  ? {
                                      backgroundColor: `${selectedColor}15`,
                                      color: selectedColor,
                                    }
                                  : {}
                              }
                              aria-label={`Select icon ${iconName}`}
                              title={iconName.charAt(0).toUpperCase() + iconName.slice(1)}
                            >
                              <IconComponent className="h-5 w-5" />
                        </button>
                          )
                        })}
                    </div>
                    )
                  }}
                />
                {errors.icon && (
                  <p className="text-xs text-destructive">{errors.icon.message}</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Confirmation + reCAPTCHA */}
        {currentStep === 'confirmation' && (
          <Card className="animate-slide-up">
            <CardHeader>
              <CardTitle className="text-lg">Confirm & Create</CardTitle>
              <CardDescription>Review your habit and verify to save</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Summary preview */}
              <div className="rounded-lg border border-border bg-muted/50 p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <div
                    className="h-4 w-4 rounded-full"
                    style={{ backgroundColor: watchedColor }}
                  />
                  <span className="font-medium text-sm">{watch('title') || 'Untitled'}</span>
                </div>
                {watch('description') && (
                  <p className="text-xs text-muted-foreground">{watch('description')}</p>
                )}
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span className="rounded bg-muted px-2 py-0.5">{watch('category')}</span>
                  <span className="rounded bg-muted px-2 py-0.5 font-mono">{watch('frequency')}</span>
                  {watchedFrequency === 'custom' && watchedCustomDays && watchedCustomDays.length > 0 && (
                    <span className="rounded bg-muted px-2 py-0.5 font-mono">
                      {watchedCustomDays.length} {watchedCustomDays.length === 1 ? 'day' : 'days'}/week
                    </span>
                  )}
                </div>
              </div>

              {/* reCAPTCHA field */}
              <Controller
                name="recaptchaToken"
                control={control}
                render={({ field }) => (
                  <RecaptchaField
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.recaptchaToken?.message}
                  />
                )}
              />
            </CardContent>
          </Card>
        )}

        {/* Navigation buttons */}
        <div className="mt-6 flex items-center justify-between">
          {stepIndex > 0 ? (
            <Button type="button" variant="outline" onClick={goBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          ) : (
            <div />
          )}

          {stepIndex < STEPS.length - 1 ? (
            <Button 
              type="button" 
              onClick={goNext}
              disabled={
                currentStep === 'details' && 
                watchedFrequency === 'custom' && 
                (!watchedCustomDays || watchedCustomDays.length === 0)
              }
            >
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {editHabit?.id ? 'Update Habit' : 'Create Habit'}
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}

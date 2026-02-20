'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowLeft, ArrowRight, Loader2, Sparkles } from 'lucide-react'

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
    formState: { errors },
  } = useForm<FullHabitFormValues>({
    resolver: zodResolver(fullHabitSchema),
    defaultValues: {
      title: editHabit?.title ?? '',
      description: editHabit?.description ?? '',
      category: (editHabit?.category as HabitCategory) ?? 'general',
      frequency: editHabit?.frequency === 'weekly' ? 'weekly' : editHabit?.frequency === 'custom' ? 'custom' : 'daily',
      target_days: editHabit?.target_days ?? 7,
      color: editHabit?.color ?? '#22c55e',
      icon: editHabit?.icon ?? 'check',
      recaptchaToken: '',
    },
  })

  const watchedColor = watch('color')

  const goNext = async () => {
    let fieldsToValidate: (keyof FullHabitFormValues)[] = []

    if (currentStep === 'basics') {
      fieldsToValidate = ['title', 'description', 'category']
    } else if (currentStep === 'details') {
      fieldsToValidate = ['frequency', 'target_days', 'color', 'icon']
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

      if (editHabit?.id) {
        const { error } = await supabase
          .from('habits')
          .update({
            title: data.title,
            description: data.description || null,
            category: data.category,
            frequency: data.frequency,
            target_days: data.target_days,
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
            target_days: data.target_days,
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
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all duration-300',
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
              <div className="space-y-2">
                <Label>Frequency</Label>
                <Controller
                  name="frequency"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.frequency && (
                  <p className="text-xs text-destructive">{errors.frequency.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="target_days">Target Days</Label>
                <Input
                  id="target_days"
                  type="number"
                  {...register('target_days', { valueAsNumber: true })}
                />
                {errors.target_days && (
                  <p className="text-xs text-destructive">{errors.target_days.message}</p>
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
                  render={({ field }) => (
                    <div className="flex flex-wrap gap-2">
                      {ICONS.map((icon) => (
                        <button
                          key={icon}
                          type="button"
                          onClick={() => field.onChange(icon)}
                          className={cn(
                            'flex h-10 w-10 items-center justify-center rounded-lg border text-xs font-medium transition-all duration-200',
                            'hover:bg-primary/10 hover:text-primary focus:outline-none active:scale-95',
                            field.value === icon
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-border text-muted-foreground'
                          )}
                          aria-label={`Select icon ${icon}`}
                        >
                          {icon.slice(0, 2)}
                        </button>
                      ))}
                    </div>
                  )}
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
                  <span className="rounded bg-muted px-2 py-0.5">{watch('frequency')}</span>
                  <span className="rounded bg-muted px-2 py-0.5">{watch('target_days')} days</span>
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
            <Button type="button" onClick={goNext}>
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

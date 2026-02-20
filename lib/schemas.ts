import { z } from 'zod'

/**
 * Habit form schemas for multi-step form validation.
 * Includes regex validation on title and refine validation on target_days.
 */

// Step 1: Basic info
export const habitBasicsSchema = z.object({
  title: z
    .string()
    .min(2, 'Title must be at least 2 characters')
    .max(50, 'Title must be under 50 characters')
    // Regex: must start with a letter, alphanumeric + spaces only
    .regex(/^[A-Za-z][A-Za-z0-9 ]*$/, 'Title must start with a letter and contain only letters, numbers, and spaces'),
  description: z.string().max(200, 'Description must be under 200 characters').optional(),
  category: z.enum(['health', 'productivity', 'mindfulness', 'fitness', 'learning', 'general'], {
    required_error: 'Please select a category',
  }),
})

// Step 2: Details
export const habitDetailsSchema = z.object({
  frequency: z.enum(['daily', 'weekly', 'custom'], {
    required_error: 'Please select a frequency',
  }),
  target_days: z
    .number()
    .min(1, 'Target must be at least 1 day')
    .max(365, 'Target must be under 365 days'),
  color: z.string().min(1, 'Please select a color'),
  icon: z.string().min(1, 'Please select an icon'),
}).refine(
  // Custom refine: if frequency is 'weekly', target must be multiple of 7
  (data) => {
    if (data.frequency === 'weekly') {
      return data.target_days % 7 === 0
    }
    return true
  },
  {
    message: 'For weekly habits, target days must be a multiple of 7',
    path: ['target_days'],
  }
)

// Step 3: Confirmation with reCAPTCHA
export const habitConfirmationSchema = z.object({
  recaptchaToken: z.string().min(1, 'Please complete the verification'),
})

// Combined schema for the full form
export const fullHabitSchema = habitBasicsSchema
  .merge(habitDetailsSchema.innerType())
  .merge(habitConfirmationSchema)

export type HabitBasicsValues = z.infer<typeof habitBasicsSchema>
export type HabitDetailsValues = z.infer<typeof habitDetailsSchema>
export type HabitConfirmationValues = z.infer<typeof habitConfirmationSchema>
export type FullHabitFormValues = z.infer<typeof fullHabitSchema>

// Profile update schema
export const profileSchema = z.object({
  display_name: z.string().min(1, 'Display name is required').max(40),
  bio: z.string().max(200).optional(),
  theme: z.enum(['dark', 'light']),
})

export type ProfileFormValues = z.infer<typeof profileSchema>

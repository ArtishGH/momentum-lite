import type { HabitCategory, HabitFrequency } from './types'
export type { HabitCategory, HabitFrequency }

export type HabitTemplate = {
  id: string
  title: string
  description: string
  category: HabitCategory
  frequency: HabitFrequency
  color: string
  icon: string
  target_days: number
}

export const HABIT_TEMPLATES: HabitTemplate[] = [
  {
    id: 'drink-water',
    title: 'Drink Water',
    description: 'Stay hydrated by drinking 8 glasses of water daily',
    category: 'health',
    frequency: 'daily',
    color: '#3b82f6',
    icon: 'check',
    target_days: 7,
  },
  {
    id: 'exercise',
    title: 'Exercise',
    description: 'Get moving with 30 minutes of physical activity',
    category: 'fitness',
    frequency: 'daily',
    color: '#ef4444',
    icon: 'dumbbell',
    target_days: 7,
  },
  {
    id: 'read',
    title: 'Read',
    description: 'Read for at least 20 minutes every day',
    category: 'learning',
    frequency: 'daily',
    color: '#8b5cf6',
    icon: 'book',
    target_days: 7,
  },
  {
    id: 'meditate',
    title: 'Meditate',
    description: 'Practice mindfulness with 10 minutes of meditation',
    category: 'mindfulness',
    frequency: 'daily',
    color: '#22c55e',
    icon: 'heart',
    target_days: 7,
  },
  {
    id: 'journal',
    title: 'Journal',
    description: 'Write down your thoughts and reflections',
    category: 'mindfulness',
    frequency: 'daily',
    color: '#f59e0b',
    icon: 'book',
    target_days: 7,
  },
  {
    id: 'no-phone-bed',
    title: 'No Phone Before Bed',
    description: 'Avoid screens 1 hour before sleep',
    category: 'health',
    frequency: 'daily',
    color: '#ec4899',
    icon: 'zap',
    target_days: 7,
  },
  {
    id: 'gratitude',
    title: 'Gratitude',
    description: 'Write down 3 things you\'re grateful for',
    category: 'mindfulness',
    frequency: 'daily',
    color: '#22c55e',
    icon: 'star',
    target_days: 7,
  },
  {
    id: 'walk',
    title: 'Take a Walk',
    description: 'Go for a 20-minute walk outdoors',
    category: 'fitness',
    frequency: 'daily',
    color: '#3b82f6',
    icon: 'check',
    target_days: 7,
  },
  {
    id: 'learn-skill',
    title: 'Learn New Skill',
    description: 'Spend time learning something new',
    category: 'learning',
    frequency: 'daily',
    color: '#8b5cf6',
    icon: 'book',
    target_days: 7,
  },
  {
    id: 'healthy-meal',
    title: 'Eat Healthy Meal',
    description: 'Have at least one nutritious, home-cooked meal',
    category: 'health',
    frequency: 'daily',
    color: '#22c55e',
    icon: 'heart',
    target_days: 7,
  },
]

export function getTemplateById(id: string): HabitTemplate | undefined {
  return HABIT_TEMPLATES.find((t) => t.id === id)
}

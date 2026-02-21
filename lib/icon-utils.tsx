/**
 * Icon utility - Maps icon name strings to Lucide React icon components
 */
import {
  Check,
  Star,
  Heart,
  Zap,
  Book,
  Dumbbell,
  type LucideIcon,
} from 'lucide-react'

export type IconName = 'check' | 'star' | 'heart' | 'zap' | 'book' | 'dumbbell'

const iconMap: Record<IconName, LucideIcon> = {
  check: Check,
  star: Star,
  heart: Heart,
  zap: Zap,
  book: Book,
  dumbbell: Dumbbell,
}

export function getIcon(iconName: string): LucideIcon {
  return iconMap[iconName as IconName] || Check
}

export const AVAILABLE_ICONS: IconName[] = ['check', 'star', 'heart', 'zap', 'book', 'dumbbell']

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Plus, Settings, LogOut, Flame, History } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/history', label: 'History', icon: History },
  { href: '/dashboard/new', label: 'Add Habit', icon: Plus },
  { href: '/settings', label: 'Settings', icon: Settings },
]

/**
 * AppShell - Main layout wrapper with glassmorphic sidebar navigation.
 * Uses the "group" class for hover effects on nav items.
 * Responsive: bottom bar on mobile, sidebar on desktop.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <div className="flex min-h-svh flex-col md:flex-row">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-16 flex-col items-center gap-2 border-r border-border bg-card/50 backdrop-blur-md py-6">
        <Link
          href="/dashboard"
          className="mb-6 flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground"
        >
          <Flame className="h-5 w-5" />
        </Link>

        <TooltipProvider delayDuration={0}>
          <nav className="flex flex-1 flex-col items-center gap-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      className={cn(
                        'group flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-200',
                        'hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary focus:outline-none',
                        'active:scale-95',
                        isActive
                          ? 'bg-primary/15 text-primary'
                          : 'text-muted-foreground'
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      <span className="sr-only">{item.label}</span>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="text-xs">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              )
            })}
          </nav>
          <div className="mt-auto flex w-full flex-col items-center gap-2 px-2 pb-2">
            <div className="h-px w-full bg-border" />
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleSignOut}
                  className="group flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-all duration-200 hover:bg-destructive/10 hover:text-destructive focus:outline-none active:scale-95"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="sr-only">Sign out</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs">
                Sign out
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </aside>

      {/* Main content area */}
      <main className="flex-1 overflow-auto pb-20 md:pb-0">
        <div 
          key={pathname}
          className="container mx-auto max-w-5xl px-4 py-6 md:px-8 md:py-8 animate-fade-in"
        >
          {children}
        </div>
      </main>

      {/* Mobile bottom bar */}
      <nav className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-around border-t border-border bg-card/80 backdrop-blur-md py-2 md:hidden">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 rounded-lg px-3 py-1.5 transition-colors',
                'active:scale-95',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
        <button
          onClick={handleSignOut}
          className="flex flex-col items-center gap-1 rounded-lg px-3 py-1.5 text-muted-foreground transition-colors active:scale-95"
        >
          <LogOut className="h-5 w-5" />
          <span className="text-[10px] font-medium">Sign out</span>
        </button>
      </nav>
    </div>
  )
}

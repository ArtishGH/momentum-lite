import Link from 'next/link'
import { Flame, CheckCircle2, BarChart3, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const features = [
  {
    icon: CheckCircle2,
    title: 'Track Daily Habits',
    description: 'Check off habits with satisfying animations. Watch your contribution grid grow greener.',
  },
  {
    icon: BarChart3,
    title: 'Visual Analytics',
    description: 'Area charts and completion stats help you see your progress over time.',
  },
  {
    icon: Zap,
    title: 'Streak Tracking',
    description: 'Build and maintain streaks. Stay motivated with daily goals and weekly rates.',
  },
]

export default function LandingPage() {
  return (
    <div className="flex min-h-svh flex-col">
      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
        <div className="animate-fade-in space-y-8">
          {/* Logo */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 animate-pulse-green">
            <Flame className="h-8 w-8" />
          </div>

          {/* Headline */}
          <div className="space-y-3">
            <h1 className="text-balance text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
              Momentum
              <span className="text-primary"> Lite</span>
            </h1>
            <p className="mx-auto max-w-md text-pretty text-base text-muted-foreground leading-relaxed md:text-lg">
              A minimal habit tracker inspired by GitHub contributions. Build streaks, track progress, stay consistent.
            </p>
          </div>

          {/* CTA */}
          <div className="flex items-center justify-center gap-3">
            <Link href="/auth/sign-up">
              <Button size="lg" className="gap-2 px-8">
                Get Started
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline" className="gap-2 px-8">
                Sign In
              </Button>
            </Link>
          </div>

          {/* Feature cards */}
          <div className="mx-auto mt-12 grid max-w-3xl grid-cols-1 gap-4 md:grid-cols-3">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="group border-border/50 transition-all duration-300 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5"
              >
                <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform duration-200 group-hover:scale-110">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-sm">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-6 text-center">
        <p className="text-xs text-muted-foreground">
          Momentum Lite &mdash; Built with Next.js, Supabase, and Tailwind CSS
        </p>
      </footer>
    </div>
  )
}

'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTheme } from 'next-themes'
import { toast } from 'sonner'
import { useState } from 'react'
import { Moon, Sun, Loader2, User } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { createClient } from '@/lib/supabase/client'
import { profileSchema, type ProfileFormValues } from '@/lib/schemas'
import type { Profile } from '@/lib/types'

type SettingsClientProps = {
  profile: Profile | null
  userEmail: string
  userId: string
}

export function SettingsClient({ profile, userEmail, userId }: SettingsClientProps) {
  const { theme, setTheme } = useTheme()
  const [isSaving, setIsSaving] = useState(false)
  const isDark = theme === 'dark'

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      display_name: profile?.display_name ?? '',
      bio: profile?.bio ?? '',
      theme: (profile?.theme as 'dark' | 'light') ?? 'dark',
    },
  })

  const handleThemeToggle = (checked: boolean) => {
    const newTheme = checked ? 'dark' : 'light'
    setTheme(newTheme)
  }

  const onSubmit = async (data: ProfileFormValues) => {
    setIsSaving(true)
    try {
      const supabase = createClient()

      // Upsert profile
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          display_name: data.display_name,
          bio: data.bio || null,
          theme: theme as 'dark' | 'light',
          updated_at: new Date().toISOString(),
        })

      if (error) throw error
      toast.success('Settings saved')
    } catch {
      toast.error('Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your profile and preferences
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Profile Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <User className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base">Profile</CardTitle>
                <CardDescription className="text-xs">Your public identity</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={userEmail}
                disabled
                className="bg-muted text-muted-foreground font-mono"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="display_name">Display Name</Label>
              <Input
                id="display_name"
                placeholder="Your name"
                {...register('display_name')}
                className="focus:border-primary"
              />
              {errors.display_name && (
                <p className="text-xs text-destructive">{errors.display_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell us about yourself..."
                {...register('bio')}
                className="resize-none focus:border-primary"
                rows={3}
              />
              {errors.bio && (
                <p className="text-xs text-destructive">{errors.bio.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Appearance Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Appearance</CardTitle>
            <CardDescription className="text-xs">Customize the look and feel</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isDark ? (
                  <Moon className="h-5 w-5 text-primary" />
                ) : (
                  <Sun className="h-5 w-5 text-primary" />
                )}
                <div>
                  <p className="text-sm font-medium">Dark Mode</p>
                  <p className="text-xs text-muted-foreground">
                    Toggle between dark and light theme
                  </p>
                </div>
              </div>
              <Switch
                checked={isDark}
                onCheckedChange={handleThemeToggle}
                aria-label="Toggle dark mode"
              />
            </div>
          </CardContent>
        </Card>

        <Separator />

        <Button type="submit" disabled={isSaving} className="gap-2">
          {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </form>
    </div>
  )
}

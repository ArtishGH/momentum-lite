'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ShieldCheck, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type RecaptchaFieldProps = {
  value: string
  onChange: (token: string) => void
  error?: string
}

/**
 * RecaptchaField - Custom input control (mock reCAPTCHA).
 * In production, replace with real Google reCAPTCHA integration.
 * Demonstrates: custom controlled input for React Hook Form.
 */
export function RecaptchaField({ value, onChange, error }: RecaptchaFieldProps) {
  const [verifying, setVerifying] = useState(false)
  const isVerified = value.length > 0

  const handleVerify = async () => {
    setVerifying(true)
    // Simulate reCAPTCHA verification delay
    await new Promise((resolve) => setTimeout(resolve, 1500))
    // Generate a mock token (in production, use real reCAPTCHA)
    const mockToken = `recap_${Date.now()}_${Math.random().toString(36).slice(2)}`
    onChange(mockToken)
    setVerifying(false)
  }

  return (
    <div className="space-y-2">
      <div
        className={cn(
          'flex items-center gap-3 rounded-lg border-2 border-dashed p-4 transition-colors',
          isVerified ? 'border-primary/40 bg-primary/5' : 'border-muted-foreground/20',
          error && 'border-destructive/40'
        )}
      >
        {isVerified ? (
          <>
            <ShieldCheck className="h-6 w-6 text-primary animate-check-bounce" />
            <div className="flex-1">
              <p className="text-sm font-medium text-primary">Verified</p>
              <p className="text-xs text-muted-foreground">You have been verified successfully</p>
            </div>
          </>
        ) : (
          <>
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
              {verifying ? (
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              ) : (
                <ShieldCheck className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Human verification</p>
              <p className="text-xs text-muted-foreground">Click verify to confirm you are human</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleVerify}
              disabled={verifying}
            >
              {verifying ? 'Verifying...' : 'Verify'}
            </Button>
          </>
        )}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

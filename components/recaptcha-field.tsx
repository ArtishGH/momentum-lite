'use client'

import { useRef, useEffect } from 'react'
import ReCAPTCHA from 'react-google-recaptcha'
import { ShieldCheck, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type RecaptchaFieldProps = {
  value: string
  onChange: (token: string | null) => void
  error?: string
}

/**
 * RecaptchaField - Integrated Google reCAPTCHA v2 Checkbox Component.
 * Requires explicit user interaction to verify humanity.
 */
export function RecaptchaField({ value, onChange, error }: RecaptchaFieldProps) {
  const recaptchaRef = useRef<ReCAPTCHA>(null)
  const isVerified = (value || '').length > 0
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'

  const handleRecaptchaChange = (token: string | null) => {
    onChange(token)
  }

  const handleReset = () => {
    if (recaptchaRef.current) {
      recaptchaRef.current.reset()
      onChange(null)
    }
  }

  return (
    <div className="space-y-4">
      <div
        className={cn(
          'flex flex-col gap-6 rounded-2xl border border-border/50 bg-card/40 backdrop-blur-xl p-8 transition-all duration-500 shadow-sm overflow-hidden relative',
          isVerified ? 'border-primary/30 ring-1 ring-primary/10' : 'hover:border-primary/20',
          error && 'border-destructive/30 bg-destructive/5'
        )}
      >
        {/* Decorative background element */}
        <div className={cn(
          "absolute -right-8 -top-8 h-32 w-32 rounded-full blur-3xl transition-opacity duration-1000",
          isVerified ? "bg-primary/20 opacity-100" : "opacity-0"
        )} />

        <div className="flex items-start justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className={cn(
              "flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-500 shadow-inner",
              isVerified ? "bg-primary text-primary-foreground scale-110" : "bg-muted text-muted-foreground"
            )}>
              <ShieldCheck className={cn("h-7 w-7 transition-all", isVerified && "animate-check-bounce")} />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold tracking-tight">
                {isVerified ? "Human Verified" : "Verification Required"}
              </h3>
              <p className="text-sm text-muted-foreground max-w-[200px] leading-relaxed">
                {isVerified 
                  ? "Identity confirmed successfully." 
                  : "Please verify you're human to continue."}
              </p>
            </div>
          </div>

          {isVerified && (
            <button 
              type="button"
              onClick={handleReset}
              className="text-xs font-medium text-muted-foreground hover:text-primary transition-all hover:translate-x-1 flex items-center gap-1 group"
            >
              Verify again
              <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
            </button>
          )}
        </div>

        <div className={cn(
          "flex justify-center py-2 animate-reveal transition-all duration-500 relative z-10", 
          isVerified && "opacity-0 invisible h-0 py-0 overflow-hidden"
        )}>
          <div className="rounded-lg overflow-hidden shadow-2xl border border-border/30">
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={siteKey}
              onChange={handleRecaptchaChange}
              size="normal"
              theme="light"
            />
          </div>
        </div>

        {isVerified && (
          <div className="flex items-center justify-center gap-3 text-sm font-semibold text-primary animate-reveal py-2 relative z-10">
            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Active Session Verified
          </div>
        )}
      </div>
      {error && (
        <p className="text-sm text-destructive font-medium ml-2 animate-reveal">
          {error}
        </p>
      )}
    </div>
  )
}

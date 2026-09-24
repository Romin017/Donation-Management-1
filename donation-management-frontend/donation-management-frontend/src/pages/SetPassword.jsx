import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CheckCircle2, Eye, EyeOff, HeartHandshake, Lock } from 'lucide-react'
import { Input, Label } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { setPasswordService } from '../api/apiService'

export default function SetPassword() {
  const { token } = useParams()
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setSubmitting(true)
    try {
      const { data } = await setPasswordService(token, password)

      // If the backend returns a token, log the user straight in
      if (data.token) {
        localStorage.setItem('dh_token', data.token)
      }

      setSuccess(true)
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'This link is invalid or has expired.')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-sm text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success/10 text-success">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h1 className="mt-4 font-display text-xl font-bold text-foreground">Password set!</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your account is now active. Redirecting you to login…
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center justify-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <HeartHandshake className="h-5 w-5" />
          </div>
          <span className="font-display text-lg font-bold text-foreground">DonateHub</span>
        </div>

        <h1 className="text-center font-display text-2xl font-bold text-foreground">Set your password</h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">
          Choose a password to activate your account.
        </p>

        <form onSubmit={handleSubmit} autoComplete="off" className="mt-8 space-y-4">
          <div>
            <Label htmlFor="password">New password</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                name="new-account-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="off"
                readOnly={!passwordFocused}
                value={password}
                onFocus={() => setPasswordFocused(true)}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-8 pr-10"
                placeholder="At least 6 characters"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="confirmPassword"
                name="confirm-account-password"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="off"
                readOnly={!confirmPasswordFocused}
                value={confirmPassword}
                onFocus={() => setConfirmPasswordFocused(true)}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-8 pr-10"
                placeholder="Re-enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((visible) => !visible)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                title={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" className="w-full" size="lg" disabled={submitting}>
            {submitting ? 'Setting password…' : 'Set password & activate account'}
          </Button>
        </form>
      </div>
    </div>
  )
}
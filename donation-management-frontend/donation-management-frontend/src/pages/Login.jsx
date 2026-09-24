import React, { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff, Lock, Mail, MapPin, Phone, UserRound } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Input, Label } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { BrandLogo } from '../components/ui/BrandLogo'

export default function Login({ initialRegister = false }) {
  const { login, loginDonor, registerDonor, error, loading } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [registerMode, setRegisterMode] = useState(initialRegister)
  const [donorLoginMode, setDonorLoginMode] = useState(searchParams.get('mode') === 'donor')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (registerMode) {
      const success = await registerDonor({ name, email, phone, password, address })
      if (success) {
        setRegisterMode(false)
        setDonorLoginMode(true)
        setPassword('')
        navigate('/login', { replace: true })
      }
      return
    }

    const success = donorLoginMode ? await loginDonor(email, password) : await login(email, password)
    if (success) navigate(donorLoginMode ? '/donor-dashboard' : '/donors', { replace: true })
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left — brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-sidebar p-10 text-white lg:flex">
        <BrandLogo variant="login" />

        <div className="max-w-md">
          <p className="font-display text-3xl font-bold leading-tight">
            Every donation, tracked. Every donor, remembered.
          </p>
          <p className="mt-4 text-sm text-white/60">
            A simple back office for your organization to record donors, log contributions, and
            see where every rupee is going.
          </p>
        </div>

        <div className="flex gap-8 text-sm text-white/50">
          <div>
            <p className="font-display text-2xl font-bold text-white">1,240+</p>
            <p>Donors managed</p>
          </div>
          <div>
            <p className="font-display text-2xl font-bold text-white">₹42L</p>
            <p>Raised this year</p>
          </div>
        </div>

        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-10 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
      </div>

      {/* Right — form */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <BrandLogo variant="landing" compact={false} />
          </div>

          <h1 className="font-display text-2xl font-bold text-foreground">
            {registerMode ? 'Create your donor account' : 'Welcome back'}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {registerMode
              ? 'Register to support a campaign securely.'
              : donorLoginMode
                ? 'Sign in to view your donations and support a campaign.'
                : 'Sign in to manage donors and donations.'}
          </p>

          <form onSubmit={handleSubmit} autoComplete="off" className="mt-8 space-y-4">
            {registerMode && (
              <>
                <div>
                  <Label htmlFor="name">Full name</Label>
                  <div className="relative">
                    <UserRound className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="pl-8" required />
                  </div>
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="pl-8" required />
                  </div>
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <div className="relative">
                    <MapPin className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} className="pl-8" required />
                  </div>
                </div>
              </>
            )}
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  name="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-8"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  name="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="off"
                  readOnly={!passwordFocused}
                  value={password}
                  onFocus={() => setPasswordFocused(true)}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-8 pr-10"
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

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? (registerMode ? 'Creating account…' : 'Signing in…') : registerMode ? 'Create account' : 'Sign in'}
            </Button>
          </form>

          <button
            type="button"
            onClick={() => navigate(registerMode ? '/login' : '/register')}
            className="mt-5 w-full text-center text-sm font-medium text-primary hover:underline"
          >
            {registerMode ? 'Already have an account? Sign in' : 'New donor? Create an account'}
          </button>
          {!registerMode && (
            <button
              type="button"
              onClick={() => setDonorLoginMode((mode) => !mode)}
              className="mt-3 w-full text-center text-sm text-muted-foreground hover:text-foreground"
            >
              {donorLoginMode ? 'Admin or staff sign in' : 'Donor sign in'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
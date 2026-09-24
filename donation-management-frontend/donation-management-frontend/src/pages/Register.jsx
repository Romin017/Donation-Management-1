import React, { useState } from 'react'
import { HeartHandshake, Lock, Mail, MapPin, Phone, UserRound } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Input, Label } from '../components/ui/Input'
import { Button } from '../components/ui/Button'

export default function Register() {
  const { registerDonor, error, loading } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
  })

  function updateField(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const success = await registerDonor(form)
    if (success) navigate('/login?mode=donor', { replace: true })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center justify-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            <HeartHandshake className="h-5 w-5" />
          </div>
          <span className="font-display text-xl font-bold text-foreground">DonateHub</span>
        </div>

        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <h1 className="font-display text-2xl font-bold text-foreground">Create your donor account</h1>
          <p className="mt-1 text-sm text-muted-foreground">Register to support campaigns securely.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <Label htmlFor="name">Full name</Label>
              <div className="relative">
                <UserRound className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="name" name="name" value={form.name} onChange={updateField} className="pl-8" required />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="email" name="email" type="email" value={form.email} onChange={updateField} className="pl-8" required />
              </div>
            </div>

            <div>
              <Label htmlFor="phone">Phone</Label>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="phone" name="phone" type="tel" value={form.phone} onChange={updateField} className="pl-8" required />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <div className="relative">
                <MapPin className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="address" name="address" value={form.address} onChange={updateField} className="pl-8" required />
              </div>
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="password" name="password" type="password" value={form.password} onChange={updateField} className="pl-8" minLength={8} required />
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? 'Creating account…' : 'Create donor account'}
            </Button>
          </form>

          <button type="button" onClick={() => navigate('/login')} className="mt-5 w-full text-center text-sm font-medium text-primary hover:underline">
            Already have an account? Sign in
          </button>
        </div>
      </div>
    </div>
  )
}

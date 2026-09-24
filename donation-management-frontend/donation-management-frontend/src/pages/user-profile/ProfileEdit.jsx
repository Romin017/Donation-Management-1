import React, { useState } from 'react'
import { UserRound, Mail, Save } from 'lucide-react'

import { Button } from '../../components/ui/Button'
import { Input, Label } from '../../components/ui/Input'

export function ProfileEdit({ user, onUpdate, onFeedback }) {
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
  })

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const name = form.name.trim()
    if (!name) {
      onFeedback?.({ type: 'error', message: 'Name is required.' })
      return
    }

    setSubmitting(true)
    try {
      const response = await onUpdate(name)
      onFeedback?.({
        type: 'success',
        message: response?.message || 'Profile updated successfully.',
      })
    } catch (err) {
      onFeedback?.({
        type: 'error',
        message: err.response?.data?.message || 'Failed to update profile.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="name">Full name</Label>
          <div className="relative">
            <UserRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              disabled={submitting}
              className="pl-9"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="email">Email address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              name="email"
              type="email"
              value={form.email}
              disabled
              className="bg-muted pl-9"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="role">Role</Label>
          <Input id="role" value={user?.role || 'User'} disabled className="bg-muted" />
        </div>
      </div>

      <div className="flex justify-end">
          <Button type="submit" disabled={submitting}>
          <Save className="h-4 w-4" /> {submitting ? 'Saving...' : 'Save profile'}
        </Button>
      </div>
    </form>
  )
}

import React, { useState } from 'react'
import { Lock, Eye, EyeOff, KeyRound } from 'lucide-react'

import { Button } from '../../components/ui/Button'
import { Input, Label } from '../../components/ui/Input'

export function ChangePassword({ onFeedback }) {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()

    if (form.newPassword !== form.confirmPassword) {
      onFeedback?.({ type: 'error', message: 'New passwords do not match.' })
      return
    }

    onFeedback?.({ type: 'success', message: 'Password changed successfully.' })
    setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
  }

  function renderPasswordField(name, label, value) {
    const visible = showPassword[name]
    return (
      <div>
        <Label htmlFor={name}>{label}</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id={name}
            name={name}
            type={visible ? 'text' : 'password'}
            autoComplete="new-password"
            value={value}
            onChange={handleChange}
            className="pl-9 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => ({ ...prev, [name]: !prev[name] }))}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label={visible ? 'Hide password' : 'Show password'}
          >
            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
    )
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="mb-4 flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-primary" />
          <span className="text-sm font-semibold text-foreground">Password security</span>
        </div>

        <div className="grid gap-4 md:grid-cols-1">
          {renderPasswordField('currentPassword', 'Current password', form.currentPassword)}
          {renderPasswordField('newPassword', 'New password', form.newPassword)}
          {renderPasswordField('confirmPassword', 'Confirm new password', form.confirmPassword)}
        </div>

        <div className="mt-5 flex justify-end">
          <Button type="submit">
            <KeyRound className="h-4 w-4" /> Update password
          </Button>
        </div>
      </div>
    </form>
  )
}

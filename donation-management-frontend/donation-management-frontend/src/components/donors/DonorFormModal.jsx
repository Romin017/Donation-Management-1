import React, { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Input, Label } from '../ui/Input'
import { Button } from '../ui/Button'

const empty = { name: '', email: '', phone: '', address: '' }

export function DonorFormModal({ open, onClose, onSubmit, donor, submitting = false }) {
  const [form, setForm] = useState(empty)
  const [errors, setErrors] = useState({})
  let submitLabel = 'Add donor'
  if (submitting) submitLabel = 'Saving donor…'
  else if (donor) submitLabel = 'Save changes'

  useEffect(() => {
    setForm(
      donor
        ? {
            name: donor.name || '',
            email: donor.email || donor.emailAddress || '',
            phone: donor.phone || donor.phoneNumber || '',
            address: donor.address || '',
          }
        : empty,
    )
    setErrors({})
  }, [donor, open])

  function validate() {
    const errs = {}
    const emailParts = form.email.split('@')
    const emailDomain = emailParts[1] || ''
    const hasValidEmail =
      emailParts.length === 2 &&
      emailParts[0].length > 0 &&
      emailDomain.indexOf('.') > 0 &&
      emailDomain.indexOf('.') < emailDomain.length - 1

    if (!form.name.trim()) errs.name = 'Name is required.'
    if (!form.email.trim()) errs.email = 'Email is required.'
    else if (!hasValidEmail) errs.email = 'Enter a valid email.'
    if (!form.phone.trim()) errs.phone = 'Phone is required.'
    else if (!/^[+\d][\d\s().-]+$/.test(form.phone.trim())) {
      errs.phone = 'Enter a valid phone number, for example +91 98765 43210.'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (submitting) return
    if (!validate()) return
    onSubmit(form)
  }

  return (
    <Modal
      open={open}
      onClose={submitting ? undefined : onClose}
      title={donor ? 'Edit donor' : 'Add donor'}
      description={donor ? 'Update this donor\u2019s details.' : 'Add a new donor record.'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <fieldset disabled={submitting} className="space-y-4">
        <div>
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Ramesh Patel"
          />
          {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="name@example.com"
            />
            {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+91 98765 43210"
            />
            {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone}</p>}
          </div>
        </div>

        <div>
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            placeholder="City, State"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {submitLabel}
          </Button>
        </div>
        </fieldset>
      </form>
    </Modal>
  )
}

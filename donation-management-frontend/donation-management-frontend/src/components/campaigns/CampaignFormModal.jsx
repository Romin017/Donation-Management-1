import React, { useEffect, useState } from 'react'
import { Modal } from '../ui/Modal'
import { Input, Label, Select } from '../ui/Input'
import { Button } from '../ui/Button'

const empty = {
  name: '',
  goal: '',
  startDate: new Date().toISOString().slice(0, 10),
  endDate: '',
  status: 'Active',
  description: '',
}

export function CampaignFormModal({ open, onClose, onSubmit, campaign }) {
  const [form, setForm] = useState(empty)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    setForm(
      campaign
        ? {
            name: campaign.name,
            goal: campaign.goal,
            startDate: campaign.startDate,
            endDate: campaign.endDate || '',
            status: campaign.status,
            description: campaign.description || '',
          }
        : empty,
    )
    setErrors({})
  }, [campaign, open])

  function validate() {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Campaign name is required.'
    if (!form.goal || Number(form.goal) <= 0) errs.goal = 'Enter a valid goal amount.'
    if (!form.startDate) errs.startDate = 'Select a start date.'
    if (form.endDate && form.endDate < form.startDate) errs.endDate = 'End date must be after start date.'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    onSubmit({ ...form, goal: Number(form.goal) })
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={campaign ? 'Edit campaign' : 'Add campaign'}
      description={campaign ? 'Update this campaign\u2019s details.' : 'Create a new fundraising campaign.'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Campaign name</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Flood Relief 2026"
          />
          {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="goal">Goal amount (₹)</Label>
            <Input
              id="goal"
              type="number"
              min="0"
              value={form.goal}
              onChange={(e) => setForm({ ...form, goal: e.target.value })}
              placeholder="0"
            />
            {errors.goal && <p className="mt-1 text-xs text-destructive">{errors.goal}</p>}
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select id="status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option>Active</option>
              <option>Completed</option>
              <option>Paused</option>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="startDate">Start date</Label>
            <Input
              id="startDate"
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            />
            {errors.startDate && <p className="mt-1 text-xs text-destructive">{errors.startDate}</p>}
          </div>
          <div>
            <Label htmlFor="endDate">End date (optional)</Label>
            <Input
              id="endDate"
              type="date"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            />
            {errors.endDate && <p className="mt-1 text-xs text-destructive">{errors.endDate}</p>}
          </div>
        </div>

        <div>
          <Label htmlFor="description">Description (optional)</Label>
          <Input
            id="description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">{campaign ? 'Save changes' : 'Add campaign'}</Button>
        </div>
      </form>
    </Modal>
  )
}
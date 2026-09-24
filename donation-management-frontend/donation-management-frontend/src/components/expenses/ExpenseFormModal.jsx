import React, { useEffect, useState } from 'react'
import { Modal } from '../ui/Modal'
import { Input, Label, Select } from '../ui/Input'
import { Button } from '../ui/Button'

const empty = {
  category: 'Operations',
  paidTo: '',
  billNo: '',
  amount: '',
  date: new Date().toISOString().slice(0, 10),
  paymentMode: 'Cash',
  campaignId: '',
  notes: '',
}

const categories = ['Operations', 'Logistics', 'Salaries', 'Utilities', 'Supplies', 'Marketing', 'Other']

export function ExpenseFormModal({ open, onClose, onSubmit, expense, campaigns }) {
  const [form, setForm] = useState(empty)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    setForm(
      expense
        ? {
            category: expense.category,
            paidTo: expense.paidTo,
            billNo: expense.billNo || '',
            amount: expense.amount,
            date: expense.date ? expense.date.slice(0, 10) : '',
            paymentMode: expense.paymentMode,
            campaignId: expense.campaignId?._id || expense.campaignId || '',
            notes: expense.notes || '',
          }
        : empty,
    )
    setErrors({})
  }, [expense, open])

  function validate() {
    const errs = {}
    if (!form.paidTo.trim()) errs.paidTo = 'Enter who this was paid to.'
    if (!form.billNo.trim()) errs.billNo = 'Enter the bill reference number.'
    if (!form.amount || Number(form.amount) <= 0) errs.amount = 'Enter a valid amount.'
    if (!form.date) errs.date = 'Select a date.'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return

    const payload = { ...form, amount: Number(form.amount) }
    if (!payload.campaignId) delete payload.campaignId // don't send an empty string if "General / Not linked"

    onSubmit(payload)
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={expense ? 'Edit expense' : 'Add expense'}
      description={expense ? 'Update this expense record.' : 'Log a new organizational expense.'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="category">Category</Label>
            <Select id="category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="paidTo">Paid to</Label>
            <Input
              id="paidTo"
              value={form.paidTo}
              onChange={(e) => setForm({ ...form, paidTo: e.target.value })}
              placeholder="e.g. XYZ Suppliers"
            />
            {errors.paidTo && <p className="mt-1 text-xs text-destructive">{errors.paidTo}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input
              id="amount"
              type="number"
              min="0"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              placeholder="0"
            />
            {errors.amount && <p className="mt-1 text-xs text-destructive">{errors.amount}</p>}
          </div>
          <div>
            <Label htmlFor="billNo">Bill No.</Label>
            <Input
              id="billNo"
              value={form.billNo}
              onChange={(e) => setForm({ ...form, billNo: e.target.value })}
              placeholder="e.g. INV-1024"
            />
            {errors.billNo && <p className="mt-1 text-xs text-destructive">{errors.billNo}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            {errors.date && <p className="mt-1 text-xs text-destructive">{errors.date}</p>}
          </div>
          <div></div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="paymentMode">Payment mode</Label>
            <Select
              id="paymentMode"
              value={form.paymentMode}
              onChange={(e) => setForm({ ...form, paymentMode: e.target.value })}
            >
              <option>Cash</option>
              <option>Cheque</option>
              <option>Bank Transfer</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="campaignId">Campaign (optional)</Label>
            <Select
              id="campaignId"
              value={form.campaignId}
              onChange={(e) => setForm({ ...form, campaignId: e.target.value })}
            >
              <option value="">General / Not linked</option>
              {campaigns?.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="notes">Notes (optional)</Label>
          <Input id="notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">{expense ? 'Save changes' : 'Add expense'}</Button>
        </div>
      </form>
    </Modal>
  )
}
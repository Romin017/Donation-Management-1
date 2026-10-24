import React, { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Topbar } from '../components/layout/Topbar'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input, Select } from '../components/ui/Input'
import { Badge } from '../components/ui/Badge'
import { ConfirmDialog } from '../components/ui/Modal'
import { FeedbackToast } from '../components/ui/FeedbackToast'
import { ExpenseFormModal } from '../components/expenses/ExpenseFormModal'
import { formatCurrency, formatDate } from '../lib/utils'
import {
  getCampaignsService,
  getExpensesService,
  createExpenseService,
  deleteExpensesService,
} from '../api/apiService'

const paymentTone = { Cash: 'Cash', Cheque: 'Cheque', 'Bank Transfer': 'Online' }

export default function Expenses() {
  const [campaigns, setCampaigns] = useState([])
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState(null)

  const [query, setQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [formOpen, setFormOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    setError('')
    try {
      const [campaignsRes, expensesRes] = await Promise.all([
        getCampaignsService(),
        getExpensesService(),
      ])
      setCampaigns(campaignsRes.data.data)
      setExpenses(expensesRes.data.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load expenses.')
    } finally {
      setLoading(false)
    }
  }

  function getCampaignId(expense) {
    return expense.campaignId?._id || expense.campaignId
  }

  function campaignName(id) {
    return campaigns.find((c) => c._id === id)?.name || '—'
  }

  const categories = ['All', ...new Set(expenses.map((e) => e.category))]

  const filtered = expenses
    .filter((e) => (categoryFilter === 'All' ? true : e.category === categoryFilter))
    .filter((e) => {
      const value = query.toLowerCase()
      return (
        (e.paidTo || '').toLowerCase().includes(value) ||
        (e.billNo || '').toLowerCase().includes(value)
      )
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date))

  const total = filtered.reduce((s, e) => s + Number(e.amount), 0)

  function openAdd() {
    setFormOpen(true)
  }
  
  async function handleSubmit(data) {
    setSubmitting(true)
    try {
      const { data: res } = await createExpenseService(data)
      setExpenses((prev) => [res.data, ...prev])
      setFeedback({ type: 'success', message: res.message || 'Expense created successfully.' })
      setFormOpen(false)
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to save expense.' })
      setError(err.response?.data?.message || 'Failed to save expense.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    try {
      await deleteExpensesService([deleteTarget._id])
      setExpenses((prev) => prev.filter((e) => e._id !== deleteTarget._id))
      setFeedback({ type: 'success', message: 'Expense deleted successfully.' })
      setDeleteTarget(null)
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to delete expense.' })
      setError(err.response?.data?.message || 'Failed to delete expense.')
      setDeleteTarget(null)
    }
  }

  return (
    <div>
      <FeedbackToast feedback={feedback} onClose={() => setFeedback(null)} />
      <Topbar
        title="Expenses"
        subtitle={`${filtered.length} record${filtered.length === 1 ? '' : 's'} · ${formatCurrency(total)} total`}
        actions={
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4" /> Add expense
          </Button>
        }
      />

      <div className="p-6">
        {error && (
          <div className="mb-4 rounded-md bg-destructive/10 px-4 py-2 text-sm text-destructive">{error}</div>
        )}

        <div className="mb-4 flex flex-wrap gap-3">
          <Input
            placeholder="Search by payee…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="max-w-xs"
          />
          <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="max-w-[180px]">
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </Select>
        </div>

        {loading && <p className="py-10 text-center text-sm text-muted-foreground">Loading expenses…</p>}

        {!loading && (
          <Card className="overflow-hidden">
            <div className="max-h-[500px] overflow-y-auto overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10 bg-secondary text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3 font-medium">Paid to</th>
                    <th className="px-5 py-3 font-medium">Bill No.</th>
                    <th className="px-5 py-3 font-medium">Category</th>
                    <th className="px-5 py-3 font-medium">Campaign</th>
                    <th className="px-5 py-3 font-medium">Amount</th>
                    <th className="px-5 py-3 font-medium">Date</th>
                    <th className="px-5 py-3 font-medium">Payment</th>
                    <th className="px-5 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((e) => (
                    <tr key={e._id} className="hover:bg-secondary/30">
                      <td className="px-5 py-3 font-medium text-foreground">{e.paidTo}</td>
                      <td className="px-5 py-3 text-muted-foreground">{e.billNo || '—'}</td>
                      <td className="px-5 py-3 text-muted-foreground">{e.category}</td>
                      <td className="px-5 py-3 text-muted-foreground">{campaignName(getCampaignId(e))}</td>
                      <td className="px-5 py-3 font-semibold text-foreground">{formatCurrency(e.amount)}</td>
                      <td className="px-5 py-3 text-muted-foreground">{formatDate(e.date)}</td>
                      <td className="px-5 py-3">
                        <Badge tone={paymentTone[e.paymentMode]}>{e.paymentMode}</Badge>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => setDeleteTarget(e)}
                            className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-5 py-10 text-center text-muted-foreground">
                        No expenses found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      <ExpenseFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        campaigns={campaigns}
        submitting={submitting}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete expense?"
        description={`This will permanently remove the expense paid to "${deleteTarget?.paidTo}".`}
      />
    </div>
  )
}
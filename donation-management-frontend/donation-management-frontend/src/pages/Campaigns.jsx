import React, { useEffect, useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, Target } from 'lucide-react'

import { Topbar } from '../components/layout/Topbar'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Badge } from '../components/ui/Badge'
import { ConfirmDialog } from '../components/ui/Modal'
import { FeedbackToast } from '../components/ui/FeedbackToast'
import { CampaignFormModal } from '../components/campaigns/CampaignFormModal'
import { formatCurrency, formatDate } from '../lib/utils'
import {
  getCampaignsService,
  createCampaignService,
  updateCampaignService,
  deleteCampaignsService,
  getDonationsService,
  getExpensesService,
} from '../api/apiService'

const statusTone = {
  Active: 'Cash',
  Completed: 'Online',
  Paused: 'Cheque',
}

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState([])
  const [donations, setDonations] = useState([])
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState(null)

  const [query, setQuery] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    setError('')
    try {
      const [campaignsRes, donationsRes, expensesRes] = await Promise.all([
        getCampaignsService(),
        getDonationsService(),
        getExpensesService(),
      ])
      setCampaigns(campaignsRes.data.data)
      setDonations(donationsRes.data.data)
      setExpenses(expensesRes.data.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load campaigns.')
    } finally {
      setLoading(false)
    }
  }

  // --------------------------------
  // Calculate donation total
  // for every campaign
  // --------------------------------
  const campaignDonationTotals = useMemo(() => {
    const totals = {}

    donations.forEach((donation) => {
      const campaignId = donation.campaignId?._id || donation.campaignId
      if (!campaignId) return

      totals[campaignId] = (totals[campaignId] || 0) + Number(donation.amount || 0)
    })

    return totals
  }, [donations])

  // --------------------------------
  // Calculate expense total
  // for every campaign
  // --------------------------------
  const campaignExpenseTotals = useMemo(() => {
    const totals = {}

    expenses.forEach((expense) => {
      const campaignId = expense.campaignId?._id || expense.campaignId
      if (!campaignId) return

      totals[campaignId] = (totals[campaignId] || 0) + Number(expense.amount || 0)
    })

    return totals
  }, [expenses])

  const filtered = campaigns.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()))

  function openAdd() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(campaign) {
    setEditing(campaign)
    setFormOpen(true)
  }

  async function handleSubmit(data) {
    setSubmitting(true)
    try {
      if (editing) {
        const { data: res } = await updateCampaignService(editing._id, data)
        setCampaigns((prev) => prev.map((c) => (c._id === editing._id ? res.data : c)))
        setFeedback({ type: 'success', message: res.message || 'Campaign updated successfully.' })
      } else {
        const { data: res } = await createCampaignService(data)
        setCampaigns((prev) => [res.data, ...prev])
        setFeedback({ type: 'success', message: res.message || 'Campaign created successfully.' })
      }
      setFormOpen(false)
      setEditing(null)
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to save campaign.' })
      setError(err.response?.data?.message || 'Failed to save campaign.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    try {
      await deleteCampaignsService([deleteTarget._id])
      setCampaigns((prev) => prev.filter((c) => c._id !== deleteTarget._id))
      setFeedback({ type: 'success', message: 'Campaign deleted successfully.' })
      setDeleteTarget(null)
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to delete campaign.' })
      setError(err.response?.data?.message || 'Failed to delete campaign.')
      setDeleteTarget(null)
    }
  }

  return (
    <div>
      <FeedbackToast feedback={feedback} onClose={() => setFeedback(null)} />
      <Topbar
        title="Campaigns"
        subtitle={`${campaigns.length} campaign${campaigns.length === 1 ? '' : 's'}`}
        actions={
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4" />
            Add campaign
          </Button>
        }
      />

      <div className="p-6">
        {error && (
          <div className="mb-4 rounded-md bg-destructive/10 px-4 py-2 text-sm text-destructive">{error}</div>
        )}

        {/* Search */}
        <div className="mb-4 max-w-xs">
          <Input placeholder="Search campaigns..." value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>

        {/* Loading state */}
        {loading && (
          <p className="py-10 text-center text-sm text-muted-foreground">Loading campaigns…</p>
        )}

        {/* Campaign Cards */}
        {!loading && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c) => {
              const raised = campaignDonationTotals[c._id] || 0
              const spent = campaignExpenseTotals[c._id] || 0

              const percentage =
                c.goal > 0 ? Math.min(100, Math.round((raised / c.goal) * 100)) : 0

              return (
                <Card key={c._id} className="p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Target className="h-5 w-5" />
                    </div>

                    <Badge tone={statusTone[c.status]}>{c.status}</Badge>
                  </div>

                  {/* Campaign Name */}
                  <h3 className="mt-3 font-display text-sm font-semibold text-foreground">{c.name}</h3>

                  {/* Date */}
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDate(c.startDate)}
                    {c.endDate ? ` – ${formatDate(c.endDate)}` : ''}
                  </p>

                  {/* Goal */}
                  <p className="mt-3 font-display text-lg font-bold text-foreground">
                    {formatCurrency(c.goal)}
                  </p>

                  <p className="text-xs text-muted-foreground">Goal amount</p>

                  {/* Raised Amount */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{formatCurrency(raised)}</p>
                        <p className="text-xs text-muted-foreground">Raised from donations</p>
                      </div>

                      <span className="text-sm font-semibold text-primary">{percentage}%</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Remaining */}
                  <div className="mt-3 flex justify-between text-xs">
                    <span className="text-muted-foreground">Remaining</span>
                    <span className="font-medium text-foreground">
                      {formatCurrency(Math.max(c.goal - raised, 0))}
                    </span>
                  </div>

                  {/* Expenses */}
                  <div className="mt-1.5 flex justify-between text-xs">
                    <span className="text-muted-foreground">Expenses</span>
                    <span className="font-medium text-destructive">{formatCurrency(spent)}</span>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex justify-end gap-1 border-t border-border pt-3">
                    <button
                      onClick={() => openEdit(c)}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => setDeleteTarget(c)}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </Card>
              )
            })}

            {filtered.length === 0 && (
              <p className="col-span-full py-10 text-center text-sm text-muted-foreground">
                No campaigns found.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Campaign */}
      <CampaignFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false)
          setEditing(null)
        }}
        onSubmit={handleSubmit}
        campaign={editing}
        submitting={submitting}
      />

      {/* Delete */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete campaign?"
        description={`This will permanently remove "${deleteTarget?.name}".`}
      />
    </div>
  )
}
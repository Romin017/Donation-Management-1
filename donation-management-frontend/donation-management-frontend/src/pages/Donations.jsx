import React, { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Mail } from 'lucide-react'

import { Topbar } from '../components/layout/Topbar'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input, Select } from '../components/ui/Input'
import { Badge } from '../components/ui/Badge'
import { ConfirmDialog } from '../components/ui/Modal'
import { FeedbackToast } from '../components/ui/FeedbackToast'
import { DonationFormModal } from '../components/donations/DonationFormModal'
import { formatCurrency, formatDate, initials } from '../lib/utils'
import {
  getDonorsService,
  getCampaignsService,
  getDonationsService,
  createDonationService,
  updateDonationService,
  deleteDonationsService,
} from '../api/apiService'

const paymentTone = {
  Cash: 'Cash',
  Cheque: 'Cheque',
  'Manual Entry': 'Online',
}

export default function Donations() {
  const [donors, setDonors] = useState([])
  const [campaigns, setCampaigns] = useState([])
  const [donations, setDonations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState(null)

  const [query, setQuery] = useState('')
  const [campaignFilter, setCampaignFilter] = useState('All')

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
      const [donorsRes, campaignsRes, donationsRes] = await Promise.all([
        getDonorsService(),
        getCampaignsService(),
        getDonationsService(),
      ])
      setDonors(donorsRes.data.data)
      setCampaigns(campaignsRes.data.data)
      setDonations(donationsRes.data.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load donations.')
    } finally {
      setLoading(false)
    }
  }

  // Get donor id whether donorId is populated (object) or plain string
  function getDonorId(donation) {
    return donation.donorId?._id || donation.donorId
  }
  function getCampaignId(donation) {
    return donation.campaignId?._id || donation.campaignId
  }

  // Get donor by ID
  function getDonor(id) {
    return donors.find((d) => d._id === id)
  }

  // Get donor name
  function donorName(id) {
    return getDonor(id)?.name || 'Unknown donor'
  }

  // Get donor email
  function donorEmail(id) {
    return getDonor(id)?.email || 'Unknown email'
  }

  // Get campaign name
  function campaignName(id) {
    return campaigns.find((c) => c._id === id)?.name || 'Unknown campaign'
  }

  // Filter donations
  const filtered = donations
    .filter((donation) => {
      if (campaignFilter === 'All') return true
      return getCampaignId(donation) === campaignFilter
    })
    .filter((donation) => {
      const donorId = getDonorId(donation)
      const donor = getDonor(donorId)

      const name = donor?.name || ''
      const email = donor?.email || ''

      const searchText = `${name} ${email}`.toLowerCase()

      return searchText.includes(query.toLowerCase())
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date))

  // Total donation amount
  const total = filtered.reduce((sum, donation) => sum + Number(donation.amount || 0), 0)

  // Open add donation
  function openAdd() {
    setEditing(null)
    setFormOpen(true)
  }

  // Open edit donation
  function openEdit(donation) {
    setEditing(donation)
    setFormOpen(true)
  }

  // Submit donation
  async function handleSubmit(data) {
    setSubmitting(true)
    try {
      if (editing) {
        const donationId = editing._id || editing.id
        if (!donationId) throw new Error('Donation ID is missing.')
        const { data: res } = await updateDonationService(donationId, data)
        setDonations((prev) => prev.map((d) => ((d._id || d.id) === donationId ? res.data : d)))
      } else {
        const { data: res } = await createDonationService(data)
        setDonations((prev) => [res.data, ...prev])
        setFeedback({ type: 'success', message: res.message || 'Donation created successfully.' })
      }
      setFormOpen(false)
      setEditing(null)
    } catch (err) {
      if (!editing) {
        setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to create donation.' })
      }
      setError(err.response?.data?.message || 'Failed to save donation.')
    } finally {
      setSubmitting(false)
    }
  }

  // Delete donation
  async function handleDelete() {
    try {
      await deleteDonationsService([deleteTarget._id])
      setDonations((prev) => prev.filter((d) => d._id !== deleteTarget._id))
      setDeleteTarget(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete donation.')
      setDeleteTarget(null)
    }
  }

  return (
    <div>
      <FeedbackToast feedback={feedback} onClose={() => setFeedback(null)} />
      {/* Topbar */}
      <Topbar
        title="Donations"
        subtitle={`${filtered.length} record${filtered.length === 1 ? '' : 's'} · ${formatCurrency(total)} total`}
        actions={
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4" />
            Record donation
          </Button>
        }
      />

      <div className="p-6">
        {error && (
          <div className="mb-4 rounded-md bg-destructive/10 px-4 py-2 text-sm text-destructive">{error}</div>
        )}

        {/* Search + Campaign Filter */}
        <div className="mb-4 flex flex-wrap gap-3">
          <Input
            placeholder="Search by donor name or email…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="max-w-xs"
          />

          <Select
            value={campaignFilter}
            onChange={(e) => setCampaignFilter(e.target.value)}
            className="max-w-[200px]"
          >
            <option value="All">All campaigns</option>

            {campaigns.map((campaign) => (
              <option key={campaign._id} value={campaign._id}>
                {campaign.name}
              </option>
            ))}
          </Select>
        </div>

        {/* Loading state */}
        {loading && <p className="py-10 text-center text-sm text-muted-foreground">Loading donations…</p>}

        {/* Donation Table */}
        {!loading && (
          <Card className="overflow-hidden">
            <div className="max-h-[500px] overflow-y-auto overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10 bg-secondary text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3 font-medium">Donor</th>
                    <th className="px-5 py-3 font-medium">Email</th>
                    <th className="px-5 py-3 font-medium">Campaign</th>
                    <th className="px-5 py-3 font-medium">Amount</th>
                    <th className="px-5 py-3 font-medium">Date</th>
                    <th className="px-5 py-3 font-medium">Payment</th>
                    <th className="px-5 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-border">
                  {filtered.map((donation) => {
                    const donorId = getDonorId(donation)
                    const campaignId = getCampaignId(donation)

                    return (
                      <tr key={donation._id} className="hover:bg-secondary/30">
                        {/* Donor */}
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                              {initials(donorName(donorId))}
                            </div>
                            <span className="font-medium text-foreground">{donorName(donorId)}</span>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="px-5 py-3 text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Mail className="h-3.5 w-3.5" />
                            <span>{donorEmail(donorId)}</span>
                          </div>
                        </td>

                        {/* Campaign */}
                        <td className="px-5 py-3 text-muted-foreground">{campaignName(campaignId)}</td>

                        {/* Amount */}
                        <td className="px-5 py-3 font-semibold text-foreground">
                          {formatCurrency(donation.amount)}
                        </td>

                        {/* Date */}
                        <td className="px-5 py-3 text-muted-foreground">{formatDate(donation.date)}</td>

                        {/* Payment */}
                        <td className="px-5 py-3">
                          <Badge tone={paymentTone[donation.paymentMode]}>{donation.paymentMode}</Badge>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-3">
                          <div className="flex justify-end gap-1">
                            <button
                              onClick={() => openEdit(donation)}
                              className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                              title="Edit donation"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>

                            <button
                              onClick={() => setDeleteTarget(donation)}
                              className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                              title="Delete donation"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}

                  {/* Empty state */}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-5 py-10 text-center text-muted-foreground">
                        No donations found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      {/* Add/Edit Donation Modal */}
      <DonationFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false)
          setEditing(null)
        }}
        onSubmit={handleSubmit}
        donation={editing}
        donors={donors}
        campaigns={campaigns}
        submitting={submitting}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete donation?"
        description="This will permanently remove this donation record."
      />
    </div>
  )
}
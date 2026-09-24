import React, { useEffect, useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, Mail, Phone, MapPin } from 'lucide-react'
import { Topbar } from '../components/layout/Topbar'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { ConfirmDialog } from '../components/ui/Modal'
import { FeedbackToast } from '../components/ui/FeedbackToast'
import { DonorFormModal } from '../components/donors/DonorFormModal'
import {
  getDonorsService,
  createDonorService,
  updateDonorService,
  deleteDonorService,
} from '../api/apiService'
import { getDonationsService } from '../api/apiService'
import { formatCurrency, formatDate, initials } from '../lib/utils'

export default function Donors() {
  const [donors, setDonors] = useState([])
  const [donations, setDonations] = useState([])
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
      const [donorsRes, donationsRes] = await Promise.all([
        getDonorsService(),
        getDonationsService(),
      ])
      setDonors(donorsRes.data.data)
      setDonations(donationsRes.data.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load donors.')
    } finally {
      setLoading(false)
    }
  }

  const donorTotals = useMemo(() => {
    const totals = {}
    donations.forEach((g) => {
      const id = g.donorId?._id || g.donorId
      totals[id] = (totals[id] || 0) + Number(g.amount)
    })
    return totals
  }, [donations])

  const filtered = donors.filter((d) =>
    [d.name, d.email, d.phone].join(' ').toLowerCase().includes(query.toLowerCase()),
  )

  function openAdd() {
    setEditing(null)
    setFormOpen(true)
  }
  function openEdit(donor) {
    setEditing(donor)
    setFormOpen(true)
  }

  async function handleSubmit(data) {
    setSubmitting(true)
    try {
      if (editing) {
        const { data: res } = await updateDonorService(editing._id, data)
        setDonors((prev) => prev.map((d) => (d._id === editing._id ? res.data : d)))
        setFeedback({ type: 'success', message: res.message || 'Donor updated successfully.' })
      } else {
        const { data: res } = await createDonorService(data)
        setDonors((prev) => [res.data, ...prev])
        setFeedback({ type: 'success', message: res.message || 'Donor created successfully.' })
      }
      setFormOpen(false)
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to save donor.' })
      setError(err.response?.data?.message || 'Failed to save donor.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    try {
      await deleteDonorService(deleteTarget._id)
      setDonors((prev) => prev.filter((d) => d._id !== deleteTarget._id))
      setFeedback({ type: 'success', message: 'Donor deleted successfully.' })
      setDeleteTarget(null)
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to delete donor.' })
      setError(err.response?.data?.message || 'Failed to delete donor.')
      setDeleteTarget(null)
    }
  }

  return (
    <div>
      <FeedbackToast feedback={feedback} onClose={() => setFeedback(null)} />
      <Topbar
        title="Donors"
        subtitle={`${donors.length} donor${donors.length === 1 ? '' : 's'} on record`}
        actions={
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4" /> Add donor
          </Button>
        }
      />

      <div className="p-6">
        {error && (
          <div className="mb-4 rounded-md bg-destructive/10 px-4 py-2 text-sm text-destructive">{error}</div>
        )}

        <div className="mb-4 max-w-xs">
          <Input placeholder="Search donors…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-medium">Donor</th>
                  <th className="px-5 py-3 font-medium">Contact</th>
                  <th className="px-5 py-3 font-medium">Address</th>
                  <th className="px-5 py-3 font-medium">Total given</th>
                  <th className="px-5 py-3 font-medium">Joined</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading && (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-muted-foreground">
                      Loading donors…
                    </td>
                  </tr>
                )}

                {!loading &&
                  filtered.map((d) => (
                    <tr key={d._id} className="hover:bg-secondary/30">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                            {initials(d.name)}
                          </div>
                          <span className="font-medium text-foreground">{d.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5" /> {d.email}
                        </div>
                        <div className="mt-0.5 flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5" /> {d.phone}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5" /> {d.address || '—'}
                        </div>
                      </td>
                      <td className="px-5 py-3 font-medium text-foreground">
                        {formatCurrency(donorTotals[d._id] || 0)}
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">{formatDate(d.createdAt)}</td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => openEdit(d)}
                            className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(d)}
                            className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                {!loading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-muted-foreground">
                      No donors found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <DonorFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        donor={editing}
        submitting={submitting}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete donor?"
        description={`This will remove ${deleteTarget?.name} and their donation history. This can't be undone.`}
      />
    </div>
  )
}
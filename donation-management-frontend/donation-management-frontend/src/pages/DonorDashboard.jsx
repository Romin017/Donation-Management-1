import React, { useEffect, useState } from 'react'
import { LogOut, Plus, UserCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getDonationsService } from '../api/apiService'
import { FeedbackToast } from '../components/ui/FeedbackToast'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { BrandLogo } from '../components/ui/BrandLogo'
import { formatCurrency, formatDate } from '../lib/utils'

export default function DonorDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [donations, setDonations] = useState([])
  const [loading, setLoading] = useState(true)
  const [feedback, setFeedback] = useState(null)

  useEffect(() => {
    async function fetchDonations() {
      try {
        const { data } = await getDonationsService()
        setDonations(data.data || [])
      } catch (err) {
        setFeedback({ type: 'error', message: err.response?.data?.message || 'Unable to load your donations.' })
      } finally {
        setLoading(false)
      }
    }

    fetchDonations()
  }, [])

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  const total = donations.reduce((sum, donation) => sum + Number(donation.amount || 0), 0)

  return (
    <div className="min-h-screen bg-background">
      <FeedbackToast feedback={feedback} onClose={() => setFeedback(null)} />
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <BrandLogo variant="donor" />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/donor-profile')}
              className="rounded-md px-2 py-1 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              <span className="inline-flex items-center gap-1">
                <UserCircle className="h-4 w-4" />
                {user?.name || 'Donor Profile'}
              </span>
            </button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" /> Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">Donor dashboard</p>
            <h1 className="mt-2 font-display text-3xl font-bold text-foreground">Welcome, {user?.name || 'donor'}</h1>
            <p className="mt-2 text-sm text-muted-foreground">Your donation history and secure online giving.</p>
          </div>
          <Button onClick={() => navigate('/donate')}>
            <Plus className="h-4 w-4" /> Make a donation
          </Button>
        </div>

        <Card className="mt-8 p-6">
          <p className="text-sm text-muted-foreground">Total donated</p>
          <p className="mt-1 font-display text-3xl font-bold text-foreground">{formatCurrency(total)}</p>
        </Card>

        <section className="mt-8">
          <h2 className="font-display text-xl font-semibold text-foreground">Your donations</h2>
          <Card className="mt-4 overflow-hidden">
            {loading && (
              <p className="px-5 py-10 text-center text-sm text-muted-foreground">Loading donations…</p>
            )}
            {!loading && donations.length === 0 && (
              <p className="px-5 py-10 text-center text-sm text-muted-foreground">You have not made a donation yet.</p>
            )}
            {!loading && donations.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-secondary text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-5 py-3 font-medium">Campaign</th>
                      <th className="px-5 py-3 font-medium">Amount</th>
                      <th className="px-5 py-3 font-medium">Date</th>
                      <th className="px-5 py-3 font-medium">Payment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {donations.map((donation) => (
                      <tr key={donation._id}>
                        <td className="px-5 py-3 text-foreground">
                          {donation.campaignId?.name || donation.campaign?.name || 'Campaign'}
                        </td>
                        <td className="px-5 py-3 font-semibold text-foreground">{formatCurrency(donation.amount)}</td>
                        <td className="px-5 py-3 text-muted-foreground">{formatDate(donation.date || donation.createdAt)}</td>
                        <td className="px-5 py-3 text-muted-foreground">{donation.paymentStatus || 'paid'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </section>
      </main>
    </div>
  )
}

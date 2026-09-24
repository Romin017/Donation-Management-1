import React, { useEffect, useState } from 'react'
import { CheckCircle2, LogOut, ShieldCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { createPaymentOrderService, getCampaignsService, verifyPaymentService } from '../api/apiService'
import { FeedbackToast } from '../components/ui/FeedbackToast'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input, Label, Select } from '../components/ui/Input'
import { BrandLogo } from '../components/ui/BrandLogo'
import { formatCurrency } from '../lib/utils'

const razorpayScript = 'https://checkout.razorpay.com/v1/checkout.js'

function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve(true)

  return new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = razorpayScript
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export default function Donate() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [campaigns, setCampaigns] = useState([])
  const [campaignId, setCampaignId] = useState('')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [receipt, setReceipt] = useState(null)
  const [feedback, setFeedback] = useState(null)

  useEffect(() => {
    async function fetchCampaigns() {
      try {
        const { data } = await getCampaignsService()
        setCampaigns((data.data || []).filter((campaign) => campaign.status === 'Active'))
      } catch (err) {
        setFeedback({ type: 'error', message: err.response?.data?.message || 'Unable to load campaigns.' })
      } finally {
        setLoading(false)
      }
    }

    fetchCampaigns()
  }, [])

  async function handlePaymentSuccess(paymentResponse, orderId) {
    try {
      const { data } = await verifyPaymentService({
        razorpay_payment_id: paymentResponse.razorpay_payment_id,
        razorpay_order_id: paymentResponse.razorpay_order_id || orderId,
        razorpay_signature: paymentResponse.razorpay_signature,
      })
      setReceipt({
        paymentId: paymentResponse.razorpay_payment_id,
        message: data.message || 'Your donation was received successfully.',
      })
      setAmount('')
      setCampaignId('')
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Payment verification failed.' })
    } finally {
      setPaying(false)
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setFeedback(null)

    const numericAmount = Number(amount)
    if (!campaignId || !numericAmount || numericAmount <= 0) {
      setFeedback({ type: 'error', message: 'Choose a campaign and enter a valid amount.' })
      return
    }

    setPaying(true)
    try {
      const loaded = await loadRazorpay()
      if (!loaded) throw new Error('Razorpay Checkout could not be loaded.')

      const { data: response } = await createPaymentOrderService({
        campaignId,
        amount: numericAmount,
      })

      const order = response?.data || response
      const keyId = response?.keyId || response?.key_id || import.meta.env.VITE_RAZORPAY_KEY_ID

      if (!order?.id) throw new Error('Payment order response is incomplete.')
      if (!keyId) throw new Error('Razorpay public key is missing. Add VITE_RAZORPAY_KEY_ID in the frontend environment.')

      const checkout = new window.Razorpay({
        key: keyId,
        amount: order.amount,
        currency: order.currency || 'INR',
        name: 'DonateHub',
        description: 'Campaign donation',
        order_id: order.id,
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || '',
        },
        handler: (paymentResponse) => handlePaymentSuccess(paymentResponse, order.id),
        modal: {
          ondismiss: () => setPaying(false),
        },
        theme: { color: '#126b55' },
      })

      checkout.on('payment.failed', (failure) => {
        setFeedback({ type: 'error', message: failure.error?.description || 'Payment failed. Please try again.' })
        setPaying(false)
      })
      checkout.open()
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || err.message || 'Unable to start payment.' })
      setPaying(false)
    }
  }

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  if (receipt) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/10 text-success">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h1 className="mt-5 font-display text-2xl font-bold text-foreground">Thank you for donating</h1>
          <p className="mt-2 text-sm text-muted-foreground">{receipt.message}</p>
          <p className="mt-5 break-all text-xs text-muted-foreground">Payment ID: {receipt.paymentId}</p>
          <Button className="mt-6 w-full" onClick={() => setReceipt(null)}>Make another donation</Button>
          <button type="button" onClick={handleLogout} className="mt-4 text-sm text-muted-foreground hover:text-foreground">
            Sign out
          </button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <BrandLogo variant="donor" />
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4" /> Sign out
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-12">
        <div className="max-w-xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Make an impact</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-foreground">Choose a campaign to support</h1>
          <p className="mt-3 text-sm text-muted-foreground">Your payment is processed securely by Razorpay. Your donation is recorded only after payment verification.</p>
        </div>

        <Card className="mt-8 max-w-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="campaign">Campaign</Label>
              <Select id="campaign" value={campaignId} onChange={(event) => setCampaignId(event.target.value)} disabled={loading || paying} required>
                <option value="">Select a campaign</option>
                {campaigns.map((campaign) => (
                  <option key={campaign._id} value={campaign._id}>{campaign.name}</option>
                ))}
              </Select>
              {!loading && campaigns.length === 0 && <p className="mt-2 text-xs text-muted-foreground">There are no active campaigns right now.</p>}
            </div>

            <div>
              <Label htmlFor="amount">Donation amount (INR)</Label>
              <Input id="amount" type="number" min="1" step="1" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="500" disabled={paying} required />
              {amount && Number(amount) > 0 && <p className="mt-2 text-xs text-muted-foreground">{formatCurrency(Number(amount))}</p>}
            </div>

            {feedback && <p className="text-sm text-destructive">{feedback.message}</p>}

            <Button type="submit" className="w-full" size="lg" disabled={loading || paying || campaigns.length === 0}>
              {paying ? 'Opening secure checkout…' : 'Continue to payment'}
            </Button>
          </form>
          <div className="mt-5 flex items-center gap-2 border-t border-border pt-4 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 shrink-0 text-success" />
            Razorpay handles your card, UPI, netbanking, or wallet details securely.
          </div>
        </Card>
      </main>
      <FeedbackToast feedback={feedback?.type === 'error' ? feedback : null} onClose={() => setFeedback(null)} />
    </div>
  )
}

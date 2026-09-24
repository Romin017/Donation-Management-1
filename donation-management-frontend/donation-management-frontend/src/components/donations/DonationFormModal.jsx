import React, { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Input, Label, Select } from '../ui/Input'
import { Button } from '../ui/Button'

const empty = {
  donorId: '',
  donorName: '',
  donorEmail: '',
  campaignId: '',
  amount: '',
  date: new Date().toISOString().slice(0, 10),
  paymentMode: 'Cash',
  notes: '',
}

export function DonationFormModal({
  open,
  onClose,
  onSubmit,
  donation,
  donors = [],
  campaigns = [],
  submitting = false,
}) {
  const [form, setForm] = useState(empty)
  const [errors, setErrors] = useState({})

  /*
   * When:
   * 1. Add donation -> reset to blank/default values (no prefill)
   * 2. Edit donation -> load existing donation
   */
  useEffect(() => {
    if (donation) {
      const donorId = donation.donorId?._id || donation.donorId || ''
      const donor = donation.donorId && typeof donation.donorId === 'object'
        ? donation.donorId
        : donors.find((item) => item._id === donorId || item.id === donorId)
      setForm({
        donorId,
        donorName: donation.donorName || donor?.name || '',
        donorEmail: donation.donorEmail || donor?.email || donor?.emailAddress || '',
        campaignId: donation.campaignId?._id || donation.campaignId || '',
        amount: donation.amount || '',
        date: donation.date ? donation.date.slice(0, 10) : '',
        paymentMode: donation.paymentMode || 'Cash',
        notes: donation.notes || '',
      })
    } else {
      setForm(empty)
    }

    setErrors({})
  }, [donation, open])

  /*
   * Donor selection
   *
   * User selects:
   *
   * Ramesh Patel - ramesh@gmail.com
   *
   * We find that donor from donors[]
   * and store:
   *
   * donorId
   * donorName
   * donorEmail
   */
  function handleDonorChange(e) {
    const donorId = e.target.value

    const selectedDonor = donors.find(
      (donor) => donor._id === donorId
    )

    setForm({
      ...form,
      donorId: selectedDonor?._id || '',
      donorName: selectedDonor?.name || '',
      donorEmail: selectedDonor?.email || '',
    })

    setErrors({
      ...errors,
      donorId: '',
      donorName: '',
      donorEmail: '',
    })
  }

  function handleCampaignChange(e) {
    setForm({
      ...form,
      campaignId: e.target.value,
    })

    setErrors({
      ...errors,
      campaignId: '',
    })
  }

  function validate() {
    const errs = {}

    /*
     * Donor validation
     */
    if (!form.donorId) {
      errs.donorId = 'Select a donor.'
    }

    if (!form.donorName.trim()) {
      errs.donorName = 'Donor name is required.'
    }

    if (!form.donorEmail.trim()) {
      errs.donorEmail = 'Donor email is required.'
    } else if (
      !/^\S+@\S+\.\S+$/.test(form.donorEmail)
    ) {
      errs.donorEmail = 'Enter a valid donor email.'
    }

    /*
     * Campaign validation
     */
    if (!form.campaignId) {
      errs.campaignId = 'Select a campaign.'
    }

    /*
     * Amount validation
     */
    if (
      !form.amount ||
      Number(form.amount) <= 0
    ) {
      errs.amount = 'Enter a valid amount.'
    }

    /*
     * Date validation
     */
    if (!form.date) {
      errs.date = 'Select a date.'
    }

    setErrors(errs)

    return Object.keys(errs).length === 0
  }

  function handleSubmit(e) {
    e.preventDefault()

    if (submitting) return

    if (!validate()) {
      return
    }

    /*
     * Data sent to parent
     */
    const donationData = {
      donorId: form.donorId,
      donorName: form.donorName.trim(),
      donorEmail: form.donorEmail.trim().toLowerCase(),

      campaignId: form.campaignId,

      amount: Number(form.amount),

      date: form.date,

      paymentMode: form.paymentMode,

      notes: form.notes.trim(),
    }

    onSubmit(donationData)
  }

  return (
    <Modal
      open={open}
      onClose={submitting ? undefined : onClose}
      title={
        donation
          ? 'Edit donation'
          : 'Record donation'
      }
      description={
        donation
          ? 'Update this donation record.'
          : 'Log a new donation.'
      }
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <fieldset disabled={submitting} className="space-y-4">

        {/* ========================= */}
        {/* DONOR */}
        {/* ========================= */}

        <div>
          <Label htmlFor="donorId">
            Donor
          </Label>

          <Select
            id="donorId"
            value={form.donorId}
            onChange={handleDonorChange}
          >
            <option value="" disabled>
              Select a donor
            </option>

            {donors.map((donor) => (
              <option
                key={donor._id}
                value={donor._id}
              >
                {donor.name} - {donor.email}
              </option>
            ))}
          </Select>

          {errors.donorId && (
            <p className="mt-1 text-xs text-destructive">
              {errors.donorId}
            </p>
          )}
        </div>

        {/* ========================= */}
        {/* DONOR NAME + EMAIL */}
        {/* ========================= */}

        <div className="grid grid-cols-2 gap-4">

          {/* Donor Name */}

          <div>
            <Label htmlFor="donorName">
              Donor Name
            </Label>

            <Input
              id="donorName"
              value={form.donorName}
              readOnly
              placeholder="Donor name"
            />

            {errors.donorName && (
              <p className="mt-1 text-xs text-destructive">
                {errors.donorName}
              </p>
            )}
          </div>

          {/* Donor Email */}

          <div>
            <Label htmlFor="donorEmail">
              Donor Email
            </Label>

            <Input
              id="donorEmail"
              type="email"
              value={form.donorEmail}
              readOnly
              placeholder="Donor email"
            />

            {errors.donorEmail && (
              <p className="mt-1 text-xs text-destructive">
                {errors.donorEmail}
              </p>
            )}
          </div>

        </div>

        {/* ========================= */}
        {/* CAMPAIGN */}
        {/* ========================= */}

        <div>
          <Label htmlFor="campaignId">
            Campaign
          </Label>

          <Select
            id="campaignId"
            value={form.campaignId}
            onChange={handleCampaignChange}
          >
            <option value="" disabled>
              Select a campaign
            </option>

            {campaigns
              .filter((campaign) => campaign.status === 'Active')
              .map((campaign) => (
                <option
                  key={campaign._id}
                  value={campaign._id}
                >
                  {campaign.name}
                </option>
              ))}
          </Select>

          {errors.campaignId && (
            <p className="mt-1 text-xs text-destructive">
              {errors.campaignId}
            </p>
          )}
        </div>

        {/* ========================= */}
        {/* AMOUNT + DATE */}
        {/* ========================= */}

        <div className="grid grid-cols-2 gap-4">

          {/* Amount */}

          <div>
            <Label htmlFor="amount">
              Amount (₹)
            </Label>

            <Input
              id="amount"
              type="number"
              min="1"
              value={form.amount}
              onChange={(e) =>
                setForm({
                  ...form,
                  amount: e.target.value,
                })
              }
              placeholder="0"
            />

            {errors.amount && (
              <p className="mt-1 text-xs text-destructive">
                {errors.amount}
              </p>
            )}
          </div>

          {/* Date */}

          <div>
            <Label htmlFor="date">
              Date
            </Label>

            <Input
              id="date"
              type="date"
              value={form.date}
              onChange={(e) =>
                setForm({
                  ...form,
                  date: e.target.value,
                })
              }
            />

            {errors.date && (
              <p className="mt-1 text-xs text-destructive">
                {errors.date}
              </p>
            )}
          </div>

        </div>

        {/* ========================= */}
        {/* PAYMENT MODE */}
        {/* ========================= */}

        <div>
          <Label htmlFor="paymentMode">
            Payment mode
          </Label>

          <Select
            id="paymentMode"
            value={form.paymentMode}
            onChange={(e) =>
              setForm({
                ...form,
                paymentMode: e.target.value,
              })
            }
          >
            <option value="Cash">
              Cash
            </option>

            <option value="Cheque">
              Cheque
            </option>

            <option value="Manual Entry">
              Manual Entry
            </option>
          </Select>
        </div>

        {/* ========================= */}
        {/* NOTES */}
        {/* ========================= */}

        <div>
          <Label htmlFor="notes">
            Notes (optional)
          </Label>

          <Input
            id="notes"
            value={form.notes}
            onChange={(e) =>
              setForm({
                ...form,
                notes: e.target.value,
              })
            }
            placeholder="Add notes..."
          />
        </div>

        {/* ========================= */}
        {/* BUTTONS */}
        {/* ========================= */}

        <div className="flex justify-end gap-2 pt-2">

          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </Button>

          <Button type="submit" disabled={submitting}>
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {submitting
              ? 'Saving donation…'
              : donation
              ? 'Save changes'
              : 'Record donation'}
          </Button>

        </div>
        </fieldset>

      </form>
    </Modal>
  )
}
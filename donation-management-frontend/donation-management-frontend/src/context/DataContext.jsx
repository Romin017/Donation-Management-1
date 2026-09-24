import React, { useEffect, useState } from 'react'

const seedDonors = [
  { id: 'd1', name: 'Ramesh Patel', email: 'ramesh.patel@example.com', phone: '+91 98765 43210', address: 'Ahmedabad, Gujarat', createdAt: '2026-02-14' },
  { id: 'd2', name: 'Sunita Sharma', email: 'sunita.sharma@example.com', phone: '+91 91234 56780', address: 'Mumbai, Maharashtra', createdAt: '2026-03-02' },
  { id: 'd3', name: 'Vikram Iyer', email: 'vikram.iyer@example.com', phone: '+91 99887 66554', address: 'Bengaluru, Karnataka', createdAt: '2026-04-19' },
  { id: 'd4', name: 'Priya Nair', email: 'priya.nair@example.com', phone: '+91 90000 11223', address: 'Kochi, Kerala', createdAt: '2026-05-27' },
]

const seedDonations = [
  { id: 'g1', donorId: 'd1', amount: 5000, date: '2026-08-01', paymentMode: 'Online', purpose: 'Flood Relief', notes: '' },
  { id: 'g2', donorId: 'd2', amount: 2500, date: '2026-08-05', paymentMode: 'Cash', purpose: 'Education Fund', notes: '' },
  { id: 'g3', donorId: 'd3', amount: 10000, date: '2026-08-12', paymentMode: 'Cheque', purpose: 'General Fund', notes: 'Quarterly pledge' },
  { id: 'g4', donorId: 'd1', amount: 1500, date: '2026-08-20', paymentMode: 'Online', purpose: 'Education Fund', notes: '' },
  { id: 'g5', donorId: 'd4', amount: 7500, date: '2026-08-24', paymentMode: 'Online', purpose: 'Flood Relief', notes: '' },
]

function loadOrSeed(key, seed) {
  const saved = typeof window !== 'undefined' ? localStorage.getItem(key) : null
  if (saved) {
    try {
      return JSON.parse(saved)
    } catch {
      return seed
    }
  }
  return seed
}

function uid(prefix) {
  return `${prefix}${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`
}

// Global subscribers so all components stay reactive without requiring a DataProvider wrapper
const listeners = new Set()
let globalDonors = loadOrSeed('dh_donors', seedDonors)
let globalDonations = loadOrSeed('dh_donations', seedDonations)

function notify() {
  listeners.forEach((listener) => listener())
}

function setDonorsGlobal(updater) {
  globalDonors = typeof updater === 'function' ? updater(globalDonors) : updater
  try {
    localStorage.setItem('dh_donors', JSON.stringify(globalDonors))
  } catch (e) {
    console.error(e)
  }
  notify()
}

function setDonationsGlobal(updater) {
  globalDonations = typeof updater === 'function' ? updater(globalDonations) : updater
  try {
    localStorage.setItem('dh_donations', JSON.stringify(globalDonations))
  } catch (e) {
    console.error(e)
  }
  notify()
}

export function useData() {
  const [, setTick] = useState(0)

  useEffect(() => {
    const handleUpdate = () => setTick((t) => t + 1)
    listeners.add(handleUpdate)
    return () => {
      listeners.delete(handleUpdate)
    }
  }, [])

  // Donor CRUD
  function addDonor(donor) {
    const record = { ...donor, id: uid('d'), createdAt: new Date().toISOString().slice(0, 10) }
    setDonorsGlobal((prev) => [record, ...prev])
    return record
  }

  function updateDonor(id, updates) {
    setDonorsGlobal((prev) => prev.map((d) => (d.id === id ? { ...d, ...updates } : d)))
  }

  function deleteDonor(id) {
    setDonorsGlobal((prev) => prev.filter((d) => d.id !== id))
    setDonationsGlobal((prev) => prev.filter((g) => g.donorId !== id))
  }

  // Donation CRUD
  function addDonation(donation) {
    const record = { ...donation, id: uid('g') }
    setDonationsGlobal((prev) => [record, ...prev])
    return record
  }

  function updateDonation(id, updates) {
    setDonationsGlobal((prev) => prev.map((g) => (g.id === id ? { ...g, ...updates } : g)))
  }

  function deleteDonation(id) {
    setDonationsGlobal((prev) => prev.filter((g) => g.id !== id))
  }

  function getDonor(id) {
    return globalDonors.find((d) => d.id === id)
  }

  return {
    donors: globalDonors,
    donations: globalDonations,
    addDonor,
    updateDonor,
    deleteDonor,
    addDonation,
    updateDonation,
    deleteDonation,
    getDonor,
  }
}

export function DataProvider({ children }) {
  return <>{children}</>
}

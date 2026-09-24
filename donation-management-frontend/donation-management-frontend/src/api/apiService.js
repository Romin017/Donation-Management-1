import api from './axios'
import { APIs } from './constant'

// ===============================
// AUTH
// ===============================
export const loginService = (email, password) =>
  api.post(APIs.LOGIN, { email, password })

export const registerService = (data) =>
  api.post(APIs.REGISTER, data)

export const donorLoginService = (email, password) =>
  api.post(APIs.DONOR_LOGIN, { email, password })

export const donorRegisterService = (data) =>
  api.post(APIs.DONOR_REGISTER, data)

export const logoutService = () =>
  api.post(APIs.LOGOUT)

export const setPasswordService = (token, password) =>
  api.put(`${APIs.SET_PASSWORD}/${token}`, { password })

// ===============================
// DONORS
// ===============================
export const getDonorsService = () =>
  api.get(APIs.DONORS)

export const getDonorService = (id) =>
  api.get(`${APIs.DONORS}/${id}`)

export const createDonorService = (data) =>
  api.post(APIs.DONORS, data)

export const updateDonorService = (id, data) =>
  api.put(`${APIs.DONORS}/${id}`, data)

export const deleteDonorService = (id) =>
  api.delete(`${APIs.DONORS}/${id}`)

// ===============================
// CAMPAIGNS
// ===============================
export const getCampaignsService = () =>
  api.get(APIs.CAMPAIGNS)

export const getCampaignService = (id) =>
  api.get(`${APIs.CAMPAIGNS}/${id}`)

export const createCampaignService = (data) =>
  api.post(APIs.CAMPAIGNS, data)

export const updateCampaignService = (id, data) =>
  api.put(`${APIs.CAMPAIGNS}/${id}`, data)

export const deleteCampaignsService = (ids) =>
  api.delete(APIs.CAMPAIGNS, { data: { ids } })

// ===============================
// DONATIONS
// ===============================
export const getDonationsService = () =>
  api.get(APIs.DONATIONS)

export const getDonationService = (id) =>
  api.get(`${APIs.DONATIONS}/${id}`)

export const createDonationService = (data) =>
  api.post(APIs.DONATIONS, data)

export const updateDonationService = (id, data) =>
  api.put(`${APIs.DONATIONS}/${id}`, data)

export const deleteDonationsService = (ids) =>
  api.delete(APIs.DONATIONS, { data: { ids } })

// ===============================
// PAYMENTS
// ===============================
export const createPaymentOrderService = (data) =>
  api.post(APIs.CREATE_RAZORPAY_ORDER, data)

export const verifyPaymentService = (data) =>
  api.post(APIs.VERIFY_RAZORPAY_PAYMENT, data)

// ===============================
// EXPENSES
// ===============================
export const getExpensesService = () =>
  api.get(APIs.EXPENSES)

export const getExpenseService = (id) =>
  api.get(`${APIs.EXPENSES}/${id}`)

export const getTotalExpensesService = () =>
  api.get(APIs.EXPENSES_TOTAL)

export const createExpenseService = (data) =>
  api.post(APIs.EXPENSES, data)

export const updateExpenseService = (id, data) =>
  api.put(`${APIs.EXPENSES}/${id}`, data)

export const deleteExpensesService = (ids) =>
  api.delete(APIs.EXPENSES, { data: { ids } })

// ===============================
// USERS
// ===============================
export const getUsersService = () =>
  api.get(APIs.USERS)

export const createUserService = (data) =>
  api.post(APIs.USERS, data)

export const updateUserService = (id, data) =>
  api.put(`${APIs.USERS}/${id}`, data)

export const deleteUserService = (id) =>
  api.delete(`${APIs.USERS}/${id}`)
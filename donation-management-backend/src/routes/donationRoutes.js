import express from 'express';
import { protect, requireAdmin, requireDonor } from '../middlewares/authMiddleware.js';

import {
  addDonation,
  listDonations,
  getDonation,
  updateDonation,
  deleteDonations,
  createRazorpayOrder,
  verifyRazorpayPayment,
} from '../controllers/donationController.js';

const router = express.Router();

router.use(protect);

router.post('/razorpay/order', requireDonor, createRazorpayOrder);
router.post('/razorpay/verify', requireDonor, verifyRazorpayPayment);

// Create donation
router.post('/', addDonation);

// Get all donations
router.get('/', listDonations);

// Get single donation
router.get('/:id', getDonation);

// Update donation
router.put('/:id', updateDonation);

// Bulk delete donations (Admin only)
// body: { ids: ["...", "...", "..."] }
router.delete('/', requireAdmin, deleteDonations);

export default router;
import express from 'express';
import { protect, requireAdmin } from '../middlewares/authMiddleware.js';

import {
  addDonor,
  listDonors,
  getDonor,
  updateDonor,
  deleteDonor,
  registerAndPayOnline,
} from '../controllers/donorController.js';

const router = express.Router();

// Public route: donor can register and make an online payment immediately
router.post('/register-and-pay', registerAndPayOnline);

router.use(protect);

router.post('/', requireAdmin, addDonor);
router.get('/', requireAdmin, listDonors);
router.get('/:id', requireAdmin, getDonor);
router.put('/:id', requireAdmin, updateDonor);

// Delete donor (Admin only)
router.delete('/:id', requireAdmin, deleteDonor);

export default router;
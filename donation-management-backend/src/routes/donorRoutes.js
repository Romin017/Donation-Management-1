import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';

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

router.post('/', addDonor);
router.get('/', listDonors);
router.get('/:id', getDonor);
router.put('/:id', updateDonor);

router.delete('/:id', deleteDonor);

export default router;
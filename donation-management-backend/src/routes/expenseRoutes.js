import express from 'express';
import { protect, requireAdmin } from '../middlewares/authMiddleware.js';

import {
  addExpense,
  listExpenses,
  getExpense,
  updateExpense,
  deleteExpenses,
  getTotalExpenses,
} from '../controllers/expenseController.js';

const router = express.Router();

router.use(protect, requireAdmin);

// Create expense
router.post('/', addExpense);

// Get total expenses
router.get('/total', getTotalExpenses);

// Get all expenses
router.get('/', listExpenses);

// Get single expense
router.get('/:id', getExpense);

// Update expense
router.put('/:id', updateExpense);

// Delete single or multiple expenses
router.delete('/', deleteExpenses);

export default router;
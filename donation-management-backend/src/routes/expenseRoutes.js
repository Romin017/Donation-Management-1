import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';

import {
  addExpense,
  listExpenses,
  getExpense,
  deleteExpenses,
  getTotalExpenses,
} from '../controllers/expenseController.js';

const router = express.Router();

router.use(protect);

// Create expense
router.post('/', addExpense);

// Get total expenses
router.get('/total', getTotalExpenses);

// Get all expenses
router.get('/', listExpenses);

// Get single expense
router.get('/:id', getExpense);

// Delete single or multiple expenses
router.delete('/', deleteExpenses);

export default router;
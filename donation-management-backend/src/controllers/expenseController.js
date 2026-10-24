import mongoose from 'mongoose';
import Expense from '../models/expenseModel.js';
import Campaign from '../models/campaignModel.js';

// ========================================
// POST /api/expenses
// CREATE EXPENSE
// ========================================
export const addExpense = async (req, res) => {
  try {
    const {
      category,
      billNo,
      paidTo,
      amount,
      date,
      paymentMode,
      campaignId,
      notes,
    } = req.body;

    // Required fields
    if (!category || !billNo || !paidTo || !amount || !date || !paymentMode) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message:
          'category, billNo, paidTo, amount, date and paymentMode are required',
      });
    }

    // Validate amount
    if (Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'Expense amount must be greater than 0',
      });
    }

    // Validate campaign if provided
    if (campaignId) {
      if (!mongoose.Types.ObjectId.isValid(campaignId)) {
        return res.status(400).json({
          success: false,
          statusCode: 400,
          message: 'Invalid campaignId',
        });
      }

      const campaign = await Campaign.findById(campaignId);

      if (!campaign) {
        return res.status(404).json({
          success: false,
          statusCode: 404,
          message: 'Campaign not found',
        });
      }
    }

    const expense = await Expense.create({
      category,
      billNo: billNo.trim(),
      paidTo: paidTo.trim(),
      amount: Number(amount),
      date,
      paymentMode,
      campaignId: campaignId || null,
      notes: notes || '',
    });

    const populatedExpense = await Expense.findById(expense._id).populate(
      'campaignId',
      'name goal startDate endDate status'
    );

    return res.status(201).json({
      success: true,
      statusCode: 201,
      message: 'Expense created successfully',
      data: populatedExpense,
    });
  } catch (error) {
    console.error('addExpense error:', error);

    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: 'Server error',
      error: error.message,
    });
  }
};

// ========================================
// GET /api/expenses
// GET ALL EXPENSES
// ========================================
export const listExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find()
      .populate(
        'campaignId',
        'name goal startDate endDate status'
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Expenses fetched successfully',
      count: expenses.length,
      data: expenses,
    });
  } catch (error) {
    console.error('listExpenses error:', error);

    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: 'Server error',
      error: error.message,
    });
  }
};

// ========================================
// GET /api/expenses/:id
// GET SINGLE EXPENSE
// ========================================
export const getExpense = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'Invalid expense id',
      });
    }

    const expense = await Expense.findById(id).populate(
      'campaignId',
      'name goal startDate endDate status'
    );

    if (!expense) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: 'Expense not found',
      });
    }

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Expense fetched successfully',
      data: expense,
    });
  } catch (error) {
    console.error('getExpense error:', error);

    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: 'Server error',
      error: error.message,
    });
  }
};

// ========================================
// DELETE /api/expenses
// DELETE SINGLE OR MULTIPLE EXPENSES
// ========================================
export const deleteExpenses = async (req, res) => {
  try {
    const { ids } = req.body;

    // ids must be an array
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'ids must be a non-empty array',
      });
    }

    // Remove duplicate IDs
    const uniqueIds = [...new Set(ids)];

    // Validate IDs
    const invalidIds = uniqueIds.filter(
      (id) => !mongoose.Types.ObjectId.isValid(id)
    );

    if (invalidIds.length > 0) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'One or more invalid expense IDs',
        invalidIds,
      });
    }

    // Check records
    const expenses = await Expense.find({
      _id: { $in: uniqueIds },
    });

    if (expenses.length === 0) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: 'No expenses found',
      });
    }

    // Delete
    const result = await Expense.deleteMany({
      _id: { $in: uniqueIds },
    });

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message:
        result.deletedCount === 1
          ? 'Expense deleted successfully'
          : 'Expenses deleted successfully',
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error('deleteExpenses error:', error);

    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: 'Server error',
      error: error.message,
    });
  }
};

// ========================================
// GET /api/expenses/total
// GET TOTAL EXPENSES
// ========================================
export const getTotalExpenses = async (req, res) => {
  try {
    const result = await Expense.aggregate([
      {
        $group: {
          _id: null,
          totalExpenses: { $sum: '$amount' },
          totalRecords: { $sum: 1 },
        },
      },
    ]);

    const totalExpenses =
      result.length > 0 ? result[0].totalExpenses : 0;

    const totalRecords =
      result.length > 0 ? result[0].totalRecords : 0;

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Total expenses calculated successfully',
      data: {
        totalExpenses,
        totalRecords,
      },
    });
  } catch (error) {
    console.error('getTotalExpenses error:', error);

    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: 'Server error',
      error: error.message,
    });
  }
};
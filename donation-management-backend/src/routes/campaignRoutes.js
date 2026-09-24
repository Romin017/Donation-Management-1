import express from 'express';
import { protect, requireAdmin } from '../middlewares/authMiddleware.js';

import {
  createCampaign,
  getCampaigns,
  getCampaign,
  updateCampaign,
  deleteCampaigns,
} from '../controllers/campaignController.js';

const router = express.Router();

router.use(protect);

// Create campaign
// POST /api/campaigns
router.post('/', createCampaign);

// Get all campaigns
// GET /api/campaigns
router.get('/', getCampaigns);

// Get single campaign
// GET /api/campaigns/:id
router.get('/:id', getCampaign);

// Update campaign
// PUT /api/campaigns/:id
router.put('/:id', updateCampaign);

// Bulk delete campaigns (Admin only)
// DELETE /api/campaigns
// body: { ids: ["...", "...", "..."] }
router.delete('/', requireAdmin, deleteCampaigns);

export default router;
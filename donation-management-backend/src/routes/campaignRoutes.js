import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';

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

// Bulk delete campaigns
// DELETE /api/campaigns
// body: { ids: ["...", "...", "..."] }
router.delete('/', deleteCampaigns);

export default router;
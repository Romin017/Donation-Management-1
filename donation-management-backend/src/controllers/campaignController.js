import Campaign from '../models/campaignModel.js';

// ===============================
// CREATE CAMPAIGN
// ===============================
export const createCampaign = async (req, res) => {
  try {
    const { name, goal, startDate, endDate, status, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'Campaign name is required',
      });
    }

    if (!goal || Number(goal) <= 0) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'Valid goal amount is required',
      });
    }

    if (!startDate) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'Start date is required',
      });
    }

    const campaign = await Campaign.create({
      name,
      goal: Number(goal),
      startDate,
      endDate,
      status,
      description,
    });

    return res.status(201).json({
      success: true,
      statusCode: 201,
      message: 'Campaign created successfully',
      data: campaign,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: error.message,
    });
  }
};

// ===============================
// GET ALL CAMPAIGNS
// ===============================
export const getCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      statusCode: 200,
      count: campaigns.length,
      data: campaigns,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: error.message,
    });
  }
};

// ===============================
// GET SINGLE CAMPAIGN
// ===============================
export const getCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: 'Campaign not found',
      });
    }

    return res.status(200).json({
      success: true,
      statusCode: 200,
      data: campaign,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: error.message,
    });
  }
};

// ===============================
// UPDATE CAMPAIGN
// ===============================
export const updateCampaign = async (req, res) => {
  try {
    const { name, goal, startDate, endDate, status, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'Campaign name is required',
      });
    }

    if (!goal || Number(goal) <= 0) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'Valid goal amount is required',
      });
    }

    const campaign = await Campaign.findByIdAndUpdate(
      req.params.id,
      {
        name,
        goal: Number(goal),
        startDate,
        endDate,
        status,
        description,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!campaign) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: 'Campaign not found',
      });
    }

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Campaign updated successfully',
      data: campaign,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: error.message,
    });
  }
};

// ===============================
// DELETE CAMPAIGN
// ===============================
export const deleteCampaigns = async (req, res) => {
  try {
    const { ids } = req.body;

    // Validate ids
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'ids must be a non-empty array',
      });
    }

    // Remove duplicate IDs
    const uniqueIds = [...new Set(ids)];

    // Validate ObjectIds
    const invalidIds = uniqueIds.filter(
      (id) => !mongoose.Types.ObjectId.isValid(id)
    );

    if (invalidIds.length > 0) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'One or more invalid campaign IDs',
        invalidIds,
      });
    }

    // Find campaigns before deleting
    const campaigns = await Campaign.find({
      _id: { $in: uniqueIds },
    });

    if (campaigns.length === 0) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: 'No campaigns found',
      });
    }

    // Delete campaigns
    const result = await Campaign.deleteMany({
      _id: { $in: uniqueIds },
    });

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message:
        result.deletedCount === 1
          ? 'Campaign deleted successfully'
          : 'Campaigns deleted successfully',
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error('deleteCampaigns error:', error);

    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: 'Server error',
      error: error.message,
    });
  }
};
import mongoose from 'mongoose';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import Donation from '../models/Donation.js';
import Donor from '../models/donorModel.js';
import Campaign from '../models/campaignModel.js';
import { sendDonationConfirmationEmail } from '../utils/emailService.js';

const getRazorpayClient = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return null;
  }

  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

// POST /api/donations
export const addDonation = async (req, res) => {
  try {
    const {
      donorId,
      donorName,
      donorEmail,
      campaignId,
      amount,
      date,
      paymentMode,
      notes,
    } = req.body;

    // ==========================================
    // 1. REQUIRED FIELDS
    // ==========================================
    if (
      !donorId ||
      !donorName ||
      !donorEmail ||
      !campaignId ||
      amount === undefined ||
      !date ||
      !paymentMode
    ) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message:
          'donorId, donorName, donorEmail, campaignId, amount, date and paymentMode are required',
      });
    }

    // ==========================================
    // 2. VALIDATE DONOR ID
    // ==========================================
    if (!mongoose.Types.ObjectId.isValid(donorId)) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'Invalid donorId',
      });
    }

    // ==========================================
    // 3. VALIDATE CAMPAIGN ID
    // ==========================================
    if (!mongoose.Types.ObjectId.isValid(campaignId)) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'Invalid campaignId',
      });
    }

    // ==========================================
    // 4. VALIDATE AMOUNT
    // ==========================================
    const donationAmount = Number(amount);

    if (Number.isNaN(donationAmount) || donationAmount <= 0) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'Donation amount must be greater than 0',
      });
    }

    // ==========================================
    // 5. FIND DONOR
    // ==========================================
    const donor = await Donor.findById(donorId);

    if (!donor) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: 'Donor not found',
      });
    }

    // ==========================================
    // 6. VERIFY DONOR NAME
    // ==========================================
    const nameMatches =
      donor.name.trim().toLowerCase() ===
      donorName.trim().toLowerCase();

    if (!nameMatches) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'Donor name does not match the selected donor',
      });
    }

    // ==========================================
    // 7. VERIFY DONOR EMAIL
    // ==========================================
    const emailMatches =
      donor.email.trim().toLowerCase() ===
      donorEmail.trim().toLowerCase();

    if (!emailMatches) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message:
          'Donor email does not match the selected donor',
      });
    }

    // ==========================================
    // 8. FIND CAMPAIGN
    // ==========================================
    const campaign = await Campaign.findById(campaignId);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: 'Campaign not found',
      });
    }

    // ==========================================
    // 9. CREATE DONATION
    // ==========================================
    const donation = await Donation.create({
      donorId: donor._id,
      campaignId: campaign._id,
      amount: donationAmount,
      date,
      paymentMode,
      notes: notes?.trim() || '',
    });

    // ==========================================
    // 10. GET POPULATED DONATION
    // ==========================================
    const populatedDonation = await Donation.findById(
      donation._id
    )
      .populate('donorId', 'name email phone')
      .populate(
        'campaignId',
        'name goal startDate endDate status'
      );

    // ==========================================
    // 11. SEND CONFIRMATION EMAIL
    // ==========================================
    try {
      sendDonationConfirmationEmail({
        donorName: donor.name,
        donorEmail: donor.email,
        campaignName: campaign.name,
        amount: donation.amount,
        date: donation.date,
        paymentMode: donation.paymentMode,
        notes: donation.notes,
      });

      console.log(
        `Donation confirmation email sent to ${donor.email}`
      );
    } catch (emailError) {
      // Do not fail the donation if email fails.
      console.error(
        'Donation email failed:',
        emailError.message
      );
    }

    // ==========================================
    // 12. RESPONSE
    // ==========================================
    return res.status(201).json({
      success: true,
      statusCode: 201,
      message:
        'Donation created successfully and confirmation email sent',
      data: populatedDonation,
    });
  } catch (error) {
    console.error('addDonation error:', error);

    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: 'Server error',
      error: error.message,
    });
  }
};

export const createRazorpayOrder = async (req, res) => {
  try {
    if (req.user.role !== 'Donor') {
      return res.status(403).json({
        success: false,
        statusCode: 403,
        message: 'Donor access required',
      });
    }

    const { campaignId, amount, notes } = req.body;

    if (!campaignId || amount === undefined) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'campaignId and amount are required',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(campaignId)) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'Invalid campaignId',
      });
    }

    const numericAmount = Number(amount);

    if (Number.isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'Donation amount must be greater than 0',
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

    const razorpay = getRazorpayClient();

    if (!razorpay) {
      return res.status(503).json({
        success: false,
        statusCode: 503,
        message: 'Razorpay keys are not configured',
      });
    }

    const order = await razorpay.orders.create({
      amount: Math.round(numericAmount * 100),
      currency: 'INR',
      receipt: `donation_${Date.now()}`,
      notes: {
        donorId: String(req.user._id),
        campaignId,
        notes: notes?.trim() || '',
      },
    });

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Razorpay order created successfully',
      data: order,
    });
  } catch (error) {
    console.error('createRazorpayOrder error:', error);

    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: 'Server error',
      error: error.message,
    });
  }
};

export const verifyRazorpayPayment = async (req, res) => {
  try {
    if (req.user.role !== 'Donor') {
      return res.status(403).json({
        success: false,
        statusCode: 403,
        message: 'Donor access required',
      });
    }

    const {
      campaignId: bodyCampaignId,
      amount: bodyAmount,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      notes,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'razorpay_order_id, razorpay_payment_id and razorpay_signature are required',
      });
    }

    const razorpay = getRazorpayClient();

    if (!razorpay || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(503).json({
        success: false,
        statusCode: 503,
        message: 'Razorpay keys are not configured',
      });
    }

    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'Razorpay payment signature verification failed',
      });
    }

    let order;
    try {
      order = await razorpay.orders.fetch(razorpay_order_id);
    } catch (fetchError) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'Razorpay order could not be fetched for verification',
        error: fetchError.message,
      });
    }

    const orderCampaignId = order?.notes?.campaignId || bodyCampaignId;
    const supportedAmountFromOrder = order?.amount ? Number(order.amount) / 100 : Number(bodyAmount);
    const normalizedAmount = Number(supportedAmountFromOrder);

    if (!orderCampaignId || !mongoose.Types.ObjectId.isValid(orderCampaignId)) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'Invalid or missing campaignId in Razorpay order notes',
      });
    }

    if (Number.isNaN(normalizedAmount) || normalizedAmount <= 0) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'Donation amount must be greater than 0',
      });
    }

    const campaign = await Campaign.findById(orderCampaignId);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: 'Campaign not found',
      });
    }

    const donation = await Donation.create({
      donorId: req.user._id,
      campaignId: campaign._id,
      amount: normalizedAmount,
      date: new Date(),
      paymentMode: 'Online',
      paymentStatus: 'paid',
      paymentReference: razorpay_payment_id,
      notes: notes?.trim() || order?.notes?.notes || '',
    });

    const populatedDonation = await Donation.findById(donation._id)
      .populate('donorId', 'name email phone')
      .populate('campaignId', 'name goal startDate endDate status');

    try {
      sendDonationConfirmationEmail({
        donorName: req.user.name,
        donorEmail: req.user.email,
        campaignName: campaign.name,
        amount: donation.amount,
        date: donation.date,
        paymentMode: donation.paymentMode,
        notes: donation.notes,
      });
    } catch (emailError) {
      console.error('Razorpay confirmation email failed:', emailError.message);
    }

    return res.status(201).json({
      success: true,
      statusCode: 201,
      message: 'Razorpay payment verified and donation recorded successfully',
      data: populatedDonation,
    });
  } catch (error) {
    console.error('verifyRazorpayPayment error:', error);

    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: 'Server error',
      error: error.message,
    });
  }
};

// =====================================================
// GET ALL DONATIONS
// GET /api/donations
// =====================================================
export const listDonations = async (req, res) => {
  try {
    const query = req.user?.role === 'Donor'
      ? { donorId: req.user._id }
      : {};

    const donations = await Donation.find(query)
      .populate('donorId', 'name email phone')
      .populate(
        'campaignId',
        'name goal startDate endDate status'
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Donations fetched successfully',
      count: donations.length,
      data: donations,
    });
  } catch (error) {
    console.error('listDonations error:', error);

    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: 'Server error',
      error: error.message,
    });
  }
};

// =====================================================
// GET SINGLE DONATION
// GET /api/donations/:id
// =====================================================
export const getDonation = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'Invalid donation id',
      });
    }

    const donation = await Donation.findById(id)
      .populate('donorId', 'name email phone')
      .populate(
        'campaignId',
        'name goal startDate endDate status'
      );

    if (!donation) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: 'Donation not found',
      });
    }

    if (req.user?.role === 'Donor' && donation.donorId?._id?.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        statusCode: 403,
        message: 'You can only view your own donation records',
      });
    }

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Donation fetched successfully',
      data: donation,
    });
  } catch (error) {
    console.error('getDonation error:', error);

    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: 'Server error',
      error: error.message,
    });
  }
};

// =====================================================
// UPDATE DONATION
// PUT /api/donations/:id
// =====================================================
export const updateDonation = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'Invalid donation id',
      });
    }

    const existingDonation = await Donation.findById(id);

    if (!existingDonation) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: 'Donation not found',
      });
    }

    const {
      donorId,
      donorName,
      donorEmail,
      campaignId,
      amount,
      date,
      paymentMode,
      notes,
    } = req.body;

    // ---------------------------------------
    // Validate donor
    // ---------------------------------------
    if (donorId || donorName || donorEmail) {
      if (!donorId || !donorName || !donorEmail) {
        return res.status(400).json({
          success: false,
          statusCode: 400,
          message:
            'donorId, donorName and donorEmail are required together',
        });
      }

      if (!mongoose.Types.ObjectId.isValid(donorId)) {
        return res.status(400).json({
          success: false,
          statusCode: 400,
          message: 'Invalid donorId',
        });
      }

      const donor = await Donor.findById(donorId);

      if (!donor) {
        return res.status(404).json({
          success: false,
          statusCode: 404,
          message: 'Donor not found',
        });
      }

      const nameMatches =
        donor.name.trim().toLowerCase() ===
        donorName.trim().toLowerCase();

      const emailMatches =
        donor.email.trim().toLowerCase() ===
        donorEmail.trim().toLowerCase();

      if (!nameMatches || !emailMatches) {
        return res.status(400).json({
          success: false,
          statusCode: 400,
          message:
            'Donor name and email do not match the selected donor',
        });
      }
    }

    // ---------------------------------------
    // Validate campaign
    // ---------------------------------------
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

    // ---------------------------------------
    // Validate amount
    // ---------------------------------------
    if (
      amount !== undefined &&
      Number(amount) <= 0
    ) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'Donation amount must be greater than 0',
      });
    }

    // ---------------------------------------
    // Prepare update
    // ---------------------------------------
    const updateData = {};

    if (donorId) {
      updateData.donorId = donorId;
    }

    if (campaignId) {
      updateData.campaignId = campaignId;
    }

    if (amount !== undefined) {
      updateData.amount = Number(amount);
    }

    if (date) {
      updateData.date = date;
    }

    if (paymentMode) {
      updateData.paymentMode = paymentMode;
    }

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    // ---------------------------------------
    // Update
    // ---------------------------------------
    const donation = await Donation.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    )
      .populate('donorId', 'name email phone')
      .populate(
        'campaignId',
        'name goal startDate endDate status'
      );

    // ==========================================
    // SEND UPDATE NOTIFICATION EMAIL
    // ==========================================
    try {
      sendDonationConfirmationEmail({
        donorName: donation.donorId.name,
        donorEmail: donation.donorId.email,
        campaignName: donation.campaignId.name,
        amount: donation.amount,
        date: donation.date,
        paymentMode: donation.paymentMode,
        notes: donation.notes,
      });

      console.log(
        `Donation update email sent to ${donation.donorId.email}`
      );
    } catch (emailError) {
      // Do not fail the update if email fails.
      console.error(
        'Donation update email failed:',
        emailError.message
      );
    }

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Donation updated successfully and notification email sent',
      data: donation,
    });
  } catch (error) {
    console.error('updateDonation error:', error);

    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: 'Server error',
      error: error.message,
    });
  }
};

// =====================================================
// DELETE SINGLE OR MULTIPLE DONATIONS
// DELETE /api/donations
// =====================================================
export const deleteDonations = async (req, res) => {
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

    // Validate ObjectIds
    const invalidIds = uniqueIds.filter(
      (id) => !mongoose.Types.ObjectId.isValid(id)
    );

    if (invalidIds.length > 0) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'One or more invalid donation IDs',
        invalidIds,
      });
    }

    // Check records
    const donations = await Donation.find({
      _id: { $in: uniqueIds },
    });

    if (donations.length === 0) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: 'No donations found',
      });
    }

    // Delete
    const result = await Donation.deleteMany({
      _id: { $in: uniqueIds },
    });

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message:
        result.deletedCount === 1
          ? 'Donation deleted successfully'
          : 'Donations deleted successfully',
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error('deleteDonations error:', error);

    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: 'Server error',
      error: error.message,
    });
  }
};
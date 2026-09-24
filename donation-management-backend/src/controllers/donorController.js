import mongoose from 'mongoose';
import Donor from '../models/donorModel.js';
import Donation from '../models/Donation.js';
import Campaign from '../models/campaignModel.js';
import { sendDonationConfirmationEmail } from '../utils/emailService.js';

// POST /api/donors/register-and-pay
export const registerAndPayOnline = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      address,
      campaignId,
      amount,
      date,
      notes,
      paymentReference,
      paymentStatus,
    } = req.body;

    if (!name || !email || !password || !campaignId || amount === undefined || !date) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message:
          'name, email, password, campaignId, amount and date are required for online payment registration',
      });
    }

    if (String(password).length < 6) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'Password must be at least 6 characters',
      });
    }

    const normalizedName = String(name).trim();
    const normalizedEmail = String(email).trim().toLowerCase();

    if (!normalizedName || !normalizedEmail.includes('@')) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'Valid donor name and email are required',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(campaignId)) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'Invalid campaignId',
      });
    }

    const donationAmount = Number(amount);

    if (Number.isNaN(donationAmount) || donationAmount <= 0) {
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

    let donor = await Donor.findOne({
      name: normalizedName,
      email: normalizedEmail,
    });

    if (!donor) {
      donor = await Donor.create({
        name: normalizedName,
        email: normalizedEmail,
        password,
        phone: phone?.trim() || '',
        address: address?.trim() || '',
        role: 'Donor',
        status: 'Active',
      });
    } else {
      donor.phone = phone?.trim() || donor.phone || '';
      donor.address = address?.trim() || donor.address || '';
      donor.password = donor.password || password;
      await donor.save();
    }

    const donation = await Donation.create({
      donorId: donor._id,
      campaignId: campaign._id,
      amount: donationAmount,
      date,
      paymentMode: 'Online',
      paymentStatus: paymentStatus || 'paid',
      paymentReference: paymentReference?.trim() || '',
      notes: notes?.trim() || '',
    });

    const populatedDonation = await Donation.findById(donation._id)
      .populate('donorId', 'name email phone')
      .populate('campaignId', 'name goal startDate endDate status');

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
    } catch (emailError) {
      console.error('Online registration payment email failed:', emailError.message);
    }

    return res.status(201).json({
      success: true,
      statusCode: 201,
      message: 'Donor registered and online payment recorded successfully',
      data: {
        donor,
        donation: populatedDonation,
      },
    });
  } catch (error) {
    console.error('registerAndPayOnline error:', error);

    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: 'Server error',
      error: error.message,
    });
  }
};

// POST /api/donors
export const addDonor = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'name and email are required',
      });
    }

    // Reject only if BOTH name and email match an existing donor
    const existingDonor = await Donor.findOne({
      name: name.trim(),
      email: email.toLowerCase(),
    });

    if (existingDonor) {
      return res.status(409).json({
        success: false,
        statusCode: 409,
        message: 'A donor with this name and email already exists',
      });
    }

    const donor = await Donor.create({ name, email, phone, address });
    return res.status(201).json({
      success: true,
      statusCode: 201,
      message: 'Donor created successfully',
      data: donor,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: 'Server error',
      error: error.message,
    });
  }
};

// GET /api/donors
export const listDonors = async (req, res) => {
  try {
    const donors = await Donor.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Donors fetched successfully',
      data: donors,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: 'Server error',
      error: error.message,
    });
  }
};

// GET /api/donors/:id
export const getDonor = async (req, res) => {
  try {
    const donor = await Donor.findById(req.params.id);
    if (!donor) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: 'Donor not found',
      });
    }
    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Donor fetched successfully',
      data: donor,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: 'Server error',
      error: error.message,
    });
  }
};

// PUT /api/donors/:id
export const updateDonor = async (req, res) => {
  try {
    const donor = await Donor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!donor) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: 'Donor not found',
      });
    }
    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Donor updated successfully',
      data: donor,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: 'Server error',
      error: error.message,
    });
  }
};

// DELETE /api/donors/:id
export const deleteDonor = async (req, res) => {
  try {
    const donor = await Donor.findByIdAndDelete(req.params.id);
    if (!donor) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: 'Donor not found',
      });
    }
    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Donor deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: 'Server error',
      error: error.message,
    });
  }
};
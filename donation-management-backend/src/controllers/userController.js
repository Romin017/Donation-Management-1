import crypto from 'crypto';
import User from '../models/userModel.js';
import {sendSetPasswordEmail} from '../utils/emailService.js';

// ===============================
// CREATE USER (Admin only)
// ===============================
export const createUser = async (req, res) => {
  try {
    const { name, email, role } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'Name and email are required',
      });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'A user with this email already exists',
      });
    }

    // Generate raw token (sent to user) + hashed version (stored in DB)
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      role: role || 'Staff',
      status: 'Pending',
      passwordSetToken: hashedToken,
      passwordSetExpires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });

    const setPasswordLink = `${process.env.CLIENT_URL}/set-password/${rawToken}`;

    try {
      await sendSetPasswordEmail({
        name: user.name,
        email: user.email,
        role: user.role,
        setPasswordLink,
      });
    } catch (emailError) {
      return res.status(201).json({
        success: true,
        statusCode: 201,
        message: 'User created, but the setup email failed to send.',
        data: { id: user._id, name: user.name, email: user.email, role: user.role },
        setPasswordLink, // fallback so the admin can share it manually
      });
    }

    // For now, return it directly so you can test the flow.
    return res.status(201).json({
      success: true,
      statusCode: 201,
      message: 'User created. Password setup link generated.',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
      setPasswordLink, // remove this from the response once email sending is wired up
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
// GET ALL USERS (Admin only)
// ===============================
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      statusCode: 200,
      count: users.length,
      data: users,
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
// UPDATE USER (Admin only)
// ===============================
export const updateUser = async (req, res) => {
  try {
    const { name, email, role, status } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email: email?.toLowerCase(), role, status },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'User updated successfully',
      data: user,
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
// DELETE USER (Admin only)
// ===============================
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: 'User not found',
      });
    }
    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'User deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: error.message,
    });
  }
};
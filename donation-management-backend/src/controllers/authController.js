import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import Donor from '../models/donorModel.js';

function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
}

function signDonorToken(donor) {
  return jwt.sign({ id: donor._id, role: donor.role }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
}

// ===============================
// SET PASSWORD (from admin-sent link)
// ===============================
export const setPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'Password must be at least 6 characters',
      });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      passwordSetToken: hashedToken,
      passwordSetExpires: { $gt: Date.now() },
    }).select('+passwordSetToken +passwordSetExpires');

    if (!user) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'This link is invalid or has expired',
      });
    }

    user.password = password; // pre-save hook hashes it
    user.status = 'Active';
    user.passwordSetToken = undefined;
    user.passwordSetExpires = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Password set successfully. You can now log in.',
      token: signToken(user), // optional: log them in immediately
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
// LOGIN
// ===============================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email?.toLowerCase() }).select('+password');

    if (!user || !user.password) {
      return res.status(401).json({ success: false, statusCode: 401, message: 'Invalid email or password' });
    }

    if (user.status !== 'Active') {
      return res.status(403).json({ success: false, statusCode: 403, message: 'Please set your password first' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, statusCode: 401, message: 'Invalid email or password' });
    }

    const token = signToken(user);

    // NEW — store the token on the user document
    user.activeToken = token;
    await user.save();

    return res.status(200).json({
      success: true,
      statusCode: 200,
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    return res.status(500).json({ success: false, statusCode: 500, message: error.message });
  }
};

export const registerDonor = async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'name, email and password are required',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'Password must be at least 6 characters',
      });
    }

    const existingDonor = await Donor.findOne({ email: String(email).toLowerCase().trim() });

    if (existingDonor) {
      return res.status(409).json({
        success: false,
        statusCode: 409,
        message: 'Donor already exists',
      });
    }

    const donor = await Donor.create({
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      password,
      phone: phone?.trim(),
      address: address?.trim(),
      role: 'Donor',
      status: 'Active',
    });

    return res.status(201).json({
      success: true,
      statusCode: 201,
      message: 'Donor registered successfully',
      data: {
        id: donor._id,
        name: donor.name,
        email: donor.email,
        role: donor.role,
      },
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

export const loginDonor = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'email and password are required',
      });
    }

    const donor = await Donor.findOne({ email: String(email).trim().toLowerCase() }).select('+password');

    if (!donor || !donor.password) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: 'Invalid email or password',
      });
    }

    const isMatch = await donor.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: 'Invalid email or password',
      });
    }

    const token = signDonorToken(donor);
    donor.activeToken = token;
    await donor.save();

    return res.status(200).json({
      success: true,
      statusCode: 200,
      token,
      donor: {
        id: donor._id,
        name: donor.name,
        email: donor.email,
        role: donor.role,
      },
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

export const logout = async (req, res) => {
  if (req.user?.role === 'Donor') {
    req.user.activeToken = undefined;
    await req.user.save();
  } else if (req.user?.role === 'Admin' || req.user?.role === 'Staff') {
    req.user.activeToken = undefined;
    await req.user.save();
  }

  return res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Logged out successfully',
  });
};
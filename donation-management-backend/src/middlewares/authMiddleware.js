import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import Donor from '../models/donorModel.js';

export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, statusCode: 401, message: 'Not authorized, no token' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role === 'Donor') {
      req.user = await Donor.findById(decoded.id).select('+activeToken +password');

      if (!req.user) {
        return res.status(401).json({ success: false, statusCode: 401, message: 'Donor no longer exists' });
      }

      if (req.user.activeToken !== token) {
        return res.status(401).json({ success: false, statusCode: 401, message: 'Session expired, please log in again' });
      }

      return next();
    }

    req.user = await User.findById(decoded.id).select('+activeToken');

    if (!req.user) {
      return res.status(401).json({ success: false, statusCode: 401, message: 'User no longer exists' });
    }

    if (req.user.activeToken !== token) {
      return res.status(401).json({ success: false, statusCode: 401, message: 'Session expired, please log in again' });
    }

    next();
  } catch (error) {
    return res.status(401).json({ success: false, statusCode: 401, message: 'Not authorized, token failed' });
  }
};

export const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'Admin') {
    return res.status(403).json({
      success: false,
      statusCode: 403,
      message: 'Admin access required',
    });
  }
  next();
};

export const requireDonor = (req, res, next) => {
  if (req.user?.role !== 'Donor') {
    return res.status(403).json({
      success: false,
      statusCode: 403,
      message: 'Donor access required',
    });
  }
  next();
};


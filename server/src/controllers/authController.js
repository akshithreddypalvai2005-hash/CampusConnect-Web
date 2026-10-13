const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { registerSchema, loginSchema } = require('../validators/schemas');
const { logAudit } = require('../services/auditService');
const { validateSreyasEmail } = require('../utils/sreyasAuthHelper');

const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const secret = process.env.JWT_SECRET || 'dev_secret_key';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  const token = jwt.sign(
    {
      userId: user._id,
      email: user.email,
      role: user.role,
    },
    secret,
    { expiresIn }
  );

  const isProduction = process.env.NODE_ENV === 'production';
  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
  };

  res.cookie('token', token, cookieOptions);

  return res.status(statusCode).json({
    success: true,
    message,
    user: user.toJSON(),
    token, // Also provided for API clients / testing
  });
};

const register = async (req, res, next) => {
  try {
    const parseResult = registerSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: parseResult.error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
      });
    }

    const { name, email, studentId, department, yearOfStudy, password } = parseResult.data;

    // Optional domain restriction check
    const allowedDomain = process.env.ALLOWED_EMAIL_DOMAIN;
    if (allowedDomain && !email.toLowerCase().endsWith(allowedDomain.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: `Registration requires an authorized college email address ending with @${allowedDomain}`,
      });
    }

    // Check duplicate email
    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: 'An account with this college email already exists. Please log in.',
      });
    }

    // Hash password
    const passwordHash = await User.hashPassword(password);

    // Create user (always defaults to role: 'student')
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      studentId,
      department,
      yearOfStudy,
      passwordHash,
      role: 'student',
      accountStatus: 'active',
    });

    await logAudit({
      req,
      actorId: user._id,
      action: 'USER_REGISTER',
      targetType: 'User',
      targetId: user._id,
      metadata: { email: user.email, studentId: user.studentId },
    });

    // Create welcome notification
    await Notification.create({
      recipient: user._id,
      type: 'system',
      message: `Welcome to CampusConnect, ${user.name}! You can now report lost items or submit claims for found belongings.`,
    });

    return sendTokenResponse(user, 201, res, 'Registration successful. Welcome to CampusConnect!');
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid login details provided',
        errors: parseResult.error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
      });
    }

    const { email, password } = parseResult.data;

    const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid college email or password.',
      });
    }

    if (user.accountStatus === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'This account has been suspended by campus administration. Please contact support.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid college email or password.',
      });
    }

    await logAudit({
      req,
      actorId: user._id,
      action: 'USER_LOGIN',
      targetType: 'User',
      targetId: user._id,
      metadata: { email: user.email, role: user.role },
    });

    return sendTokenResponse(user, 200, res, `Welcome back, ${user.name}!`);
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  if (req.user) {
    await logAudit({
      req,
      actorId: req.user._id,
      action: 'USER_LOGOUT',
      targetType: 'User',
      targetId: req.user._id,
    });
  }

  return res.status(200).json({
    success: true,
    message: 'Successfully logged out.',
  });
};

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const unreadNotificationsCount = await Notification.countDocuments({
      recipient: user._id,
      readAt: null,
    });

    return res.status(200).json({
      success: true,
      user: user.toJSON(),
      unreadNotificationsCount,
    });
  } catch (error) {
    next(error);
  }
};

const googleLogin = async (req, res, next) => {
  try {
    const { email, name, photoURL } = req.body;

    // 1. Strictly validate Sreyas email and roll number format
    const validation = validateSreyasEmail(email);
    if (!validation.isValid) {
      return res.status(403).json({
        success: false,
        message: `Access Denied: Only Sreyas college emails matching <rollnumber>@sreyas.ac.in are permitted. ${validation.reason}`,
      });
    }

    const { rollNumber, department, yearOfStudy, isAdmin } = validation;

    // 2. Check if user already exists in MongoDB
    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Auto-register student on first Google Login with Sreyas credentials
      const crypto = require('crypto');
      const randomPassword = crypto.randomBytes(32).toString('hex');
      const passwordHash = await User.hashPassword(randomPassword);

      user = await User.create({
        name: name || `Student ${rollNumber}`,
        email: email.toLowerCase(),
        studentId: rollNumber,
        department,
        yearOfStudy,
        passwordHash,
        role: isAdmin ? 'admin' : 'student',
        accountStatus: 'active',
        avatar: photoURL || '',
      });

      await Notification.create({
        recipient: user._id,
        type: 'system',
        message: `Welcome to CampusConnect, ${user.name}! Your account has been verified through your Sreyas Google student ID (${rollNumber}).`,
      });
    } else {
      if (user.accountStatus === 'suspended') {
        return res.status(403).json({
          success: false,
          message: 'Your account has been suspended by campus administration.',
        });
      }
      if (photoURL && !user.avatar) {
        user.avatar = photoURL;
        await user.save();
      }
    }

    await logAudit({
      req,
      actorId: user._id,
      action: 'USER_GOOGLE_LOGIN',
      targetType: 'User',
      targetId: user._id,
      metadata: { email: user.email, rollNumber, provider: 'google-firebase' },
    });

    return sendTokenResponse(user, 200, res, `Welcome to CampusConnect, ${user.name}!`);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  googleLogin,
  logout,
  getMe,
};

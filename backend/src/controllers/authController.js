const { db, admin } = require('../config/firebaseAdmin');
const { generateToken, verifyToken } = require('../utils/jwt');

// Send OTP via Firebase Phone Authentication
const sendOTP = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ error: 'Số điện thoại là bắt buộc' });
    }

    // Validate phone number format
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(phoneNumber.replace(/\D/g, ''))) {
      return res.status(400).json({ error: 'Số điện thoại không hợp lệ' });
    }

    // Format phone number for Firebase (add +84 for Vietnam)
    const formattedPhone = phoneNumber.startsWith('0') 
      ? `+84${phoneNumber.substring(1)}` 
      : `+84${phoneNumber}`;

    // Store phone verification request
    const verificationRef = db.collection('phoneVerifications').doc();
    await verificationRef.set({
      id: verificationRef.id,
      phoneNumber: formattedPhone,
      status: 'pending',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
    });

    res.json({ 
      success: true, 
      message: 'Sẵn sàng gửi mã OTP',
      verificationId: verificationRef.id,
      phoneNumber: formattedPhone
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ error: 'Lỗi hệ thống' });
  }
};

// Verify OTP and login/register
const verifyOTP = async (req, res) => {
  try {
    const { phoneNumber, verificationId, idToken, name, role } = req.body;

    if (!phoneNumber || !idToken) {
      return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
    }

    // Verify Firebase ID token or handle development mode
    let decodedToken;
    
    // Check if it's a development token
    if (idToken.startsWith('dev-token-')) {
      console.log('Development mode detected');
      decodedToken = {
        phone_number: phoneNumber,
        uid: 'dev-user-' + Date.now()
      };
    } else {
      try {
        decodedToken = await admin.auth().verifyIdToken(idToken);
      } catch (error) {
        console.error('Firebase token verification failed:', error);
        return res.status(400).json({ error: 'Token không hợp lệ' });
      }
    }

    // Check if phone number matches
    if (decodedToken.phone_number !== phoneNumber) {
      return res.status(400).json({ error: 'Số điện thoại không khớp' });
    }

    // Update verification status
    if (verificationId) {
      await db.collection('phoneVerifications').doc(verificationId).update({
        status: 'verified',
        verifiedAt: new Date()
      });
    }

    // Check if user exists
    const userQuery = await db.collection('users')
      .where('phoneNumber', '==', phoneNumber)
      .limit(1)
      .get();

    let user;
    let isNewUser = false;

    if (userQuery.empty) {
      // Create new user
      if (!name) {
        return res.status(400).json({ error: 'Tên là bắt buộc cho người dùng mới' });
      }

      // Auto-assign role based on phone number
      let userRole = role || 'student'; // Default to student if no role provided
      
      // Special phone numbers for instructor (check both formats)
      console.log('Checking phone number for auto-role assignment:', phoneNumber);
      if (phoneNumber === '+84336499876' || phoneNumber === '0336499876' || 
          phoneNumber === '+84336499877' || phoneNumber === '0336499877') {
        userRole = 'instructor';
        console.log('Auto-assigning instructor role to phone:', phoneNumber);
      } else {
        console.log('Using default role for phone:', phoneNumber, 'role:', userRole);
      }

      const userRef = db.collection('users').doc();
      user = {
        id: userRef.id,
        phoneNumber,
        name,
        role: userRole,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await userRef.set(user);
      isNewUser = true;
    } else {
      // Existing user
      user = userQuery.docs[0].data();
      
      // Check if existing user should be upgraded to instructor
      if ((phoneNumber === '+84336499876' || phoneNumber === '0336499876' || 
           phoneNumber === '+84336499877' || phoneNumber === '0336499877') && 
          user.role !== 'instructor') {
        console.log('Upgrading existing user to instructor role:', phoneNumber);
        
        // Update user role in database
        await db.collection('users').doc(user.id).update({
          role: 'instructor',
          updatedAt: new Date()
        });
        
        // Update local user object
        user.role = 'instructor';
      }
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      phoneNumber: user.phoneNumber,
      role: user.role
    });

    res.json({
      success: true,
      message: isNewUser ? 'Đăng ký thành công' : 'Đăng nhập thành công',
      token,
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        name: user.name,
        role: user.role
      },
      isNewUser
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: 'Lỗi hệ thống' });
  }
};

// Verify JWT token middleware
const verifyAuth = async (req, res, next) => {
  try {
    console.log('=== VERIFY AUTH MIDDLEWARE ===');
    const token = req.headers.authorization?.split(' ')[1];
    console.log('Token received:', token ? 'Present' : 'Missing');

    if (!token) {
      console.log('❌ No token provided');
      return res.status(401).json({ error: 'Không có token xác thực' });
    }

    const decoded = verifyToken(token);
    console.log('Token decoded:', decoded);
    
    // Get user from database using userId from token
    const userId = decoded.userId || decoded.id; // Support both formats
    console.log('Looking for user with ID:', userId);
    
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      console.log('❌ User not found in database');
      return res.status(401).json({ error: 'Người dùng không tồn tại' });
    }

    const user = userDoc.data();
    console.log('User found:', user.name, 'Role:', user.role);
    
    if (!user.isActive) {
      console.log('❌ User account is inactive');
      return res.status(401).json({ error: 'Tài khoản đã bị vô hiệu hóa' });
    }

    req.user = user;
    console.log('✅ Authentication successful');
    next();
  } catch (error) {
    console.error('❌ Auth verification error:', error);
    res.status(401).json({ error: 'Token không hợp lệ' });
  }
};

module.exports = {
  sendOTP,
  verifyOTP,
  verifyAuth
};

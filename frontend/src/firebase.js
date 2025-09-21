// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { 
  getAuth, 
  onAuthStateChanged,
  signOut,
  signInWithPhoneNumber,
  RecaptchaVerifier
} from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAgynzn4Ni6v4LFEDCm1khS35n7T5-ITxY",
  authDomain: "classroom-app-3ee5e.firebaseapp.com",
  projectId: "classroom-app-3ee5e",
  storageBucket: "classroom-app-3ee5e.appspot.com",
  messagingSenderId: "91309937104",
  appId: "1:91309937104:web:3a54d43fe2fdd04268e9d5",
  measurementId: "G-CDR162C7ZK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Auth
const auth = getAuth(app);

// Initialize Analytics only if supported (e.g., not on server-side)
let analytics = null;
isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  }
});

// Initialize reCAPTCHA verifier
let recaptchaVerifier = null;

const initializeRecaptcha = (elementId) => {
  // Clear existing verifier if any
  if (recaptchaVerifier) {
    try {
      recaptchaVerifier.clear();
    } catch (error) {
      console.log('Clearing existing reCAPTCHA verifier');
    }
    recaptchaVerifier = null;
  }

  try {
    recaptchaVerifier = new RecaptchaVerifier(auth, elementId, {
      size: 'invisible',
      callback: (response) => {
        console.log('reCAPTCHA solved');
      },
      'expired-callback': () => {
        console.log('reCAPTCHA expired');
        // Clear the verifier when expired
        recaptchaVerifier = null;
      }
    });
  } catch (error) {
    console.error('Error initializing reCAPTCHA:', error);
    throw error;
  }
  return recaptchaVerifier;
};

// Development fallback for testing without billing
const sendOTPDev = async (phoneNumber) => {
  // Simulate OTP sending for development
  console.log('Development mode: Simulating OTP send to', phoneNumber);
  
  return {
    success: true,
    confirmationResult: {
      confirm: async (otp) => {
        // Simulate OTP verification
        if (otp === '123456') {
          return {
            user: {
              getIdToken: async () => 'dev-token-' + Date.now()
            }
          };
        } else {
          throw new Error('Invalid OTP in dev mode');
        }
      }
    },
    phoneNumber: phoneNumber.startsWith('0') ? `+84${phoneNumber.substring(1)}` : `+84${phoneNumber}`
  };
};

// Function to send OTP via Firebase Phone Authentication
const sendOTP = async (phoneNumber, recaptchaElementId = 'recaptcha-container') => {
  // Check if we're in development mode and billing is not enabled
  if (process.env.NODE_ENV === 'development') {
    try {
      return await sendOTPDev(phoneNumber);
    } catch (error) {
      console.log('Dev mode failed, trying Firebase...');
    }
  }

  try {
    // Format phone number for Firebase (add +84 for Vietnam)
    const formattedPhone = phoneNumber.startsWith('0') 
      ? `+84${phoneNumber.substring(1)}` 
      : `+84${phoneNumber}`;

    // Initialize reCAPTCHA
    const verifier = initializeRecaptcha(recaptchaElementId);

    // Send OTP
    const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, verifier);
    
    console.log('OTP sent successfully to:', formattedPhone);
    
    return {
      success: true,
      confirmationResult,
      phoneNumber: formattedPhone
    };
  } catch (error) {
    console.error('Error sending OTP:', error);
    
    // Handle specific Firebase errors
    let errorMessage = error.message;
    if (error.code === 'auth/invalid-phone-number') {
      errorMessage = 'Số điện thoại không hợp lệ';
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = 'Quá nhiều yêu cầu. Vui lòng thử lại sau';
    } else if (error.code === 'auth/captcha-check-failed') {
      errorMessage = 'reCAPTCHA verification thất bại';
    } else if (error.code === 'auth/billing-not-enabled') {
      errorMessage = 'Firebase Phone Authentication cần billing được enable. Vui lòng liên hệ admin.';
    } else if (error.code === 'auth/quota-exceeded') {
      errorMessage = 'Đã vượt quá giới hạn SMS. Vui lòng thử lại sau.';
    } else if (error.code === 'auth/app-not-authorized') {
      errorMessage = 'Ứng dụng chưa được authorize cho Phone Authentication.';
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
};

// Function to verify OTP
const verifyOTP = async (confirmationResult, otp) => {
  try {
    const result = await confirmationResult.confirm(otp);
    console.log('OTP verified successfully');
    
    return {
      success: true,
      user: result.user,
      idToken: await result.user.getIdToken()
    };
  } catch (error) {
    console.error('Error verifying OTP:', error);
    
    // Handle specific Firebase errors
    let errorMessage = error.message;
    if (error.code === 'auth/invalid-verification-code') {
      errorMessage = 'Mã OTP không đúng';
    } else if (error.code === 'auth/code-expired') {
      errorMessage = 'Mã OTP đã hết hạn';
    } else if (error.code === 'auth/invalid-verification-id') {
      errorMessage = 'Mã xác thực không hợp lệ';
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
};

// Function to get current user token
const getCurrentUserToken = async () => {
  try {
    if (auth.currentUser) {
      return await auth.currentUser.getIdToken();
    }
    return null;
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

// Function to check authentication state
const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Function to sign out
const signOutUser = async () => {
  try {
    await signOut(auth);
    console.log('User signed out successfully');
    return true;
  } catch (error) {
    console.error('Error signing out:', error);
    return false;
  }
};

// Function to get current user
const getCurrentUser = () => {
  return auth.currentUser;
};

// Function to clear reCAPTCHA
const clearRecaptcha = () => {
  if (recaptchaVerifier) {
    recaptchaVerifier.clear();
    recaptchaVerifier = null;
  }
};

export { 
  app, 
  analytics, 
  db, 
  auth, 
  sendOTP,
  verifyOTP,
  getCurrentUserToken,
  onAuthStateChange,
  signOutUser,
  getCurrentUser,
  clearRecaptcha
};
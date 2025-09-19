// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { 
  getAuth, 
  signInAnonymously, 
  signInWithCredential,
  onAuthStateChanged,
  signOut
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

// Connect to Firestore emulator in development
if (process.env.NODE_ENV === 'development' && !db._delegate._settings?.host?.includes('firestore.googleapis.com')) {
  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
    console.log('🔧 Đã kết nối với Firestore Emulator (localhost:8080)');
  } catch (error) {
    console.log('⚠️ Firestore Emulator không khả dụng, sử dụng production database');
  }
}

// Initialize Auth
const auth = getAuth(app);

// Initialize Analytics only if supported (e.g., not on server-side)
let analytics = null;
isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  }
});

// Function to authenticate anonymously
const authenticateAnonymously = async () => {
  try {
    const userCredential = await signInAnonymously(auth);
    console.log('Đã đăng nhập ẩn danh:', userCredential.user.uid);
    return true;
  } catch (error) {
    console.error('Lỗi đăng nhập ẩn danh:', error);
    return false;
  }
};

// Cache để tránh gọi Firebase Auth nhiều lần
let authCache = {
  user: null,
  token: null,
  lastCheck: 0,
  cacheTimeout: 5 * 60 * 1000 // 5 phút
};

// Function to authenticate with phone number (optimized)
const authenticateWithPhone = async (phoneNumber) => {
  try {
    // Kiểm tra cache trước
    const now = Date.now();
    if (authCache.user && authCache.token && (now - authCache.lastCheck) < authCache.cacheTimeout) {
      console.log('Sử dụng cache authentication:', authCache.user.uid);
      return { success: true, user: authCache.user, fromCache: true };
    }

    // Kiểm tra nếu đã có user đăng nhập
    if (auth.currentUser) {
      console.log('Đã có user đăng nhập:', auth.currentUser.uid);
      // Cập nhật cache
      authCache.user = auth.currentUser;
      authCache.lastCheck = now;
      return { success: true, user: auth.currentUser };
    }

    // Tạo custom token cho phone number
    const customToken = await createCustomToken(phoneNumber);
    
    // Đăng nhập với custom token
    const userCredential = await signInWithCredential(auth, customToken);
    console.log('Đã đăng nhập với phone:', phoneNumber, 'UID:', userCredential.user.uid);
    
    // Cập nhật cache
    authCache.user = userCredential.user;
    authCache.lastCheck = now;
    
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error('Lỗi đăng nhập với phone:', error);
    return { success: false, error: error.message };
  }
};

// Function to create custom token (simplified for demo)
const createCustomToken = async (phoneNumber) => {
  // Trong thực tế, bạn sẽ gọi backend để tạo custom token
  // Ở đây chúng ta sẽ sử dụng anonymous auth với metadata
  try {
    const userCredential = await signInAnonymously(auth);
    
    // Lưu phone number vào user metadata
    await userCredential.user.updateProfile({
      displayName: phoneNumber
    });
    
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

// Function to get current user token (optimized with cache)
const getCurrentUserToken = async () => {
  try {
    // Kiểm tra cache trước
    const now = Date.now();
    if (authCache.token && authCache.user && (now - authCache.lastCheck) < authCache.cacheTimeout) {
      console.log('Sử dụng cached token');
      return authCache.token;
    }

    if (auth.currentUser) {
      const token = await auth.currentUser.getIdToken();
      // Cập nhật cache
      authCache.token = token;
      authCache.user = auth.currentUser;
      authCache.lastCheck = now;
      return token;
    }
    return null;
  } catch (error) {
    console.error('Lỗi lấy token:', error);
    return null;
  }
};

// Function to check authentication state
const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Function to sign out (clear cache)
const signOutUser = async () => {
  try {
    await signOut(auth);
    // Xóa cache
    authCache.user = null;
    authCache.token = null;
    authCache.lastCheck = 0;
    console.log('Đã đăng xuất và xóa cache');
    return true;
  } catch (error) {
    console.error('Lỗi đăng xuất:', error);
    return false;
  }
};

// Function to get current user
const getCurrentUser = () => {
  return auth.currentUser;
};

export { 
  app, 
  analytics, 
  db, 
  auth, 
  authenticateAnonymously,
  authenticateWithPhone,
  getCurrentUserToken,
  onAuthStateChange,
  signOutUser,
  getCurrentUser
};
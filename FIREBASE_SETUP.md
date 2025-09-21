# 🔥 Firebase Phone Authentication Setup Guide

Hướng dẫn chi tiết để cấu hình Firebase Phone Authentication cho ứng dụng Classroom App.

## 📋 Bước 1: Tạo Firebase Project

1. Truy cập [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" hoặc "Add project"
3. Nhập tên project: `classroom-app` (hoặc tên bạn muốn)
4. Chọn "Enable Google Analytics" (tùy chọn)
5. Click "Create project"

## 🔧 Bước 2: Cấu hình Authentication

1. Trong Firebase Console, chọn project vừa tạo
2. Vào **Authentication** từ menu bên trái
3. Click tab **Sign-in method**
4. Tìm **Phone** provider và click để enable
5. Click **Enable** để bật Phone Authentication
6. **Quan trọng**: Thêm domain vào **Authorized domains**:
   - `localhost` (cho development)
   - Domain production của bạn (ví dụ: `yourdomain.com`)

## 💳 Bước 2.5: Enable Billing (QUAN TRỌNG)

**Firebase Phone Authentication cần billing được enable để hoạt động!**

1. Vào **Project Settings** (icon bánh răng)
2. Click tab **Usage and billing**
3. Click **Upgrade to Blaze plan** (Pay as you go)
4. Thêm payment method (thẻ tín dụng)
5. **Lưu ý**: Firebase có free tier cho Phone Auth (10,000 SMS/tháng)

**Nếu không muốn enable billing ngay:**
- Ứng dụng sẽ tự động chuyển sang development mode
- Sử dụng OTP: `123456` cho bất kỳ số điện thoại nào
- Chỉ hoạt động trong development environment

## 📱 Bước 3: Cấu hình Web App

1. Trong Firebase Console, click icon **Web** (`</>`)
2. Nhập tên app: `classroom-app-web`
3. **Không** check "Set up Firebase Hosting" (tùy chọn)
4. Click "Register app"
5. Copy Firebase config object:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

## 🔑 Bước 4: Cấu hình Service Account (Backend)

1. Vào **Project Settings** (icon bánh răng)
2. Tab **Service accounts**
3. Click **Generate new private key**
4. Download file JSON
5. Rename thành `serviceAccountKey.json`
6. Đặt vào thư mục `backend/src/config/`

## ⚙️ Bước 5: Cập nhật Environment Variables

Cập nhật file `backend/config.env`:

```env
# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour-private-key\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token

# Database URL
DATABASE_URL=https://your-project-id-default-rtdb.firebaseio.com
```

## 🌐 Bước 6: Cập nhật Frontend Config

Cập nhật file `frontend/src/firebase.js`:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

## 🗄️ Bước 7: Cấu hình Firestore Database

1. Vào **Firestore Database** từ menu Firebase Console
2. Click **Create database**
3. Chọn **Start in test mode** (cho development)
4. Chọn location gần nhất (ví dụ: `asia-southeast1`)
5. Click **Done**

## 🔒 Bước 8: Cấu hình Firestore Security Rules

Cập nhật Firestore Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Students collection
    match /students/{studentId} {
      allow read, write: if request.auth != null;
    }
    
    // Lessons collection
    match /lessons/{lessonId} {
      allow read, write: if request.auth != null;
    }
    
    // Messages collection
    match /messages/{messageId} {
      allow read, write: if request.auth != null;
    }
    
    // Phone verifications collection
    match /phoneVerifications/{verificationId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 🧪 Bước 9: Test Phone Authentication

1. Chạy ứng dụng:
   ```bash
   cd frontend
   npm start
   ```

2. Truy cập `http://localhost:3000`
3. Nhập số điện thoại thật (ví dụ: `0123456789`)
4. Firebase sẽ tự động gửi SMS OTP
5. Nhập mã OTP 6 chữ số
6. Kiểm tra console để xem logs

## 🚨 Troubleshooting

### Lỗi "reCAPTCHA verification failed"
- Đảm bảo domain được thêm vào Authorized domains
- Kiểm tra internet connection
- Thử refresh page và gửi lại OTP

### Lỗi "Invalid phone number"
- Đảm bảo số điện thoại đúng format Việt Nam (10-11 chữ số)
- Firebase sẽ tự động format thành +84...

### Lỗi "Too many requests"
- Firebase có rate limiting
- Đợi vài phút trước khi thử lại
- Trong production, có thể cần upgrade Firebase plan

### Lỗi "Phone number already exists"
- Số điện thoại đã được đăng ký
- Sử dụng số khác hoặc reset trong Firebase Console

## 📞 Test Numbers (Development)

Firebase cung cấp số test cho development:

- `+1 650-555-3434` (US)
- `+1 650-555-3435` (US)
- OTP luôn là: `123456`

## 🔧 Production Setup

1. **Upgrade Firebase Plan**: Blaze plan cho production
2. **Custom Domain**: Thêm domain production vào Authorized domains
3. **Security Rules**: Cập nhật Firestore rules cho production
4. **Monitoring**: Enable Firebase Performance Monitoring
5. **Analytics**: Enable Firebase Analytics

## 📚 Tài liệu tham khảo

- [Firebase Phone Authentication](https://firebase.google.com/docs/auth/web/phone-auth)
- [Firebase Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)

## ✅ Checklist

- [ ] Firebase project created
- [ ] Phone Authentication enabled
- [ ] Authorized domains configured
- [ ] Service account key downloaded
- [ ] Environment variables updated
- [ ] Frontend config updated
- [ ] Firestore database created
- [ ] Security rules configured
- [ ] Test phone authentication
- [ ] Production setup (if needed)

Sau khi hoàn thành tất cả các bước, Firebase Phone Authentication sẽ hoạt động tự động! 🎉

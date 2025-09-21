# Test Authentication và Data Persistence

## Kiểm tra vấn đề mất tài khoản học sinh khi refresh

### 🔍 **Nguyên nhân có thể:**

1. **JWT Token không hợp lệ** sau khi refresh
2. **Authentication middleware không hoạt động đúng**
3. **User ID không match** giữa token và database
4. **Firebase data không được lưu đúng**

### ✅ **Debug Steps:**

#### **1. Kiểm tra Console Logs khi refresh:**

```javascript
// Frontend Console (F12)
"=== INSTRUCTOR DASHBOARD INITIALIZATION ==="
"Token exists: true/false"
"User data exists: true/false"
"Parsed user data: {id: '...', role: 'instructor', ...}"
"User role: instructor"
"User ID: instructor-id"
"✅ User is instructor, setting user and loading data"

"=== LOADING INITIAL DATA ==="
"User data: {id: '...', role: 'instructor', ...}"
"User ID: instructor-id"

"=== LOADING STUDENTS ==="
"API Response: {success: true, students: [...]}"
"Number of students: X"
```

#### **2. Kiểm tra Backend Logs:**

```bash
# Backend Terminal
"=== VERIFY AUTH MIDDLEWARE ==="
"Token received: Present"
"Token decoded: {userId: '...', role: 'instructor', ...}"
"Looking for user with ID: instructor-id"
"User found: Instructor Name Role: instructor"
"✅ Authentication successful"

"=== GET STUDENTS API CALLED ==="
"Instructor ID: instructor-id"
"Found X instructor-student relationships"
"Processing student: Student Name ID: student-id"
"Returning X students: [Student Name 1, Student Name 2, ...]"
```

#### **3. Kiểm tra Firebase Console:**

```javascript
// Collection: users
// Document: instructor-id
{
  id: "instructor-id",
  name: "Instructor Name",
  role: "instructor",
  phoneNumber: "+84...",
  isActive: true,
  createdAt: "2024-01-15T...",
  updatedAt: "2024-01-15T..."
}

// Collection: instructorStudents
// Documents: instructor-student relationships
{
  id: "relationship-id",
  instructorId: "instructor-id",
  studentId: "student-id",
  studentName: "Student Name",
  studentEmail: "student@email.com",
  studentPhoneNumber: "+84...",
  addedAt: "2024-01-15T...",
  isActive: true
}

// Collection: users
// Document: student-id
{
  id: "student-id",
  name: "Student Name",
  role: "student",
  phoneNumber: "+84...",
  email: "student@email.com",
  isActive: true,
  createdAt: "2024-01-15T...",
  updatedAt: "2024-01-15T..."
}
```

### 🐛 **Troubleshooting:**

#### **Nếu Token không hợp lệ:**
```javascript
// Frontend Console
"❌ Missing token or user data, redirecting to signin"
// Hoặc
"❌ User is not instructor, redirecting to signin"

// Backend Console
"❌ No token provided"
// Hoặc
"❌ Auth verification error: Invalid token"
```

#### **Nếu User không tồn tại:**
```javascript
// Backend Console
"❌ User not found in database"
// Hoặc
"❌ User account is inactive"
```

#### **Nếu không có students:**
```javascript
// Frontend Console
"⚠️ NO STUDENTS FOUND - This is why chat is empty"
"Please add students first using the 'Thêm học sinh' button"

// Backend Console
"Found 0 instructor-student relationships"
"No students found for this instructor"
```

### 🔧 **Cách khắc phục:**

#### **1. Nếu Token hết hạn:**
- **Đăng nhập lại** với tài khoản instructor
- **Kiểm tra JWT_SECRET** trong backend có đúng không

#### **2. Nếu User không tồn tại:**
- **Kiểm tra Firebase** collection `users` có document instructor không
- **Kiểm tra isActive** có = true không
- **Tạo lại tài khoản instructor** nếu cần

#### **3. Nếu không có students:**
- **Thêm học sinh mới** bằng nút "Thêm học sinh"
- **Kiểm tra Firebase** collection `instructorStudents` có documents không
- **Kiểm tra instructorId** có đúng không

### 📱 **Test Flow:**

#### **Bước 1: Tạo học sinh**
1. **Login as Instructor**
2. **Click "Thêm học sinh"**
3. **Điền thông tin học sinh**
4. **Click "Thêm học sinh"**
5. **Kiểm tra console logs**

#### **Bước 2: Test refresh**
1. **Refresh trang** (F5)
2. **Kiểm tra console logs**
3. **Kiểm tra students có hiển thị không**
4. **Kiểm tra chat có students không**

#### **Bước 3: Test persistence**
1. **Đóng browser**
2. **Mở lại browser**
3. **Login lại**
4. **Kiểm tra students có còn không**

### ⚠️ **Lưu ý quan trọng:**

- **JWT Token có thời hạn 24h**
- **Students được lưu trong Firebase** nên sẽ persist
- **Authentication phải thành công** để load students
- **instructorId phải đúng** để query students

### 🎯 **Kết quả mong đợi:**

Sau khi sửa:
- ✅ **Refresh trang** → Students vẫn hiển thị
- ✅ **Đóng/mở browser** → Students vẫn còn
- ✅ **Login lại** → Students vẫn có
- ✅ **Chat hoạt động** bình thường

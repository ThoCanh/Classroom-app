# Test Socket.IO Messaging System

## Kiểm tra hệ thống nhắn tin Socket.IO

### 1. Kiểm tra Backend Server
```bash
cd backend
npm start
```
- ✅ Server chạy trên port 5000
- ✅ Socket.IO được khởi tạo
- ✅ SocketHandler được load

### 2. Kiểm tra Frontend
```bash
cd frontend
npm start
```
- ✅ Frontend chạy trên port 3000
- ✅ Socket.IO client kết nối được

### 3. Test Flow

#### A. Instructor gửi tin nhắn cho Student:
1. **Login as Instructor** → Instructor Dashboard
2. **Click "Chat" button** cho một student
3. **Type message** và **Send**
4. **Check Console Logs**:
   - ✅ "=== INSTRUCTOR DASHBOARD HANDLE SEND MESSAGE ==="
   - ✅ "=== SOCKET SERVICE JOINING ROOM ==="
   - ✅ "=== SOCKET SERVICE SENDING MESSAGE ==="
   - ✅ "=== SEND MESSAGE EVENT ===" (Backend)
   - ✅ "Message saved to Firebase successfully"
   - ✅ "Message emitted to room participants"

#### B. Student nhận tin nhắn:
1. **Login as Student** → Student Dashboard
2. **Go to Chat tab**
3. **Check Console Logs**:
   - ✅ "=== STUDENT DASHBOARD LOADING MESSAGES ==="
   - ✅ "=== SOCKET SERVICE JOINING ROOM ==="
   - ✅ "=== STUDENT CHAT BOX RECEIVED MESSAGE ==="
   - ✅ "=== STUDENT DASHBOARD RECEIVED MESSAGE ==="
4. **Check UI**: Message hiển thị trong chat

#### C. Student gửi tin nhắn cho Instructor:
1. **Type message** trong Student ChatBox
2. **Send message**
3. **Check Console Logs**:
   - ✅ "=== STUDENT DASHBOARD HANDLE SEND MESSAGE ==="
   - ✅ "=== SOCKET SERVICE JOINING ROOM ==="
   - ✅ "=== SOCKET SERVICE SENDING MESSAGE ==="
   - ✅ "=== SEND MESSAGE EVENT ===" (Backend)
   - ✅ "Message saved to Firebase successfully"

#### D. Instructor nhận tin nhắn:
1. **Check Instructor Dashboard**
2. **Check Console Logs**:
   - ✅ "=== INSTRUCTOR DASHBOARD RECEIVED MESSAGE ==="
3. **Check UI**: Message hiển thị trong chat

### 4. Kiểm tra Firebase
- ✅ Messages được lưu vào collection "messages"
- ✅ Room names được tạo đúng format: "chat-{userId1}-{userId2}"
- ✅ Timestamps được lưu đúng format

### 5. Kiểm tra Chat History
- ✅ Khi refresh page, messages vẫn hiển thị
- ✅ Chat history được load từ Firebase
- ✅ Messages được sắp xếp theo thời gian

## Debug Commands

### Backend Logs:
```bash
# Kiểm tra server logs
tail -f backend/logs/server.log

# Kiểm tra Socket.IO connection
# Look for: "User connected:", "User authenticated:"
```

### Frontend Logs:
```javascript
// Mở Developer Console (F12)
// Look for Socket.IO logs:
// - "=== SOCKET SERVICE CONNECTING ==="
// - "=== SOCKET CONNECTED TO SERVER ==="
// - "=== SOCKET AUTHENTICATED ==="
```

### Firebase Logs:
```javascript
// Kiểm tra Firebase Console
// Collection: messages
// Fields: id, senderId, senderName, senderRole, receiverId, receiverRole, message, timestamp, roomName
```

## Troubleshooting

### Nếu Socket không kết nối:
1. ✅ Kiểm tra backend server có chạy không
2. ✅ Kiểm tra CORS settings
3. ✅ Kiểm tra JWT token có hợp lệ không
4. ✅ Kiểm tra network connection

### Nếu Messages không hiển thị:
1. ✅ Kiểm tra Socket.IO listeners
2. ✅ Kiểm tra message state updates
3. ✅ Kiểm tra Firebase saving
4. ✅ Kiểm tra room joining

### Nếu Chat History không load:
1. ✅ Kiểm tra Firebase query
2. ✅ Kiểm tra timestamp format
3. ✅ Kiểm tra room name matching
4. ✅ Kiểm tra authentication

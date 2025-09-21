# Test Message Flow và Chat History

## Kiểm tra hai vấn đề:
1. **Không hiển thị tin nhắn đã chat**
2. **Học sinh không nhận được tin nhắn ở phần chat với giáo viên**

### 🔍 **Debug Steps:**

#### **1. Kiểm tra Chat History Loading:**

```javascript
// Frontend Console (F12) - Instructor Dashboard
"=== LOADING MESSAGES ==="
"Loading messages for student: student-id"
"Current messages before clear: []"
"Messages cleared"
"Joining room via Socket.IO..."
"Joined room via Socket.IO"
"=== SETTING UP CHAT HISTORY LISTENER ==="
"=== CHAT HISTORY RECEIVED ==="
"Chat history loaded: [message1, message2, ...]"
"Number of messages: X"
```

```javascript
// Frontend Console (F12) - Student Dashboard
"=== STUDENT LOADING MESSAGES ==="
"Loading messages for instructor: instructor-id"
"Current messages before clear: []"
"Messages cleared"
"Joining room via Socket.IO..."
"Joined room via Socket.IO"
"=== SETTING UP CHAT HISTORY LISTENER ==="
"=== STUDENT CHAT HISTORY RECEIVED ==="
"Chat history loaded: [message1, message2, ...]"
"Number of messages: X"
```

#### **2. Kiểm tra Backend Socket.IO:**

```bash
# Backend Terminal
"=== JOIN ROOM EVENT ==="
"User instructor-name (instructor) joining room with student-id (student)"
"Created room name: chat-instructor-id-student-id"
"User instructor-name joined room: chat-instructor-id-student-id"
"Loading chat history for room: chat-instructor-id-student-id"
"Found X messages for room: chat-instructor-id-student-id"
"Loaded messages: [message1, message2, ...]"
"Chat history sent to client"
```

#### **3. Kiểm tra Message Sending:**

```bash
# Backend Terminal
"=== SEND MESSAGE EVENT ==="
"Socket user info: {userId: 'instructor-id', userName: 'Instructor Name', userRole: 'instructor'}"
"Message data received: {receiverId: 'student-id', message: 'Hello', receiverRole: 'student'}"
"Created room name: chat-instructor-id-student-id"
"Message object created: {id: '...', senderId: 'instructor-id', ...}"
"Saving message to Firebase..."
"Message saved to Firebase successfully"
"=== EMITTING MESSAGE TO ROOM ==="
"Room name: chat-instructor-id-student-id"
"Room participants: [socket-id-1, socket-id-2]"
"✅ Message emitted to room participants"
"✅ Message sent confirmation sent to sender"
```

#### **4. Kiểm tra Message Receiving:**

```javascript
// Frontend Console (F12) - Instructor Dashboard
"=== INSTRUCTOR DASHBOARD RECEIVED MESSAGE ==="
"Received message: {id: '...', senderId: 'instructor-id', message: 'Hello', ...}"
"Current messages: [previous-messages]"
"Updated messages: [previous-messages, new-message]"
```

```javascript
// Frontend Console (F12) - Student Dashboard
"=== STUDENT DASHBOARD RECEIVED MESSAGE ==="
"Received message: {id: '...', senderId: 'instructor-id', message: 'Hello', ...}"
"Current messages: [previous-messages]"
"Updated messages: [previous-messages, new-message]"
```

### 🐛 **Troubleshooting:**

#### **Nếu không hiển thị chat history:**

1. **Kiểm tra Firebase có messages không:**
   ```javascript
   // Firebase Console
   // Collection: messages
   // Query: roomName == "chat-instructor-id-student-id"
   // Kết quả: Có messages không?
   ```

2. **Kiểm tra room name có đúng không:**
   ```javascript
   // Backend logs
   "Created room name: chat-instructor-id-student-id"
   // Frontend logs
   "Joining room via Socket.IO..."
   // Có match không?
   ```

3. **Kiểm tra chat history listener:**
   ```javascript
   // Frontend logs
   "=== SETTING UP CHAT HISTORY LISTENER ==="
   "=== CHAT HISTORY RECEIVED ==="
   // Có được gọi không?
   ```

#### **Nếu học sinh không nhận được tin nhắn:**

1. **Kiểm tra Socket.IO connection:**
   ```javascript
   // Student Dashboard Console
   "=== SOCKET CONNECTED TO SERVER ==="
   "=== SOCKET AUTHENTICATED ==="
   // Có kết nối không?
   ```

2. **Kiểm tra room joining:**
   ```javascript
   // Student Dashboard Console
   "=== SOCKET SERVICE JOINING ROOM ==="
   "Joining room with userId: instructor-id"
   "User role: instructor"
   "Join room event emitted"
   ```

3. **Kiểm tra message listeners:**
   ```javascript
   // Student Dashboard Console
   "=== STUDENT CHAT BOX SETTING UP LISTENERS ==="
   "=== STUDENT CHAT BOX RECEIVED MESSAGE ==="
   // Có được setup không?
   ```

4. **Kiểm tra room participants:**
   ```bash
   # Backend logs
   "Room participants: [socket-id-1, socket-id-2]"
   # Có cả instructor và student không?
   ```

### 🔧 **Các sửa đổi đã thực hiện:**

#### **1. Sửa loadMessages trong InstructorDashboard:**
```javascript
// Thêm debug logging và cleanup listeners
const loadMessages = async (studentId) => {
  console.log('=== LOADING MESSAGES ===');
  console.log('Loading messages for student:', studentId);
  console.log('Current messages before clear:', messages);
  setIsLoadingMessages(true);
  
  // Clear previous messages
  setMessages([]);
  console.log('Messages cleared');
  
  // Join chat room via Socket.IO
  console.log('Joining room via Socket.IO...');
  socketService.joinRoom(studentId, 'student');
  console.log('Joined room via Socket.IO');
  
  // Setup chat history listener (remove previous listener first)
  socketService.offChatHistory();
  socketService.onChatHistory((messages) => {
    console.log('=== CHAT HISTORY RECEIVED ===');
    console.log('Chat history loaded:', messages);
    console.log('Number of messages:', messages.length);
    setMessages(messages);
    setIsLoadingMessages(false);
  });
  
  // Set timeout để đảm bảo loading được tắt
  setTimeout(() => {
    console.log('Timeout: Setting isLoadingMessages to false');
    setIsLoadingMessages(false);
  }, 3000);
};
```

#### **2. Sửa loadMessages trong StudentDashboard:**
```javascript
// Tương tự như InstructorDashboard
const loadMessages = async () => {
  if (!instructorId) {
    console.log('❌ No instructorId, cannot load messages');
    return;
  }
  
  try {
    console.log('=== STUDENT LOADING MESSAGES ===');
    console.log('Loading messages for instructor:', instructorId);
    console.log('Current messages before clear:', messages);
    setIsLoadingMessages(true);
    
    // Clear previous messages
    setMessages([]);
    console.log('Messages cleared');
    
    // Join chat room via Socket.IO
    console.log('Joining room via Socket.IO...');
    socketService.joinRoom(instructorId, 'instructor');
    console.log('Joined room via Socket.IO');
    
    // Setup chat history listener (remove previous listener first)
    socketService.offChatHistory();
    socketService.onChatHistory((messages) => {
      console.log('=== STUDENT CHAT HISTORY RECEIVED ===');
      console.log('Chat history loaded:', messages);
      console.log('Number of messages:', messages.length);
      setMessages(messages);
      setIsLoadingMessages(false);
    });
    
    // Set timeout để đảm bảo loading được tắt
    setTimeout(() => {
      console.log('Timeout: Setting isLoadingMessages to false');
      setIsLoadingMessages(false);
    }, 3000);
    
  } catch (error) {
    console.error('Error loading messages:', error);
    setIsLoadingMessages(false);
  }
};
```

#### **3. Sửa Socket.IO service:**
```javascript
// Thêm debug logging và cleanup
onChatHistory(callback) {
  if (this.socket) {
    console.log('=== SETTING UP CHAT HISTORY LISTENER ===');
    this.socket.on('chat-history', callback);
  }
}

offChatHistory(callback) {
  if (this.socket) {
    console.log('=== REMOVING CHAT HISTORY LISTENER ===');
    if (callback) {
      this.socket.off('chat-history', callback);
    } else {
      this.socket.removeAllListeners('chat-history');
    }
  }
}
```

#### **4. Thêm debug logging vào backend:**
```javascript
// Thêm debug logging cho message emission
console.log(`=== EMITTING MESSAGE TO ROOM ===`);
console.log(`Room name: ${roomName}`);
console.log(`Message data:`, messageData);

// Get room participants
const room = this.io.sockets.adapter.rooms.get(roomName);
console.log(`Room participants:`, room ? Array.from(room) : 'Room not found');

this.io.to(roomName).emit('receive-message', messageData);
console.log('✅ Message emitted to room participants');
```

### 🎯 **Test Flow:**

#### **Bước 1: Test Chat History**
1. **Login as Instructor** → Go to Chat → Click on student
2. **Kiểm tra console logs** → Có load được chat history không
3. **Login as Student** → Go to Chat tab
4. **Kiểm tra console logs** → Có load được chat history không

#### **Bước 2: Test Message Sending**
1. **Instructor gửi tin nhắn** cho student
2. **Kiểm tra backend logs** → Message có được emit không
3. **Kiểm tra student dashboard** → Có nhận được tin nhắn không
4. **Kiểm tra UI** → Tin nhắn có hiển thị không

#### **Bước 3: Test Message Receiving**
1. **Student gửi tin nhắn** cho instructor
2. **Kiểm tra backend logs** → Message có được emit không
3. **Kiểm tra instructor dashboard** → Có nhận được tin nhắn không
4. **Kiểm tra UI** → Tin nhắn có hiển thị không

### ⚠️ **Lưu ý quan trọng:**

- **Chat history listener** phải được cleanup trước khi setup mới
- **Room name** phải match giữa instructor và student
- **Socket.IO connection** phải stable
- **Firebase messages** phải được lưu đúng format

### 🎉 **Kết quả mong đợi:**

Sau khi sửa:
- ✅ **Chat history** được load và hiển thị
- ✅ **Messages** được gửi và nhận real-time
- ✅ **UI** hiển thị messages đúng cách
- ✅ **Bidirectional communication** hoạt động

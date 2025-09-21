// Test Socket.IO Messaging System
// Chạy script này để test Socket.IO connection và messaging

const io = require('socket.io-client');

// Test configuration
const SOCKET_URL = 'http://localhost:5000';
const TEST_TOKEN = 'your-jwt-token-here'; // Thay bằng JWT token thực tế

console.log('=== SOCKET.IO MESSAGING TEST ===');

// Test 1: Connection
console.log('\n1. Testing Socket.IO Connection...');
const socket = io(SOCKET_URL, {
  auth: {
    token: TEST_TOKEN
  }
});

socket.on('connect', () => {
  console.log('✅ Socket connected successfully');
  console.log('Socket ID:', socket.id);
});

socket.on('authenticated', (data) => {
  console.log('✅ Authentication successful:', data);
  
  // Test 2: Join Room
  console.log('\n2. Testing Room Joining...');
  socket.emit('join-room', { 
    userId: 'test-student-id', 
    userRole: 'student' 
  });
});

socket.on('chat-history', (messages) => {
  console.log('✅ Chat history received:', messages.length, 'messages');
});

// Test 3: Send Message
socket.on('authenticated', () => {
  setTimeout(() => {
    console.log('\n3. Testing Message Sending...');
    socket.emit('send-message', {
      receiverId: 'test-student-id',
      message: 'Test message from instructor',
      receiverRole: 'student'
    });
  }, 2000);
});

socket.on('message-sent', (message) => {
  console.log('✅ Message sent confirmation:', message);
});

socket.on('receive-message', (message) => {
  console.log('✅ Message received:', message);
});

socket.on('error', (error) => {
  console.error('❌ Socket error:', error);
});

socket.on('connect_error', (error) => {
  console.error('❌ Connection error:', error);
});

socket.on('authentication-error', (error) => {
  console.error('❌ Authentication error:', error);
});

// Cleanup after 10 seconds
setTimeout(() => {
  console.log('\n=== TEST COMPLETED ===');
  socket.disconnect();
  process.exit(0);
}, 10000);

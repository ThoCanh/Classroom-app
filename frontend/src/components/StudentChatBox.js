import React, { useState, useEffect, useRef } from 'react';
import './StudentChatBox.css';

const StudentChatBox = ({ 
  messages = [], 
  onSendMessage, 
  currentUserId, 
  instructorId,
  instructorName = 'Giáo viên'
}) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle send message
  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) {
      return;
    }
    
    console.log('=== STUDENT CHAT BOX SEND MESSAGE ===');
    console.log('Message:', newMessage.trim());
    console.log('Current User ID:', currentUserId);
    console.log('Instructor ID:', instructorId);
    
    if (onSendMessage) {
      const messageData = {
        message: newMessage.trim(),
        senderId: currentUserId,
        receiverId: instructorId,
        senderRole: 'student',
        receiverRole: 'instructor'
      };
      
      onSendMessage(messageData);
      setNewMessage('');
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (error) {
      return '';
    }
  };

  return (
    <div className="student-chat-box">
      {/* Chat Header */}
      <div className="chat-header">
        <h3>Chat với {instructorName}</h3>
      </div>

      {/* Messages Area */}
      <div className="messages-container">
        <div className="messages-list">
          {messages.length === 0 ? (
            <div className="no-messages">
              <p>Chưa có tin nhắn nào</p>
              <small>Hãy gửi tin nhắn đầu tiên cho giáo viên!</small>
            </div>
          ) : (
            messages.map((message) => {
              const isOwn = message.senderId === currentUserId;
              const senderName = isOwn ? 'Bạn' : (message.senderName || instructorName);
              
              return (
                <div key={message.id} className={`message-item ${isOwn ? 'own' : 'other'}`}>
                  <div className="message-content">
                    <div className="message-header">
                      <span className="message-sender">{senderName}</span>
                      <span className="message-time">{formatTime(message.timestamp)}</span>
                    </div>
                    
                    <div className="message-text">
                      {message.message}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="message-input-container">
        <form onSubmit={handleSendMessage} className="message-input-form">
          <div className="input-group">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={`Nhắn tin cho ${instructorName}...`}
              className="message-input"
            />
            
            <button 
              type="submit" 
              className="send-button"
              disabled={!newMessage.trim()}
            >
              <span className="send-icon">📤</span>
              <span className="send-text">Gửi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentChatBox;
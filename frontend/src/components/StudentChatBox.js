import React, { useState, useEffect, useRef } from 'react';
import './StudentChatBox.css';

const StudentChatBox = ({ 
  messages = [], 
  onSendMessage, 
  currentUserId, 
  instructorId,
  instructorName,
  isLoading = false
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [selectedConversation, setSelectedConversation] = useState(null);
  const messagesEndRef = useRef(null);

  // Create instructor conversation
  const instructorConversation = {
    id: instructorId,
    name: instructorName || 'Instructor',
    lastMessage: messages.length > 0 ? messages[messages.length - 1].message : 'Hello',
    avatar: '👨‍🏫'
  };

  // Set selected conversation to instructor by default
  useEffect(() => {
    if (instructorId && !selectedConversation) {
      setSelectedConversation(instructorConversation);
    }
  }, [instructorId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Setup Socket.IO listeners
  useEffect(() => {
    console.log('=== STUDENT CHAT BOX SETTING UP LISTENERS ===');
    console.log('instructorId:', instructorId);
    
    // TODO: Implement Socket.IO listeners here
    console.log('Socket.IO listeners not implemented yet');
    
    // Cleanup listeners on unmount
    return () => {
      console.log('=== STUDENT CHAT BOX CLEANING UP LISTENERS ===');
      // TODO: Cleanup Socket.IO listeners here
    };
  }, [instructorId, onSendMessage]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const messageData = {
        message: newMessage.trim(),
        senderId: currentUserId,
        receiverId: instructorId,
        senderRole: 'student',
        receiverRole: 'instructor'
      };
      
      onSendMessage && onSendMessage(messageData);
      setNewMessage('');
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div 
      className="student-chat-interface"
      style={{
        display: 'flex',
        height: '100vh',
        background: 'white',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        borderLeft: '3px solid #007bff'
      }}
    >
      {console.log('=== STUDENT CHAT BOX RENDERING ===')}
      {console.log('instructorId:', instructorId)}
      {console.log('instructorName:', instructorName)}
      {console.log('messages:', messages)}
      {console.log('selectedConversation:', selectedConversation)}
      {console.log('instructorConversation:', instructorConversation)}
      
      {/* Left Column - Conversations List */}
      <div 
        className="conversations-panel"
        style={{
          width: '25%',
          background: '#f8f9fa',
          borderRight: '1px solid #e0e0e0',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div className="conversations-header">
          <h3>Conversations</h3>
        </div>
        
        <div className="conversations-list">
          <div 
            className={`conversation-item ${selectedConversation?.id === instructorConversation.id ? 'active' : ''}`}
            onClick={() => setSelectedConversation(instructorConversation)}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px',
              marginBottom: '8px',
              background: selectedConversation?.id === instructorConversation.id ? '#e3f2fd' : 'white',
              borderRadius: '8px',
              cursor: 'pointer',
              border: selectedConversation?.id === instructorConversation.id ? '1px solid #007bff' : '1px solid #e0e0e0'
            }}
          >
            <div className="conversation-avatar">
              <div 
                className="avatar-placeholder"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: '#e0e0e0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  color: '#666',
                  marginRight: '12px'
                }}
              >
                👨‍🏫
              </div>
            </div>
            <div className="conversation-content">
              <div className="conversation-name">{instructorConversation.name}</div>
              <div className="conversation-preview">{instructorConversation.lastMessage}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Chat Area */}
      <div 
        className="chat-panel"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          background: 'white'
        }}
      >
        <div className="chat-header">
          <h3>Chat Area</h3>
        </div>
        
        {selectedConversation ? (
          <>
            <div className="chat-messages">
              {messages.length === 0 ? (
                <div className="no-messages">
                  <p>Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`message ${message.senderId === currentUserId ? 'sent' : 'received'}`}
                  >
                    <div className="message-content">
                      <p>{message.message}</p>
                      <span className="message-time">
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <form 
              className="chat-input" 
              onSubmit={handleSendMessage}
              style={{
                display: 'flex',
                padding: '20px',
                background: '#f8f9fa',
                borderTop: '1px solid #e0e0e0',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Reply message"
                disabled={isLoading}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '20px',
                  fontSize: '14px',
                  background: 'white',
                  outline: 'none'
                }}
              />
              <button 
                type="submit" 
                disabled={!newMessage.trim() || isLoading}
                style={{
                  padding: '12px',
                  background: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '44px',
                  height: '44px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <i className="send-icon">📤</i>
              </button>
            </form>
          </>
        ) : (
          <div className="no-conversation-selected">
            <p>Chọn một cuộc trò chuyện để bắt đầu</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentChatBox;

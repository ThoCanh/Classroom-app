import React, { useState, useEffect, useRef } from 'react';
import './ChatBox.css';

const ChatBox = ({ 
  messages = [], 
  onSendMessage, 
  currentUserId, 
  receiverId, 
  senderRole, 
  receiverRole,
  isLoading = false,
  conversations = [],
  onSelectConversation,
  selectedConversation = null
}) => {
  // Debug: Log conversations data
  console.log('ChatBox received conversations:', conversations);
  console.log('ChatBox conversations length:', conversations.length);
  console.log('ChatBox conversations type:', typeof conversations);
  console.log('ChatBox conversations is array:', Array.isArray(conversations));
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Debug: Log messages state changes
  useEffect(() => {
    console.log('=== CHATBOX MESSAGES STATE CHANGED ===');
    console.log('Messages:', messages);
    console.log('Messages length:', messages.length);
    console.log('Messages type:', typeof messages);
    console.log('Messages is array:', Array.isArray(messages));
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    console.log('=== CHATBOX HANDLE SEND MESSAGE ===');
    console.log('New message:', newMessage);
    console.log('Current user ID:', currentUserId);
    console.log('Receiver ID:', receiverId);
    console.log('Sender role:', senderRole);
    console.log('Receiver role:', receiverRole);
    console.log('OnSendMessage function:', !!onSendMessage);
    
    if (newMessage.trim() && onSendMessage) {
      const messageData = {
        message: newMessage.trim(),
        senderId: currentUserId,
        receiverId: receiverId,
        senderRole: senderRole,
        receiverRole: receiverRole
      };
      
      console.log('Sending message data:', messageData);
      onSendMessage(messageData);
      setNewMessage('');
      console.log('Message sent and input cleared');
    } else {
      console.log('Cannot send message - missing data or function');
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const filteredConversations = conversations.filter(conv => {
    if (!searchTerm.trim()) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const name = conv.name?.toLowerCase() || '';
    const phone = conv.phone?.toLowerCase() || '';
    const email = conv.email?.toLowerCase() || '';
    
    console.log('Search term:', searchTerm);
    console.log('Conversation data:', conv);
    console.log('Name:', name, 'Phone:', phone, 'Email:', email);
    
    const matches = name.includes(searchLower) || 
           phone.includes(searchLower) || 
           email.includes(searchLower);
           
    console.log('Matches:', matches);
    return matches;
  });

  return (
    <div className="chat-interface">
      {/* Left Column - Conversations List */}
      <div className="conversations-panel">
        <div className="conversations-header">
          <h3>Tất cả tin nhắn</h3>
        </div>
        
        <div className="search-container">
          <input
            type="text"
            placeholder="Tìm theo tên, số điện thoại hoặc email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="conversations-list">
          {console.log('Filtered conversations:', filteredConversations)}
          {console.log('Total conversations:', conversations.length)}
          {console.log('Search term:', searchTerm)}
          {filteredConversations.length === 0 && searchTerm.trim() ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
              Không tìm thấy cuộc trò chuyện nào
            </div>
          ) : filteredConversations.length === 0 && !searchTerm.trim() ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
              Chưa có cuộc trò chuyện nào
            </div>
          ) : (
            filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`conversation-item ${selectedConversation?.id === conversation.id ? 'active' : ''}`}
              onClick={() => onSelectConversation && onSelectConversation(conversation)}
            >
              <div className="conversation-avatar">
                <div className="avatar-placeholder">👤</div>
              </div>
              <div className="conversation-content">
                <div className="conversation-name">{conversation.name}</div>
                <div className="conversation-preview">{conversation.lastMessage || 'Chưa có tin nhắn'}</div>
              </div>
            </div>
            ))
          )}
        </div>
      </div>

      {/* Right Column - Chat Area */}
      <div className="chat-panel">
        <div className="chat-header">
          <h3>Chat Area</h3>
        </div>
        
        {selectedConversation ? (
          <>
            {console.log('=== CHATBOX SELECTED CONVERSATION TRUE ===')}
            {console.log('selectedConversation:', selectedConversation)}
            {console.log('Will render chat input')}
            <div className="chat-messages">
              {console.log('=== CHATBOX RENDERING MESSAGES ===')}
              {console.log('Messages array:', messages)}
              {console.log('Messages length:', messages.length)}
              {console.log('Is loading:', isLoading)}
              {console.log('Selected conversation:', selectedConversation)}
              
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

            {/* Luôn hiển thị thanh input */}
            <form className="chat-input" onSubmit={handleSendMessage}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Reply message..."
                disabled={false}
                style={{ 
                  backgroundColor: 'white',
                  cursor: 'text'
                }}
              />
              <button type="submit" disabled={!newMessage.trim()}>
                <i className="send-icon">📤</i>
              </button>
            </form>
            {console.log('ChatBox isLoading:', isLoading)}
          </>
        ) : (
          <>
            {console.log('=== CHATBOX SELECTED CONVERSATION FALSE ===')}
            {console.log('selectedConversation:', selectedConversation)}
            {console.log('Will render no-conversation-selected')}
            <div className="no-conversation-selected">
              <p>Chọn một cuộc trò chuyện để bắt đầu</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatBox;

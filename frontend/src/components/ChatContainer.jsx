import React from "react";
import "../css/ChatContainer.css";

const ChatContainer = ({ 
  userName, 
  avatarURL, 
  contact, 
  isOnline = false, 
  unreadCount = 0, 
  isSelected = false,
  onSelect 
}) => {
  
  const handleSelectContact = () => {
    if (contact && onSelect) {
      onSelect(contact);
    }
  };

  return (
    <div 
      className={`chat-container ${isSelected ? 'selected' : ''}`} 
      onClick={handleSelectContact}
    >
      <div className="user-avatar-container">
        <div className="user-avatar">
          <img src={avatarURL} alt={userName} />
          {isOnline && <div className="online-indicator"></div>}
        </div>
      </div>
      
      <div className="user-info">
        <div className="user-name">
          <p>{userName}</p>
        </div>
        <div className="user-status">
          <span className={`status ${isOnline ? 'online' : 'offline'}`}>
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>
      
      {unreadCount > 0 && (
        <div className="unread-badge">
          <span>{unreadCount > 99 ? '99+' : unreadCount}</span>
        </div>
      )}
    </div>
  );
};

export default ChatContainer;

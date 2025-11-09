import React, { useState } from "react";
import "../css/ChatContainer.css";

const ChatContainer = ({ 
  userName, 
  avatarURL, 
  contact, 
  isOnline = false, 
  unreadCount = 0, 
  isSelected = false,
  onSelect,
  onDelete 
}) => {
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const handleSelectContact = () => {
    if (contact && onSelect) {
      onSelect(contact);
    }
  };

  const handleDeleteContact = (e) => {
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const confirmDelete = (e) => {
    e.stopPropagation();
    if (contact && onDelete) {
      onDelete(contact.contactId);
    }
    setShowDeleteConfirm(false);
  };

  const cancelDelete = (e) => {
    e.stopPropagation();
    setShowDeleteConfirm(false);
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

      <div className="contact-actions">
        <button 
          className="delete-contact-btn"
          onClick={handleDeleteContact}
          title="Delete Contact"
        >
          🗑️
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="delete-confirm-modal" onClick={cancelDelete}>
          <div className="delete-confirm-content" onClick={e => e.stopPropagation()}>
            <h3>Delete Contact</h3>
            <p>Are you sure you want to delete <strong>{userName}</strong> from your contacts?</p>
            <div className="delete-confirm-actions">
              <button className="confirm-delete-btn" onClick={confirmDelete}>
                Delete
              </button>
              <button className="cancel-delete-btn" onClick={cancelDelete}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatContainer;

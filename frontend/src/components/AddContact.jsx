import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChatContext } from "../stores/chatStore";
import { showError } from "../utils/toast";
import "../css/AddContact.css";

const AddContact = () => {
  const [email, setEmail] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  const { addContact, searchUsers, loading } = useContext(ChatContext);
  const navigate = useNavigate();

  // Debounce search
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchUsers(searchQuery);
        setSearchResults(results);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchUsers]);

  const handleAddContact = async () => {
    const contactEmail = selectedUser ? selectedUser.email : email.trim();
    
    if (!contactEmail) {
      showError("Please enter an email or select a user");
      return;
    }

    const success = await addContact(contactEmail);
    if (success !== false) { // addContact returns nothing on success, false on error
      navigate("/chat");
    }
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setEmail(user.email);
    setSearchResults([]);
    setSearchQuery(user.username);
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setSelectedUser(null);
  };

  return (
    <div className="add-contact-page">
      <div className="add-contact-form">
        <h2>Add New Contact</h2>
        
        {/* Search users */}
        <div className="search-section">
          <h3>Search Users</h3>
          <input
            type="text"
            placeholder="Search by username or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          
          {isSearching && (
            <div className="search-loading">Searching...</div>
          )}
          
          {searchResults.length > 0 && (
            <div className="search-results">
              {searchResults.map((user) => (
                <div 
                  key={user._id} 
                  className="search-result-item"
                  onClick={() => handleSelectUser(user)}
                >
                  <img 
                    src={user.avatarURL} 
                    alt={user.username}
                    className="user-avatar-small"
                  />
                  <div className="user-info">
                    <div className="username">{user.username}</div>
                    <div className="user-email">{user.email}</div>
                  </div>
                  {user.isOnline && <div className="online-dot"></div>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Manual email entry */}
        <div className="manual-section">
          <h3>Or Enter Email Manually</h3>
          <input
            type="email"
            placeholder="Enter contact email"
            value={email}
            onChange={handleEmailChange}
            className="email-input"
          />
        </div>

        {selectedUser && (
          <div className="selected-user">
            <p>Selected: <strong>{selectedUser.username}</strong> ({selectedUser.email})</p>
          </div>
        )}

        <div className="form-actions">
          <button 
            onClick={handleAddContact}
            disabled={loading || (!email.trim())}
            className={`add-button ${loading ? 'loading' : ''}`}
          >
            {loading ? 'Adding...' : 'Add Contact'}
          </button>
          <button 
            className="cancel-button" 
            onClick={() => navigate("/chat")}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddContact;
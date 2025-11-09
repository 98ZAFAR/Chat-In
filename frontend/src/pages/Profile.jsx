import { useContext, useState } from "react";
import { ChatContext } from "../stores/chatStore";
import "../css/Profile.css";
import { useNavigate } from "react-router-dom";
import { showSuccess, showError } from "../utils/toast";

const Profile = () => {
  const { user, updateProfile, logoutUser, loading, defaultAvatars } = useContext(ChatContext);
  const [isEditing, setIsEditing] = useState(false);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    bio: user?.bio || '',
    avatarURL: user?.avatarURL || ''
  });
  
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    if (!formData.username.trim()) {
      showError("Username is required!");
      return;
    }

    if (formData.username.trim().length < 2) {
      showError("Username must be at least 2 characters long!");
      return;
    }

    try {
      await updateProfile({
        username: formData.username.trim(),
        bio: formData.bio.trim(),
        avatarURL: formData.avatarURL
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Update profile error:', error);
    }
  };

  const handleCancel = () => {
    setFormData({
      username: user?.username || '',
      bio: user?.bio || '',
      avatarURL: user?.avatarURL || ''
    });
    setIsEditing(false);
    setShowAvatarSelector(false);
  };

  const handleSelectAvatar = (avatarURL) => {
    setFormData(prev => ({
      ...prev,
      avatarURL
    }));
    setShowAvatarSelector(false);
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await logoutUser();
    }
  };

  if (!user?._id) {
    return (
      <div className="profile-page">
        <div className="profile-card">
          <p>Please login to view profile</p>
          <button onClick={() => navigate('/signin')}>Go to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-header">
          <div className="avatar-section">
            <img 
              src={isEditing ? formData.avatarURL : user.avatarURL} 
              alt="User Avatar" 
              className="profile-avatar"
              onClick={() => isEditing && setShowAvatarSelector(true)}
            />
            {isEditing && (
              <button 
                type="button"
                className="change-avatar-btn"
                onClick={() => setShowAvatarSelector(true)}
              >
                Change Avatar
              </button>
            )}
          </div>
          
          {!isEditing ? (
            <div className="profile-info">
              <h2>{user.username}</h2>
              <p className="user-email">{user.email}</p>
              {user.bio && <p className="user-bio">{user.bio}</p>}
              <div className="user-stats">
                <span className="join-date">
                  Joined: {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ) : (
            <form className="edit-profile-form" onSubmit={handleUpdateProfile}>
              <div className="form-group">
                <label htmlFor="username">Username:</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  minLength={2}
                  maxLength={30}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="bio">Bio:</label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  maxLength={150}
                  placeholder="Tell us about yourself..."
                  rows={3}
                />
                <small>{formData.bio.length}/150 characters</small>
              </div>
            </form>
          )}
        </div>

        {/* Avatar Selector Modal */}
        {showAvatarSelector && (
          <div className="avatar-selector-modal">
            <div className="avatar-selector">
              <h3>Choose an Avatar</h3>
              <div className="avatar-grid">
                {defaultAvatars.map((avatar, index) => (
                  <img
                    key={index}
                    src={avatar}
                    alt={`Avatar ${index + 1}`}
                    className={`avatar-option ${formData.avatarURL === avatar ? 'selected' : ''}`}
                    onClick={() => handleSelectAvatar(avatar)}
                  />
                ))}
              </div>
              <div className="avatar-actions">
                <button 
                  type="button"
                  onClick={() => setShowAvatarSelector(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="profile-actions">
          {!isEditing ? (
            <>
              <button 
                className="edit-btn"
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </button>
              <button 
                className="logout-btn" 
                onClick={handleLogout}
                disabled={loading}
              >
                Logout
              </button>
              <button 
                className="back-btn" 
                onClick={() => navigate("/chat")}
              >
                Back to Chat
              </button>
            </>
          ) : (
            <>
              <button 
                type="submit"
                className="save-btn"
                onClick={handleUpdateProfile}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button 
                type="button"
                className="cancel-btn"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;

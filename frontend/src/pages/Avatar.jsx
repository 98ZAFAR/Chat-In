import { useContext, useEffect } from "react";
import "../css/Avatar.css";
import { ChatContext } from "../stores/chatStore";
import { showError } from "../utils/toast";
import { useNavigate } from "react-router-dom";

const Avatar = () => {
  const { 
    defaultAvatars, 
    selectedtAvatar, 
    setSelectedAvatar, 
    updateAvatar, 
    user,
    loading,
    token 
  } = useContext(ChatContext);
  
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if not authenticated
    if (!token || !user?._id) {
      navigate('/signin');
      return;
    }

    // If user already has an avatar, redirect to chat
    if (user.avatarURL && user.avatarURL !== "#" && user.avatarURL !== "") {
      navigate('/chat');
    }
  }, [token, user, navigate]);

  const handleSelectAvatar = (event) => {
    setSelectedAvatar(event.target.id);
  };

  const handleSubmit = async () => {
    if (!selectedtAvatar) {
      showError("Please select an avatar!");
      return;
    }

    try {
      await updateAvatar({ avatarURL: selectedtAvatar });
    } catch (error) {
      console.error('Avatar update error:', error);
    }
  };

  const handleSkip = () => {
    navigate('/chat');
  };

  return (
    <>
      <div className="avatar-body">
        <div className="avatar-form">
          <div className="avatar-sections">
            <h2 className="avatar-title">Select Your Avatar</h2>
            <div className="avatar-top-section">
              <img src={selectedtAvatar} alt="" className="user-avatar" />
            </div>
            <div className="avatar-bottom-section">
              {defaultAvatars.map((imagesUrl) => (
                <img
                  key={imagesUrl}
                  id={imagesUrl}
                  src={imagesUrl}
                  alt=""
                  className="available-avatar"
                  onClick={handleSelectAvatar}
                />
              ))}
            </div>
            <div className="avatar-actions">
              <button 
                onClick={handleSubmit} 
                disabled={loading || !selectedtAvatar}
                className={`next-button ${loading ? 'loading' : ''}`}
              >
                {loading ? 'Setting Avatar...' : 'Continue'}
              </button>
              <button 
                onClick={handleSkip} 
                className="skip-button"
                disabled={loading}
              >
                Skip for now
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Avatar;

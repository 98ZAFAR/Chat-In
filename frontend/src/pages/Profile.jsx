import { useContext } from "react";
import { ChatContext } from "../stores/chatStore";
import "../css/Profile.css";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { user } = useContext(ChatContext);
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/signin');
  };

  return (
    <div className="profile-page">
      <div className="profile-card">
        <img src={user.avatarURL} alt="User Avatar" className="profile-avatar" />
        <h2>{user.username}</h2>
        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
        <button className="back-btn" onClick={() => navigate("/chat")}>
          Back to Chat
        </button>
      </div>
    </div>
  );
};

export default Profile;

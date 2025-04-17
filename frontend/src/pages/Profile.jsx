import { useContext, useState } from "react";
import { ChatContext } from "../stores/chatStore";
import "../css/Profile.css";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { user, updateUser } = useContext(ChatContext);
  const [username, setUsername] = useState(user.username);
  const [avatarURL, setAvatarURL] = useState(user.avatarURL);
  const navigate = useNavigate();

  const handleUpdate = () => {
    updateUser({ username, avatarURL });
    alert("Profile updated!");
  };

  const logout = ()=>{
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/signin');
  }
  return (
    <div className="profile-page">
      <div className="profile-card">
        <img src={avatarURL} alt="User Avatar" className="profile-avatar" />
        <h2>Edit Profile</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="text"
          placeholder="Avatar URL"
          value={avatarURL}
          onChange={(e) => setAvatarURL(e.target.value)}
        />
        <button className="update-btn" onClick={handleUpdate}>
          Save Changes
        </button>
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

import { useContext } from "react";
import "../css/Avatar.css";
import { ChatContext } from "../stores/chatStore";

const Avatar = () => {
  const { defaultAvatars, selectedtAvatar, setSelectedAvatar, updateAvatar, user } = useContext(ChatContext);

    const handleSelectAvatar = (event)=>{
        setSelectedAvatar(event.target.id);
    }

    const handleSubmit = (event)=>{
      updateAvatar({email:user.email, avatarURL:selectedtAvatar});
    }

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
            <div className="avatar-next-button">
                <button onClick={handleSubmit}>Next</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Avatar;

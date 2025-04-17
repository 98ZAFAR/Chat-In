import { useContext } from "react";
import "../css/ChatContainer.css";
import { ChatContext } from "../stores/chatStore";

const ChatContainer = ({ userName, avatarURL, contact }) => {
  const { setSelectedContact } = useContext(ChatContext);
  
  const handleSelectContact = (contact) => {
    if (contact) setSelectedContact(contact);
  };
  return (
    <>
      <div className="chat-container" onClick={()=>handleSelectContact(contact)}>
        <div className="user-avatar">
          <img src={avatarURL} alt="" />
        </div>
        <div className="user-name">
          <p>{userName}</p>
        </div>
      </div>
    </>
  );
};

export default ChatContainer;

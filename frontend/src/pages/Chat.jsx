import { useContext } from "react";
import ChatContainer from "../components/ChatContainer";
import { ChatContext } from "../stores/chatStore";
import "../css/Chat.css";

const Chat = () => {
  const { contacts } = useContext(ChatContext);
  return (
    <>
      <div className="chat-body">
        <div className="chat-sidebar">
          <h2 className="sidebar-title">Chat-In</h2>
          {contacts.map((contact) => (
            <ChatContainer
              className="chat-container"
              key={contact._id}
              userName={contact.userName}
              avatarUrl={contact.avatarUrl}
            ></ChatContainer>
          ))}
        </div>
        <div className="chat-panel">
            <div className="chat-title">
                <h3>Username</h3>
            </div>
            <div className="chat-area">

            </div>
            <div className="chat-box">
                <input type="text" id="message-box" />
                <button className="send-button">Send</button>
            </div>
        </div>
      </div>
    </>
  );
};

export default Chat;

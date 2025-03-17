import { useContext } from "react";
import ChatContainer from "../components/ChatContainer";
import { ChatContext } from "../stores/chatStore";
import { FaCog } from "react-icons/fa";
import "../css/Chat.css";

const Chat = () => {
  const { contacts, selectedContact } = useContext(ChatContext);

  return (
    <>
      <div className="chat-body">
        <div className="chat-sidebar">
          <div className="sidebar-header">
            <FaCog className="setting-icon"/>
            <h2 className="sidebar-title">Chat-In</h2>
          </div>
          {contacts.map((contact) => (
            <ChatContainer
              className="chat-container"
              key={contact._id}
              userName={contact.userName}
              avatarUrl={contact.avatarUrl}
              contact={contact}
            />
          ))}
        </div>
        {selectedContact && (
          <>
            <div className="chat-panel">
              <div className="chat-title">
                <img
                  src={selectedContact ? selectedContact.avatarUrl : "#"}
                  alt=""
                  className="user-avatar"
                />
                <h3>
                  {selectedContact ? selectedContact.userName : "Username"}
                </h3>
              </div>
              <div className="chat-area"></div>
              <div className="chat-box">
                <input
                  type="text"
                  id="message-box"
                  placeholder="Enter the message"
                />
                <button className="send-button">Send</button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Chat;

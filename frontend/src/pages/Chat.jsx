import { useContext, useEffect, useRef, useState } from "react";
import ChatContainer from "../components/ChatContainer";
import { ChatContext } from "../stores/chatStore";
import { FaCog } from "react-icons/fa";
import { IoMdAddCircleOutline } from "react-icons/io";
import { LuSendHorizontal } from "react-icons/lu";
import { GiHamburgerMenu } from "react-icons/gi";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import "../css/Chat.css";
import { initializeSocket } from "../utils/Socket";

const API_URL = import.meta.env.VITE_API_URL;
let socket = null;

const Chat = () => {
  const {
    contacts,
    selectedContact,
    user,
    messages,
    token,
    setContacts,
    getMessages,
    setMessages,
    setSelectedContact,
  } = useContext(ChatContext);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const message = useRef(null);
  const bottomRef = useRef(null);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedContact || !message.current.value.trim()) return;
    sendMessage(selectedContact.contactId, message.current.value);
  };

  const sendMessage = (toUserId, messageText) => {
    if (!socket || !toUserId) return;

    socket.emit("send_message", {
      to: toUserId,
      content: messageText,
    });

    const newMessages = [
      ...messages,
      {
        _id: `${Date.now()}`,
        sender: user._id,
        reciever: toUserId,
        content: messageText,
      },
    ];

    setMessages(newMessages);
    message.current.value = "";
  };

  useEffect(() => {
    if (!token) return navigate("/signin");

    const fetchAllContacts = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/contacts/fetch/${user._id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res) {
          setContacts(res.data.data.contacts);
        }
      } catch (error) {
        alert("Something went wrong!");
      }
    };

    fetchAllContacts();
    getMessages(user._id, token);
  }, [token]);

  useEffect(() => {
    setMessages([]);
    setSelectedContact(null);
  }, [user]);

  useEffect(() => {
    if (!token) return;
    socket = initializeSocket(token);

    return () => {
      if (socket) socket.disconnect();
    };
  }, [token]);

  useEffect(() => {
    const handleMessage = (msg) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          _id: `${Date.now() + prevMessages.length}`,
          sender: msg.from,
          reciever: user._id,
          content: msg.content,
        },
      ]);
    };

    socket?.on("recieve_message", handleMessage);
    return () => socket?.off("recieve_message", handleMessage);
  }, []);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="chat-body">
      <GiHamburgerMenu className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)} />

      <div className={`chat-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-title">Chat-In</h2>
          <FaCog className="setting-icon" onClick={() => navigate("/profile")} />
        </div>

        {contacts.map((contact) => (
          <ChatContainer
            key={contact._id}
            userName={contact.contactName}
            avatarURL={contact.contactAvatarURL}
            contact={contact}
          />
        ))}

        <div className="sidebar-footer">
          <IoMdAddCircleOutline className="chat-add-contact" onClick={() => navigate("/add-contact")} />
        </div>
      </div>

      {selectedContact ? (
        <div className="chat-panel">
          <div className="chat-title">
            <img src={selectedContact.contactAvatarURL} alt="" className="user-avatar" />
            <h3>{selectedContact.contactName}</h3>
          </div>

          <div className="chat-area">
            {messages.map((mess) =>
              mess.sender == user._id && mess.reciever == selectedContact.contactId ? (
                <div key={mess._id} className="message-area-right">
                  <p>{mess.content}</p>
                </div>
              ) : (
                mess.sender == selectedContact.contactId &&
                mess.reciever == user._id && (
                  <div key={mess._id} className="message-area-left">
                    <p>{mess.content}</p>
                  </div>
                )
              )
            )}
            <div ref={bottomRef} />
          </div>

          <form className="chat-box" onSubmit={handleSubmit}>
            <input
              type="text"
              id="message-box"
              name="message"
              ref={message}
              placeholder="Enter the message"
            />
            <LuSendHorizontal
              className="send-button"
              onClick={() =>
                sendMessage(selectedContact.contactId, message.current.value)
              }
            />
          </form>
        </div>
      ):(<div className="select-contact-message"><p>Select A Contact To Chat</p></div>)}
    </div>
  );
};

export default Chat;

import { useContext, useEffect, useRef, useState } from "react";
import ChatContainer from "../components/ChatContainer";
import { ChatContext } from "../stores/chatStore";
import { FaCog } from "react-icons/fa";
import { IoMdAddCircleOutline } from "react-icons/io";
import { LuSendHorizontal } from "react-icons/lu";

import "../css/Chat.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import { io } from 'socket.io-client';

const socket = io('https://chatin-ln9h.onrender.com', {
  auth: {
    token: localStorage.getItem('token')
  }
});

socket.on('connect', () => {
  console.log('Connected to socket server');
});

const Chat = () => {
  const { contacts, selectedContact, user, messages, token, setContacts, getMessages, setMessages } = useContext(ChatContext);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  // console.log("Original Messages : ", messages);
  const bottomRef = useRef(null);
  

  useEffect(() => {
    if (!token) return navigate('/signin');

    const fetchAllContacts = async () => {
      try {
        const res = await axios.get(`https://chatin-ln9h.onrender.com/api/contacts/fetch/${user._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (res) {
          console.log(res.data);
          setContacts(res.data.data.contacts);
        }
      } catch (error) {
        alert("Something went wrong!");
        console.log(error);
      }
    }
    fetchAllContacts();
    getMessages(user._id, token);

  }, [token])

  const sendMessage = (toUserId, messageText) => {
    socket.emit('send_message', {
      to: toUserId,
      content: messageText
    });

    const newMessages = [...messages, {
      _id: `${Date.now()}`,
      sender: user._id,
      reciever: toUserId,
      content: messageText,
    }];

    setMessages(newMessages);
  };

  useEffect(() => {
    socket.on('recieve_message', (msg) => {
      console.log('New message:', msg);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          _id: `${Date.now()+prevMessages.length}`,
          sender: msg.from,
          reciever: user._id,
          content: msg.content,
        }
      ]);
      return () => {
        socket.off('recieve_message');
      };
    });

  }, [socket]);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <>
      <div className="chat-body">
        <div className="chat-sidebar">
          <div className="sidebar-header">
            <FaCog className="setting-icon" onClick={() => navigate('/profile')} />
            <h2 className="sidebar-title">Chat-In</h2>
          </div>
          {contacts.map((contact) => (
            <ChatContainer
              className="chat-container"
              key={contact._id}
              userName={contact.contactName}
              avatarURL={contact.contactAvatarURL}
              contact={contact}
            />
          ))}
          <IoMdAddCircleOutline className="chat-add-contact" onClick={() => navigate('/add-contact')} />
        </div>

        {selectedContact && (
          <>
            <div className="chat-panel">
              <div className="chat-title">
                <img
                  src={selectedContact ? selectedContact.contactAvatarURL : "#"}
                  alt=""
                  className="user-avatar"
                />
                <h3>
                  {selectedContact ? selectedContact.contactName : "Username"}
                </h3>
              </div>
              <div className="chat-area">
                {messages.map((mess) =>
                  mess.sender == user._id && mess.reciever == selectedContact.contactId ? (
                    <div key={mess._id} className="message-area-right">
                      <p>{mess.content}</p>
                    </div>
                  ) : mess.sender == selectedContact.contactId && mess.reciever == user._id && (
                    <div key={mess._id} className="message-area-left">
                      <p>{mess.content}</p>
                    </div>
                  )
                )}
                <div ref={bottomRef} />
              </div>
              <div className="chat-box">
                <input
                  type="text"
                  id="message-box"
                  placeholder="Enter the message"
                  onChange={(e) => { setMessage(e.target.value) }}
                />
                <LuSendHorizontal className="send-button" onClick={() => sendMessage(selectedContact.contactId, message)} />
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Chat;
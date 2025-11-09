import { useContext, useEffect, useRef, useState } from "react";
import ChatContainer from "../components/ChatContainer";
import { ChatContext } from "../stores/chatStore";
import { FaCheck, FaCheckDouble, FaCog } from "react-icons/fa";
import { IoMdAddCircleOutline } from "react-icons/io";
import { LuSendHorizontal } from "react-icons/lu";
import { GiHamburgerMenu } from "react-icons/gi";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

import "../css/Chat.css";
import {
  initializeSocket,
  sendMessage,
  onMessage,
  offMessage,
  onMessageSent,
  offMessageSent,
  onUserTyping,
  offUserTyping,
  startTyping,
  stopTyping,
  disconnectSocket,
  isSocketConnected,
  onUserOnline,
  offUserOnline,
  onOnlineUsersList,
  offOnlineUsersList,
} from "../utils/Socket";
import { showError, showInfo } from "../utils/toast";

const API_URL = import.meta.env.VITE_API_URL;
let socket = null;
let typingTimeout = null;

const Chat = () => {
  const {
    contacts,
    selectedContact,
    user,
    messages,
    token,
    fetchContacts,
    getConversation,
    markMessagesAsRead,
    setMessages,
    setSelectedContact,
    setToken,
    setUser,
  } = useContext(ChatContext);

  console.log("Messaeges in Chat component:", messages);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentMessages, setCurrentMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [unreadCounts, setUnreadCounts] = useState(new Map());

  const messageRef = useRef(null);
  const bottomRef = useRef(null);
  const chatAreaRef = useRef(null);

  const navigate = useNavigate();
  const { search } = useLocation();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedContact || !messageRef.current?.value.trim()) return;

    if (!isSocketConnected()) {
      showError(
        "You're not connected to the server. Please wait for reconnection."
      );
      return;
    }

    const messageText = messageRef.current.value.trim();
    const success = sendMessage(selectedContact.contactId, messageText);

    if (success) {
      messageRef.current.value = "";
      stopTyping(selectedContact.contactId);
    }
  };

  const handleMessageInput = (e) => {
    if (!selectedContact) return;

    // Clear previous typing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    // Start typing indicator
    if (!isTyping) {
      setIsTyping(true);
      startTyping(selectedContact.contactId);
    }

    // Set new timeout to stop typing
    typingTimeout = setTimeout(() => {
      setIsTyping(false);
      stopTyping(selectedContact.contactId);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const loadConversation = async (contact) => {
    console.log("Loading conversation for contact:", contact);
    if (!contact) return;

    try {
      const conversationData = await getConversation(contact.contactId);
      console.log("Conversation data fetched:", conversationData);
      setCurrentMessages(conversationData.messages || []);

      // Mark messages as read
      await markMessagesAsRead(contact.contactId);

      // Update unread count
      setUnreadCounts((prev) => {
        const newCounts = new Map(prev);
        newCounts.delete(contact.contactId);
        return newCounts;
      });
    } catch (error) {
      console.error("Error loading conversation:", error);
      setCurrentMessages([]);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(search);
    const tokenURL = params.get("token");

    const initializeChat = async () => {
      // Handle Google OAuth callback
      if (tokenURL) {
        setToken(tokenURL);
        localStorage.setItem("token", tokenURL);
        try {
          const response = await axios.get(
            `${API_URL}/api/current_user/${tokenURL}`
          );
          if (response.data.user) {
            setUser(response.data.user);
            localStorage.setItem("user", JSON.stringify(response.data.user));
            navigate("/chat", { replace: true });
            return;
          }
        } catch (error) {
          console.error("Failed to fetch user from token:", error);
          showError("Authentication failed");
          navigate("/signin");
          return;
        }
      }

      // Check if user is authenticated
      if (!token || !user?._id) {
        navigate("/signin");
        return;
      }

      // Fetch contacts
      try {
        await fetchContacts();
      } catch (error) {
        console.error("Failed to fetch contacts:", error);
      }
    };

    initializeChat();
  }, [search, token, user?._id]);

  // Initialize socket connection
  useEffect(() => {
    if (!token || !user?._id) return;

    socket = initializeSocket(token, user);

    // Set up message handlers
    const handleMessage = (messageData) => {
      const { sender, receiver } = messageData;

      // Add to current conversation if it matches selected contact
      if (
        selectedContact &&
        ((sender._id === selectedContact.contactId &&
          receiver._id === user._id) ||
          (sender._id === user._id &&
            receiver._id === selectedContact.contactId))
      ) {
        setCurrentMessages((prev) => {
          // Check if message already exists to avoid duplicates
          const exists = prev.some((msg) => msg._id === messageData._id);
          if (!exists) {
            return [...prev, messageData];
          }
          return prev;
        });
      }

      // Update unread count if message is from another user and not currently selected
      if (
        sender._id !== user._id &&
        (!selectedContact || sender._id !== selectedContact.contactId)
      ) {
        setUnreadCounts((prev) => {
          const newCounts = new Map(prev);
          const currentCount = newCounts.get(sender._id) || 0;
          newCounts.set(sender._id, currentCount + 1);
          return newCounts;
        });
      }
    };

    const handleMessageSent = (messageData) => {
      // Message sent successfully, update UI if needed
      if (
        selectedContact &&
        messageData.receiver._id === selectedContact.contactId
      ) {
        setCurrentMessages((prev) => {
          // Check if message already exists to avoid duplicates
          const exists = prev.some((msg) => msg._id === messageData._id);
          if (!exists) {
            return [...prev, messageData];
          }
          return prev;
        });
      }
    };

    const handleTyping = (data) => {
      const { userId, isTyping } = data;
      setTypingUsers((prev) => {
        const newSet = new Set(prev);
        if (isTyping) {
          newSet.add(userId);
        } else {
          newSet.delete(userId);
        }
        return newSet;
      });
    };

    const handleUserOnline = (data) => {
      const { userId, isOnline } = data;
      setOnlineUsers((prev) => {
        const newSet = new Set(prev);
        if (isOnline) {
          newSet.add(userId);
        } else {
          newSet.delete(userId);
        }
        return newSet;
      });
    };

    const handleOnlineUsersList = (data) => {
      const { onlineUsers } = data;
      const userIds = onlineUsers.map((user) => user.userId);
      setOnlineUsers(new Set(userIds));
    };

    onMessage(handleMessage);
    onMessageSent(handleMessageSent);
    onUserTyping(handleTyping);
    onUserOnline(handleUserOnline);
    onOnlineUsersList(handleOnlineUsersList);

    return () => {
      offMessage(handleMessage);
      offMessageSent(handleMessageSent);
      offUserTyping(handleTyping);
      offUserOnline(handleUserOnline);
      offOnlineUsersList(handleOnlineUsersList);
      disconnectSocket();
    };
  }, [token, user?._id, selectedContact?.contactId]);

  // Load conversation when selected contact changes
  useEffect(() => {
    if (selectedContact) {
      loadConversation(selectedContact);
    } else {
      setCurrentMessages([]);
    }
  }, [selectedContact]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentMessages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, []);

  return (
    <div className="chat-body">
      <GiHamburgerMenu
        className="sidebar-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className={`chat-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-title">Chat-In</h2>
          <FaCog
            className="setting-icon"
            onClick={() => navigate("/profile")}
          />
        </div>

        {contacts.map((contact) => (
          <ChatContainer
            key={contact._id}
            userName={contact.contactName}
            avatarURL={contact.contactAvatarURL}
            contact={contact}
            isOnline={onlineUsers.has(contact.contactId)}
            unreadCount={unreadCounts.get(contact.contactId) || 0}
            isSelected={selectedContact?._id === contact._id}
            onSelect={setSelectedContact}
          />
        ))}

        <div className="sidebar-footer">
          <IoMdAddCircleOutline
            className="chat-add-contact"
            onClick={() => navigate("/add-contact")}
          />
        </div>
      </div>

      {selectedContact ? (
        <div className="chat-panel">
          <div className="chat-title">
            <div className="chat-title-avatar">
              <img
                src={selectedContact.contactAvatarURL}
                alt=""
                className="user-avatar"
              />
              {onlineUsers.has(selectedContact.contactId) && (
                <div className="online-indicator-title"></div>
              )}
            </div>
            <div className="chat-title-info">
              <h3>{selectedContact.contactName}</h3>
              <span
                className={`status-text ${
                  onlineUsers.has(selectedContact.contactId)
                    ? "online"
                    : "offline"
                }`}
              >
                {onlineUsers.has(selectedContact.contactId)
                  ? "Online"
                  : "Offline"}
              </span>
            </div>
          </div>

          <div className="chat-area" ref={chatAreaRef}>
            {currentMessages.map((message) => {
              const isOwnMessage = message.sender._id === user._id;
              return (
                <div
                  key={message._id}
                  className={
                    isOwnMessage ? "message-area-right" : "message-area-left"
                  }
                >
                  <div className="message-content">
                    <p>{message.content}</p>
                    <span className="message-time">
                      {new Date(message.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {isOwnMessage && message.isRead && (
                        <span className="message-read"><FaCheckDouble/></span>
                      )}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Typing indicator */}
            {selectedContact && typingUsers.has(selectedContact.contactId) && (
              <div className="typing-indicator">
                <div className="message-area-left">
                  <div className="typing-animation">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <small
                    style={{
                      marginLeft: "10px",
                      color: "rgba(255,255,255,0.7)",
                      fontSize: "12px",
                    }}
                  >
                    {selectedContact.contactName} is typing...
                  </small>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          <form className="chat-box" onSubmit={handleSubmit}>
            <input
              type="text"
              id="message-box"
              name="message"
              ref={messageRef}
              placeholder={
                isSocketConnected()
                  ? "Type your message..."
                  : "Connecting... You can still type"
              }
              onInput={handleMessageInput}
              onKeyDown={handleKeyPress}
              maxLength={1000}
            />
            <LuSendHorizontal size={45} className="send-button" onClick={handleSubmit} />
          </form>
        </div>
      ) : (
        <div className="select-contact-message">
          <p>Select A Contact To Chat</p>
        </div>
      )}
    </div>
  );
};

export default Chat;

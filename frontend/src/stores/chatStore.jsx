import axios from "axios";
import { createContext, useState } from "react";
import { useNavigate } from "react-router-dom";

export const ChatContext = createContext({
  defaultAvatars: [],
  selectedtAvatar: "",
  setSelectedAvatar: () => { },
  contacts: [],
  selectedContact: {},
  setSelectedContact: () => { },
  user: {},
  messages: [],
  registerUser: () => { },
  loginUser: () => { },
  updateAvatar: () => { },
  token:"",
  setContacts:()=>{},
  getMessages:()=>{},
  setMessages:()=>{},
});

const ChatProvider = ({ children }) => {
  const defaultAvatars = [
    "/default_avatar_1.png",
    "/default_avatar_2.png",
    "/default_avatar_3.png",
    "/default_avatar_4.png",
    "/default_avatar_5.png",
    "/default_avatar_6.png",
    "/default_avatar_7.png",
    "/default_avatar_8.png",
  ];

  const [selectedtAvatar, setSelectedAvatar] = useState(defaultAvatars[0]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') ? localStorage.getItem('token') : "");
  const [contacts, setContacts] = useState([]);
  const [user, setUser] = useState(localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : {});
  const [messages, setMessages] = useState([]);

  const navigate = useNavigate();

  const registerUser = async (formData) => {
    try {
      const res = await axios.post(
        "https://chatin-ln9h.onrender.com/api/auth/signup",
        formData
      )

      if (res) {
        console.log(res.data);
        navigate('/signin');
      }
    } catch (error) {
      alert("Something went wrong!");
      console.log(error);
    }
  }

  const loginUser = async (formData) => {
    try {
      const res = await axios.post(
        "https://chatin-ln9h.onrender.com/api/auth/signin",
        formData
      )
      if (res) {
        console.log(res.data);
        setToken(res.data.data.token);
        setUser(res.data.data.user);
        localStorage.setItem('token', res.data.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.data.user));
        if(res.data.data.user.avatarURL=="" || res.data.data.user.avatarURL=="#") navigate('/avatar');
        else navigate('/chat');
      }
    } catch (error) {
      alert("Something went wrong!");
      console.log(error);
    }
  }

  const updateAvatar = async ({ email, avatarURL }) => {
    try {
      const res = await axios.put(
        "https://chatin-ln9h.onrender.com/api/auth/update",
        { email, avatarURL }
      )
      if (res) {
        console.log(res.data);
        setUser(res.data.updatedUser);
        localStorage.setItem('user', JSON.stringify(res.data.updatedUser));
        navigate('/chat');
      }
    } catch (error) {
      alert("Something went wrong!");
      console.log(error);
    }
  }

  const getMessages = async(userId, token)=>{
    try {
      const res = await axios.get(`https://chatin-ln9h.onrender.com/api/messages/fetch/${userId}`,{
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if(res){
        console.log(res.data);
        setMessages(res.data.data.messages);
      }
    } catch (error) {
      alert("Something went wrong!");
      console.log(error);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        defaultAvatars,
        selectedtAvatar,
        setSelectedAvatar,
        contacts,
        selectedContact,
        setSelectedContact,
        user,
        messages,
        registerUser,
        loginUser,
        updateAvatar,
        token,
        setContacts,
        getMessages,
        setMessages,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export default ChatProvider;

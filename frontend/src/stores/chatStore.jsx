import { createContext, useEffect, useState } from "react";

export const ChatContext = createContext({
  defaultAvatars: [],
  selectedtAvatar: "",
  setSelectedAvatar: () => {},
  contacts: [],
  selectedContact: {},
  setSelectedContact: () => {},
  user:{},
  messages:[],
});

const ChatProvider = ({ children }) => {
  const user = {
    _id: 4,
    userName: "Mohammad Zafar",
    email: "zafar@email.com",
    avatarUrl: "/default_avatar_7.png",
  }
  const contacts = [
    {
      _id: 1,
      userName: "Murari Sarkar",
      email: "murari@email.com",
      avatarUrl: "/default_avatar_2.png",
    },
    {
      _id: 2,
      userName: "Satish Singh",
      email: "saish@email.com",
      avatarUrl: "/default_avatar_3.png",
    },
    {
      _id: 3,
      userName: "Aminul Islam",
      email: "aminul@email.com",
      avatarUrl: "/default_avatar_6.png",
    },
  ];

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

  const messages = [
    {
      id:1,
      sender:"murari@email.com",
      reciever:"zafar@email.com",
      text:"Hello, what are you doing ?"
    },
    {
      id:2,
      sender:"zafar@email.com",
      reciever:"murari@email.com",
      text:"Nothing just chilling."
    },
    {
      id:3,
      sender:"murari@email.com",
      reciever:"zafar@email.com",
      text:"Lets go the gym."
    },
    {
      id:4,
      sender:"murari@email.com",
      reciever:"zafar@email.com",
      text:"We will build our muscles."
    },
    {
      id:5,
      sender:"zafar@email.com",
      reciever:"murari@email.com",
      text:"Naah, I m good here. Prolly next time."
    },
  ]

  const [selectedtAvatar, setSelectedAvatar] = useState(defaultAvatars[0]);
  const [selectedContact, setSelectedContact] = useState(null);

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
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export default ChatProvider;

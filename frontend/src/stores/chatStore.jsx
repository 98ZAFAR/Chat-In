import { createContext, useEffect, useState } from "react";

export const ChatContext = createContext({
  defaultAvatars: [],
  selectedtAvatar: "",
  setSelectedAvatar: () => {},
  contacts:[],
});

const ChatProvider = ({ children }) => {
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

  const [selectedtAvatar, setSelectedAvatar] = useState(defaultAvatars[0]);

  return (
    <ChatContext.Provider
      value={{ defaultAvatars, selectedtAvatar, setSelectedAvatar, contacts }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export default ChatProvider;

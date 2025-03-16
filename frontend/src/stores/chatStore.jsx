import { createContext, useEffect, useState } from "react";

export const ChatContext = createContext({
  defaultAvatars: [],
  selectedtAvatar:"",
  setSelectedAvatar:()=>{},
});

const ChatProvider = ({ children }) => {
  const defaultAvatars = [
    "/public/default_avatar_1.png",
    "/public/default_avatar_2.png",
    "/public/default_avatar_3.png",
    "/public/default_avatar_4.png",
    "/public/default_avatar_5.png",
    "/public/default_avatar_6.png",
    "/public/default_avatar_7.png",
    "/public/default_avatar_8.png",
  ];

  const [selectedtAvatar, setSelectedAvatar] = useState(defaultAvatars[0]);

  return (
    <ChatContext.Provider value={{ defaultAvatars, selectedtAvatar, setSelectedAvatar }}>
      {children}
    </ChatContext.Provider>
  );
};

export default ChatProvider;

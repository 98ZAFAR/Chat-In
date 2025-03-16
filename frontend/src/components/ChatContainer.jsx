import '../css/ChatContainer.css'

const ChatContainer = ({userName, avatarUrl})=>{
    return <>
        <div className="chat-container">
            <div className="user-avatar">
                <img src={avatarUrl} alt="" />
            </div>
            <div className="user-name">
                <p>{userName}</p>
            </div>
        </div>
    </>
};

export default ChatContainer;
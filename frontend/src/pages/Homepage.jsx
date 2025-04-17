import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChatContext } from "../stores/chatStore";

const Homepage = () => {
    const navigate = useNavigate();
    const { token } = useContext(ChatContext);

    console.log(token);
    useEffect(() => {
        if (token) navigate('/chat');
        else navigate('/signup');
    }, [token])
    return <>Homepage</>
}

export default Homepage;
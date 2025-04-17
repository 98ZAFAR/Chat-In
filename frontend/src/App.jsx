import { Outlet} from "react-router-dom";
import ChatProvider from "./stores/chatStore";

const App = () => {
  return (
    <>
      <ChatProvider>
        <Outlet />
      </ChatProvider>
    </>
  );
};

export default App;

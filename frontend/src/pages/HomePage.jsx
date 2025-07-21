import { useChatStore } from "../store/useChatStore";
import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";

const HomePage = () => {
  const { selectedUser } = useChatStore();

  return (
    <div className="h-screen bg-[#1f1c2c] text-white antialiased overflow-hidden px-4 pt-20 pb-4 flex items-center justify-center">
      <div
        className="w-full max-w-6xl h-full bg-[#26203a] rounded-2xl shadow-2xl border border-[#3a3055] overflow-hidden flex"
        style={{ transform: "translateZ(0)" }}
      >
        <Sidebar />
        {selectedUser ? <ChatContainer /> : <NoChatSelected />}
      </div>
    </div>
  );
};

export default HomePage;

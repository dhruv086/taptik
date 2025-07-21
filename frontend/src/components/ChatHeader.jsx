import { X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();

  if (!selectedUser) return null;

  const isOnline = onlineUsers.includes(selectedUser._id);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-[#3a3055] bg-[#1f1c2c] shadow-sm">
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <img
          src={selectedUser.profilePic || "/avatar.png"}
          alt={selectedUser.fullname}
          className="w-10 h-10 rounded-full border object-cover"
        />

        {/* User Info */}
        <div>
          <p className="font-medium text-sm sm:text-base text-white">
            {selectedUser.fullname}
          </p>
          <p
            className={`text-xs ${
              isOnline ? "text-green-400" : "text-zinc-400"
            }`}
          >
            {isOnline ? "Online" : "Offline"}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Future: Video Call button */}
        {/* 
        <button
          title="Video Call"
          className="p-2 rounded-md hover:bg-[#3a3055] transition"
        >
          <Video className="w-5 h-5 text-white" />
        </button>
        */}

        <button
          onClick={() => setSelectedUser(null)}
          title="Close Chat"
          className="p-2 rounded-md hover:bg-[#3a3055] transition"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;

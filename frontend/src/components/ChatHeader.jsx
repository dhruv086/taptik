import { useState } from "react";
import { Video } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import VideoCallModal from "./VideoCallModal";

const ChatHeader = ({ chat, isGroup }) => {
  if (!chat) return null;

  const { setSelectedUser, selectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const [showVideoCall, setShowVideoCall] = useState(false);

  const isUserOnline = !isGroup && chat && onlineUsers?.includes(chat._id);

  const handleClose = () => {
    console.log("Close button clicked");
    setSelectedUser(null);
  };

  const handleVideoCall = () => {
    console.log("Video call button clicked");
    setShowVideoCall(true);
  };

  return (
    <>
      <div className="border-b dark:border-gray-700 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img
            src={chat.profilePic || chat.groupIcon || "/avatar.png"}
            alt={isGroup ? chat.title : chat.username}
            className="h-10 w-10 rounded-full object-cover"
          />
          <div>
            <h2 className="font-semibold dark:text-white">
              {isGroup ? chat.title : chat.username}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isGroup
                ? `${chat.members?.length || 0} members`
                : onlineUsers?.includes(chat._id) ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {!isGroup && (
            <button
              onClick={handleVideoCall}
              className={`text-blue-500 hover:text-blue-700 ${!isUserOnline ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={isUserOnline ? "Start Video Call" : "User must be online to call"}
              disabled={!isUserOnline}
            >
              <Video className="h-6 w-6" />
            </button>
          )}
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            Close
          </button>
        </div>
      </div>

      {/* Video Call Modal */}
      {showVideoCall && selectedUser && (
        <VideoCallModal
          isOpen={showVideoCall}
          onClose={() => setShowVideoCall(false)}
          callee={selectedUser}
          caller={null}
          isCaller={true}
        />
      )}
    </>
  );
};

export default ChatHeader;
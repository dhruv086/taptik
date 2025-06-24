import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import toast from "react-hot-toast";
import { Users, MessageCircleMore, MessageSquareQuote } from "lucide-react";

const Sidebar = () => {
  const { getUsers, users = [], selectedUser, setSelectedUser, isUsersLoading, listenToContacts, notListenToContacts } = useChatStore();
  const { authUser, onlineUsers, socket } = useAuthStore();
  const [typingUsers, setTypingUsers] = useState([]);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  useEffect(() => {
    if (!socket) return;
    const handleTyping = ({ sender }) => {
      setTypingUsers((prev) => [...new Set([...prev, sender])]);
    };
    const handleStopTyping = ({ sender }) => {
      setTypingUsers((prev) => prev.filter((id) => id !== sender));
    };
    socket.on("typing", handleTyping);
    socket.on("stopTyping", handleStopTyping);
    return () => {
      socket.off("typing", handleTyping);
      socket.off("stopTyping", handleStopTyping);
    };
  }, [socket]);

  useEffect(() => {
    listenToContacts();
    return () => notListenToContacts();
  }, [listenToContacts, notListenToContacts]);

  const sortedUsers = [...users]
    .filter(user => user._id !== authUser?._id)
    .sort((a, b) => {
      const aTime = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0;
      const bTime = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0;
      return bTime - aTime;
    });

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center gap-2">
          <Users className="size-6" title="Contacts" />
          <span className="font-medium hidden lg:block">Contacts</span>
        </div>
      </div>
      <div className="overflow-y-auto w-full py-3">
        {sortedUsers.length === 0 ? (
          <div className="text-center text-base-content/60 py-4">
            No contacts found
          </div>
        ) : (
          sortedUsers.map((user) => (
            <button
              key={user._id}
              onClick={() => setSelectedUser(user)}
              className={`
                w-full p-3 flex items-center gap-3
                hover:bg-base-300 transition-colors
                ${selectedUser?._id === user._id ? "bg-base-300 ring-1 ring-base-300" : ""}
              `}
            >
              <div className="relative mx-auto lg:mx-0">
                <img
                  src={user.profilePic || "/avatar.png"}
                  alt={user.fullname}
                  className="size-12 object-cover rounded-full"
                />
                {typingUsers.includes(user._id) ? (
                  <span className="absolute bottom-0 right-0 size-5 bg-base-100 rounded-full flex items-center justify-center">
                    <MessageCircleMore className="text-blue-500 size-4" title="Typing..." />
                  </span>
                ) : user.lastMessage && user.lastMessage.senderId !== authUser?._id && !user.lastMessage.read ? (
                  <span className="absolute bottom-0 right-0 size-5 bg-base-100 rounded-full flex items-center justify-center">
                    <MessageSquareQuote className="text-primary size-4" title="New Message" />
                  </span>
                ) : onlineUsers.includes(user._id) && (
                  <span
                    className="absolute bottom-0 right-0 size-3 bg-green-500 
                    rounded-full ring-2 ring-zinc-900"
                  />
                )}
              </div>

              <div className="hidden lg:block text-left min-w-0">
                <div className="font-medium truncate">{user.fullname}</div>
                <div className="text-sm text-base-content/70">
                  {user.username}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
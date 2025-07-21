import React, { useEffect, useState, useRef } from "react";
import { useChatStore } from "../store/useChatStore";
import MessageInput from "./MessageInput";
import ChatHeader from "./ChatHeader";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { formatMessageTime } from "../lib/utils";
import { useAuthStore } from "../store/useAuthStore";

function getDateLabel(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isToday) return "Today";
  if (isYesterday) return "Yesterday";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function ChatContainer() {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    listenToMessages,
    notListenToMessages,
    markMessagesAsRead,
  } = useChatStore();
  const { authUser, socket } = useAuthStore();
  const messageEndRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (selectedUser?._id) {
      getMessages(selectedUser._id);
      listenToMessages();
      return () => notListenToMessages();
    }
  }, [selectedUser?._id]);

  useEffect(() => {
    if (
      selectedUser?._id &&
      messages.some((m) => m.senderId === selectedUser._id && !m.read)
    ) {
      markMessagesAsRead(selectedUser._id);
    }
  }, [messages, selectedUser]);

  useEffect(() => {
    const container = messageEndRef.current?.parentElement;
    if (!container) return;

    const nearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight <
      200;
    if (nearBottom) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  useEffect(() => {
    if (!socket || !selectedUser) return;

    const handleTyping = ({ sender }) => setIsTyping(true);
    const handleStopTyping = ({ sender }) => setIsTyping(false);

    socket.on("typing", handleTyping);
    socket.on("stopTyping", handleStopTyping);

    return () => {
      socket.off("typing", handleTyping);
      socket.off("stopTyping", handleStopTyping);
    };
  }, [socket, selectedUser]);

  if (!authUser || isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto bg-[#26203a]">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#26203a] border-l border-[#3a3055]">
      <ChatHeader />
      <div
        className={`flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 ${
          isTyping ? "pb-12" : ""
        }`}
      >
        {messages.map((message, idx) => {
          const isOwn = message.senderId === authUser._id;
          const showDate =
            idx === 0 ||
            getDateLabel(message.createdAt) !==
              getDateLabel(messages[idx - 1].createdAt);

          return (
            <React.Fragment key={message._id}>
              {showDate && (
                <div className="w-full flex justify-center my-4">
                  <span className="text-xs text-gray-400 px-3 py-1 rounded-full bg-[#3a3055]">
                    {getDateLabel(message.createdAt)}
                  </span>
                </div>
              )}
              <div
                className={`flex gap-2 ${
                  isOwn ? "justify-end" : "justify-start"
                }`}
                ref={idx === messages.length - 1 ? messageEndRef : null}
              >
                {!isOwn && (
                  <img
                    className="w-10 h-10 rounded-full border object-cover"
                    src={selectedUser.profilePic || "/avatar.png"}
                    alt="avatar"
                  />
                )}
                <div
                  className={`max-w-xs sm:max-w-md px-4 py-2 rounded-xl shadow-sm ${
                    isOwn
                      ? "bg-gradient-to-tr from-pink-500 to-purple-500 text-white rounded-br-none"
                      : "bg-[#3a3055] text-white border border-[#453f5d] rounded-bl-none"
                  }`}
                >
                  {message.image && (
                    <img
                      src={message.image}
                      alt="attachment"
                      className="rounded-md mb-2 max-w-[200px]"
                    />
                  )}
                  {message.text && <p className="text-sm">{message.text}</p>}
                  <p className="text-[10px] text-right mt-1 opacity-60">
                    {formatMessageTime(message.createdAt)}
                  </p>
                </div>
              </div>
            </React.Fragment>
          );
        })}

        {isTyping && (
          <div className="flex items-start gap-2">
            <img
              className="w-10 h-10 rounded-full border object-cover"
              src={selectedUser.profilePic || "/avatar.png"}
              alt="avatar"
            />
            <div className="px-4 py-2 rounded-xl bg-[#3a3055] text-sm text-gray-400 shadow-sm">
              Typing...
            </div>
          </div>
        )}

        <div ref={messageEndRef} />
      </div>
      <MessageInput />
    </div>
  );
}

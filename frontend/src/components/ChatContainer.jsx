import React, { useEffect, useState, useRef } from 'react'
import {useChatStore} from '../store/useChatStore'
import MessageInput from './MessageInput'
import ChatHeader from './ChatHeader'
import MessageSkeleton from './skeletons/MessageSkeleton'
import { formatMessageTime } from "../lib/utils";
import { useAuthStore } from '../store/useAuthStore'

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
  return date.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

export default function ChatContainer() {
  const {messages, getMessages, isMessagesLoading, selectedUser, listenToMessages, notListenToMessages} = useChatStore()
  const {authUser, socket} = useAuthStore()
  const messageEndRef=useRef(null)
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if(selectedUser?._id) {
      getMessages(selectedUser._id);
      listenToMessages();
      return () => notListenToMessages();
    }
  }, [selectedUser?._id, getMessages, listenToMessages, notListenToMessages]);

  useEffect(()=>{
    if(messageEndRef.current){
      messageEndRef.current.scrollIntoView({behavior:"smooth"})
    }
  },[messages, isTyping])

  useEffect(() => {
    if (!socket || !selectedUser) return;

    const handleTyping = ({ sender }) => {
      setIsTyping(true);
    };
    const handleStopTyping = ({ sender }) => {
      setIsTyping(false);
    };

    socket.on("typing", handleTyping);
    socket.on("stopTyping", handleStopTyping);

    return () => {
      socket.off("typing", handleTyping);
      socket.off("stopTyping", handleStopTyping);
    };
  }, [socket, selectedUser]);

  // Wait for authUser to be available
  if (!authUser) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  if(isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }
  
  return (
    <div className='flex-1 flex flex-col overflow-auto'>
      <ChatHeader chat={selectedUser} isGroup={false} />
      <div
        className={`flex-1 overflow-y-auto p-4 space-y-4 transition-all duration-200 ${
          isTyping ? "pb-12" : ""
        }`}
      >
        {messages.map((message, idx) => {
          const isOwnMessage = message.senderId === authUser._id;
          const showDateSeparator =
            idx === 0 ||
            getDateLabel(message.createdAt) !== getDateLabel(messages[idx - 1].createdAt);
          return (
            <React.Fragment key={message._id}>
              {showDateSeparator && (
                <div className="w-full flex justify-center my-2">
                  <span className="bg-base-200 px-4 py-1 rounded-full text-xs text-base-content/60 shadow">
                    {getDateLabel(message.createdAt)}
                  </span>
                </div>
              )}
              <div
                className={`chat ${isOwnMessage ? "chat-end" : "chat-start"}`}
                ref={idx === messages.length - 1 ? messageEndRef : null}
              >
                <div className="chat-image avatar">
                  <div className="size-10 rounded-full border">
                    <img
                      src={
                        isOwnMessage
                          ? authUser.profilePic || "/avatar.png"
                          : selectedUser.profilePic || "/avatar.png"
                      }
                      alt="profile pic"
                    />
                  </div>
                </div>
                <div className="chat-header mb-1">
                  <time className="text-xs opacity-50 ml-1">
                    {formatMessageTime(message.createdAt)}
                  </time>
                </div>
                <div className="chat-bubble flex flex-col">
                  {message.image && (
                    <img
                      src={message.image}
                      alt="Attachment"
                      className="sm:max-w-[200px] rounded-md mb-2"
                    />
                  )}
                  {message.text && <p>{message.text}</p>}
                </div>
              </div>
            </React.Fragment>
          );
        })}

        {/* Typing indicator always at the bottom */}
        {isTyping && (
          <div className="chat chat-start">
            <div className="chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={selectedUser.profilePic || "/avatar.png"}
                  alt="profile pic"
                />
              </div>
            </div>
            <div className="chat-bubble flex flex-col bg-base-300 text-base-content/60">
              <p>Typing...</p>
            </div>
          </div>
        )}

        {/* Always keep the scroll ref at the very end */}
        <div ref={messageEndRef} />
      </div>
      <MessageInput />
    </div>
  )
}

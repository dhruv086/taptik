import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set,get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/friends");
      set({ users: Array.isArray(res.data.data) ? res.data.data : [] });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch users");
      set({ users: [] });
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
       set({ messages: res.data.message });
        // toast.error("Invalid response format from server");
      
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch messages");
      set({ messages: [] });
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  sendMessage:async (messageData)=>{
    const {selectedUser,messages}=get()
    try{
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`,messageData);
      set({messages:[...messages,res.data.message]})
    }catch(error){
      toast.error(error.response.data.message)
    }
  },
  listenToMessages:()=>{
    const {selectedUser} = get()
    if(!selectedUser)return;

    const socket = useAuthStore.getState().socket

    socket.on("newMessage",(newMessage)=>{
      if(newMessage.senderId!==selectedUser._id)return;
      set({
        messages:[...get().messages,newMessage],
      })
    })
  },

  notListenToMessages:()=>{
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage")
  },
  
  setSelectedUser: (selectedUser) => {
    set({ selectedUser });
    if (selectedUser) {
      get().markMessagesAsRead(selectedUser._id);
    }
  },

  listenToContacts: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    socket.on("refreshContacts", () => {
      get().getUsers();
    });
  },
  notListenToContacts: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    socket.off("refreshContacts");
  },
  markMessagesAsRead: async (fromUserId) => {
    try {
      await axiosInstance.put("/messages/mark-read", { fromUserId });
    } catch (error) {
      // Optionally handle error
    }
  },
}));
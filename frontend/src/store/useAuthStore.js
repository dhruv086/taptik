import {create} from 'zustand';
import { axiosInstance } from '../lib/axios.js';
import toast,{Toaster} from 'react-hot-toast';
import { io } from 'socket.io-client';
import { Trophy } from 'lucide-react';

const BASE_URL = import.meta.env.MODE==="development"?"http://localhost:5001" :"/"

export const useAuthStore = create((set,get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  onlineUsers:[],
  socket:null,
  isNotificationLoading:false,
  notifications:[],

  getUnreadNotificationsCount: () => {
    const { notifications } = get();
    
    if (!notifications || !Array.isArray(notifications)) {
      // console.log("getUnreadNotificationsCount - notifications is not an array, returning 0");
      return 0;
    }
    
    const unreadNotifications = notifications.filter(notif => {
      // console.log("Checking notification:", notif);
      // console.log("Notification read field:", notif.read);
      // console.log("Notification read field type:", typeof notif.read);
      return !notif.read;
    });
    
    // console.log("getUnreadNotificationsCount - unreadNotifications:", unreadNotifications);
    const unreadCount = unreadNotifications.length;
    // console.log("getUnreadNotificationsCount - unreadCount:", unreadCount);
    return unreadCount;
  },

  isCheckingAuth: true,

  checkAuth: async()=>{
    try{
      const res = await axiosInstance.get('/auth/getuser');
      set({authUser:res.data.message})
      get().connectSocket();
      get().allNotifications();

    }catch (error) {
      if (error?.response?.status !== 401) {
        toast.error("Error checking authentication status");
        console.error("Error checking authentication:", error);
      }
      set({authUser: null});
    }finally{
      set({isCheckingAuth: false});
    }
  },
  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      toast.success("Account created successfully");
      window.location.reload();
      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isSigningUp: false });
    }
  },

  login:async(data)=>{
    set({ isLoggingIn:true});
    try{
      const res = await axiosInstance.post("/auth/login",data)
      set({authUser:res.data})
      toast.success("logged in successfully")
      // Fetch notifications after login
      get().allNotifications();
      window.location.reload();
      get().connectSocket();
    }catch(error){
      toast.error(error.response.data.data)
    }finally{
      set({isLoggingIn:false})
    }
  },
  logout:async()=>{
    try{
      await axiosInstance.post("/auth/logout")
      set({authUser:null})
      toast.success("logged out successfully")
      get().disconnectSocket();
    }catch(error){
      toast.error(error.response.data.message)
    }
  },
  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      // console.log("error in update profile:", error);
      toast.error(error.response.data.message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },
  allNotifications:async()=>{
    set({isNotificationLoading:true});
    try {
      const res=await axiosInstance.get("/auth/notification")
      set({notifications:res.data.message})
    } catch (error) {
      toast.error(error.response?.message?.message,"error fetching notification")
    }finally{
      set({isNotificationLoading:false})
    }
  },
  markNotificationsAsRead:async()=>{
    // console.log("markNotificationsAsRead called");
    try {
      const res=await axiosInstance.put("/auth/mark-notifications-read")
      // console.log("markNotificationsAsRead response:", res.data);
      set({notifications:res.data.message})
      // console.log("Notifications updated in store");
    } catch (error) {
      console.error("Error marking notifications as read:", error);
      toast.error(error.response?.data?.message,"error marking notifications as read")
    }
  },
  connectSocket:()=>{
    const {authUser} = get()
    if(!authUser||get().socket?.connected) return;

    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id
      }
    });

    socket.on("connect", () => {
      // console.log("Socket connected with userId:", authUser._id);
    });

    // Listen for new notifications
    socket.on("newNotification", (notif) => {
      set((state) => ({
        notifications: [notif, ...state.notifications]
      }));
    });

    // Listen for new friend requests
    socket.on("newFriendRequest", async (request) => {
      try {
        const requesterRes = await axiosInstance.get(`/auth/getuser/${request.requester}`);
        const requester = requesterRes.data.message;
        const notif = {
          message: `${requester.fullname} (@${requester.username}) sent you a friend request`,
          read: false,
          createdAt: new Date(),
        };
        set((state) => ({
          notifications: [notif, ...state.notifications]
        }));
        toast.success("New friend request received!");
      } catch (error) {
        console.error("Error processing friend request:", error);
      }
    });

    socket.connect();
    set({socket:socket});

    socket.on("getOnlineUsers",(usersIds)=>{
      set({onlineUsers:usersIds})
    });
  },
  disconnectSocket:()=>{
    if(get().socket?.connected) {
      // console.log("Disconnecting socket");
      get().socket.disconnect();
    }
  }


}));
import {create} from 'zustand';
import { axiosInstance } from '../lib/axios.js';
import toast,{Toaster} from 'react-hot-toast';
import { io } from 'socket.io-client';

const BASE_URL = import.meta.env.MODE==="development"?"http://localhost:5001" :"/"

export const useAuthStore = create((set,get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  onlineUsers:[],
  socket:null,


  isCheckingAuth: true,

  checkAuth: async()=>{
    try{
      const res = await axiosInstance.get('/auth/getuser');
      set({authUser:res.data.message})
      get().connectSocket();

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
      console.log("error in update profile:", error);
      toast.error(error.response.data.message);
    } finally {
      set({ isUpdatingProfile: false });
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
      console.log("Socket connected with userId:", authUser._id);
    });

    socket.connect();
    set({socket:socket});

    socket.on("getOnlineUsers",(usersIds)=>{
      set({onlineUsers:usersIds})
    });
  },
  disconnectSocket:()=>{
    if(get().socket?.connected) {
      console.log("Disconnecting socket");
      get().socket.disconnect();
    }
  }


}));
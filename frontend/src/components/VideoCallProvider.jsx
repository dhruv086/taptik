import { createContext, useContext, useEffect, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import VideoCallModal from "./VideoCallModal";

const VideoCallContext = createContext();

export const useVideoCall = () => useContext(VideoCallContext);

const VideoCallProvider = ({ children }) => {
  const { socket, user, onlineUsers } = useAuthStore();
  const { selectedUser } = useChatStore();
  const [callState, setCallState] = useState(null); // null | { type, from, to, isCaller }
  const [busy, setBusy] = useState(false);

  // Listen for incoming call requests
  useEffect(() => {
    if (!socket || !user) return;

    const handleCallRequest = ({ from }) => {
      console.log("[VideoCallProvider] Received webrtc_call_request from", from);
      if (busy) {
        socket.emit("webrtc_call_reject", { to: from });
        return;
      }
      setCallState({ type: "incoming", from, to: user._id, isCaller: false });
      console.log("[VideoCallProvider] Setting callState to incoming", { from, to: user._id });
      setBusy(true);
    };

    const handleCallReject = () => {
      setCallState(null);
      setBusy(false);
      alert("Call was rejected or user is busy.");
    };

    socket.on("webrtc_call_request", handleCallRequest);
    socket.on("webrtc_call_reject", handleCallReject);
    socket.on("webrtc_call_ended", () => {
      setCallState(null);
      setBusy(false);
    });

    return () => {
      socket.off("webrtc_call_request", handleCallRequest);
      socket.off("webrtc_call_reject", handleCallReject);
      socket.off("webrtc_call_ended");
    };
  }, [socket, user, busy]);

  // Outgoing call
  const startCall = (callee) => {
    if (!socket || !user || !callee) return;
    if (!onlineUsers.includes(callee._id)) {
      alert("User is not online");
      return;
    }
    console.log("[VideoCallProvider] Emitting webrtc_call_request", { to: callee._id, from: user._id });
    setCallState({ type: "outgoing", from: user, to: callee, isCaller: true });
    setBusy(true);
    socket.emit("webrtc_call_request", { to: callee._id, from: user._id });
  };

  // Accept call
  const acceptCall = () => {
    setCallState((prev) => ({ ...prev, accepted: true }));
  };

  // Reject call
  const rejectCall = () => {
    if (callState && callState.from) {
      socket.emit("webrtc_call_reject", { to: callState.from });
    }
    setCallState(null);
    setBusy(false);
  };

  // End call
  const endCall = () => {
    if (callState && callState.isCaller && callState.to) {
      socket.emit("webrtc_call_ended", { to: callState.to._id || callState.to });
    } else if (callState && !callState.isCaller && callState.from) {
      socket.emit("webrtc_call_ended", { to: callState.from });
    }
    setCallState(null);
    setBusy(false);
  };

  return (
    <VideoCallContext.Provider value={{ startCall, acceptCall, rejectCall, endCall, callState, busy }}>
      {children}
      {callState && (
        console.log("[VideoCallProvider] Rendering VideoCallModal with callState:", callState),
        <VideoCallModal
          isOpen={!!callState}
          onClose={endCall}
          callee={callState.isCaller ? callState.to : user}
          caller={callState.isCaller ? user : callState.from}
          isCaller={callState.isCaller}
          callState={callState}
          acceptCall={acceptCall}
          rejectCall={rejectCall}
        />
      )}
    </VideoCallContext.Provider>
  );
};

export default VideoCallProvider; 
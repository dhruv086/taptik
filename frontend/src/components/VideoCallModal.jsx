import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useVideoCall } from "./VideoCallProvider";

const iceServers = {
  iceServers: [
    { urls: "stun:global.stun.xirsys.com" },
    {
      urls: [
        "turn:global.turn.xirsys.com:3478?transport=udp",
        "turn:global.turn.xirsys.com:3478?transport=tcp",
        "turn:global.turn.xirsys.com:5349?transport=udp",
        "turn:global.turn.xirsys.com:5349?transport=tcp"
      ],
      username: "dhruv086",
      credential: "af5cb17c-5033-11f0-b5c5-0242ac150002"
    }
  ]
};

const VideoCallModal = ({ isOpen, onClose, callee, caller, isCaller, callState, acceptCall, rejectCall }) => {
  console.log("[VideoCallModal] Rendered", { isOpen, callState, isCaller, callee, caller });
  const { socket, user } = useAuthStore();
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnection = useRef(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [connectionState, setConnectionState] = useState("idle");

  // Start local stream on open
  useEffect(() => {
    if (!isOpen) return;
    if (!socket) return;
    const startLocalStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        alert("Could not access camera/microphone");
        onClose();
      }
    };
    startLocalStream();
  }, [isOpen, socket, onClose]);

  // Setup signaling and peer connection
  useEffect(() => {
    if (!isOpen || !socket || !localStream) return;
    peerConnection.current = new RTCPeerConnection(iceServers);
    localStream.getTracks().forEach(track => {
      peerConnection.current.addTrack(track, localStream);
    });
    peerConnection.current.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };
    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("webrtc_ice_candidate", {
          to: isCaller ? callee._id : caller._id,
          candidate: event.candidate,
        });
      }
    };
    // Handle signaling events
    socket.on("webrtc_offer", async ({ from, offer }) => {
      if (!isCaller) {
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnection.current.createAnswer();
        await peerConnection.current.setLocalDescription(answer);
        socket.emit("webrtc_answer", {
          to: from,
          answer,
        });
        setConnectionState("in-call");
      }
    });
    socket.on("webrtc_answer", async ({ answer }) => {
      if (isCaller) {
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
        setConnectionState("in-call");
      }
    });
    socket.on("webrtc_ice_candidate", async ({ candidate }) => {
      try {
        await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {}
    });
    socket.on("webrtc_call_ended", () => {
      endCall();
    });
    // If caller and call accepted, create offer
    if (isCaller && (!callState || callState.accepted)) {
      (async () => {
        const offer = await peerConnection.current.createOffer();
        await peerConnection.current.setLocalDescription(offer);
        socket.emit("webrtc_offer", {
          to: callee._id,
          offer,
        });
      })();
    }
    return () => {
      socket.off("webrtc_offer");
      socket.off("webrtc_answer");
      socket.off("webrtc_ice_candidate");
      socket.off("webrtc_call_ended");
    };
    // eslint-disable-next-line
  }, [isOpen, socket, localStream, isCaller, callee, caller, callState]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const endCall = () => {
    setConnectionState("ended");
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    setLocalStream(null);
    setRemoteStream(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-lg flex flex-col items-center">
        <div className="flex justify-between w-full mb-2">
          <h2 className="text-lg font-semibold">
            {isCaller && (!callState || callState.type === "outgoing") && "Calling..."}
            {!isCaller && callState && callState.type === "incoming" && "Incoming Call"}
            {((callState && callState.accepted) || connectionState === "in-call") && "In Call"}
            {connectionState === "ended" && "Call Ended"}
          </h2>
          <button onClick={endCall} className="text-red-500 hover:text-red-700">
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="flex flex-col md:flex-row gap-4 w-full justify-center items-center">
          <video ref={localVideoRef} autoPlay muted playsInline className="w-40 h-40 bg-black rounded-lg" />
          <video ref={remoteVideoRef} autoPlay playsInline className="w-40 h-40 bg-black rounded-lg" />
        </div>
        {!isCaller && callState && callState.type === "incoming" && !callState.accepted && (
          <div className="flex gap-4 mt-4">
            <button
              onClick={acceptCall}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Accept
            </button>
            <button
              onClick={rejectCall}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Reject
            </button>
          </div>
        )}
        {isCaller && (!callState || callState.type === "outgoing") && <p className="mt-4">Waiting for answer...</p>}
      </div>
    </div>
  );
};

export default VideoCallModal; 
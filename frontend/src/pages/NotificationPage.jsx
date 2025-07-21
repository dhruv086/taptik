import React, { useEffect, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import NotificationSkeleton from "../components/skeletons/NotificationSkeleton";
import { Globe, Mail, CircleAlert, UserPlus, Check, X } from "lucide-react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

function NotificationPage() {
  const { isNotificationLoading, notifications = [], allNotifications } = useAuthStore();
  const [friendRequests, setFriendRequests] = useState([]);
  const [isFriendRequestLoading, setIsFriendRequestLoading] = useState(true);

  useEffect(() => {
    allNotifications();
    fetchFriendRequests();
  }, [allNotifications]);

  const fetchFriendRequests = async () => {
    setIsFriendRequestLoading(true);
    try {
      const { data } = await axiosInstance.get("/friends/requests/pending");
      setFriendRequests(data.data);
    } catch (error) {
      if (error.response?.status !== 404) {
        toast.error("Failed to fetch friend requests");
      }
    } finally {
      setIsFriendRequestLoading(false);
    }
  };

  const handleRequestUpdate = async (requestId, status) => {
    try {
      await axiosInstance.put(`/friends/request/${requestId}`, { status });
      toast.success(`Friend request ${status}`);
      setFriendRequests(friendRequests.filter((req) => req._id !== requestId));
    } catch (error) {
      toast.error("Failed to update friend request");
    }
  };

  if (isNotificationLoading || isFriendRequestLoading) return <NotificationSkeleton />;

  return (
    <div className="min-h-screen bg-[#1f1c2c] text-white antialiased px-4 py-20">
      <div className="max-w-2xl mx-auto">
        <div
          className="bg-[#26203a] rounded-2xl p-6 shadow-2xl space-y-8"
          style={{ imageRendering: "auto", transform: "translateZ(0)" }}
        >
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-bold">Notifications</h2>
            <p className="text-sm text-gray-400">All your recent activity</p>
          </div>

          <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
            {/* Friend Requests */}
            {friendRequests.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <UserPlus />
                  Friend Requests
                </h3>
                {friendRequests.map((req) => (
                  <div
                    key={req._id}
                    className="bg-[#3a3055] px-4 py-3 rounded-xl shadow flex items-center gap-3"
                  >
                    <div className="avatar">
                      <div className="w-10 rounded-full">
                        <img src={req.requester.profilePic || "/avatar.png"} alt="avatar" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-white">
                        <span className="font-bold">{req.requester.fullname}</span> (@{req.requester.username}) sent you a friend request.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="btn btn-sm btn-success btn-circle"
                        onClick={() => handleRequestUpdate(req._id, "accepted")}
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        className="btn btn-sm btn-error btn-circle"
                        onClick={() => handleRequestUpdate(req._id, "rejected")}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* General Notifications */}
            <div className="space-y-4">
              {friendRequests.length > 0 && notifications.length > 0 && (
                <div className="border-t border-gray-600" />
              )}

              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Mail />
                General Notifications
              </h3>

              {notifications.length === 0 && friendRequests.length === 0 ? (
                <div className="text-center text-gray-400 py-4">No notifications yet.</div>
              ) : notifications.length === 0 && friendRequests.length > 0 ? (
                <div className="text-center text-gray-400 py-4">No general notifications.</div>
              ) : (
                notifications.map((notif, idx) => (
                  <div
                    key={idx}
                    className="bg-[#3a3055] px-4 py-3 rounded-xl shadow flex items-start gap-3"
                  >
                    <div className="flex-shrink-0 mt-1">
                      {notif.isSerious ? (
                        <CircleAlert className="w-5 h-5 text-red-500" />
                      ) : (
                        <Globe className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 text-sm text-white">{notif.message}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotificationPage;

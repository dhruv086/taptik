import React, { useEffect } from 'react'
import { useAuthStore } from '../store/useAuthStore';
import NotificationSkeleton from '../components/skeletons/NotificationSkeleton';
import { Globe, Mail,CircleAlert } from 'lucide-react';

function NotificationPage() {
  const {isNotificationLoading, notifications = [], allNotifications} = useAuthStore();

  useEffect(() => {
    allNotifications();
  }, [allNotifications]);

  if(isNotificationLoading) return <NotificationSkeleton />;
  
  return (
    <div className="h-screen pt-20">
      <div className="max-w-2xl mx-auto p-4 py-8">
        <div className="bg-base-300 rounded-xl p-6 space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold">Notifications</h2>
            <p className="mt-2">All your recent notifications</p>
          </div>
          <div className="space-y-4 h-110 overflow-y-auto pr-2">
            {notifications.length === 0 ? (
              <div className="text-center text-gray-400">No notifications</div>
            ) : (
              notifications.map((notif, idx) => (
                <div
                  key={idx}
                  className="bg-base-100 px-4 py-3 rounded-lg shadow flex items-start gap-3"
                >
                  <div className="flex-shrink-0 mt-1">
                    {notif.isSerious ? (
                      <CircleAlert className="w-5 h-5 text-red-500" />
                    ) : (
                      <Mail className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">{notif.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotificationPage
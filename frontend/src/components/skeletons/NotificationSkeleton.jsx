const NotificationSkeleton = () => {
  const skeletonNotifications = Array(4).fill(null);

  return (
    <div className="h-screen pt-20">
      <div className="max-w-2xl mx-auto p-4 py-8">
        <div className="bg-base-300 rounded-xl p-6 space-y-8">
          <div className="text-center">
            <div className="skeleton h-8 w-48 mx-auto mb-2" />
            <div className="skeleton h-4 w-64 mx-auto" />
          </div>
          <div className="space-y-4 h-110 overflow-y-auto pr-2">
            {skeletonNotifications.map((_, idx) => (
              <div
                key={idx}
                className="bg-base-100 px-4 py-3 rounded-lg shadow"
              >
                <div className="flex items-start gap-3">
                  <div className="skeleton size-10 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-4 w-3/4" />
                    <div className="skeleton h-3 w-1/2" />
                    <div className="skeleton h-3 w-1/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSkeleton; 
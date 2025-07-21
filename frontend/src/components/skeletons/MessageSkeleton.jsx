const MessageSkeleton = () => {
  const skeletonMessages = Array(6).fill(null);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col items-center justify-center">
      {/* Loader Circle */}
      <span className="loading loading-infinity loading-lg text-primary mb-6"></span>
      {skeletonMessages.map((_, idx) => (
        <div key={idx} className={`chat ${idx % 2 === 0 ? "chat-start" : "chat-end"}`}>
          <div className="chat-image avatar">
            <div className="size-10 rounded-full">
              <div className="skeleton w-full h-full rounded-full" />
            </div>
          </div>

          <div className="chat-header mb-1">
            <div className="skeleton h-4 w-16" />
          </div>

          <div className="chat-bubble bg-base-300 p-3 rounded-xl">
            <div className="skeleton h-4 w-40 mb-2" />
            <div className="skeleton h-4 w-24" />
          </div>

          <div className="chat-footer mt-1">
            <div className="skeleton h-3 w-10" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessageSkeleton;

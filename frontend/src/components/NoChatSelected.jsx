import { MessageSquare } from "lucide-react";

const NoChatSelected = () => {
  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center p-16 bg-[#1f1c2c] text-white translate-z-0 antialiased">
      <div className="max-w-md text-center space-y-8">
        {/* Glowing Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#5f4b8b] to-[#201c3c] shadow-[0_0_20px_#a78bfa80] flex items-center justify-center animate-pulse">
            <MessageSquare className="w-9 h-9 text-white drop-shadow-glow" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-3xl font-extrabold tracking-wide bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text">
          No Conversation Selected
        </h2>

        {/* Description */}
        <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
          Select a user from the sidebar to start a conversation or explore your recent messages. We’re waiting to connect you.
        </p>
      </div>
    </div>
  );
};

export default NoChatSelected;

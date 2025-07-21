import { useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { Image, Send, X } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/useAuthStore";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const typingTimeout = useRef(null);

  const { sendMessage, selectedUser } = useChatStore();
  const { socket, authUser } = useAuthStore();

  const handleInputChange = (e) => {
    setText(e.target.value);

    if (socket && selectedUser && authUser) {
      socket.emit("typing", {
        receiverId: selectedUser._id,
        sender: authUser._id,
      });

      clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => {
        socket.emit("stopTyping", {
          receiverId: selectedUser._id,
          sender: authUser._id,
        });
      }, 1000);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file?.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;

    try {
      await sendMessage({ text: text.trim(), image: imagePreview });
      setText("");
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className="w-full px-4 py-3 border-t border-[#3a3055] bg-[#1f1c2c]">
      {imagePreview && (
        <div className="mb-3">
          <div className="relative w-fit">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-24 h-24 rounded-xl border border-[#3a3055] object-cover"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute -top-2 -right-2 bg-[#26203a] hover:bg-[#3a3055] rounded-full p-1 transition"
              title="Remove Image"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <input
          type="text"
          value={text}
          onChange={handleInputChange}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 rounded-lg border border-[#3a3055] bg-[#26203a] text-white outline-none focus:ring-2 focus:ring-[#3a3055] placeholder:text-zinc-400 text-sm sm:text-base"
        />

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageChange}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 rounded-lg hover:bg-[#3a3055] transition hidden sm:block"
          title="Attach Image"
        >
          <Image className="w-5 h-5 text-white" />
        </button>

        <button
          type="submit"
          disabled={!text.trim() && !imagePreview}
          className="p-2 rounded-lg bg-gradient-to-br from-pink-600 to-purple-600 text-white hover:opacity-90 transition disabled:opacity-50"
          title="Send"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;

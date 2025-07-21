import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import {
  Bell,
  LogOut,
  MessageSquare,
  Search,
  User,
} from "lucide-react";

const Navbar = () => {
  const {
    logout,
    authUser,
    getUnreadNotificationsCount,
    markNotificationsAsRead,
  } = useAuthStore();
  const navigate = useNavigate();

  const unreadCount = getUnreadNotificationsCount();

  const handleBellClick = async () => {
    if (unreadCount > 0) {
      await markNotificationsAsRead();
    }
    navigate("/notifications");
  };

  return (
    <header className="w-full fixed top-0 z-40 bg-[#1f1c2c] border-b border-[#3a3055] text-white translate-z-0 antialiased">
      <div className="max-w-7xl mx-auto px-4 h-16">
        <div className="flex items-center justify-between h-full">
          {/* Logo + Brand */}
          <Link
            to="/"
            className="flex items-center gap-2.5 hover:text-purple-400 transition"
          >
            <div className="size-9 rounded-lg bg-[#3a3055] flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-wide">TAPTIK</span>
          </Link>

          {/* Actions */}
          {authUser && (
            <div className="flex items-center gap-3">
              <Link
                to="/search"
                className="p-2 rounded-md hover:bg-[#3a3055] transition"
                title="Search"
              >
                <Search className="w-5 h-5 text-white" />
              </Link>

              <div className="relative">
                <button
                  type="button"
                  onClick={handleBellClick}
                  className="p-2 rounded-md hover:bg-[#3a3055] transition"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5 text-white" />
                </button>
                {unreadCount > 0 && (
                  <>
                    <span className="absolute -top-1 -right-1 size-3 rounded-full bg-green-500 border-2 border-[#1f1c2c]" />
                    <span className="absolute -top-1 -right-1 size-3 rounded-full bg-green-500 animate-ping opacity-75" />
                  </>
                )}
              </div>

              <Link
                to="/profile"
                className="px-3 py-1.5 flex items-center gap-2 rounded-md bg-[#26203a] hover:bg-[#3a3055] transition"
                title="Profile"
              >
                <User className="w-5 h-5 text-white" />
                <span className="hidden sm:inline text-sm font-medium">Profile</span>
              </Link>

              <button
                onClick={logout}
                className="px-3 py-1.5 flex items-center gap-2 rounded-md bg-[#26203a] hover:bg-[#3a3055] transition text-sm font-medium"
                title="Logout"
              >
                <LogOut className="w-5 h-5 text-white" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;

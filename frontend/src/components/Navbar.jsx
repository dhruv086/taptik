import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { Bell, Group, LogOut, MessageSquare, Search, Settings, User, Users } from "lucide-react";
import toast, {Toaster} from "react-hot-toast";

const Navbar = () => {
  const { logout, authUser, getUnreadNotificationsCount, notifications, markNotificationsAsRead } = useAuthStore();
  const navigate = useNavigate();

  const unreadCount = getUnreadNotificationsCount();

  const handleBellClick = async () => {
    if (unreadCount > 0) {
      await markNotificationsAsRead();
    }
    navigate("/notifications");
  };

  return (
    <header
      className="bg-base-100 border-b border-base-300 fixed w-full top-0 z-40 
    backdrop-blur-lg bg-base-100/80"
    >
      <div className="container mx-auto px-4 h-16">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-all">
              <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-lg font-bold">TAPTIK</h1>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {authUser && (
              <>
                <Link to={"/search"} className={`btn btn-sm btn-ghost btn-circle`}>
                  <Search className="size-5" />
                </Link>
                <div className="relative">
                  <button type="button" className="btn btn-xs btn-ghost btn-circle gap-4  mr-2" >
                    <Group className="size-5" />
                  </button>
                  <button type="button" className="btn btn-sm btn-ghost btn-circle gap-4" onClick={handleBellClick}>
                    <Bell className="size-5" />
                  </button>
                  {unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 size-3 bg-green-500 rounded-full border-2 border-base-100 animate-pulse"></div>
                  )}
                </div>

                <Link to={"/profile"} className={`btn btn-sm gap-2`}>
                  <User className="size-5" />
                  <span className="hidden sm:inline">Profile</span>
                </Link>

                <button className="flex gap-2 items-center" onClick={logout}>
                  <LogOut className="size-5" />
                  <span className="hidden sm:inline cursor-pointer">Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
export default Navbar;
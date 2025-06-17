import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import toast from "react-hot-toast";
import { Users } from "lucide-react";

const Sidebar = () => {
  const { getUsers, users = [], selectedUser, setSelectedUser, isUsersLoading } = useChatStore();
  const { authUser } = useAuthStore();
  console.log(users)

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center gap-2">
          <Users className="size-6" />
          <span className="font-medium hidden lg:block">Contacts</span>
        </div>
      </div>
      <div className="overflow-y-auto w-full py-3">
        {users.length === 0 ? (
          <div className="text-center text-base-content/60 py-4">
            No contacts found
          </div>
        ) : (
          users
            .filter(user => user._id !== authUser?._id)
            .map((user) => (
              <button
                key={user._id}
                onClick={() => setSelectedUser(user)}
                className={`
                  w-full p-3 flex items-center gap-3
                  hover:bg-base-300 transition-colors
                  ${selectedUser?._id === user._id ? "bg-base-300 ring-1 ring-base-300" : ""}
                `}
              >
                <div className="relative mx-auto lg:mx-0">
                  <img
                    src={user.profilePic || "/avatar.png"}
                    alt={user.fullName}
                    className="size-12 object-cover rounded-full"
                  />
                </div>

                <div className="hidden lg:block text-left min-w-0">
                  <div className="font-medium truncate">{user.fullname}</div>
                  <div className="text-sm text-base-content/70">
                    {user.email}
                  </div>
                </div>
              </button>
            ))
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
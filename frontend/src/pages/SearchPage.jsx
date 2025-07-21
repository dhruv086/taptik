import React, { useState } from 'react';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';
import { Loader2, Search, Send } from 'lucide-react';

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingRequest, setIsSendingRequest] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    try {
      const { data } = await axiosInstance.get(`/friends/search?query=${searchQuery}`);
      setUsers(data.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to search for users');
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendRequest = async (recipientId) => {
    setIsSendingRequest(recipientId);
    try {
      await axiosInstance.post('/friends/request', { recipientId });
      toast.success('Friend request sent!');
      setUsers((prev) =>
        prev.map((u) =>
          u._id === recipientId ? { ...u, friendshipStatus: 'pending' } : u
        )
      );
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send request');
    } finally {
      setIsSendingRequest(null);
    }
  };

  return (
    <div className="min-h-screen pt-20 px-4 bg-[#0e0b1f] text-white antialiased">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-extrabold tracking-tight mb-6 text-white">Find Friends</h1>

        {/* Search Bar */}
        <form
          onSubmit={handleSearch}
          className="flex items-center gap-2 mb-8"
        >
          <input
            type="text"
            placeholder="Search username or fullname"
            className="flex-1 px-4 py-2.5 bg-[#1a162b] text-white border border-[#3f3a58] rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            type="submit"
            className="p-2.5 bg-purple-600 hover:bg-purple-700 rounded-lg transition duration-200"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <Search className="w-5 h-5" />}
          </button>
        </form>

        {/* Search Results */}
        <div className="space-y-4">
          {users.length > 0 ? (
            users.map((user) => (
              <div
                key={user._id}
                className="flex items-center justify-between bg-[#1b172e] border border-[#3a3355] px-5 py-4 rounded-xl shadow-[0_0_12px_rgba(139,92,246,0.05)] transition hover:shadow-[0_0_20px_rgba(139,92,246,0.1)]"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={user.profilePic || '/avatar.png'}
                    alt="avatar"
                    className="w-12 h-12 rounded-full object-cover border-2 border-[#4e437a]"
                  />
                  <div>
                    <p className="font-semibold">{user.fullname}</p>
                    <p className="text-sm text-zinc-400">@{user.username}</p>
                  </div>
                </div>

                {/* Request Button */}
                <button
                  className={`px-3 py-1.5 text-sm flex items-center gap-1.5 rounded-lg font-medium transition-all duration-200 ${
                    user.friendshipStatus === 'friends'
                      ? 'bg-green-700 cursor-default'
                      : user.friendshipStatus === 'pending'
                      ? 'bg-zinc-600 cursor-default'
                      : 'bg-purple-600 hover:bg-purple-700'
                  }`}
                  onClick={() =>
                    user.friendshipStatus === 'friends' ||
                    user.friendshipStatus === 'pending'
                      ? null
                      : handleSendRequest(user._id)
                  }
                  disabled={
                    isSendingRequest === user._id ||
                    user.friendshipStatus === 'pending' ||
                    user.friendshipStatus === 'friends'
                  }
                >
                  {user.friendshipStatus === 'friends' ? (
                    'Friends'
                  ) : user.friendshipStatus === 'pending' ? (
                    'Pending'
                  ) : isSendingRequest === user._id ? (
                    <Loader2 className="animate-spin w-4 h-4" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" /> Request
                    </>
                  )}
                </button>
              </div>
            ))
          ) : (
            !isLoading && (
              <p className="text-sm text-zinc-500 text-center mt-10">
                No users found. Try refining your search.
              </p>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;

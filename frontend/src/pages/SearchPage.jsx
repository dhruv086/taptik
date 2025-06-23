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
            setUsers(users.map(u => u._id === recipientId ? {...u, requestSent: true} : u));
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send request');
        } finally {
            setIsSendingRequest(null);
        }
    };

    return (
        <div className="p-4 md:p-6 lg:p-8">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-2xl font-bold mb-4">Find Friends</h1>
                <form onSubmit={handleSearch} className="flex gap-2 mb-6">
                    <input
                        type="text"
                        placeholder="Search by username or fullname..."
                        className="input input-bordered w-full"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button type="submit" className="btn btn-primary" disabled={isLoading}>
                        {isLoading ? <Loader2 className="animate-spin" /> : <Search />}
                    </button>
                </form>

                <div className="space-y-3">
                    {users.length > 0 ? (
                        users.map((user) => (
                            <div key={user._id} className="flex items-center justify-between p-3 bg-base-200 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="avatar">
                                        <div className="w-12 rounded-full">
                                            <img src={user.profilePic || '/avatar.png'} alt="user avatar" />
                                        </div>
                                    </div>
                                    <div>
                                        <p className="font-bold">{user.fullname}</p>
                                        <p className="text-sm text-base-content/70">@{user.username}</p>
                                    </div>
                                </div>
                                <button
                                    className="btn btn-primary btn-sm"
                                    onClick={() => handleSendRequest(user._id)}
                                    disabled={isSendingRequest === user._id || user.friendshipStatus === 'pending' || user.friendshipStatus === 'friends'}
                                >
                                    {user.friendshipStatus === 'friends' ? (
                                        'Friends'
                                    ) : user.friendshipStatus === 'pending' ? (
                                        'Request Sent'
                                    ) : isSendingRequest === user._id ? (
                                        <Loader2 className="animate-spin" />
                                    ) : (
                                        <Send className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                        ))
                    ) : (
                       !isLoading && <p>No users found. Try another search.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SearchPage; 
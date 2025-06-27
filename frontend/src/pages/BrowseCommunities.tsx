import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCommunityStore } from '../store/useCommunityStore';
import { useAuthStore } from '../store/useAuthStore';
import { Search, Loader2, X, ArrowLeft, Users } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function BrowseCommunities() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    allCommunities,
    loading,
    fetchAllCommunities,
    joinCommunity,
  } = useCommunityStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isJoining, setIsJoining] = useState<string | null>(null);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAllCommunities(searchQuery);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchQuery, fetchAllCommunities]);

  // Fetch data on mount
  useEffect(() => {
    if (user) {
      fetchAllCommunities();
    }
  }, [user, fetchAllCommunities]);

  const handleJoin = async (communityId: string) => {
    try {
      setIsJoining(communityId);
      const success = await joinCommunity(communityId);
      if (success) {
        toast.success('Successfully joined the community!, u can now access it from "your CommunityPage"');
      }
    } catch (error) {
      console.error('Error joining community:', error);
    } finally {
      setIsJoining(null);
    }
  };

  // Show loading state only on initial load
  if (loading && allCommunities.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </button>
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Browse Communities</h1>
              <p className="mt-1 sm:mt-2 text-sm text-gray-600">
                Discover and join developer communities
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-12 sm:text-sm border-gray-300 rounded-md py-3 border"
              placeholder="Search communities by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
        </div>

        {/* Communities Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {allCommunities.length > 0 ? (
            allCommunities.map((community) => (
              <div key={community.id} className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200">
                <div className="p-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 bg-indigo-100 rounded-lg p-3">
                      <Users className={`h-6 w-6 ${community.isPrivate ? 'text-indigo-600' : 'text-indigo-500'}`} />
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{community.name}</h3>
                          {community.isPrivate && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 mt-1">
                              Private
                            </span>
                          )}
                        </div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {community.memberCount} {community.memberCount === 1 ? 'member' : 'members'}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-gray-500 line-clamp-3">{community.description}</p>
                      <div className="mt-4 flex justify-between items-center">
                        <button
                          onClick={() => handleJoin(community.id)}
                          disabled={!!isJoining}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isJoining === community.id ? (
                            <>
                              <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                              Joining...
                            </>
                          ) : (
                            'Join Community'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12 bg-white shadow rounded-lg">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No communities found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery 
                  ? 'Try a different search term'
                  : 'No communities are currently available'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

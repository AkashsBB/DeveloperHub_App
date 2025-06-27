import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCommunityStore } from '../store/useCommunityStore';
import { useAuthStore } from '../store/useAuthStore';
import { Plus, Users, Search, ArrowRight, Loader2, Users as UsersIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { CommunityMembers } from '../components/community/CommunityMembers';

export default function Communities() {
  const { user } = useAuthStore();
  const {
    userCommunities,
    loading,
    members,
    fetchUserCommunities,
    createCommunity,
    getCommunityMembers,
    updateMemberRole,
  } = useCommunityStore();
  
  const { leaveCommunity } = useCommunityStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(null);
  const [membersLoading, setMembersLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newCommunity, setNewCommunity] = useState({ 
    name: '', 
    description: '',
    isPrivate: false 
  });

  const handleLeaveCommunity = async (communityId: string) => {
    if (window.confirm('Are you sure you want to leave this community?')) {
      try {
        const success = await leaveCommunity(communityId);
        if (success) {
          toast.success('Left community successfully');
          await fetchUserCommunities();
        }
      } catch (error) {
        toast.error('Failed to leave community');
      }
    }
  };

  useEffect(() => {
    const loadData = async () => {
      if (user) {
        try {
          await fetchUserCommunities();
        } catch (error) {
          toast.error('Failed to load your communities');
        }
      }
    };
    
    loadData();
  }, [user, fetchUserCommunities]);

  const handleCreateCommunity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommunity.name.trim() || !newCommunity.description.trim()) {
      toast.error('Name and description are required');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const createdCommunity = await createCommunity({
        name: newCommunity.name.trim(),
        description: newCommunity.description.trim(),
        isPrivate: newCommunity.isPrivate
      });
      
      if (createdCommunity) {
        toast.success('Community created successfully!');
        setNewCommunity({ name: '', description: '', isPrivate: false });
        setShowCreateModal(false);
      } else {
        throw new Error('Failed to create community');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Error creating community. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && userCommunities.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const handleManageMembers = async (communityId: string) => {
    setSelectedCommunityId(communityId);
    setMembersLoading(true);
    try {
      await getCommunityMembers(communityId, 1, 100); // Get first 100 members
      setShowMembersModal(true);
    } catch (error) {
      toast.error('Failed to load community members');
    } finally {
      setMembersLoading(false);
    }
  };

  const handleUpdateMemberRole = async (userId: string, newRole: 'VIEWER' | 'ADMIN' | 'OWNER') => {
    if (!selectedCommunityId) return false;
    
    try {
      const success = await updateMemberRole(selectedCommunityId, userId, newRole);
      if (success) {
        // Refresh members list
        await getCommunityMembers(selectedCommunityId, 1, 100);
      }
      return success;
    } catch (error) {
      console.error('Failed to update member role:', error);
      toast.error('Failed to update member role');
      return false;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Your Communities</h1>
            <p className="mt-1 sm:mt-2 text-sm text-gray-600">
              Manage and interact with your developer communities
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Link
              to="/browse-communities"
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Search className="-ml-1 mr-2 h-5 w-5" />
              Browse Communities
            </Link>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Plus className="-ml-1 mr-2 h-5 w-5" />
              Create Community
            </button>
          </div>
        </div>

        <div className="mb-12">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Your Communities</h2>
              <p className="mt-1 text-sm text-gray-500">
                {loading ? 'Loading...' : `${userCommunities.length} community${userCommunities.length !== 1 ? 's' : ''}`}
              </p>
            </div>
          </div>
          
          {loading && userCommunities.length === 0 ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
          ) : userCommunities.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {userCommunities.map((community) => {
                if (!community.id) {
                  console.warn('Invalid community ID:', community);
                  return null;
                }
                return (
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
                            <Link
                              to={`/community/${community.id}`}
                              className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
                            >
                              View community 
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-white shadow rounded-lg">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No communities yet</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by joining a community below or create your own.</p>
              <div className="mt-6">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Plus className="-ml-1 mr-2 h-5 w-5" />
                  Create Community
                </button>
              </div>
            </div>
          )}
        </div>

        {showCreateModal && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
            onClick={() => setShowCreateModal(false)}
            aria-label="Close modal"
          >
            <div 
              className="bg-white p-6 rounded-lg w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-medium mb-4">Create Community</h2>
              <form onSubmit={handleCreateCommunity} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium">
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="w-full p-2 border rounded"
                    placeholder="Community name"
                    value={newCommunity.name}
                    onChange={(e) => setNewCommunity({ ...newCommunity, name: e.target.value })}
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium">
                    Description *
                  </label>
                  <textarea
                    id="description"
                    rows={3}
                    className="w-full p-2 border rounded"
                    placeholder="What's this community about?"
                    value={newCommunity.description}
                    onChange={(e) => setNewCommunity({ ...newCommunity, description: e.target.value })}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="flex items-center">
                  <input
                    id="isPrivate"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600"
                    checked={newCommunity.isPrivate}
                    onChange={(e) => setNewCommunity({ ...newCommunity, isPrivate: e.target.checked })}
                    disabled={isSubmitting}
                  />
                  <label htmlFor="isPrivate" className="ml-2 text-sm">
                    Private
                  </label>
                </div>
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    className={`flex-1 px-4 py-2 rounded text-white ${
                      isSubmitting || !newCommunity.name.trim() || !newCommunity.description.trim()
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                    disabled={isSubmitting || !newCommunity.name.trim() || !newCommunity.description.trim()}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="inline animate-spin h-5 w-5 mr-2" />
                        Creating...
                      </>
                    ) : (
                      'Create'
                    )}
                  </button>
                  <button
                    type="button"
                    className="flex-1 px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Members Management Modal */}
      {selectedCommunityId && (
        <CommunityMembers
          isOpen={showMembersModal}
          onClose={() => setShowMembersModal(false)}
          members={members}
          currentUserId={user?.id || ''}
          onRoleUpdate={handleUpdateMemberRole}
          loading={membersLoading}
        />
      )}
    </div>
  );
}
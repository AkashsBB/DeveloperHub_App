import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCommunityStore } from '../store/useCommunityStore';
import { TaskStatusEnum, TaskPriorityEnum } from '../store/useTaskStore';
import { useMemberStore } from '../store/useMemberStore';
import { format, formatDistanceToNow } from 'date-fns';
import { TaskSection } from './taskSection';
import { ProjectSection } from './projectSection';
import toast from "react-hot-toast";

// Utility functions for formatting
export const formatDate = (dateString?: string) => {
  if (!dateString) return '-';
  try {
    return format(new Date(dateString), 'MMM d, yyyy');
  } catch (error) {
    return '-';
  }
};

// Used in tasks section
export const getStatusBadge = (status: string) => {
  const statusMap: Record<string, string> = {
    [TaskStatusEnum.TODO]: 'bg-gray-100 text-gray-800',
    [TaskStatusEnum.IN_PROGRESS]: 'bg-blue-100 text-blue-800',
    [TaskStatusEnum.IN_REVIEW]: 'bg-yellow-100 text-yellow-800',
    [TaskStatusEnum.DONE]: 'bg-green-100 text-green-800',
  };
  return statusMap[status] || 'bg-gray-100 text-gray-800';
};

// Used in tasks section
export const getPriorityBadge = (priority: string) => {
  const priorityMap: Record<string, string> = {
    [TaskPriorityEnum.LOW]: 'bg-green-100 text-green-800',
    [TaskPriorityEnum.MEDIUM]: 'bg-yellow-100 text-yellow-800',
    [TaskPriorityEnum.HIGH]: 'bg-red-100 text-red-800',
  };
  return priorityMap[priority] || 'bg-gray-100 text-gray-800';
};

// Format date with relative time
export const formatRelativeTime = (dateString?: string) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'N/A' : formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    return 'N/A';
  }
};

const tabList = [
  { key: 'members', label: 'Members' },
  { key: 'projects', label: 'Projects' },
  { key: 'tasks', label: 'Tasks' },
];

const CommunitySection: React.FC = () => {
  const { communityId } = useParams<{ communityId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'members' | 'projects' | 'tasks'>('members');
  const [isMounted, setIsMounted] = useState(false);
  const { getCommunity } = useCommunityStore();
  const { members, fetchMembers, loading: membersLoading } = useMemberStore();
  const [community, setCommunity] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    if (!communityId) {
      setError('Invalid community ID');
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [communityData] = await Promise.all([
          getCommunity(communityId),
          fetchMembers(communityId),
        ]);

        if (!communityData) {
          throw new Error('Community not found');
        }

        setCommunity(communityData);
      } catch (error) {
        console.error('Error loading community data:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to load community data';
        setError(errorMessage);
        toast.error(errorMessage);
        navigate('/communities');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();
  }, [communityId, isMounted, getCommunity, fetchMembers, navigate]);

  if (error) {
    return (
      <div className="max-w-5xl mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
          <button
            onClick={() => navigate('/communities')}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Back to Communities
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4">
      {/* Community Info */}
      <div className="bg-white rounded-lg shadow p-6 mb-6 border">
        {loading ? (
          <div className="animate-pulse h-8 w-1/3 bg-gray-200 rounded mb-2" />
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-1">{community?.name}</h1>
            <p className="text-gray-600 mb-2">{community?.description}</p>
            <div className="text-sm text-gray-500 flex gap-4">
              <span>Members: {community?.memberCount || 0}</span>
              <span>Created: {community?.createdAt ? new Date(community.createdAt).toLocaleDateString() : ''}</span>
            </div>
          </>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 border-b">
        {tabList.map((tab) => (
          <button
            key={tab.key}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors duration-200 focus:outline-none ${
              activeTab === tab.key
                ? 'border-blue-600 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-600 hover:text-blue-600 hover:bg-blue-50'
            }`}
            onClick={() => setActiveTab(tab.key as any)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow p-4 min-h-[300px]">
        {activeTab === 'members' && (
          <div className="overflow-hidden bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Community Members</h3>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                  {members.length} {members.length === 1 ? 'Member' : 'Members'}
                </span>
              </div>
            </div>
            
            {membersLoading ? (
              <div className="animate-pulse p-6 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded-md"></div>
                ))}
              </div>
            ) : !Array.isArray(members) || members.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No members</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by inviting members to your community.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Member
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joined
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {members.map((member) => (
                      <tr key={member.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                              <span className="text-indigo-600 font-medium">
                                {member.name ? member.name.charAt(0).toUpperCase() : 'U'}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {member.name || 'Unnamed Member'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {member.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Active
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            member.role === 'OWNER' 
                              ? 'bg-purple-100 text-purple-800' 
                              : member.role === 'ADMIN' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-gray-100 text-gray-800'
                          }`}>
                            {member.role || 'MEMBER'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {member.joinedAt ? formatRelativeTime(member.joinedAt) : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'projects' && (
          <ProjectSection 
            communityId={communityId!} 
          />
        )}

        {activeTab === 'tasks' && (
          <TaskSection 
            communityId={communityId!}
          />
        )}
      </div>
    </div>
  );
};

export default CommunitySection;

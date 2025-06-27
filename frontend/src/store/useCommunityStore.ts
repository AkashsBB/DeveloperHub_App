import { create } from 'zustand';
import axios from '../lib/axios';
import { toast } from 'react-hot-toast';

interface Community {
  id: string;
  name: string;
  description: string;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
  memberCount?: number;
  isMember?: boolean;
  _count?: {
    communityMembers: number;
  };
}

export interface CommunityMember {
  userId: string;
  role: 'VIEWER' | 'ADMIN' | 'OWNER';
  user: {
    id: string;
    name: string;
    email: string;
    profilePicture?: string;
  };
}

interface CommunityState {
  userCommunities: Community[];
  allCommunities: Community[];
  members: CommunityMember[];
  loading: boolean;
  error: string | null;
  fetchUserCommunities: () => Promise<void>;
  fetchAllCommunities: (search?: string) => Promise<void>;
  getCommunity: (communityId: string) => Promise<Community | null>;
  joinCommunity: (communityId: string) => Promise<boolean>;
  leaveCommunity: (communityId: string) => Promise<boolean>;
  createCommunity: (data: { name: string; description: string; isPrivate?: boolean }) => Promise<Community | null>;
  updateCommunity: (communityId: string, data: { name?: string; description?: string; isPrivate?: boolean }) => Promise<Community | null>;
  deleteCommunity: (communityId: string) => Promise<boolean>;
  updateMemberRole: (communityId: string, userId: string, role: 'VIEWER' | 'ADMIN' | 'OWNER') => Promise<boolean>;
  getCommunityMembers: (communityId: string, page?: number, limit?: number) => Promise<CommunityMember[]>;
  generateInviteLink: (communityId: string) => Promise<string | null>;
}

export const useCommunityStore = create<CommunityState>((set, get) => ({
  userCommunities: [],
  allCommunities: [],
  members: [],
  loading: false,
  error: null,

  fetchUserCommunities: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await axios.get('/api/community/user/communities', {
        params: { limit: 50 },
      });
      const transformed = data.communities.map((community: any) => ({
        ...community,
        memberCount: community._count?.communityMembers || 0,
        isMember: true,
      }));
      set({ userCommunities: transformed });
    } catch (error: any) {
      let errorMessage = 'Failed to fetch your communities';
      if (error.response?.status === 401) {
        errorMessage = 'Please log in to view your communities';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      set({ error: errorMessage });
      toast.error(errorMessage);
    } finally {
      set({ loading: false });
    }
  },

  fetchAllCommunities: async (search = '') => {
    set({ loading: true, error: null });
    try {
      const { data } = await axios.get('/api/community', {
        params: { search, limit: 50, page: 1 },
      });
      const transformed = data.communities.map((community: any) => ({
        ...community,
        memberCount: community._count?.communityMembers || 0,
        isMember: get().userCommunities.some(uc => uc.id === community.id),
      }));
      set({ allCommunities: transformed });
    } catch (error: any) {
      let errorMessage = 'Failed to fetch communities';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      set({ error: errorMessage });
      toast.error(errorMessage);
    } finally {
      set({ loading: false });
    }
  },

  getCommunity: async (communityId: string) => {
    try {
      const { data } = await axios.get(`/api/community/${communityId}`);
      if (!data) {
        throw new Error('Community not found');
      }
      return {
        ...data,
        memberCount: data._count?.communityMembers || 0,
        isMember: get().userCommunities.some(uc => uc.id === data.id),
      };
    } catch (error: any) {
      console.error('Error in getCommunity:', {
        status: error.response?.status,
        data: error.response?.data,
      }); // Debug log
      let errorMessage = 'Failed to fetch community details';
      if (error.response?.status === 404) {
        errorMessage = 'Community not found';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      toast.error(errorMessage);
      return null;
    }
  },

  joinCommunity: async (communityId: string) => {
    try {
      await axios.post(`/api/community/${communityId}/join`);
      const [userCommunities, allCommunities] = await Promise.all([
        axios.get('/api/community/user/communities', { params: { limit: 50 } }),
        axios.get('/api/community', { params: { limit: 50, page: 1 } }),
      ]);
      set({
        userCommunities: userCommunities.data.communities.map((c: any) => ({
          ...c,
          memberCount: c._count?.communityMembers || 0,
          isMember: true,
        })),
        allCommunities: allCommunities.data.communities.map((c: any) => ({
          ...c,
          memberCount: c._count?.communityMembers || 0,
          isMember: userCommunities.data.communities.some((uc: any) => uc.id === c.id),
        })),
      });
      toast.success('Successfully joined the community!');
      return true;
    } catch (error: any) {
      let errorMessage = 'Failed to join community';
      if (error.response?.status === 403) {
        errorMessage = 'Cannot join private community without an invite';
      } else if (error.response?.status === 400 && error.response?.data?.error?.includes('Already a member')) {
        errorMessage = 'You are already a member of this community';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      toast.error(errorMessage);
      return false;
    }
  },

  leaveCommunity: async (communityId: string) => {
    try {
      await axios.post(`/api/community/${communityId}/leave`);
      const [userCommunities, allCommunities] = await Promise.all([
        axios.get('/api/community/user/communities', { params: { limit: 50 } }),
        axios.get('/api/community', { params: { limit: 50, page: 1 } }),
      ]);
      set({
        userCommunities: userCommunities.data.communities.map((c: any) => ({
          ...c,
          memberCount: c._count?.communityMembers || 0,
          isMember: true,
        })),
        allCommunities: allCommunities.data.communities.map((c: any) => ({
          ...c,
          memberCount: c._count?.communityMembers || 0,
          isMember: userCommunities.data.communities.some((uc: any) => uc.id === c.id),
        })),
      });
      toast.success('Successfully left the community');
      return true;
    } catch (error: any) {
      let errorMessage = 'Failed to leave community';
      if (error.response?.status === 400 && error.response?.data?.error?.includes('last admin')) {
        errorMessage = 'Cannot leave as the last admin';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      toast.error(errorMessage);
      return false;
    }
  },

  createCommunity: async (data: { name: string; description: string; isPrivate?: boolean }) => {
    try {
      const response = await axios.post('/api/community', data);
      const newCommunity = response.data;
      await get().fetchUserCommunities();
      toast.success('Community created successfully!');
      return {
        ...newCommunity,
        memberCount: newCommunity._count?.communityMembers || 1,
        isMember: true,
      };
    } catch (error: any) {
      let errorMessage = 'Failed to create community';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.status === 400 && error.response?.data?.errors) {
        errorMessage = error.response.data.errors.map((e: any) => e.message).join(', ');
      }
      toast.error(errorMessage);
      return null;
    }
  },

  updateCommunity: async (communityId: string, data: { name?: string; description?: string; isPrivate?: boolean }) => {
    try {
      const response = await axios.patch(`/api/community/${communityId}`, data);
      const updatedCommunity = response.data;
      await get().fetchUserCommunities(); // Refresh user communities
      toast.success('Community updated successfully!');
      return {
        ...updatedCommunity,
        memberCount: updatedCommunity._count?.communityMembers || 0,
        isMember: get().userCommunities.some(uc => uc.id === updatedCommunity.id),
      };
    } catch (error: any) {
      let errorMessage = 'Failed to update community';
      if (error.response?.status === 403) {
        errorMessage = 'Only admins can update community details';
      } else if (error.response?.status === 400 && error.response?.data?.errors) {
        errorMessage = error.response.data.errors.map((e: any) => e.message).join(', ');
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      toast.error(errorMessage);
      return null;
    }
  },

  deleteCommunity: async (communityId: string) => {
    try {
      await axios.delete(`/api/community/${communityId}`);
      await get().fetchUserCommunities(); // Refresh user communities
      toast.success('Community deleted successfully!');
      return true;
    } catch (error: any) {
      let errorMessage = 'Failed to delete community';
      if (error.response?.status === 403) {
        errorMessage = 'Only owners can delete the community';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      toast.error(errorMessage);
      return false;
    }
  },

  updateMemberRole: async (communityId: string, userId: string, role: 'VIEWER' | 'ADMIN' | 'OWNER') => {
    try {
      await axios.patch(`/api/community/${communityId}/members/role`, { userId, role });
      toast.success('Member role updated successfully!');
      return true;
    } catch (error: any) {
      let errorMessage = 'Failed to update member role';
      if (error.response?.status === 403) {
        errorMessage = 'Only admins can change roles';
      } else if (error.response?.status === 400 && error.response?.data?.error?.includes('last admin')) {
        errorMessage = 'Cannot demote the last admin';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      toast.error(errorMessage);
      return false;
    }
  },

  getCommunityMembers: async (communityId: string, page = 1, limit = 10) => {
    try {
      const { data } = await axios.get(`/api/community/${communityId}/members`, {
        params: { page, limit },
      });
      return data.data || [];
    } catch (error: any) {
      let errorMessage = 'Failed to fetch community members';
      if (error.response?.status === 400 && error.response?.data?.error?.includes('Invalid community ID')) {
        errorMessage = 'Invalid community ID';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      toast.error(errorMessage);
      return [];
    }
  },

  generateInviteLink: async (communityId: string) => {
    try {
      const { data } = await axios.post(`/api/community/${communityId}/invite`);
      toast.success('Invite link generated successfully!');
      return data.inviteLink;
    } catch (error: any) {
      let errorMessage = 'Failed to generate invite link';
      if (error.response?.status === 403) {
        errorMessage = 'Only admins can generate invite links';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      toast.error(errorMessage);
      return null;
    }
  },
}));
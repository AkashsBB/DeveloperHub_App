import { create } from 'zustand';
import axios from '../lib/axios';
import { toast } from 'react-hot-toast';

interface User {
  id: string;
  name: string;
  email: string;
  profilePicture: string;
}

interface CommunityMember {
  user: User;
  role: string;
  joinedAt?: string;
}

interface ApiResponse {
  status: string;
  data: CommunityMember[];
}

export interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  joinedAt?: string;
}

interface MemberState {
  members: Member[];
  loading: boolean;
  error: string | null;
  fetchMembers: (communityId: string) => Promise<void>;
}

export const useMemberStore = create<MemberState>((set) => ({
  members: [],
  loading: false,
  error: null,

  fetchMembers: async (communityId: string) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem('token'); // Adjust based on your auth setup
      const { data } = await axios.get<ApiResponse>(`/api/community/${communityId}/members`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      
      if (!data || data.status !== 'success') {
        throw new Error('Invalid response format');
      }

      const membersArray = data.data || [];
      if (!Array.isArray(membersArray)) {
        console.warn('Members data is not an array:', membersArray);
        set({ members: [] });
        return;
      }

      const members: Member[] = [];
      
      for (const member of membersArray) {
        if (!member.user) {
          console.warn('Member missing user object:', member);
          continue;
        }
        members.push({
          id: member.user.id,
          name: member.user.name,
          email: member.user.email,
          role: member.role || 'unknown',
          joinedAt: member.joinedAt || undefined,
        });
      }

      set({ members });
    } catch (error: any) {
      console.error('Fetch Members Error:', {
        message: error.message,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config,
      });
      let errorMessage = 'Failed to fetch members';
      if (error.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      set({ error: errorMessage });
      toast.error(errorMessage);
    } finally {
      set({ loading: false });
    }
  },
}));
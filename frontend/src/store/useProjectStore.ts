import { create } from 'zustand';
import axios from '../lib/axios';
import { toast } from 'react-hot-toast';

export interface User {
  id: string;
  name: string;
  email?: string | null;
  profilePicture?: string | null;
}

export interface ProjectMember {
  id: string;
  user: User;
  joinedAt?: string | null;
}

export interface Project {
  id: string;
  name: string;
  description?: string | null;
  emoji?: string | null;
  communityId: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  createdBy: User;
  members: ProjectMember[];
}

export interface ProjectAnalytics {
  totalMembers: number;
  members: ProjectMember[];
}

export interface CreateProjectData {
  name: string;
  description?: string | null;
  emoji?: string | null;
}

export interface UpdateProjectData {
  name?: string | null;
  description?: string | null;
  emoji?: string | null;
}

export interface PaginatedResponse<T> {
  projects?: T[];
  members?: T[];
  total: number;
  pageNumber: number;
  totalPages: number;
}

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  projectMembers: User[];
  projectAnalytics: ProjectAnalytics | null;
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  totalProjects: number;
  fetchProjects: (communityId: string, pageNumber?: number, pageSize?: number) => Promise<void>;
  fetchProjectById: (communityId: string, projectId: string) => Promise<void>;
  createProject: (communityId: string, data: CreateProjectData) => Promise<Project | null>;
  updateProject: (communityId: string, projectId: string, data: UpdateProjectData) => Promise<Project | null>;
  deleteProject: (communityId: string, projectId: string) => Promise<boolean>;
  joinProject: (communityId: string, projectId: string) => Promise<boolean>;
  leaveProject: (communityId: string, projectId: string) => Promise<boolean>;
  fetchProjectMembers: (communityId: string, projectId: string, pageNumber?: number, pageSize?: number) => Promise<void>;
  clearError: () => void;
  clearCurrentProject: () => void;
  clearProjectMembers: () => void;
  clearProjectAnalytics: () => void;
  reset: () => void;
}

export const useProjectStore = create<ProjectState>((set, _get) => ({
  projects: [],
  currentProject: null,
  projectMembers: [],
  projectAnalytics: null,
  loading: false,
  error: null,
  currentPage: 1,
  totalPages: 1,
  totalProjects: 0,

  fetchProjects: async (communityId: string, pageNumber = 1, pageSize = 10) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get<PaginatedResponse<Project>>(`/api/community/${communityId}/project`, {
        params: { pageNumber, pageSize },
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      if (!data || !data.projects) {
        throw new Error('Invalid projects response');
      }

      set({
        projects: data.projects,
        currentPage: data.pageNumber || 1,
        totalPages: data.totalPages || 1,
        totalProjects: data.total || 0,
      });
    } catch (error: any) {
      console.error('Fetch Projects Error:', {
        message: error.message,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config,
      });
      let errorMessage = 'Failed to fetch projects';
      if (error.response?.data?.error) {
        errorMessage = Array.isArray(error.response.data.error)
          ? error.response.data.error[0]?.message || errorMessage
          : error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      set({ error: errorMessage });
      toast.error(errorMessage);
    } finally {
      set({ loading: false });
    }
  },

  fetchProjectById: async (communityId: string, projectId: string) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get<Project>(`/api/community/${communityId}/project/${projectId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      set({ currentProject: data });
    } catch (error: any) {
      console.error('Fetch Project Error:', {
        message: error.message,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config,
      });
      let errorMessage = 'Failed to fetch project';
      if (error.response?.data?.error) {
        errorMessage = Array.isArray(error.response.data.error)
          ? error.response.data.error[0]?.message || errorMessage
          : error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      set({ error: errorMessage });
      toast.error(errorMessage);
    } finally {
      set({ loading: false });
    }
  },

  createProject: async (communityId: string, data: CreateProjectData) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post<Project>(`/api/community/${communityId}/project`, data, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const newProject = response.data;
      set(state => ({
        projects: [newProject, ...state.projects],
        totalProjects: state.totalProjects + 1,
      }));
      toast.success('Project created successfully');
      return newProject;
    } catch (error: any) {
      console.error('Create Project Error:', {
        message: error.message,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config,
      });
      let errorMessage = 'Failed to create project';
      if (error.response?.data?.error) {
        errorMessage = Array.isArray(error.response.data.error)
          ? error.response.data.error[0]?.message || errorMessage
          : error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      set({ error: errorMessage });
      toast.error(errorMessage);
      return null;
    } finally {
      set({ loading: false });
    }
  },

  updateProject: async (communityId: string, projectId: string, data: UpdateProjectData) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put<Project>(`/api/community/${communityId}/project/${projectId}`, data, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const updatedProject = response.data;
      set(state => ({
        projects: state.projects.map(p => (p.id === projectId ? updatedProject : p)),
        currentProject: state.currentProject?.id === projectId ? updatedProject : state.currentProject,
      }));
      toast.success('Project updated successfully');
      return updatedProject;
    } catch (error: any) {
      console.error('Update Project Error:', {
        message: error.message,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config,
      });
      let errorMessage = 'Failed to update project';
      if (error.response?.data?.error) {
        errorMessage = Array.isArray(error.response.data.error)
          ? error.response.data.error[0]?.message || errorMessage
          : error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      set({ error: errorMessage });
      toast.error(errorMessage);
      return null;
    } finally {
      set({ loading: false });
    }
  },

  deleteProject: async (communityId: string, projectId: string) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/community/${communityId}/project/${projectId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      set(state => ({
        projects: state.projects.filter(p => p.id !== projectId),
        currentProject: state.currentProject?.id === projectId ? null : state.currentProject,
        totalProjects: Math.max(0, state.totalProjects - 1),
      }));
      toast.success('Project deleted successfully');
      return true;
    } catch (error: any) {
      console.error('Delete Project Error:', {
        message: error.message,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config,
      });
      let errorMessage = 'Failed to delete project';
      if (error.response?.data?.error) {
        errorMessage = Array.isArray(error.response.data.error)
          ? error.response.data.error[0]?.message || errorMessage
          : error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      set({ error: errorMessage });
      toast.error(errorMessage);
      return false;
    } finally {
      set({ loading: false });
    }
  },

  joinProject: async (communityId: string, projectId: string) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post<ProjectMember>(`/api/community/${communityId}/project/${projectId}/join`, {}, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const newMember = response.data;
      set(state => ({
        currentProject: state.currentProject?.id === projectId
          ? { ...state.currentProject, members: [...state.currentProject.members, newMember] }
          : state.currentProject,
        projects: state.projects.map(p =>
          p.id === projectId
            ? { ...p, members: [...p.members, newMember] }
            : p
        ),
      }));
      toast.success('Successfully joined project');
      return true;
    } catch (error: any) {
      console.error('Join Project Error:', {
        message: error.message,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config,
      });
      let errorMessage = 'Failed to join project';
      if (error.response?.data?.error) {
        errorMessage = Array.isArray(error.response.data.error)
          ? error.response.data.error[0]?.message || errorMessage
          : error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      set({ error: errorMessage });
      toast.error(errorMessage);
      return false;
    } finally {
      set({ loading: false });
    }
  },

  leaveProject: async (communityId: string, projectId: string) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      const currentUserId = localStorage.getItem('userId'); // Adjust based on your auth setup
      await axios.post(`/api/community/${communityId}/project/${projectId}/leave`, {}, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      set(state => ({
        currentProject: state.currentProject?.id === projectId
          ? { ...state.currentProject, members: state.currentProject.members.filter(m => m.user.id !== currentUserId) }
          : state.currentProject,
        projects: state.projects.map(p =>
          p.id === projectId
            ? { ...p, members: p.members.filter(m => m.user.id !== currentUserId) }
            : p
        ),
      }));
      toast.success('Successfully left project');
      return true;
    } catch (error: any) {
      console.error('Leave Project Error:', {
        message: error.message,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config,
      });
      let errorMessage = 'Failed to leave project';
      if (error.response?.data?.error) {
        errorMessage = Array.isArray(error.response.data.error)
          ? error.response.data.error[0]?.message || errorMessage
          : error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      set({ error: errorMessage });
      toast.error(errorMessage);
      return false;
    } finally {
      set({ loading: false });
    }
  },

  fetchProjectMembers: async (communityId: string, projectId: string, pageNumber = 1, pageSize = 10) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get<PaginatedResponse<User>>(`/api/community/${communityId}/project/${projectId}/members`, {
        params: { pageNumber, pageSize },
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!data || !data.members) {
        throw new Error('Invalid project members response');
      }
      set({ projectMembers: data.members });
    } catch (error: any) {
      console.error('Fetch Project Members Error:', {
        message: error.message,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config,
      });
      let errorMessage = 'Failed to fetch project members';
      if (error.response?.data?.error) {
        errorMessage = Array.isArray(error.response.data.error)
          ? error.response.data.error[0]?.message || errorMessage
          : error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      set({ error: errorMessage });
      toast.error(errorMessage);
    } finally {
      set({ loading: false });
    }
  },

  clearError: () => set({ error: null }),
  clearCurrentProject: () => set({ currentProject: null }),
  clearProjectMembers: () => set({ projectMembers: [] }),
  clearProjectAnalytics: () => set({ projectAnalytics: null }),
  reset: () => set({
    projects: [],
    currentProject: null,
    projectMembers: [],
    projectAnalytics: null,
    loading: false,
    error: null,
    currentPage: 1,
    totalPages: 1,
    totalProjects: 0,
  }),
}));
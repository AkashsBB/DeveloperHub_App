export type CommunityRole = 'OWNER' | 'ADMIN' | 'MANAGER' | 'DEVELOPER_I' | 'DEVELOPER_II' | 'DEVELOPER_III';
export type TaskStatus = 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  isEmailVerified: boolean;
  provider: 'LOCAL' | 'GOOGLE' | 'GITHUB';
  createdAt: string;
  updatedAt: string;
}

export interface Community {
  id: string;
  name: string;
  description: string;
  isPrivate: boolean;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  memberCount: number;
  owner: User;
}

export interface CommunityMember {
  id: string;
  communityId: string;
  userId: string;
  role: CommunityRole;
  joinedAt: string;
  user: User;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string | null;
  memberCount: number;
  emoji?: string;
  taskCount?: number;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  joinedAt: string;
  user: User;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  communityId: string;
  projectId?: string;
  assignedToId?: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  assignedTo?: User;
  createdBy: User;
}

export interface ProjectAnalytics {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  backlogTasks: number;
  memberStats: {
    userId: string;
    userName: string;
    taskCount: number;
  }[];
  taskStatusDistribution: {
    status: string;
    count: number;
  }[];
  taskPriorityDistribution: {
    priority: string;
    count: number;
  }[];
}

// Request types
export interface CreateCommunityRequest {
  name: string;
  description: string;
  isPrivate: boolean;
}

export interface UpdateCommunityRequest {
  name?: string;
  description?: string;
  isPrivate?: boolean;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  emoji?: string;
  startDate?: string;
  endDate?: string;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  emoji?: string;
  startDate?: string;
  endDate?: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  assignedTo?: string | null;
  dueDate?: string;
  projectId?: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  assignedTo?: string | null;
  dueDate?: string;
  projectId?: string;
}

export interface GetCommunitiesParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'name' | 'memberCount' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  type?: 'public' | 'private';
}

// Response types
export interface ApiResponse<T> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
} 
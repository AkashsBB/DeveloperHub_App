import { useState, useEffect } from 'react';
import { Plus, Loader2, Edit, Trash2, Users, X } from 'lucide-react';
import { useProjectStore, type Project, type CreateProjectData } from '../store/useProjectStore';

interface ProjectSectionProps {
  communityId: string;
  className?: string;
  showHeader?: boolean;
  onProjectSelect?: (project: Project) => void;
}

export function ProjectSection({ 
  communityId, 
  className = '',
  showHeader = true,
  onProjectSelect
}: ProjectSectionProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState<CreateProjectData>({ name: '', description: '' });
  
  const {
    projects,
    loading,
    error,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    joinProject,
    leaveProject,
  } = useProjectStore();

  useEffect(() => {
    if (communityId) {
      fetchProjects(communityId);
    }
  }, [communityId, fetchProjects]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProject) {
        await updateProject(communityId, editingProject.id, formData);
      } else {
        await createProject(communityId, formData);
      }
      handleCloseModal();
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Failed to save project');
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      description: project.description || '',
      emoji: project.emoji || ''
    });
    setIsCreateModalOpen(true);
  };

  const handleDelete = async (projectId: string) => {
    if (confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      try {
        await deleteProject(communityId, projectId);
      } catch (error) {
        console.error('Error deleting project:', error);
        alert('Failed to delete project');
      }
    }
  };

  const handleJoinProject = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await joinProject(communityId, projectId);
    } catch (error) {
      console.error('Error joining project:', error);
      alert('Failed to join project');
    }
  };

  const handleLeaveProject = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await leaveProject(communityId, projectId);
    } catch (error) {
      console.error('Error leaving project:', error);
      alert('Failed to leave project');
    }
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    setEditingProject(null);
    setFormData({ name: '', description: '' });
  };

  const isCurrentUserMember = (project: Project) => {

    return project.members?.some(member => member.user.id === project.createdById);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        {showHeader && (
          <h2 className="text-2xl font-bold">Projects</h2>
        )}
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {loading && !projects.length ? (
        <div className="flex justify-center p-8">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-700">No projects yet</h3>
          <p className="mt-1 text-gray-500">Create your first project to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => {
            const isMember = isCurrentUserMember(project);
            return (
              <div 
                key={project.id} 
                className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => onProjectSelect?.(project)}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        {project.emoji && <span>{project.emoji}</span>}
                        {project.name}
                      </h3>
                      {project.description && (
                        <p className="mt-1 text-gray-600 text-sm">
                          {project.description.length > 100 
                            ? `${project.description.substring(0, 100)}...` 
                            : project.description}
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(project);
                        }}
                        className="p-1 text-gray-400 hover:text-blue-600"
                        aria-label="Edit project"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(project.id);
                        }}
                        className="p-1 text-gray-400 hover:text-red-600"
                        aria-label="Delete project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      <span>{project.members?.length || 0} members</span>
                    </div>
                    <div>
                      {isMember ? (
                        <button
                          onClick={(e) => handleLeaveProject(project.id, e)}
                          className="px-3 py-1 rounded-md text-sm bg-gray-100 hover:bg-gray-200 text-gray-800"
                        >
                          Leave
                        </button>
                      ) : (
                        <button
                          onClick={(e) => handleJoinProject(project.id, e)}
                          className="px-3 py-1 rounded-md text-sm bg-blue-100 hover:bg-blue-200 text-blue-800"
                        >
                          Join
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Project Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  {editingProject ? 'Edit Project' : 'Create New Project'}
                </h3>
                <button 
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="emoji" className="block text-sm font-medium text-gray-700 mb-1">
                    Emoji (optional)
                  </label>
                  <input
                    type="text"
                    id="emoji"
                    name="emoji"
                    value={formData.emoji || ''}
                    onChange={handleInputChange}
                    className="w-20 p-2 border rounded-md"
                    placeholder="🎯"
                  />
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description (optional)
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description || ''}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="flex items-center">
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {editingProject ? 'Updating...' : 'Creating...'}
                      </span>
                    ) : editingProject ? 'Update Project' : 'Create Project'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
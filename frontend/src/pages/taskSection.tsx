import { useState, useEffect } from 'react';
import { useTaskStore } from '../store/useTaskStore';
import type { Task } from '../store/useTaskStore';
import { TaskStatusEnum } from '../store/useTaskStore';
import { Plus, Loader2, Pencil, Trash2, Check } from 'lucide-react';

interface TaskSectionProps {
  communityId: string;
  projectId?: string;
  showHeader?: boolean;
  className?: string;
  onTaskSelect?: (task: any) => void;
}

export function TaskSection({
  communityId,
  projectId,
  showHeader = true,
  className = '',
}: TaskSectionProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  const {
    tasks,
    loading,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
  } = useTaskStore();

  useEffect(() => {
    if (communityId) {
      fetchTasks(communityId, projectId ? { projectId } : undefined);
    }
  }, [communityId, projectId, fetchTasks]);

  const handleCreateTask = async (data: any) => {
    try {
      await createTask(communityId, {
        ...data,
        projectId: projectId || undefined,
      });
      alert('Task created successfully');
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Failed to create task:', error);
      alert('Failed to create task');
    }
  };

  const handleUpdateTask = async (data: any) => {
    if (!editingTask) return;
    
    try {
      await updateTask(communityId, editingTask.id, data);
      alert('Task updated successfully');
      setEditingTask(null);
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Failed to update task:', error);
      alert('Failed to update task');
    }
  };

  const handleStatusChange = async (taskId: string, status: TaskStatusEnum) => {
    try {
      await updateTaskStatus(communityId, taskId, status);
    } catch (error) {
      console.error('Failed to update task status:', error);
      alert('Failed to update task status');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(communityId, taskId);
        alert('Task deleted successfully');
      } catch (error) {
        console.error('Failed to delete task:', error);
        alert('Failed to delete task');
      }
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsCreateDialogOpen(true);
  };

  const filteredTasks = projectId 
    ? tasks.filter(task => task.projectId === projectId)
    : tasks;

  const renderTaskForm = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">
          {editingTask ? 'Edit Task' : 'Create New Task'}
        </h3>
        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          const taskData = {
            title: formData.get('title') as string,
            description: formData.get('description') as string,
            status: formData.get('status') as TaskStatusEnum || TaskStatusEnum.TODO,
            priority: formData.get('priority') as string || 'MEDIUM',
          };
          
          if (editingTask) {
            handleUpdateTask(taskData);
          } else {
            handleCreateTask(taskData);
          }
        }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              name="title"
              type="text"
              defaultValue={editingTask?.title || ''}
              required
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              name="description"
              defaultValue={editingTask?.description || ''}
              className="w-full p-2 border rounded"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                name="status"
                defaultValue={editingTask?.status || TaskStatusEnum.TODO}
                className="w-full p-2 border rounded"
              >
                {Object.values(TaskStatusEnum).map(status => (
                  <option key={status} value={status}>
                    {status.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Priority</label>
              <select
                name="priority"
                defaultValue={editingTask?.priority || 'MEDIUM'}
                className="w-full p-2 border rounded"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <button
              type="button"
              onClick={() => {
                setEditingTask(null);
                setIsCreateDialogOpen(false);
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        {showHeader && (
          <h2 className="text-xl font-semibold">
            {projectId ? 'Project Tasks' : 'All Tasks'}
          </h2>
        )}
        <button
          onClick={() => setIsCreateDialogOpen(true)}
          className="ml-auto inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </button>
      </div>

      {loading && !tasks.length ? (
        <div className="flex justify-center items-center p-8">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center p-8 text-gray-500">
          No tasks found. Create one to get started!
        </div>
      ) : (
        <div className="space-y-2">
          {filteredTasks.map((task) => (
            <div key={task.id} className="border rounded-lg p-4 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <button
                    onClick={() => handleStatusChange(
                      task.id,
                      task.status === TaskStatusEnum.DONE ? TaskStatusEnum.TODO : TaskStatusEnum.DONE
                    )}
                    className={`mt-1 flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center ${
                      task.status === TaskStatusEnum.DONE
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-gray-300 hover:border-blue-500'
                    }`}
                  >
                    {task.status === TaskStatusEnum.DONE && <Check className="w-3 h-3" />}
                  </button>
                  <div>
                    <h3 className="font-medium">{task.title}</h3>
                    {task.description && (
                      <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                    )}
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        task.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                        task.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {task.priority}
                      </span>
                      <span className="capitalize">{task.status.toLowerCase().replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditTask(task)}
                    className="text-gray-400 hover:text-blue-500 p-1"
                    aria-label="Edit task"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="text-gray-400 hover:text-red-500 p-1"
                    aria-label="Delete task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {(isCreateDialogOpen || editingTask) && renderTaskForm()}
    </div>
  );
}
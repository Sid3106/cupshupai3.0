import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Activity, Task } from '../../types/database';
import {
  Building2,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Plus,
  Save,
  ArrowLeft
} from 'lucide-react';
import { Button } from '../../components/ui/button';

export default function ActivityDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [activity, setActivity] = useState<Activity | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: ''
  });
  const [savingTask, setSavingTask] = useState(false);

  useEffect(() => {
    const fetchActivityDetails = async () => {
      try {
        // Fetch activity details
        const { data: activityData, error: activityError } = await supabase
          .from('activities')
          .select('*')
          .eq('id', id)
          .single();

        if (activityError) throw activityError;
        setActivity(activityData);

        // Fetch tasks
        const { data: taskData, error: taskError } = await supabase
          .from('tasks')
          .select('*')
          .eq('activity_id', id)
          .order('created_at', { ascending: false });

        if (taskError) throw taskError;
        setTasks(taskData || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch activity details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchActivityDetails();
    }
  }, [id]);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activity || !newTask.title) return;

    setSavingTask(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('tasks')
        .insert({
          activity_id: activity.id,
          vendor_id: user.id,
          title: newTask.title,
          description: newTask.description,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      setTasks([data, ...tasks]);
      setNewTask({ title: '', description: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add task');
    } finally {
      setSavingTask(false);
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: 'pending' | 'in_progress' | 'done') => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId);

      if (error) throw error;

      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !activity) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-2">
            {error || 'Activity not found'}
          </p>
          <Button
            onClick={() => navigate('/vendor')}
            variant="outline"
            className="text-primary hover:text-primary/80"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/vendor')}
            className="text-gray-600"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{activity.name}</h1>
            <p className="text-sm text-gray-600">Activity Details and Tasks</p>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
          activity.status === 'completed' ? 'bg-green-100 text-green-800' :
          activity.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
          activity.status === 'cancelled' ? 'bg-red-100 text-red-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {activity.status === 'completed' && <CheckCircle2 className="w-4 h-4" />}
          {activity.status === 'pending' && <AlertCircle className="w-4 h-4" />}
          {activity.status === 'in_progress' && <Clock className="w-4 h-4" />}
          {activity.status.charAt(0).toUpperCase() + activity.status.slice(1).replace('_', ' ')}
        </span>
      </div>

      {/* Activity Details */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h2 className="text-sm font-medium text-gray-600 mb-4">Activity Information</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-gray-600">
                <Building2 className="w-4 h-4" />
                <span className="font-medium">{activity.brand}</span>
              </div>
              
              {activity.city && (
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{activity.city}</span>
                  {activity.location && (
                    <span className="text-gray-400">({activity.location})</span>
                  )}
                </div>
              )}
              
              {activity.start_date && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(activity.start_date).toLocaleDateString()}
                    {activity.end_date && (
                      <> - {new Date(activity.end_date).toLocaleDateString()}</>
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-medium text-gray-600 mb-4">Instructions</h2>
            <p className="text-gray-600 whitespace-pre-wrap">
              {activity.instructions || 'No specific instructions provided.'}
            </p>
          </div>
        </div>
      </div>

      {/* Tasks Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Tasks</h2>
        </div>

        <div className="p-6">
          {/* Add Task Form */}
          <form onSubmit={handleAddTask} className="mb-6">
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="Task title (e.g., Order ID #1234)"
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
              />
              <input
                type="text"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="Description (optional)"
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div className="mt-4 flex justify-end">
              <Button
                type="submit"
                disabled={savingTask || !newTask.title}
                className="bg-primary text-white hover:bg-primary/90"
              >
                {savingTask ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Task
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Tasks List */}
          <div className="space-y-4">
            {tasks.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks yet</h3>
                <p className="text-gray-600">
                  Add your first task to track progress
                </p>
              </div>
            ) : (
              tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-gray-100"
                >
                  <div>
                    <h3 className="font-medium text-gray-900">{task.title}</h3>
                    {task.description && (
                      <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <select
                      value={task.status}
                      onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value as any)}
                      className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="done">Done</option>
                    </select>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      task.status === 'done' ? 'bg-green-100 text-green-800' :
                      task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {task.status.charAt(0).toUpperCase() + task.status.slice(1).replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
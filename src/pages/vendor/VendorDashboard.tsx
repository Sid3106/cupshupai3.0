import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../types/database';
import { 
  Calendar,
  Clock,
  MapPin,
  Bell,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowUpRight,
  Building2
} from 'lucide-react';
import { Button } from '../../components/ui/button';

export default function VendorDashboard() {
  const [activities, setActivities] = useState<Database['public']['Tables']['activities']['Row'][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    pending: 0
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVendorActivities = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await supabase
          .from('activities')
          .select(`
            *,
            activity_assignments!inner(*)
          `)
          .eq('activity_assignments.vendor_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        setActivities(data || []);
        
        // Calculate stats
        if (data) {
          setStats({
            total: data.length,
            active: data.filter(a => a.status === 'in_progress').length,
            completed: data.filter(a => a.status === 'completed').length,
            pending: data.filter(a => a.status === 'pending').length
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch activities');
      } finally {
        setLoading(false);
      }
    };

    fetchVendorActivities();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-2">Error: {error}</p>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="text-primary hover:text-primary/80"
          >
            Try again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Notification button - Fixed position */}
      <div className="absolute top-4 right-4">
        <Button variant="outline" className="gap-2">
          <Bell className="w-4 h-4" />
          <span className="bg-primary text-white text-xs rounded-full px-2 py-0.5">3</span>
        </Button>
      </div>

      {/* Header with minimal spacing */}
      <div className="flex flex-col items-center text-center md:text-left md:flex-row md:justify-between md:items-center">
        <div className="w-full md:w-auto mb-2 md:mb-0">
          <h1 className="text-2xl font-semibold text-[#00A979] text-center md:text-left">Vendor Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600 text-center md:text-left">
            Welcome back to your vendor dashboard
          </p>
        </div>
      </div>

      {/* Stats Overview - Compact cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Total Activities</h3>
            <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
              All time
            </span>
          </div>
          <p className="text-xl font-semibold text-gray-900">{stats.total}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Active</h3>
            <span className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full">
              In Progress
            </span>
          </div>
          <p className="text-xl font-semibold text-gray-900">{stats.active}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Completed</h3>
            <span className="bg-green-50 text-green-700 text-xs px-2 py-0.5 rounded-full">
              Success
            </span>
          </div>
          <p className="text-xl font-semibold text-gray-900">{stats.completed}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Pending</h3>
            <span className="bg-yellow-50 text-yellow-700 text-xs px-2 py-0.5 rounded-full">
              Action needed
            </span>
          </div>
          <p className="text-xl font-semibold text-gray-900">{stats.pending}</p>
        </div>
      </div>

      {/* Activities List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Your Activities</h2>
        </div>
        
        <div className="p-4">
          <div className="space-y-3">
            {activities.length === 0 ? (
              <div className="text-center py-8">
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No activities assigned yet</h3>
                <p className="text-gray-600">
                  You'll be notified when new activities are assigned to you.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex flex-col p-3 rounded-lg border border-gray-200 hover:border-primary/20 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/vendor/activities/${activity.id}`)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900">{activity.name}</h3>
                        {activity.status === 'pending' && (
                          <span className="bg-yellow-50 text-yellow-700 text-xs px-2 py-0.5 rounded-full">
                            Action needed
                          </span>
                        )}
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-gray-400" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mt-1">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        <span className="truncate">{activity.brand}</span>
                      </div>
                      
                      {activity.city && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="truncate">{activity.city}</span>
                        </div>
                      )}
                      
                      {activity.start_date && (
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>{new Date(activity.start_date).toLocaleDateString()}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                          activity.status === 'completed' ? 'bg-green-100 text-green-800' :
                          activity.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          activity.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {activity.status === 'completed' && <CheckCircle2 className="w-3 h-3" />}
                          {activity.status === 'pending' && <AlertCircle className="w-3 h-3" />}
                          {activity.status === 'in_progress' && <Clock className="w-3 h-3" />}
                          {activity.status ? activity.status.charAt(0).toUpperCase() + activity.status.slice(1).replace('_', ' ') : 'Unknown'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
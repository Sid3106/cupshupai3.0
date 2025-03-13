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

export default function ClientDashboard() {
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
    const fetchClientActivities = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        // First get the client's brand name
        const { data: clientData, error: clientError } = await supabase
          .from('clients')
          .select('brand_name')
          .eq('user_id', user.id)
          .single();

        if (clientError) throw clientError;
        if (!clientData) throw new Error('Client data not found');

        // Then fetch activities for this brand
        const { data, error } = await supabase
          .from('activities')
          .select('*')
          .eq('brand', clientData.brand_name)
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

    fetchClientActivities();
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

      {/* Welcome Section */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back to your dashboard</h1>
        <p className="text-muted-foreground">
          Here's an overview of your brand's activities
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            <h3 className="font-medium">Total Activities</h3>
          </div>
          <p className="text-2xl font-semibold mt-2">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-yellow-500" />
            <h3 className="font-medium">Active</h3>
          </div>
          <p className="text-2xl font-semibold mt-2">{stats.active}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <h3 className="font-medium">Completed</h3>
          </div>
          <p className="text-2xl font-semibold mt-2">{stats.completed}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <h3 className="font-medium">Pending</h3>
          </div>
          <p className="text-2xl font-semibold mt-2">{stats.pending}</p>
        </div>
      </div>

      {/* Activities List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Your Activities</h2>
          <Button variant="outline" className="gap-2">
            View All <ArrowUpRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/activities/${activity.id}`)}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="font-medium">{activity.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{activity.location || activity.city}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Building2 className="w-4 h-4" />
                      <span>{activity.brand}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    activity.status === 'completed' ? 'bg-green-100 text-green-800' :
                    activity.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {activity.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 
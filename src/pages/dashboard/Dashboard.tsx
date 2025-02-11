import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Activity } from '../../types/database';
import { Loader2, Calendar, MapPin, Clock } from 'lucide-react';

export default function Dashboard() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const { data, error } = await supabase
          .from('activities')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) throw error;
        setActivities(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch activities');
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
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
          <button
            onClick={() => window.location.reload()}
            className="text-primary hover:text-primary/80"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {activity.name}
            </h3>
            
            <div className="space-y-3 text-sm text-gray-600">
              {activity.brand && (
                <p className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-primary" />
                  {activity.brand}
                </p>
              )}
              
              {activity.city && (
                <p className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-primary" />
                  {activity.city}
                </p>
              )}
              
              {activity.start_date && (
                <p className="flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-primary" />
                  {new Date(activity.start_date).toLocaleDateString()}
                  {activity.end_date && ` - ${new Date(activity.end_date).toLocaleDateString()}`}
                </p>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                activity.status === 'completed' ? 'bg-green-100 text-green-800' :
                activity.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                activity.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {activity.status.replace('_', ' ').charAt(0).toUpperCase() + 
                 activity.status.slice(1).replace('_', ' ')}
              </span>
            </div>
          </div>
        ))}

        {activities.length === 0 && (
          <div className="col-span-full text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-500">No activities found</p>
          </div>
        )}
      </div>
    </div>
  );
}
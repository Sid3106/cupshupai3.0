import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  Calendar,
  Search,
  Filter,
  MapPin,
  Building2,
  Loader2,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import { Button } from '../../components/ui/button';

interface Activity {
  id: string;
  activity_id: string | null;
  brand: string;
  city: string | null;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | null;
  instructions: string | null;
  client_id: string | null;
  created_at: string | null;
  created_by: string;
  updated_at: string | null;
}

export default function Activities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchAllActivities = async () => {
      try {
        const { data, error } = await supabase
          .from('activities')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setActivities(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch activities');
      } finally {
        setLoading(false);
      }
    };

    fetchAllActivities();
  }, []);

  const filteredActivities = activities.filter(activity => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      activity.brand.toLowerCase().includes(searchLower) ||
      activity.city?.toLowerCase().includes(searchLower) ||
      activity.location?.toLowerCase().includes(searchLower)
    );
  });

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
    <div className="space-y-6">
      <div className="flex flex-col items-center text-center md:text-left md:flex-row md:justify-between md:items-center">
        <div className="w-full md:w-auto mb-4 md:mb-0">
          <h1 className="text-2xl font-semibold text-[#00A979] text-center md:text-left">All Activities</h1>
          <p className="mt-1 text-sm text-gray-600 text-center md:text-left">
            View all available activities in the system
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <Button variant="outline" className="w-full md:w-auto text-gray-600">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>

          <div className="md:hidden mt-6 space-y-4">
            {filteredActivities.length === 0 ? (
              <div className="text-center py-8">
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No activities available</h3>
                <p className="text-gray-600">Check back later for new activities.</p>
              </div>
            ) : (
              filteredActivities.map((activity) => (
                <div 
                  key={activity.id}
                  className="bg-white rounded-lg border border-gray-200 p-4"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900">{activity.brand}</h3>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        activity.status === 'completed' ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20' :
                        activity.status === 'in_progress' ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-700/10' :
                        activity.status === 'cancelled' ? 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/10' :
                        activity.status === 'pending' ? 'bg-yellow-50 text-yellow-800 ring-1 ring-inset ring-yellow-600/20' :
                        'bg-gray-50 text-gray-600 ring-1 ring-inset ring-gray-500/10'
                      }`}>
                        {activity.status === 'completed' && <CheckCircle2 className="w-3 h-3" />}
                        {activity.status === 'pending' && <AlertCircle className="w-3 h-3" />}
                        {activity.status === 'in_progress' && <Clock className="w-3 h-3" />}
                        {activity.status ? activity.status.charAt(0).toUpperCase() + activity.status.slice(1).replace('_', ' ') : 'Unknown'}
                      </span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span>{activity.city || '-'}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span>{activity.location || '-'}</span>
                    </div>
                    {activity.start_date && (
                      <div className="flex items-center text-gray-600">
                        <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
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
              ))
            )}
          </div>

          <div className="hidden md:block overflow-x-auto mt-6">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Brand</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Location</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Date Range</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Instructions</th>
                  <th className="w-20"></th>
                </tr>
              </thead>
              <tbody>
                {filteredActivities.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12">
                      <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Calendar className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No activities available</h3>
                      <p className="text-gray-600">Check back later for new activities.</p>
                    </td>
                  </tr>
                ) : (
                  filteredActivities.map((activity) => (
                    <tr 
                      key={activity.id}
                      className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center text-gray-600">
                          <Building2 className="w-4 h-4 mr-2" />
                          {activity.brand}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center text-gray-600">
                          <MapPin className="w-4 h-4 mr-2" />
                          {activity.city && activity.location
                            ? `${activity.city} - ${activity.location}`
                            : activity.city || activity.location || '-'
                          }
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center text-gray-600">
                          <Calendar className="w-4 h-4 mr-2" />
                          {activity.start_date && (
                            <>
                              {new Date(activity.start_date).toLocaleDateString()}
                              {activity.end_date && (
                                <> - {new Date(activity.end_date).toLocaleDateString()}</>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          activity.status === 'completed' ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20' :
                          activity.status === 'in_progress' ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-700/10' :
                          activity.status === 'cancelled' ? 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/10' :
                          activity.status === 'pending' ? 'bg-yellow-50 text-yellow-800 ring-1 ring-inset ring-yellow-600/20' :
                          'bg-gray-50 text-gray-600 ring-1 ring-inset ring-gray-500/10'
                        }`}>
                          {activity.status === 'completed' && <CheckCircle2 className="w-3 h-3" />}
                          {activity.status === 'pending' && <AlertCircle className="w-3 h-3" />}
                          {activity.status === 'in_progress' && <Clock className="w-3 h-3" />}
                          {activity.status ? activity.status.charAt(0).toUpperCase() + activity.status.slice(1).replace('_', ' ') : 'Unknown'}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-gray-600 max-w-xs truncate">
                          {activity.instructions || '-'}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
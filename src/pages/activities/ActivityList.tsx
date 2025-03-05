import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Database } from "../../types/database";
import { supabase } from '../../lib/supabase';
import { 
  PlusCircle, 
  Search, 
  Filter,
  Building2,
  MapPin,
  Calendar,
  ArrowUpRight,
  Loader2,
  ChevronRight
} from 'lucide-react';
import { Button } from '../../components/ui/button';

type Activity = Database["public"]["Tables"]["activities"]["Row"];

export default function ActivityList() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    brand: '',
    city: '',
    status: ''
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchActivities = async () => {
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
      {/* Header with centered title on mobile */}
      <div className="flex flex-col items-center text-center md:text-left md:flex-row md:justify-between md:items-center">
        <div className="w-full md:w-auto mb-4 md:mb-0">
          <h1 className="text-2xl font-semibold text-[#00A979] text-center md:text-left">Activities</h1>
          <p className="mt-1 text-sm text-gray-600 text-center md:text-left">
            Manage your activities and campaigns
          </p>
        </div>
        <Button 
          onClick={() => navigate('/cupshup/activities/new')}
          className="w-full md:w-auto bg-primary text-white hover:bg-primary/90"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          New Activity
        </Button>
      </div>

      {/* Search and Filters - Full width on mobile */}
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

          {/* Mobile Activity Cards */}
          <div className="md:hidden mt-6 space-y-4">
            {activities.length === 0 ? (
              <div className="text-center py-8">
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No activities found</h3>
                <p className="text-gray-600 mb-4">Create your first activity to get started</p>
                <Button 
                  onClick={() => navigate('/cupshup/activities/new')}
                  className="bg-primary text-white hover:bg-primary/90"
                >
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Create Activity
                </Button>
              </div>
            ) : (
              activities.map((activity) => (
                <div 
                  key={activity.id}
                  className="bg-white rounded-lg border border-gray-200 p-4"
                  onClick={() => navigate(`/cupshup/activities/${activity.id}`)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900">{activity.brand}</h3>
                      {activity.status === 'pending' && (
                        <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">
                          Pending
                        </span>
                      )}
                      {activity.status === 'in_progress' && (
                        <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                          In Progress
                        </span>
                      )}
                      {activity.status === 'completed' && (
                        <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                          Completed
                        </span>
                      )}
                      {activity.status === 'cancelled' && (
                        <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
                          Cancelled
                        </span>
                      )}
                      {!activity.status && (
                        <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                          Unknown
                        </span>
                      )}
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

          {/* Desktop Table - Hidden on mobile */}
          <div className="hidden md:block overflow-x-auto mt-6">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Brand</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">City</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Location</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Date Range</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                  <th className="w-20"></th>
                </tr>
              </thead>
              <tbody>
                {activities.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12">
                      <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Calendar className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No activities found</h3>
                      <p className="text-gray-600 mb-4">Create your first activity to get started</p>
                      <Button 
                        onClick={() => navigate('/cupshup/activities/new')}
                        className="bg-primary text-white hover:bg-primary/90"
                      >
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Create Activity
                      </Button>
                    </td>
                  </tr>
                ) : (
                  activities.map((activity) => (
                    <tr 
                      key={activity.id}
                      className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigate(`/cupshup/activities/${activity.id}`)}
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
                          {activity.city || '-'}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center text-gray-600">
                          <MapPin className="w-4 h-4 mr-2" />
                          {activity.location || '-'}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {activity.start_date && (
                          <div className="flex items-center text-gray-600">
                            <Calendar className="w-4 h-4 mr-2" />
                            {new Date(activity.start_date).toLocaleDateString()}
                            {activity.end_date && (
                              <> - {new Date(activity.end_date).toLocaleDateString()}</>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        {activity.status === 'pending' && (
                          <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">
                            Pending
                          </span>
                        )}
                        {activity.status === 'in_progress' && (
                          <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                            In Progress
                          </span>
                        )}
                        {activity.status === 'completed' && (
                          <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                            Completed
                          </span>
                        )}
                        {activity.status === 'cancelled' && (
                          <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
                            Cancelled
                          </span>
                        )}
                        {!activity.status && (
                          <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                            Unknown
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex justify-end">
                          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-500">
                            <ArrowUpRight className="w-4 h-4" />
                          </Button>
                        </div>
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
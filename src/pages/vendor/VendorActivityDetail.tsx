import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { 
  Building2, 
  MapPin, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  ArrowLeft,
  PlusCircle
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { useAuth } from '../../contexts/AuthContext';

interface Activity {
  id: string;
  brand: string;
  city: string | null;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  instructions: string | null;
  created_at: string | null;
}

interface ActivityWithAssignments extends Activity {
  activity_assignments: {
    id: string;
    activity_id: string;
    vendor_id: string;
  }[];
}

export default function VendorActivityDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivityDetails = async () => {
      try {
        if (!id || !user?.id) return;

        const { data: activityData, error: activityError } = await supabase
          .from('activities')
          .select(`
            *,
            activity_assignments!inner(*)
          `)
          .eq('id', id)
          .eq('activity_assignments.vendor_id', user.id)
          .single();

        if (activityError) throw activityError;

        if (!activityData) {
          throw new Error('Activity not found');
        }

        // Type assertion since we know the structure
        const typedActivity: Activity = {
          id: activityData.id,
          brand: activityData.brand,
          city: activityData.city,
          location: activityData.location,
          start_date: activityData.start_date,
          end_date: activityData.end_date,
          status: activityData.status || 'pending',
          instructions: activityData.instructions,
          created_at: activityData.created_at
        };

        setActivity(typedActivity);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch activity details');
      } finally {
        setLoading(false);
      }
    };

    fetchActivityDetails();
  }, [id, user]);

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
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
          <p className="text-red-600 mb-4">
            {error || 'Activity not found'}
          </p>
          <Button
            onClick={() => navigate('/vendor/my-activities')}
            variant="outline"
            className="text-primary hover:text-primary/80"
          >
            Back to My Activities
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with back button */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/vendor/my-activities')}
          className="text-gray-600 -ml-3"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold text-[#00A979]">Activity Details</h1>
          <p className="text-sm text-gray-600">View activity information and add tasks</p>
        </div>
      </div>

      {/* Activity Details Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {/* Brand and Status */}
        <div className="px-4 py-3 sm:px-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#00A979]" />
            <span className="font-medium text-gray-900">{activity.brand}</span>
          </div>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
            activity.status === 'completed' ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20' :
            activity.status === 'in_progress' ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-700/10' :
            activity.status === 'cancelled' ? 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/10' :
            'bg-yellow-50 text-yellow-800 ring-1 ring-inset ring-yellow-600/20'
          }`}>
            {activity.status === 'completed' && <CheckCircle2 className="w-3 h-3" />}
            {activity.status === 'pending' && <AlertCircle className="w-3 h-3" />}
            {activity.status === 'in_progress' && <Clock className="w-3 h-3" />}
            {activity.status.charAt(0).toUpperCase() + activity.status.slice(1).replace('_', ' ')}
          </span>
        </div>

        {/* Main Content */}
        <div className="p-4 sm:p-6 space-y-6">
          {/* Location & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-2">Location</h3>
                <div className="flex items-center gap-2 text-gray-700">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>
                    {activity.city && activity.location
                      ? `${activity.city} - ${activity.location}`
                      : activity.city || activity.location || 'No location specified'
                    }
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-2">Date Range</h3>
                <div className="flex items-center gap-2 text-gray-700">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>
                    {activity.start_date && (
                      <>
                        {new Date(activity.start_date).toLocaleDateString()}
                        {activity.end_date && (
                          <> - {new Date(activity.end_date).toLocaleDateString()}</>
                        )}
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">Instructions</h3>
              <p className="text-gray-700 whitespace-pre-wrap">
                {activity.instructions || 'No specific instructions provided.'}
              </p>
            </div>
          </div>

          {/* Add Task Button */}
          <div className="pt-4 sm:pt-6 border-t border-gray-100">
            <Button
              onClick={() => navigate(`/vendor/activities/${activity.id}/tasks/new`)}
              className="w-full bg-[#00A979] text-white hover:bg-[#00A979]/90 h-10"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Add New Task
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
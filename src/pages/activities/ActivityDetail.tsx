import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Database } from "../../types/database";
import {
  Building2,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  UserPlus
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import AssignVendorDialog from './AssignVendorDialog';

type Activity = Database["public"]["Tables"]["activities"]["Row"];

export default function ActivityDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);

  useEffect(() => {
    const fetchActivityDetails = async () => {
      try {
        if (!id) return;
        
        const { data, error } = await supabase
          .from('activities')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setActivity(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch activity details');
      } finally {
        setLoading(false);
      }
    };

    fetchActivityDetails();
  }, [id]);

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
            onClick={() => navigate('/cupshup/activities')}
            variant="outline"
            className="text-primary hover:text-primary/80"
          >
            Back to Activities
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with back button and title */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/cupshup/activities')}
          className="text-gray-600 -ml-2"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold text-[#00A979]">Activity Details</h1>
          <p className="text-sm text-gray-600">View and manage activity information</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={() => setIsAssignDialogOpen(true)}
          className="w-full sm:w-auto bg-primary text-white hover:bg-primary/90"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Assign
        </Button>
        <span className={`inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
          activity.status === 'completed' ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20' :
          activity.status === 'in_progress' ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-700/10' :
          activity.status === 'cancelled' ? 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/10' :
          'bg-yellow-50 text-yellow-800 ring-1 ring-inset ring-yellow-600/20'
        }`}>
          {activity.status === 'completed' && <CheckCircle2 className="w-4 h-4" />}
          {activity.status === 'pending' && <AlertCircle className="w-4 h-4" />}
          {activity.status === 'in_progress' && <Clock className="w-4 h-4" />}
          {activity.status ? (
            activity.status.charAt(0).toUpperCase() + activity.status.slice(1).replace('_', ' ')
          ) : (
            'Unknown'
          )}
        </span>
      </div>

      {/* Activity Details */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-sm font-medium text-gray-600 mb-4">Activity Information</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Building2 className="w-4 h-4 flex-shrink-0" />
                  <span className="font-medium">{activity.brand}</span>
                </div>
                
                {activity.city && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span>{activity.city}</span>
                    {activity.location && (
                      <span className="text-gray-400">({activity.location})</span>
                    )}
                  </div>
                )}
                
                {activity.start_date && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4 flex-shrink-0" />
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
      </div>

      {/* Assign Vendor Dialog */}
      <AssignVendorDialog
        activityId={activity.id}
        open={isAssignDialogOpen}
        onOpenChange={setIsAssignDialogOpen}
      />
    </div>
  );
}
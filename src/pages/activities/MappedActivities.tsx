import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { 
  Calendar,
  Search,
  Filter,
  MapPin,
  Building2,
  Users,
  Loader2,
} from 'lucide-react';
import { Button } from '../../components/ui/button';

interface Assignment {
  id: string;
  activity: {
    brand: string;
    city: string | null;
    location: string | null;
    start_date: string | null;
  };
  profile: {
    name: string;
  };
}

export default function MappedActivities() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const { data, error } = await supabase
          .from('activity_assignments')
          .select(`
            id,
            activity:activities (
              brand,
              city,
              location,
              start_date
            ),
            profile:profiles!vendor_id (
              name
            )
          `)
          .order('id', { ascending: false });

        if (error) throw error;
        setAssignments(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch assignments');
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, []);

  const filteredAssignments = assignments.filter(assignment => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      assignment.activity.brand.toLowerCase().includes(searchLower) ||
      assignment.activity.city?.toLowerCase().includes(searchLower) ||
      assignment.activity.location?.toLowerCase().includes(searchLower) ||
      assignment.profile.name.toLowerCase().includes(searchLower)
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Mapped Activities</h1>
          <p className="mt-1 text-sm text-gray-600">
            View all vendor assignments
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6">
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search assignments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <Button variant="outline" className="text-gray-600">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Assignments Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Brand</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">City</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Location</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Start Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Vendor</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssignments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12">
                      <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments found</h3>
                      <p className="text-gray-600 mb-4">Assign vendors to activities to see them here</p>
                      <Button 
                        onClick={() => navigate('/cupshup/activities')}
                        className="bg-primary text-white hover:bg-primary/90"
                      >
                        View Activities
                      </Button>
                    </td>
                  </tr>
                ) : (
                  filteredAssignments.map((assignment) => (
                    <tr 
                      key={assignment.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center text-gray-600">
                          <Building2 className="w-4 h-4 mr-2" />
                          {assignment.activity.brand}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center text-gray-600">
                          <MapPin className="w-4 h-4 mr-2" />
                          {assignment.activity.city || '-'}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center text-gray-600">
                          <MapPin className="w-4 h-4 mr-2" />
                          {assignment.activity.location || '-'}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center text-gray-600">
                          <Calendar className="w-4 h-4 mr-2" />
                          {assignment.activity.start_date 
                            ? new Date(assignment.activity.start_date).toLocaleDateString()
                            : '-'
                          }
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center text-gray-600">
                          <Users className="w-4 h-4 mr-2" />
                          {assignment.profile.name}
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
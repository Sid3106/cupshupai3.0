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
  ChevronRight
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

        // Sort assignments by activity start_date in descending order
        const sortedAssignments = (data || []).sort((a, b) => {
          const dateA = a.activity.start_date ? new Date(a.activity.start_date).getTime() : 0;
          const dateB = b.activity.start_date ? new Date(b.activity.start_date).getTime() : 0;
          return dateB - dateA; // Sort in descending order (latest first)
        });

        setAssignments(sortedAssignments);
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
      {/* Header with centered title on mobile */}
      <div className="flex flex-col items-center text-center md:text-left md:flex-row md:justify-between md:items-center">
        <div className="w-full md:w-auto mb-4 md:mb-0">
          <h1 className="text-2xl font-semibold text-[#00A979] text-center md:text-left">Mapped Activities</h1>
          <p className="mt-1 text-sm text-gray-600 text-center md:text-left">
            View all vendor assignments
          </p>
        </div>
      </div>

      {/* Search and Filters - Full width on mobile */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
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
            <Button variant="outline" className="w-full md:w-auto text-gray-600">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Assignments List */}
          <div className="overflow-x-auto">
            {filteredAssignments.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments found</h3>
                <p className="text-gray-600 mb-4">Assign vendors to activities to see them here</p>
                <Button 
                  onClick={() => navigate('/cupshup/activities')}
                  className="w-full md:w-auto bg-primary text-white hover:bg-primary/90"
                >
                  View Activities
                </Button>
              </div>
            ) : (
              <>
                {/* Mobile View */}
                <div className="md:hidden space-y-4">
                  {filteredAssignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="bg-white rounded-lg border border-gray-200 p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center text-gray-900 font-medium">
                            <Building2 className="w-4 h-4 mr-2 text-gray-400" />
                            {assignment.activity.brand}
                          </div>
                          <div className="flex items-center text-gray-600 text-sm">
                            <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                            {assignment.activity.city || '-'} - {assignment.activity.location || '-'}
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center text-gray-600">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          {assignment.activity.start_date 
                            ? new Date(assignment.activity.start_date).toLocaleDateString()
                            : '-'
                          }
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Users className="w-4 h-4 mr-2 text-gray-400" />
                          {assignment.profile.name}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop View */}
                <div className="hidden md:block">
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
                      {filteredAssignments.map((assignment) => (
                        <tr 
                          key={assignment.id}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="py-4 px-4">
                            <div className="flex items-center text-gray-900 font-medium">
                              <Building2 className="w-4 h-4 mr-2 text-gray-400" />
                              {assignment.activity.brand}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center text-gray-600">
                              <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                              {assignment.activity.city || '-'}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center text-gray-600">
                              <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                              {assignment.activity.location || '-'}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center text-gray-600">
                              <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                              {assignment.activity.start_date 
                                ? new Date(assignment.activity.start_date).toLocaleDateString()
                                : '-'
                              }
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center text-gray-600">
                              <Users className="w-4 h-4 mr-2 text-gray-400" />
                              {assignment.profile.name}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
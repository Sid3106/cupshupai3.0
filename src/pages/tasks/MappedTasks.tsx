import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  Search,
  Loader2,
  ClipboardList,
  CalendarDays,
  User,
  Phone,
  ShoppingBag,
  Building2
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { useAuth } from '../../contexts/AuthContext';

interface Task {
  id: string;
  customer_name: string;
  customer_number: number;
  order_id: string | null;
  order_image_url: string;
  created_at: string | null;
  vendor: {
    email: string | null;
  } | null;
  activity: {
    brand: string;
    city: string | null;
    location: string | null;
  } | null;
}

export default function MappedTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchAllTasks = async () => {
      try {
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await supabase
          .from('tasks')
          .select(`
            *,
            vendor:vendors!inner(
              user_id,
              vendor_name,
              profile:profiles!inner(
                email
              )
            ),
            activity:activities(
              brand,
              city,
              location
            )
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        // Transform the data to match our Task interface
        const transformedTasks: Task[] = (data || []).map(task => ({
          id: task.id,
          customer_name: task.customer_name,
          customer_number: task.customer_number,
          order_id: task.order_id,
          order_image_url: task.order_image_url,
          created_at: task.created_at,
          vendor: task.vendor ? { 
            email: task.vendor.profile.email 
          } : null,
          activity: task.activity ? {
            brand: task.activity.brand,
            city: task.activity.city,
            location: task.activity.location
          } : null
        }));

        setTasks(transformedTasks);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
      } finally {
        setLoading(false);
      }
    };

    fetchAllTasks();
  }, [user]);

  // Update the filter to handle potentially null values
  const filteredTasks = tasks.filter(task => 
    task.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.order_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.activity?.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.activity?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.vendor?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Mapped Tasks</h1>
          <p className="mt-1 text-sm text-gray-600">
            View all tasks created by vendors across different activities
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6">
          {/* Search */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by customer name, order ID, brand, city or vendor email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          {/* Tasks Table */}
          <div className="overflow-x-auto">
            {tasks.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ClipboardList className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
                <p className="text-gray-600">
                  Tasks created by vendors will appear here
                </p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Activity Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vendor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date Created
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTasks.map((task) => (
                    <tr key={task.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="ml-4">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-gray-400" />
                              <div className="text-sm font-medium text-gray-900">
                                {task.customer_name}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <Phone className="w-4 h-4 text-gray-400" />
                              <div className="text-sm text-gray-500">
                                {task.customer_number}
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <ShoppingBag className="w-4 h-4 text-gray-400" />
                          <div className="text-sm text-gray-900">
                            {task.order_id || 'N/A'}
                          </div>
                        </div>
                        {task.order_image_url && (
                          <a
                            href={task.order_image_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary text-sm hover:underline mt-1 block"
                          >
                            View Image
                          </a>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          <div>
                            <div className="text-sm text-gray-900 font-medium">
                              {task.activity?.brand}
                            </div>
                            <div className="text-sm text-gray-500">
                              {task.activity?.city} - {task.activity?.location}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {task.vendor?.email || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="w-4 h-4 text-gray-400" />
                          {task.created_at ? new Date(task.created_at).toLocaleDateString() : 'N/A'}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 
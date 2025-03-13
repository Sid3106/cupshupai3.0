import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  Search,
  Filter,
  Download,
  ClipboardList,
  Loader2,
  CalendarDays,
  User,
  Phone,
  ShoppingBag,
  MapPin,
  Building2
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';

interface Task {
  id: string;
  customer_name: string;
  customer_number: number;
  order_id: string | null;
  order_image_url: string;
  created_at: string | null;
  activity: {
    brand: string;
    city: string | null;
    location: string | null;
  } | null;
}

export default function BrandTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    location: '',
    city: '',
    startDate: '',
    endDate: ''
  });

  const itemsPerPage = 25;

  useEffect(() => {
    const fetchBrandTasks = async () => {
      try {
        if (!user) throw new Error('Not authenticated');

        // First get the client's brand name
        console.log('Fetching client data for user:', user.id);
        const { data: clientData, error: clientError } = await supabase
          .from('clients')
          .select('brand_name')
          .eq('user_id', user.id)
          .single();

        if (clientError) {
          console.error('Error fetching client data:', clientError);
          throw clientError;
        }
        if (!clientData) {
          console.error('No client data found for user:', user.id);
          throw new Error('Client data not found');
        }
        console.log('Found client data:', clientData);

        // Then fetch tasks for this brand's activities
        console.log('Fetching tasks for brand:', clientData.brand_name);
        const { data, error, count } = await supabase
          .from('tasks')
          .select(`
            id,
            customer_name,
            customer_number,
            order_id,
            order_image_url,
            created_at,
            activity:activities!inner (
              brand,
              city,
              location
            )
          `, { count: 'exact' })
          .eq('activities.brand', clientData.brand_name)
          .order('created_at', { ascending: false })
          .range((page - 1) * itemsPerPage, page * itemsPerPage - 1);

        if (error) {
          console.error('Error fetching tasks:', error);
          throw error;
        }
        console.log('Found tasks:', data);
        
        setTasks(data || []);
        if (count) {
          setTotalPages(Math.ceil(count / itemsPerPage));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
      } finally {
        setLoading(false);
      }
    };

    fetchBrandTasks();
  }, [user, page]);

  // Filter tasks based on search term and filters
  const filteredTasks = tasks.filter(task => {
    if (!task.activity) return false;
    
    const matchesSearch = searchTerm === '' || 
      task.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.order_id?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLocation = filters.location === '' || 
      task.activity.location?.toLowerCase().includes(filters.location.toLowerCase());

    const matchesCity = filters.city === '' || 
      task.activity.city?.toLowerCase().includes(filters.city.toLowerCase());

    const createdDate = task.created_at ? new Date(task.created_at) : null;
    const matchesDateRange = (
      !filters.startDate || 
      !createdDate || 
      createdDate >= new Date(filters.startDate)
    ) && (
      !filters.endDate || 
      !createdDate || 
      createdDate <= new Date(filters.endDate)
    );

    return matchesSearch && matchesLocation && matchesCity && matchesDateRange;
  });

  const downloadCSV = () => {
    if (filteredTasks.length === 0) return;

    const headers = [
      'Customer Name',
      'Customer Number',
      'Order ID',
      'Order Image URL',
      'Location',
      'Date Created'
    ];
    const csvData = filteredTasks.map(task => [
      task.customer_name,
      task.customer_number,
      task.order_id || '',
      task.order_image_url || '',
      task.activity?.location || '',
      task.created_at ? format(new Date(task.created_at), 'yyyy-MM-dd HH:mm:ss') : ''
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `brand-tasks-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
      <div className="flex flex-col items-center text-center md:text-left md:flex-row md:justify-between md:items-center">
        <div className="w-full md:w-auto mb-4 md:mb-0">
          <h1 className="text-2xl font-semibold text-[#00A979]">Brand Tasks</h1>
          <p className="mt-1 text-sm text-gray-600">
            View all tasks created across different activities
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6">
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by customer name or order ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            {/* Filter Inputs */}
            <input
              type="text"
              placeholder="Filter by location"
              value={filters.location}
              onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
              className="w-full md:w-48 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <input
              type="text"
              placeholder="Filter by city"
              value={filters.city}
              onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
              className="w-full md:w-48 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
              className="w-full md:w-auto px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
              className="w-full md:w-auto px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />

            {/* Download Button */}
            <Button
              onClick={downloadCSV}
              variant="outline"
              className="w-full md:w-auto gap-2"
              disabled={filteredTasks.length === 0}
            >
              <Download className="w-4 h-4" />
              Download CSV
            </Button>
          </div>

          {/* Tasks Table */}
          <div className="overflow-x-auto">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ClipboardList className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
                <p className="text-gray-600">
                  Tasks will appear here once vendors create them
                </p>
              </div>
            ) : (
              <>
                {/* Desktop View */}
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Customer Name</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Customer Number</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Order Image</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Order ID</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Location</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Date Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTasks.map((task) => (
                      <tr key={task.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-900 font-medium">{task.customer_name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">{task.customer_number}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          {task.order_image_url && (
                            <a
                              href={task.order_image_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline flex items-center gap-2"
                            >
                              <ShoppingBag className="w-4 h-4 text-gray-400" />
                              View Order Image
                            </a>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <ShoppingBag className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-900">{task.order_id || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-900">{task.activity?.location || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">{task.activity?.city || 'N/A'}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2 text-gray-600">
                            <CalendarDays className="w-4 h-4 text-gray-400" />
                            {task.created_at ? format(new Date(task.created_at), 'MMM d, yyyy HH:mm') : 'N/A'}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-6">
                    <Button
                      variant="outline"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <span className="py-2 px-4 text-sm text-gray-600">
                      Page {page} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 
import { useState, useEffect, ChangeEvent } from 'react';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';
import { 
  Search,
  Loader2,
  ClipboardList,
  CalendarDays,
  User,
  Phone,
  ShoppingBag,
  Building2,
  ChevronRight,
  MapPin,
  Download,
  ChevronLeft,
  ChevronRight as ChevronRightIcon
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

interface Filters {
  location: string;
  city: string;
  startDate: string;
  endDate: string;
}

export default function MappedTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<Filters>({
    location: '',
    city: '',
    startDate: '',
    endDate: '',
  });
  const [uniqueLocations, setUniqueLocations] = useState<string[]>([]);
  const [uniqueCities, setUniqueCities] = useState<string[]>([]);

  const ITEMS_PER_PAGE = 25;

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

        // Extract unique locations and cities
        const locations = [...new Set(transformedTasks.map(task => task.activity?.location).filter(Boolean))];
        const cities = [...new Set(transformedTasks.map(task => task.activity?.city).filter(Boolean))];
        setUniqueLocations(locations as string[]);
        setUniqueCities(cities as string[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
      } finally {
        setLoading(false);
      }
    };

    fetchAllTasks();
  }, [user]);

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = 
      task.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.order_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(task.customer_number).includes(searchTerm);

    const matchesLocation = !filters.location || task.activity?.location === filters.location;
    const matchesCity = !filters.city || task.activity?.city === filters.city;
    
    const taskDate = task.created_at ? new Date(task.created_at) : null;
    const matchesDateRange = (!filters.startDate || !filters.endDate || !taskDate) ? true : (
      taskDate >= new Date(filters.startDate) && 
      taskDate <= new Date(filters.endDate)
    );

    return matchesSearch && matchesLocation && matchesCity && matchesDateRange;
  });

  const totalPages = Math.ceil(filteredTasks.length / ITEMS_PER_PAGE);
  const paginatedTasks = filteredTasks.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const downloadCSV = () => {
    const headers = ['Customer Name', 'Customer Number', 'Order Image URL', 'Order ID', 'Location', 'Date Created'];
    const csvData = filteredTasks.map(task => [
      task.customer_name,
      task.customer_number,
      task.order_image_url,
      task.order_id || '',
      `${task.activity?.city || ''} - ${task.activity?.location || ''}`,
      task.created_at ? format(new Date(task.created_at), 'yyyy-MM-dd HH:mm:ss') : ''
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `mapped-tasks-${format(new Date(), 'yyyy-MM-dd')}.csv`);
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
      <div className="flex flex-col items-center text-center md:text-left md:flex-row md:justify-between md:items-center">
        <div className="w-full md:w-auto mb-4 md:mb-0">
          <h1 className="text-2xl font-semibold text-[#00A979] text-center md:text-left">Mapped Tasks</h1>
          <p className="mt-1 text-sm text-gray-600 text-center md:text-left">
            View all tasks created by vendors across different activities
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 md:p-6">
          {/* Search and Filters */}
          <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-center md:space-x-4 mb-6">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, number or order ID..."
                value={searchTerm}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            {/* Location and City Filters */}
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
              <select
                value={filters.location}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                className="w-full md:w-48 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="">All Locations</option>
                {uniqueLocations.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>

              <select
                value={filters.city}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setFilters(prev => ({ ...prev, city: e.target.value }))}
                className="w-full md:w-48 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="">All Cities</option>
                {uniqueCities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            {/* Date Range Filters */}
            <div className="flex space-x-2">
              <input
                type="date"
                value={filters.startDate}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full md:w-36 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <input
                type="date"
                value={filters.endDate}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full md:w-36 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            {/* Download Button */}
            <Button
              onClick={downloadCSV}
              variant="outline"
              className="w-full md:w-auto text-primary hover:text-primary/80"
            >
              <Download className="w-4 h-4 mr-2" />
              Download CSV
            </Button>
          </div>

          {/* Tasks List */}
          <div className="overflow-x-auto">
            {paginatedTasks.length === 0 ? (
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
              <>
                {/* Mobile View */}
                <div className="md:hidden space-y-4">
                  {paginatedTasks.map((task) => (
                    <div
                      key={task.id}
                      className="bg-white rounded-lg border border-gray-200 p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-900 font-medium">{task.customer_name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">{task.customer_number}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <ShoppingBag className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-900">{task.order_id || 'N/A'}</span>
                        </div>
                        {task.order_image_url && (
                          <a
                            href={task.order_image_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary text-sm hover:underline block ml-6"
                          >
                            View Order Image
                          </a>
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">
                            {task.activity?.city} - {task.activity?.location}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-gray-600">
                        <CalendarDays className="w-4 h-4 text-gray-400" />
                        {task.created_at ? format(new Date(task.created_at), 'MMM d, yyyy HH:mm') : 'N/A'}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop View */}
                <div className="hidden md:block">
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
                      {paginatedTasks.map((task) => (
                        <tr key={task.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                          <td className="py-3 px-4">
                            <span className="text-gray-900">{task.customer_name}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-gray-600">{task.customer_number}</span>
                          </td>
                          <td className="py-3 px-4">
                            {task.order_image_url && (
                              <a
                                href={task.order_image_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                              >
                                View Order Image
                              </a>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <ShoppingBag className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-900">{task.order_id || 'N/A'}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-gray-600">
                              {task.activity?.city} - {task.activity?.location}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-gray-600">
                              {task.created_at ? format(new Date(task.created_at), 'MMM d, yyyy HH:mm') : 'N/A'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>

          {/* Pagination */}
          {filteredTasks.length > 0 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredTasks.length)} of {filteredTasks.length} entries
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRightIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
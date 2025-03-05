import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { 
  Building2,
  Search,
  Filter,
  MapPin,
  Mail,
  Phone,
  Loader2,
  PlusCircle,
  Trash2,
  Edit,
  ChevronRight
} from 'lucide-react';
import { Button } from '../../components/ui/button';

interface Client {
  id: string;
  user_id: string;
  brand_name: string;
  phone: string | null;
  city: string | null;
  created_at: string | null;
  email?: string;
}

export default function ClientList() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const { data, error } = await supabase
          .from('clients')
          .select(`
            *,
            profiles!inner(email)
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Transform the data to include email from profiles
        const transformedData = data?.map(client => ({
          ...client,
          email: client.profiles.email
        })) || [];

        setClients(transformedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch clients');
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this client?')) return;

    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;
      setClients(clients.filter(client => client.user_id !== userId));
    } catch (err) {
      console.error('Error deleting client:', err);
      alert('Failed to delete client');
    }
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
      {/* Header with centered title on mobile */}
      <div className="flex flex-col items-center text-center md:text-left md:flex-row md:justify-between md:items-center">
        <div className="w-full md:w-auto mb-4 md:mb-0">
          <h1 className="text-2xl font-semibold text-[#00A979] text-center md:text-left">Clients</h1>
          <p className="mt-1 text-sm text-gray-600 text-center md:text-left">
            Manage your client relationships
          </p>
        </div>
        <Button 
          onClick={() => navigate('/cupshup/invite/client')}
          className="w-full md:w-auto bg-primary text-white hover:bg-primary/90"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Invite Client
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
                placeholder="Search clients..."
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

          {/* Mobile Client Cards */}
          <div className="md:hidden mt-6 space-y-4">
            {clients.length === 0 ? (
              <div className="text-center py-8">
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No clients found</h3>
                <p className="text-gray-600 mb-4">Invite your first client to get started</p>
                <Button 
                  onClick={() => navigate('/cupshup/invite/client')}
                  className="bg-primary text-white hover:bg-primary/90"
                >
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Invite Client
                </Button>
              </div>
            ) : (
              clients.map((client) => (
                <div 
                  key={client.id}
                  className="bg-white rounded-lg border border-gray-200 p-4"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900">{client.brand_name}</h3>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-600">
                      <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{client.email}</span>
                    </div>
                    {client.phone && (
                      <div className="flex items-center text-gray-600">
                        <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                        {client.phone}
                      </div>
                    )}
                    {client.city && (
                      <div className="flex items-center text-gray-600">
                        <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                        {client.city}
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
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Client</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Contact</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Location</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Joined</th>
                  <th className="w-20"></th>
                </tr>
              </thead>
              <tbody>
                {clients.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12">
                      <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Building2 className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No clients found</h3>
                      <p className="text-gray-600 mb-4">Invite your first client to get started</p>
                      <Button 
                        onClick={() => navigate('/cupshup/invite/client')}
                        className="bg-primary text-white hover:bg-primary/90"
                      >
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Invite Client
                      </Button>
                    </td>
                  </tr>
                ) : (
                  clients.map((client) => (
                    <tr 
                      key={client.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-4 px-4">
                        <div className="font-medium text-gray-900">{client.brand_name}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center text-gray-600">
                            <Mail className="w-4 h-4 mr-2" />
                            {client.email}
                          </div>
                          {client.phone && (
                            <div className="flex items-center text-gray-600">
                              <Phone className="w-4 h-4 mr-2" />
                              {client.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {client.city && (
                          <div className="flex items-center text-gray-600">
                            <MapPin className="w-4 h-4 mr-2" />
                            {client.city}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4 text-gray-600">
                        {new Date(client.created_at || '').toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(client.user_id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-gray-600 hover:text-gray-700"
                          >
                            <Edit className="w-4 h-4" />
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
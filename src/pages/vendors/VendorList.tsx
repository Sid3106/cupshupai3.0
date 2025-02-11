import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { 
  Users,
  Search,
  Filter,
  MapPin,
  Mail,
  Phone,
  Loader2,
  PlusCircle,
  Trash2,
  Edit
} from 'lucide-react';
import { Button } from '../../components/ui/button';

interface Vendor {
  id: string;
  user_id: string;
  vendor_name: string;
  email: string;
  phone: string | null;
  city: string | null;
  created_at: string;
}

export default function VendorList() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        // First, check if we're authenticated
        const { data: { user } } = await supabase.auth.getUser();
        console.log('Current user:', user);

        // Fetch vendors with their profile information
        const { data, error } = await supabase
          .from('vendors')
          .select(`
            id,
            user_id,
            vendor_name,
            phone,
            city,
            created_at,
            profiles!inner (
              email
            )
          `)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }

        // Transform the data to match our interface
        const transformedData: Vendor[] = data?.map(vendor => ({
          id: vendor.id,
          user_id: vendor.user_id,
          vendor_name: vendor.vendor_name,
          email: vendor.profiles.email,
          phone: vendor.phone,
          city: vendor.city,
          created_at: vendor.created_at
        })) || [];

        console.log('Fetched vendors:', transformedData);
        setVendors(transformedData);
      } catch (err) {
        console.error('Error in fetchVendors:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch vendors');
      } finally {
        setLoading(false);
      }
    };

    fetchVendors();
  }, []);

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this vendor?')) return;

    try {
      const { error } = await supabase
        .from('vendors')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;
      setVendors(vendors.filter(vendor => vendor.user_id !== userId));
    } catch (err) {
      console.error('Error deleting vendor:', err);
      alert('Failed to delete vendor');
    }
  };

  const filteredVendors = vendors.filter(vendor => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      vendor.vendor_name?.toLowerCase().includes(searchLower) ||
      vendor.email?.toLowerCase().includes(searchLower) ||
      vendor.phone?.toLowerCase().includes(searchLower) ||
      vendor.city?.toLowerCase().includes(searchLower)
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
          <h1 className="text-2xl font-semibold text-gray-900">Vendors</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your vendor network ({vendors.length} total)
          </p>
        </div>
        <Button 
          onClick={() => navigate('/cupshup/invite/vendor')}
          className="bg-primary text-white hover:bg-primary/90"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Invite Vendor
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6">
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search vendors..."
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

          {/* Vendors Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Vendor</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Contact</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Location</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Joined</th>
                  <th className="w-20"></th>
                </tr>
              </thead>
              <tbody>
                {filteredVendors.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12">
                      <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {searchTerm ? 'No vendors found matching your search' : 'No vendors found'}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {searchTerm ? 'Try adjusting your search terms' : 'Invite your first vendor to get started'}
                      </p>
                      {!searchTerm && (
                        <Button 
                          onClick={() => navigate('/cupshup/invite/vendor')}
                          className="bg-primary text-white hover:bg-primary/90"
                        >
                          <PlusCircle className="w-4 h-4 mr-2" />
                          Invite Vendor
                        </Button>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredVendors.map((vendor) => (
                    <tr 
                      key={vendor.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-4 px-4">
                        <div className="font-medium text-gray-900">{vendor.vendor_name}</div>
                        <div className="text-sm text-gray-500">ID: {vendor.user_id}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center text-gray-600">
                            <Mail className="w-4 h-4 mr-2" />
                            {vendor.email}
                          </div>
                          {vendor.phone && (
                            <div className="flex items-center text-gray-600">
                              <Phone className="w-4 h-4 mr-2" />
                              {vendor.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {vendor.city && (
                          <div className="flex items-center text-gray-600">
                            <MapPin className="w-4 h-4 mr-2" />
                            {vendor.city}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4 text-gray-600">
                        {new Date(vendor.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" className="text-blue-600">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-600"
                            onClick={() => handleDelete(vendor.user_id)}
                          >
                            <Trash2 className="w-4 h-4" />
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
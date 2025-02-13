import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { 
  Building2, 
  MapPin, 
  Calendar,
  Save,
  Loader2,
  ArrowLeft,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { useAuth } from '../../contexts/AuthContext';

// Define city options based on the enum in the database
const CITY_OPTIONS = [
  'Delhi',
  'Pune',
  'Noida',
  'Gurgaon',
  'Mumbai',
  'Bengaluru',
  'Chennai',
  'Jaipur',
  'Ahmedabad',
  'Kolkata',
  'Lucknow'
] as const;

interface Brand {
  brand_name: string;
}

export default function ActivityForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [formData, setFormData] = useState({
    brand: '',
    city: '',
    location: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    instructions: ''
  });
  
  const navigate = useNavigate();
  const { refreshSession } = useAuth();

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        await refreshSession();
        const { data, error } = await supabase
          .from('clients')
          .select('brand_name')
          .not('brand_name', 'is', null);

        if (error) {
          if (error.message.includes('JWT')) {
            throw new Error('Session expired. Please refresh the page or log in again.');
          }
          throw error;
        }

        const uniqueBrands = data
          ?.filter((item): item is { brand_name: string } => 
            item.brand_name != null
          )
          .filter((brand, index, self) => 
            index === self.findIndex(b => b.brand_name === brand.brand_name)
          );

        console.log('Fetched brands:', uniqueBrands);
        setBrands(uniqueBrands);
      } catch (err) {
        console.error('Error fetching brands:', err);
        setError(err instanceof Error ? err.message : 'Failed to load brands');
        if (err instanceof Error && err.message.includes('Session expired')) {
          navigate('/login');
        }
      }
    };

    fetchBrands();
  }, [navigate, refreshSession]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await refreshSession();
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      // Combine date and time for start and end
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`).toISOString();
      const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`).toISOString();

      const { data: activity, error: activityError } = await supabase
        .from('activities')
        .insert({
          brand: formData.brand,
          city: formData.city,
          location: formData.location,
          start_date: startDateTime,
          end_date: endDateTime,
          instructions: formData.instructions,
          created_by: userData.user.id,
          status: 'pending'
        })
        .select()
        .single();

      if (activityError) throw activityError;

      setSuccess(true);
      
      // Navigate after a short delay to show success message
      setTimeout(() => {
        navigate('/cupshup/activities');
      }, 2000);
    } catch (err) {
      if (err.message.includes('JWT') || err.message.includes('session')) {
        navigate('/login');
      }
      setError(err instanceof Error ? err.message : 'Failed to create activity');
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/cupshup/activities');
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="text-gray-600"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              Create New Activity
            </h1>
            <p className="text-sm text-gray-600">
              Fill in the activity details below
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-red-600">{error}</div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-green-800">Activity created successfully!</p>
              <p className="text-sm text-green-600">Redirecting to activities list...</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">
                Brand
              </label>
              <div className="relative">
                <Building2 className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <select
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none"
                  required
                >
                  <option value="">Select a brand</option>
                  {brands.map((brand) => (
                    <option key={brand.brand_name} value={brand.brand_name}>
                      {brand.brand_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <div className="relative">
                <MapPin className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <select
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none"
                  required
                >
                  <option value="">Select a city</option>
                  {CITY_OPTIONS.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <div className="relative">
                <MapPin className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Enter specific location"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  id="startDate"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  required
                />
              </div>
              <div>
                <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time
                </label>
                <input
                  type="time"
                  id="startTime"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  id="endDate"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  required
                />
              </div>
              <div>
                <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
                  End Time
                </label>
                <input
                  type="time"
                  id="endTime"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 mb-1">
              Instructions
            </label>
            <textarea
              id="instructions"
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="Add any specific instructions or notes..."
            />
          </div>

          <div className="flex justify-end space-x-4 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || success}
              className="bg-primary text-white hover:bg-primary/90"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Create Activity
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
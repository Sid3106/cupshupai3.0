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
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
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

  // Get today's date in YYYY-MM-DD format for date inputs
  const today = new Date().toISOString().split('T')[0];

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

  // Validate form fields
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.brand) {
      errors.brand = 'Please select a brand';
    }
    if (!formData.city) {
      errors.city = 'Please select a city';
    }
    if (!formData.location.trim()) {
      errors.location = 'Please enter a location';
    }
    if (!formData.startDate) {
      errors.startDate = 'Please select a start date';
    }
    if (!formData.startTime) {
      errors.startTime = 'Please select a start time';
    }
    if (!formData.endDate) {
      errors.endDate = 'Please select an end date';
    }
    if (!formData.endTime) {
      errors.endTime = 'Please select an end time';
    }
    if (!formData.instructions.trim()) {
      errors.instructions = 'Please provide activity instructions';
    }

    // Validate date ranges
    if (formData.startDate && formData.endDate) {
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime || '00:00'}`);
      const endDateTime = new Date(`${formData.endDate}T${formData.endTime || '00:00'}`);
      
      if (endDateTime < startDateTime) {
        errors.endDate = 'End date must be after start date';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError('Please fill in all required fields correctly');
      return;
    }

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
          location: formData.location.trim(),
          start_date: startDateTime,
          end_date: endDateTime,
          instructions: formData.instructions.trim(),
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
    } catch (err: unknown) {
      if (err instanceof Error && (err.message.includes('JWT') || err.message.includes('session'))) {
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
    <div className="space-y-4">
      {/* Header with back button and title */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCancel}
          className="text-gray-600 -ml-2"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold text-[#00A979]">Create New Activity</h1>
          <p className="text-sm text-gray-600">Fill in the activity details below</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 md:p-6">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">
                  Brand <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Building2 className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select
                    id="brand"
                    value={formData.brand}
                    onChange={(e) => {
                      setFormData({ ...formData, brand: e.target.value });
                      setValidationErrors({ ...validationErrors, brand: '' });
                    }}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none ${
                      validationErrors.brand ? 'border-red-300' : 'border-gray-200'
                    }`}
                    required
                  >
                    <option value="">Select a brand</option>
                    {brands.map((brand) => (
                      <option key={brand.brand_name} value={brand.brand_name}>
                        {brand.brand_name}
                      </option>
                    ))}
                  </select>
                  {validationErrors.brand && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.brand}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                  City <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select
                    id="city"
                    value={formData.city}
                    onChange={(e) => {
                      setFormData({ ...formData, city: e.target.value });
                      setValidationErrors({ ...validationErrors, city: '' });
                    }}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none ${
                      validationErrors.city ? 'border-red-300' : 'border-gray-200'
                    }`}
                    required
                  >
                    <option value="">Select a city</option>
                    {CITY_OPTIONS.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                  {validationErrors.city && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.city}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  Location <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    id="location"
                    value={formData.location}
                    onChange={(e) => {
                      setFormData({ ...formData, location: e.target.value });
                      setValidationErrors({ ...validationErrors, location: '' });
                    }}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${
                      validationErrors.location ? 'border-red-300' : 'border-gray-200'
                    }`}
                    placeholder="Enter specific location"
                    required
                  />
                  {validationErrors.location && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.location}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    value={formData.startDate}
                    min={today}
                    onChange={(e) => {
                      setFormData({ ...formData, startDate: e.target.value });
                      setValidationErrors({ ...validationErrors, startDate: '' });
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${
                      validationErrors.startDate ? 'border-red-300' : 'border-gray-200'
                    }`}
                    required
                  />
                  {validationErrors.startDate && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.startDate}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    id="startTime"
                    value={formData.startTime}
                    onChange={(e) => {
                      setFormData({ ...formData, startTime: e.target.value });
                      setValidationErrors({ ...validationErrors, startTime: '' });
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${
                      validationErrors.startTime ? 'border-red-300' : 'border-gray-200'
                    }`}
                    required
                  />
                  {validationErrors.startTime && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.startTime}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    value={formData.endDate}
                    min={formData.startDate || today}
                    onChange={(e) => {
                      setFormData({ ...formData, endDate: e.target.value });
                      setValidationErrors({ ...validationErrors, endDate: '' });
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${
                      validationErrors.endDate ? 'border-red-300' : 'border-gray-200'
                    }`}
                    required
                  />
                  {validationErrors.endDate && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.endDate}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
                    End Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    id="endTime"
                    value={formData.endTime}
                    onChange={(e) => {
                      setFormData({ ...formData, endTime: e.target.value });
                      setValidationErrors({ ...validationErrors, endTime: '' });
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${
                      validationErrors.endTime ? 'border-red-300' : 'border-gray-200'
                    }`}
                    required
                  />
                  {validationErrors.endTime && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.endTime}</p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 mb-1">
                Instructions <span className="text-red-500">*</span>
              </label>
              <textarea
                id="instructions"
                value={formData.instructions}
                onChange={(e) => {
                  setFormData({ ...formData, instructions: e.target.value });
                  setValidationErrors({ ...validationErrors, instructions: '' });
                }}
                rows={4}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${
                  validationErrors.instructions ? 'border-red-300' : 'border-gray-200'
                }`}
                placeholder="Add activity instructions or notes..."
                required
              />
              {validationErrors.instructions && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.instructions}</p>
              )}
            </div>

            <div className="flex flex-col md:flex-row justify-end gap-3 md:gap-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="w-full md:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || success}
                className="w-full md:w-auto bg-primary text-white hover:bg-primary/90"
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
    </div>
  );
}
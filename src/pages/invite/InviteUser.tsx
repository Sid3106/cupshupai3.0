import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { inviteVendor } from '../../lib/api';
import { 
  Users,
  Building2,
  Mail,
  Phone,
  MapPin,
  Loader2,
  PlusCircle,
  ArrowLeft
} from 'lucide-react';
import { Button } from '../../components/ui/button';

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

interface InviteUserProps {
  type: 'vendor' | 'client';
}

export default function InviteUser({ type }: InviteUserProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState<typeof CITY_OPTIONS[number] | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (type === 'vendor') {
        const response = await inviteVendor({
          vendorName: name,
          email,
          phone,
          city
        });

        if (!response.success) {
          throw new Error(response.error || 'Failed to invite vendor');
        }
      }
      setSuccess(true);
    } catch (err) {
      console.error('Error inviting user:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred while inviting the user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/cupshup');
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-6 text-center">
          <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            User Created Successfully!
          </h2>
          <p className="text-gray-600 mb-6">
            {type === 'vendor' ? 'Vendor' : 'Client'} account has been created for {email}.
            They will receive an email with instructions to set their password.
          </p>
          <div className="space-x-4">
            <Button
              onClick={() => navigate(`/cupshup/${type}s`)}
              className="bg-primary text-white hover:bg-primary/90"
            >
              View All {type === 'vendor' ? 'Vendors' : 'Clients'}
            </Button>
            <Button
              onClick={() => {
                setSuccess(false);
                setName('');
                setEmail('');
                setPhone('');
                setCity('');
              }}
              variant="outline"
            >
              Invite Another
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="text-gray-600"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              Invite {type === 'vendor' ? 'Vendor' : 'Client'}
            </h1>
            <p className="text-sm text-gray-600">
              Fill in the details below
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              {type === 'vendor' ? 'Vendor Name' : 'Contact Name'}
            </label>
            <div className="relative">
              <Users className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
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
                value={city}
                onChange={(e) => setCity(e.target.value as typeof CITY_OPTIONS[number])}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none"
                required
              >
                <option value="">Select a city</option>
                {CITY_OPTIONS.map((cityOption) => (
                  <option key={cityOption} value={cityOption}>
                    {cityOption}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-primary text-white hover:bg-primary/90"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <PlusCircle className="w-5 h-5 mr-2" />
                  Create Account
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Users,
  Mail,
  Phone,
  MapPin,
  Loader2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { inviteClient } from '../../lib/api';

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

export default function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState<typeof CITY_OPTIONS[number] | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await inviteClient({
        name,
        email,
        phone,
        city,
        brandName: name // Using name as brandName for regular users
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to create account');
      }

      setSuccess(true);
    } catch (err) {
      console.error('Error creating account:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred while creating the account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="flex flex-col items-center mb-8">
            <img 
              src="https://jfntmxbflpbeieuwwebz.supabase.co/storage/v1/object/sign/cupshup/CupShupLogo.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJjdXBzaHVwL0N1cFNodXBMb2dvLnBuZyIsImlhdCI6MTczODIzOTE0NiwiZXhwIjoxNzY5Nzc1MTQ2fQ.sW8QP195xXThQeE5yvBkLdyxtEH-Bwq2LVw0nERMb10" 
              alt="CupShup" 
              className="h-16 mb-4"
            />
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Account Created Successfully!
            </h2>
            
            <p className="text-gray-600 mb-6">
              Your account has been created successfully. You can now log in with:
              <br /><br />
              Email: <strong>{email}</strong>
              <br />
              Password: <strong>cupshup@1234</strong>
              <br /><br />
              For security reasons, please change your password after your first login.
            </p>
            
            <Button
              onClick={() => navigate('/login')}
              className="bg-primary text-white hover:bg-primary/90"
            >
              Go to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <img 
            src="https://jfntmxbflpbeieuwwebz.supabase.co/storage/v1/object/sign/cupshup/CupShupLogo.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJjdXBzaHVwL0N1cFNodXBMb2dvLnBuZyIsImlhdCI6MTczODIzOTE0NiwiZXhwIjoxNzY5Nzc1MTQ2fQ.sW8QP195xXThQeE5yvBkLdyxtEH-Bwq2LVw0nERMb10" 
            alt="CupShup" 
            className="h-16 mb-4"
          />
          <h2 className="text-2xl font-bold text-primary">Let's Brew Innovation!</h2>
        </div>
        
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="text-center mb-6">
            <p className="text-gray-600">
              Fill in your details below to create an account
            </p>
          </div>
          
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
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
                  required
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

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white hover:bg-primary/90 flex items-center justify-center"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Create Account
                </>
              )}
            </Button>

            <div className="text-center">
              <span className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-primary hover:underline">
                  Sign in
                </Link>
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
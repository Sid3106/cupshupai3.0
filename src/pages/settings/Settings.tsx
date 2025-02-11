import { useState } from 'react';
import { Bell, Shield, Smartphone, Mail, Globe, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/button';

export default function Settings() {
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: true,
  });

  const handleSave = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Notifications Section */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Choose how you want to be notified about updates
            </p>
            <div className="mt-4 space-y-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={notifications.email}
                  onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })}
                  className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <span className="ml-3 text-sm text-gray-700">Email notifications</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={notifications.push}
                  onChange={(e) => setNotifications({ ...notifications, push: e.target.checked })}
                  className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <span className="ml-3 text-sm text-gray-700">Push notifications</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={notifications.sms}
                  onChange={(e) => setNotifications({ ...notifications, sms: e.target.checked })}
                  className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <span className="ml-3 text-sm text-gray-700">SMS notifications</span>
              </label>
            </div>
          </div>

          {/* Security Section */}
          <div className="pt-6 border-t border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Security
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Manage your security preferences
            </p>
            <div className="mt-4 space-y-4">
              <Button variant="outline" className="w-full justify-start">
                Change password
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Two-factor authentication
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Active sessions
              </Button>
            </div>
          </div>

          {/* Contact Preferences */}
          <div className="pt-6 border-t border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Contact Preferences
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Choose how we can contact you
            </p>
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Email</p>
                    <p className="text-sm text-gray-600">Receive email updates</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Update
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Phone</p>
                    <p className="text-sm text-gray-600">Receive SMS updates</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Update
                </Button>
              </div>
            </div>
          </div>

          {/* Language and Region */}
          <div className="pt-6 border-t border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Language and Region
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Set your language and regional preferences
            </p>
            <div className="mt-4 space-y-4">
              <div>
                <label htmlFor="language" className="block text-sm font-medium text-gray-700">
                  Language
                </label>
                <select
                  id="language"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                >
                  <option>English</option>
                  <option>Hindi</option>
                  <option>Marathi</option>
                </select>
              </div>
              <div>
                <label htmlFor="timezone" className="block text-sm font-medium text-gray-700">
                  Time Zone
                </label>
                <select
                  id="timezone"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                >
                  <option>Asia/Kolkata (GMT+5:30)</option>
                  <option>UTC</option>
                  <option>Pacific Time</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
          <Button
            onClick={handleSave}
            disabled={loading}
            className="bg-primary text-white hover:bg-primary/90"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
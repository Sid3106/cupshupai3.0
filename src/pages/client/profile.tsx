import React from 'react';
import { ClientGuard } from '../../components/client/guards/ClientGuard';
import { useAuth } from '../../contexts/AuthContext';

const ClientProfile: React.FC = () => {
  const { profile } = useAuth();

  return (
    <ClientGuard>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Settings</h2>
        <div className="max-w-2xl">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <div className="mt-1 p-2 bg-gray-50 rounded-md">
                {profile?.name}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <div className="mt-1 p-2 bg-gray-50 rounded-md">
                {profile?.email}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <div className="mt-1 p-2 bg-gray-50 rounded-md">
                {profile?.role}
              </div>
            </div>
            {/* Add more profile fields as needed */}
          </div>
        </div>
      </div>
    </ClientGuard>
  );
};

export default ClientProfile; 
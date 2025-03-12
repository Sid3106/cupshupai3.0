import React from 'react';
import { ClientGuard } from '../../components/client/guards/ClientGuard';

const ClientDashboard: React.FC = () => {
  return (
    <ClientGuard>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Your Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Add dashboard widgets/cards here */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Actions</h3>
            {/* Add quick action buttons */}
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Recent Activity</h3>
            {/* Add recent activity list */}
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Statistics</h3>
            {/* Add statistics or metrics */}
          </div>
        </div>
      </div>
    </ClientGuard>
  );
};

export default ClientDashboard; 
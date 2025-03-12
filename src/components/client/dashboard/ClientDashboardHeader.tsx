import React from 'react';
import { ClientProfileDropdown } from './ClientProfileDropdown';

export const ClientDashboardHeader: React.FC = () => {
  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Client Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <ClientProfileDropdown />
          </div>
        </div>
      </div>
    </header>
  );
}; 
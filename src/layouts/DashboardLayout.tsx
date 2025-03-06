import { Outlet } from 'react-router-dom';
import { UserNav } from '../components/UserNav';
import Sidebar from '../components/Sidebar';

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      
      {/* Main content area */}
      <div className="flex flex-1 flex-col lg:pl-72">
        {/* Desktop header - hidden on mobile */}
        <div className="hidden lg:sticky lg:top-0 lg:z-40 lg:flex lg:h-16 lg:shrink-0 lg:items-center lg:justify-end lg:gap-x-4 lg:border-b lg:border-gray-200 lg:bg-white lg:px-6 lg:shadow-sm">
          <UserNav />
        </div>

        {/* Main content */}
        <main className="flex-1">
          <div className="py-4 sm:py-6 px-4 sm:px-6 lg:px-8 max-w-full overflow-x-hidden">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
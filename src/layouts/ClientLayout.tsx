import { Outlet } from 'react-router-dom';
import { UserNav } from '../components/UserNav';
import ClientSidebar from '../components/client/sidebar/ClientSidebar';

export default function ClientLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <ClientSidebar />
      
      {/* Main content area */}
      <div className="flex flex-1 flex-col lg:pl-72">
        {/* Desktop header - hidden on mobile */}
        <div className="hidden lg:sticky lg:top-0 lg:z-40 lg:flex lg:h-14 lg:shrink-0 lg:items-center lg:justify-end lg:gap-x-4 lg:border-b lg:border-gray-200 lg:bg-white lg:px-6 lg:shadow-sm">
          <UserNav />
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-x-hidden">
          <div className="py-2 px-4 sm:px-6 lg:px-8 max-w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
} 
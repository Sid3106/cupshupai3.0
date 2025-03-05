import { Outlet } from 'react-router-dom';
import { UserNav } from '../components/UserNav';
import VendorSidebar from '../components/VendorSidebar';

export default function VendorLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <VendorSidebar />
      
      {/* Main content area */}
      <div className="flex flex-1 flex-col lg:pl-72">
        {/* Mobile header - shown only on mobile */}
        <div className="sticky top-0 z-40 flex h-14 shrink-0 items-center justify-end gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:hidden">
          <UserNav />
        </div>

        {/* Desktop header - hidden on mobile */}
        <div className="hidden lg:sticky lg:top-0 lg:z-40 lg:flex lg:h-14 lg:shrink-0 lg:items-center lg:justify-end lg:gap-x-4 lg:border-b lg:border-gray-200 lg:bg-white lg:px-6 lg:shadow-sm">
          <UserNav />
        </div>

        {/* Main content */}
        <main className="flex-1">
          <div className="py-2 px-4 sm:px-6 lg:px-8 mt-14 lg:mt-0">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
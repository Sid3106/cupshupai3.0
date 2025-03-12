import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard,
  Menu,
  X,
  User
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useState } from 'react';
import { Button } from '../../ui/button';
import { UserNav } from '../../../components/UserNav';

const navigation = [
  {
    name: 'Dashboard',
    href: '/client/dashboard',
    icon: LayoutDashboard
  },
  {
    name: 'Profile',
    href: '/client/profile',
    icon: User
  }
];

export default function ClientSidebar() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const NavigationList = () => (
    <ul role="list" className="flex flex-1 flex-col gap-y-4">
      {navigation.map((item) => (
        <li key={item.name}>
          <Link
            to={item.href}
            className={cn(
              location.pathname === item.href
                ? 'bg-primary-dark text-white'
                : 'text-white/80 hover:text-white hover:bg-primary-dark',
              'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
            )}
          >
            <item.icon className="h-6 w-6 shrink-0" />
            {item.name}
          </Link>
        </li>
      ))}
    </ul>
  );

  return (
    <>
      {/* Mobile header */}
      <div className="fixed top-0 left-0 right-0 z-40 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6 lg:hidden">
        <div className="flex items-center gap-x-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-500 hover:text-gray-600"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileMenuOpen}
          >
            <Menu className="h-6 w-6" />
          </Button>
          <img
            className="h-8 w-auto"
            src="https://jfntmxbflpbeieuwwebz.supabase.co/storage/v1/object/sign/cupshup/CupShupLogo.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJjdXBzaHVwL0N1cFNodXBMb2dvLnBuZyIsImlhdCI6MTczODIzOTE0NiwiZXhwIjoxNzY5Nzc1MTQ2fQ.sW8QP195xXThQeE5yvBkLdyxtEH-Bwq2LVw0nERMb10"
            alt="CupShup"
          />
        </div>
        <UserNav />
      </div>

      {/* Mobile menu drawer */}
      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden",
          isMobileMenuOpen ? "block" : "hidden"
        )}
      >
        {/* Backdrop */}
        <div 
          className={cn(
            "fixed inset-0 bg-gray-600 transition-opacity duration-300 ease-in-out",
            isMobileMenuOpen ? "opacity-75" : "opacity-0"
          )}
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
        
        {/* Drawer panel */}
        <div 
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-[280px] overflow-y-auto bg-primary transform transition-transform duration-300 ease-in-out",
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          )}
          role="dialog"
          aria-modal="true"
        >
          <div className="flex h-16 shrink-0 items-center justify-between px-4 sm:px-6">
            <img
              className="h-8 w-auto"
              src="https://jfntmxbflpbeieuwwebz.supabase.co/storage/v1/object/sign/cupshup/CupShupLogo.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJjdXBzaHVwL0N1cFNodXBMb2dvLnBuZyIsImlhdCI6MTczODIzOTE0NiwiZXhwIjoxNzY5Nzc1MTQ2fQ.sW8QP195xXThQeE5yvBkLdyxtEH-Bwq2LVw0nERMb10"
              alt="CupShup"
            />
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:text-white/80"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Close menu"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
          <nav className="flex flex-1 flex-col px-4 sm:px-6 pb-4 pt-2">
            <NavigationList />
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-primary px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center">
            <img
              className="h-8 w-auto"
              src="https://jfntmxbflpbeieuwwebz.supabase.co/storage/v1/object/sign/cupshup/CupShupLogo.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJjdXBzaHVwL0N1cFNodXBMb2dvLnBuZyIsImlhdCI6MTczODIzOTE0NiwiZXhwIjoxNzY5Nzc1MTQ2fQ.sW8QP195xXThQeE5yvBkLdyxtEH-Bwq2LVw0nERMb10"
              alt="CupShup"
            />
          </div>
          <nav className="flex flex-1 flex-col">
            <NavigationList />
          </nav>
        </div>
      </div>
    </>
  );
} 
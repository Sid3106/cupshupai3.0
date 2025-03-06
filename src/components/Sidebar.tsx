import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  Calendar,
  ListChecks,
  ClipboardList,
  Menu,
  X
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { UserNav } from './UserNav';

const navigation = [
  {
    name: 'Dashboard',
    href: '/cupshup',
    icon: LayoutDashboard
  },
  {
    name: 'Vendors',
    href: '/cupshup/vendors',
    icon: Users
  },
  {
    name: 'Clients',
    href: '/cupshup/clients',
    icon: Building2
  },
  {
    name: 'Activities',
    href: '/cupshup/activities',
    icon: Calendar
  },
  {
    name: 'Mapped Activities',
    href: '/cupshup/mapped-activities',
    icon: ListChecks
  },
  {
    name: 'Mapped Tasks',
    href: '/cupshup/mapped-tasks',
    icon: ClipboardList
  }
];

export default function Sidebar() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Close menu on escape key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const NavigationList = () => (
    <ul role="list" className="flex flex-1 flex-col gap-y-7">
      <li>
        <ul role="list" className="-mx-2 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={cn(
                    'group flex gap-x-3 rounded-md p-2 text-sm leading-6',
                    isActive
                      ? 'bg-white/10 text-white'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  )}
                >
                  <item.icon className="h-6 w-6 shrink-0" />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </li>
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
            className="text-gray-500 hover:text-gray-600 flex items-center justify-center"
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
              className="text-white hover:text-white/80 flex items-center justify-center"
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
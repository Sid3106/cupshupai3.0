import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  Calendar,
  ListChecks
} from 'lucide-react';
import { cn } from '../lib/utils';

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
  }
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-primary px-6 pb-4">
        <div className="flex h-16 shrink-0 items-center">
          <img
            className="h-8"
            src="https://jfntmxbflpbeieuwwebz.supabase.co/storage/v1/object/sign/cupshup/CupShupLogo.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJjdXBzaHVwL0N1cFNodXBMb2dvLnBuZyIsImlhdCI6MTczODIzOTE0NiwiZXhwIjoxNzY5Nzc1MTQ2fQ.sW8QP195xXThQeE5yvBkLdyxtEH-Bwq2LVw0nERMb10"
            alt="CupShup"
          />
        </div>
        <nav className="flex flex-1 flex-col">
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
        </nav>
      </div>
    </div>
  );
}
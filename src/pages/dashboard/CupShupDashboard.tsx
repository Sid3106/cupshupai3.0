import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { 
  Users, 
  Building2, 
  Calendar,
  ListChecks,
  TrendingUp,
  ArrowUpRight
} from 'lucide-react';
import { Button } from '../../components/ui/button';

export default function CupshupDashboard() {
  const [stats, setStats] = useState({
    totalVendors: 0,
    totalClients: 0,
    totalActivities: 0,
    mappedActivities: 0,
    completionRate: 0,
    activeVendors: 0
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch vendors count from vendors table
        const { count: vendorsCount } = await supabase
          .from('vendors')
          .select('*', { count: 'exact' });

        // Fetch clients count
        const { count: clientsCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact' })
          .eq('role', 'Client');

        // Fetch activities count
        const { count: activitiesCount } = await supabase
          .from('activities')
          .select('*', { count: 'exact' });

        // Fetch mapped activities count
        const { count: mappedCount } = await supabase
          .from('activity_assignments')
          .select('*', { count: 'exact' });

        setStats({
          totalVendors: vendorsCount || 0,
          totalClients: clientsCount || 0,
          totalActivities: activitiesCount || 0,
          mappedActivities: mappedCount || 0,
          completionRate: 85, // Example static value
          activeVendors: Math.floor((vendorsCount || 0) * 0.7) // Example calculation
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      name: 'Total Vendors',
      value: stats.totalVendors,
      icon: Users,
      href: '/cupshup/vendors',
      color: 'bg-blue-500'
    },
    {
      name: 'Total Clients',
      value: stats.totalClients,
      icon: Building2,
      href: '/cupshup/clients',
      color: 'bg-green-500'
    },
    {
      name: 'Total Activities',
      value: stats.totalActivities,
      icon: Calendar,
      href: '/cupshup/activities',
      color: 'bg-purple-500'
    },
    {
      name: 'Mapped Activities',
      value: stats.mappedActivities,
      icon: ListChecks,
      href: '/cupshup/mapped-activities',
      color: 'bg-orange-500'
    },
    {
      name: 'Completion Rate',
      value: `${stats.completionRate}%`,
      icon: TrendingUp,
      color: 'bg-pink-500'
    },
    {
      name: 'Active Vendors',
      value: stats.activeVendors,
      icon: Users,
      href: '/cupshup/vendors?filter=active',
      color: 'bg-indigo-500'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header section with centered title and description on mobile */}
      <div className="flex flex-col items-center text-center md:text-left md:flex-row md:justify-between md:items-center">
        <div className="w-full md:w-auto mb-4 md:mb-0">
          <h1 className="text-2xl font-semibold text-[#00A979] text-center md:text-left">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600 text-center md:text-left">
            Welcome back to your CupShup dashboard
          </p>
        </div>
        
        {/* Action buttons - stacked on mobile, row on desktop */}
        <div className="flex flex-col w-full md:w-auto md:flex-row gap-3">
          <Button 
            onClick={() => navigate('/cupshup/invite/vendor')}
            className="bg-primary/10 text-primary hover:bg-primary/20 w-full md:w-auto"
          >
            <Users className="w-4 h-4 mr-2" />
            Invite Vendor
          </Button>
          <Button 
            onClick={() => navigate('/cupshup/invite/client')}
            className="bg-primary/10 text-primary hover:bg-primary/20 w-full md:w-auto"
          >
            <Building2 className="w-4 h-4 mr-2" />
            Invite Client
          </Button>
          <Button 
            onClick={() => navigate('/cupshup/activities/new')}
            className="bg-primary text-white hover:bg-primary/90 w-full md:w-auto"
          >
            <Calendar className="w-4 h-4 mr-2" />
            New Activity
          </Button>
        </div>
      </div>

      {/* Stat cards - single column on mobile, 3 columns on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {statCards.map((stat) => (
          <div
            key={stat.name}
            className="bg-white rounded-lg shadow-sm p-4 md:p-6 hover:shadow-md transition-shadow"
            onClick={() => stat.href && navigate(stat.href)}
            style={{ cursor: stat.href ? 'pointer' : 'default' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`${stat.color} p-3 rounded-lg flex-shrink-0`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                </div>
              </div>
              {stat.href && (
                <ArrowUpRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { ReactNode, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { 
  LayoutDashboard, 
  Image, 
  Upload, 
  UserCircle, 
  LogOut, 
  Menu, 
  X 
} from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navigationItems = [
    // {
    //   name: 'Dashboard',
    //   href: '/dashboard',
    //   icon: LayoutDashboard,
    // },
    // {
    //   name: 'Creatives',
    //   href: '/creatives',
    //   icon: Image,
    // },
    // {
    //   name: 'Upload',
    //   href: '/upload',
    //   icon: Upload,
    //   showFor: 'creator', // Only show for creators
    // },
    // {
    //   name: 'Profile',
    //   href: '/profile',
    //   icon: UserCircle,
    // },
    {
      name: 'Ad account',
      href: '/ads',
      icon: UserCircle,
    },
    {
      name: 'Dashboard',
      href: '/adspend',
      icon: UserCircle,
    }
    // {
    //   name: 'Saved Ads',
    //   href: '/saved',
    //   icon: UserCircle,
    // },
  ];

  const filteredNavItems = navigationItems.filter(item => 
    !item.showFor || item.showFor === user?.role
  );

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={toggleSidebar}
          className="rounded-full"
        >
          {sidebarOpen ? <X /> : <Menu />}
        </Button>
      </div>

      {/* Sidebar - mobile version with overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 z-40 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`} 
        onClick={toggleSidebar}
      />

      {/* Sidebar */}
      <div 
        className={`
          w-64 bg-white border-r shadow-sm fixed inset-y-0 z-40 
          transition-transform duration-300 ease-in-out 
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          lg:translate-x-0 lg:static
        `}
      >
        <div className="flex flex-col h-full">
          <div className="px-6 py-6 border-b">
            <h2 className="text-2xl font-bold">AdCreativeX</h2>
            <p className="text-sm text-gray-500 mt-1">
              {user?.role === 'brand' ? 'Brand Dashboard' : 'Brand Dashboard'}
            </p>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1">
            {filteredNavItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link 
                  key={item.name} 
                  to={item.href}
                  className={`
                    flex items-center px-3 py-3 rounded-md text-sm
                    ${isActive ? 'bg-gray-100 text-blue-600 font-medium' : 'text-gray-700 hover:bg-gray-100'}
                  `}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t">
            <Button 
              variant="outline" 
              className="w-full justify-start text-red-600" 
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto py-8 px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

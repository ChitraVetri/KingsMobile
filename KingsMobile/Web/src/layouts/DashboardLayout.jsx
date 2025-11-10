import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import {
  Smartphone,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Wrench,
  BarChart3,
  Users,
  Menu,
  X,
  LogOut,
  User,
  Bell,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'SALES_STAFF', 'TECHNICIAN'] },
  { name: 'Inventory', href: '/inventory', icon: Package, roles: ['ADMIN', 'SALES_STAFF', 'TECHNICIAN'] },
  { name: 'Point of Sale', href: '/pos', icon: ShoppingCart, roles: ['ADMIN', 'SALES_STAFF'] },
  { name: 'Repairs', href: '/repairs', icon: Wrench, roles: ['ADMIN', 'TECHNICIAN'] },
  { name: 'Reports', href: '/reports', icon: BarChart3, roles: ['ADMIN'] },
  { name: 'Users', href: '/users', icon: Users, roles: ['ADMIN'] },
];

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout, isAdmin, isSalesStaff, isTechnician } = useAuth();

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(user?.role)
  );

  const handleLogout = async () => {
    await logout();
  };

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'ADMIN': return 'primary';
      case 'SALES_STAFF': return 'success';
      case 'TECHNICIAN': return 'warning';
      default: return 'default';
    }
  };

  const formatRoleName = (role) => {
    switch (role) {
      case 'ADMIN': return 'Administrator';
      case 'SALES_STAFF': return 'Sales Staff';
      case 'TECHNICIAN': return 'Technician';
      default: return role;
    }
  };

  return (
    <div className="h-screen flex overflow-hidden bg-secondary-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 flex z-40 md:hidden">
          <div className="fixed inset-0 bg-secondary-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            <SidebarContent navigation={filteredNavigation} />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <SidebarContent navigation={filteredNavigation} />
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Top navigation */}
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow-sm border-b border-secondary-200">
          <button
            className="px-4 border-r border-secondary-200 text-secondary-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="flex-1 px-4 flex justify-between items-center">
            <div className="flex-1 flex">
              <h1 className="text-xl font-semibold text-secondary-900">
                Kings Mobile Management
              </h1>
            </div>
            
            <div className="ml-4 flex items-center md:ml-6 space-x-4">
              {/* Notifications */}
              <button className="bg-white p-1 rounded-full text-secondary-400 hover:text-secondary-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                <Bell className="h-6 w-6" />
              </button>

              {/* User menu */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="bg-primary-100 p-2 rounded-full">
                    <User className="h-5 w-5 text-primary-600" />
                  </div>
                  <div className="hidden md:block">
                    <div className="text-sm font-medium text-secondary-900">
                      {user?.username}
                    </div>
                    <Badge variant={getRoleBadgeVariant(user?.role)} size="sm">
                      {formatRoleName(user?.role)}
                    </Badge>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-secondary-600 hover:text-secondary-900"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function SidebarContent({ navigation }) {
  const currentPath = window.location.pathname;

  return (
    <div className="flex flex-col h-full bg-white border-r border-secondary-200">
      {/* Logo */}
      <div className="flex items-center h-16 flex-shrink-0 px-4 bg-primary-600">
        <div className="flex items-center space-x-3">
          <Smartphone className="h-8 w-8 text-white" />
          <div className="text-white">
            <div className="text-lg font-bold">Kings Mobile</div>
            <div className="text-xs text-primary-200">Management System</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navigation.map((item) => {
            const isActive = currentPath === item.href;
            return (
              <a
                key={item.name}
                href={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-primary-100 text-primary-900 border-r-2 border-primary-600'
                    : 'text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900'
                }`}
              >
                <item.icon
                  className={`mr-3 flex-shrink-0 h-5 w-5 ${
                    isActive ? 'text-primary-600' : 'text-secondary-400 group-hover:text-secondary-500'
                  }`}
                />
                {item.name}
              </a>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 p-4 border-t border-secondary-200">
        <div className="text-xs text-secondary-500 text-center">
          © 2024 Kings Mobile
        </div>
      </div>
    </div>
  );
}

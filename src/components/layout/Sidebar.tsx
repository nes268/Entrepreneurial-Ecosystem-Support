import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  FolderOpen, 
  Users, 
  Calendar, 
  BarChart3, 
  TrendingUp, 
  Settings, 
  LogOut,
  Building2,
  UserCheck,
  CalendarDays,
  FileText,
  UserCog,
  DollarSign
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userNavItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
    { path: '/dashboard/data-room', icon: FolderOpen, label: 'Data Room' },
    { path: '/dashboard/mentors', icon: Users, label: 'Mentors' },
    { path: '/dashboard/calendar', icon: Calendar, label: 'Calendar' },
    { path: '/dashboard/pitch-deck', icon: BarChart3, label: 'Pitch Deck' },
    { path: '/dashboard/fundraising', icon: TrendingUp, label: 'Fundraising' },
    { path: '/dashboard/settings', icon: Settings, label: 'Settings' },
  ];

  const adminNavItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Overview' },
    { path: '/admin/review', icon: UserCheck, label: 'Review' },
    { path: '/admin/events', icon: CalendarDays, label: 'Events' },
    { path: '/admin/reports', icon: FileText, label: 'Reports' },
    { path: '/admin/mentors', icon: UserCog, label: 'Mentor Manage' },
    { path: '/admin/investors', icon: DollarSign, label: 'Investor Manage' },
    { path: '/admin/startups', icon: Building2, label: 'Startups' },
    { path: '/admin/data-room', icon: FolderOpen, label: 'Data Room' },
    { path: '/admin/settings', icon: Settings, label: 'Settings' },
  ];

  const navItems = user?.role === 'admin' ? adminNavItems : userNavItems;

  return (
    <div className="fixed left-0 top-0 w-56 bg-gray-800 border-r border-gray-700 flex flex-col h-screen overflow-hidden z-10">
      {/* Logo */}
      <div className="p-6 border-b border-gray-700 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <Building2 className="h-8 w-8 text-cyan-400" />
          <span className="text-xl font-bold text-white">CITBIF</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/dashboard' || item.path === '/admin/dashboard'}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-700 flex-shrink-0">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-red-600/10 hover:border hover:border-red-500/20 w-full transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Bell, User } from 'lucide-react';

const Header: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate('/dashboard/settings');
  };

  return (
    <header className="h-16 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-6">
      {/* Left side - Welcome message */}
      <div>
        <h1 className="text-lg font-semibold text-white">
          Welcome, {user?.role === 'admin' ? 'Admin' : user?.fullName || user?.username}
        </h1>
      </div>

      {/* Right side - Controls */}
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <button className="relative p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
        </button>


        {/* Profile button */}
        <button
          onClick={handleProfileClick}
          className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          title="Profile Settings"
        >
          <div className="h-8 w-8 bg-cyan-500 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-white" />
          </div>
        </button>
      </div>
    </header>
  );
};

export default Header;
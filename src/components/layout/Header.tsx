import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Bell, User, ChevronDown } from 'lucide-react';

const Header: React.FC = () => {
  const { user } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

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


        {/* Profile dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center space-x-2 p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <div className="h-8 w-8 bg-cyan-500 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
            <ChevronDown className="h-4 w-4" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10">
              <div className="py-2">
                <a href="#" className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700">
                  Profile
                </a>
                <a href="#" className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700">
                  Settings
                </a>
                <hr className="border-gray-700 my-1" />
                <a href="#" className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700">
                  Logout
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const DashboardLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="ml-56 flex flex-col min-h-screen bg-slate-900">
        <Header />
        
        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto bg-slate-900">
          <div className="bg-slate-900 min-h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
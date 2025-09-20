import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useAuth } from '../../context/AuthContext';
import { 
  User, 
  Building, 
  Bell, 
  Shield, 
  Save,
  Edit,
  Settings as SettingsIcon,
  BarChart3
} from 'lucide-react';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [tabTransition, setTabTransition] = useState(false);
  const [personalInfo, setPersonalInfo] = useState({
    fullName: 'John Doe',
    email: 'john@example.com',
    phoneNumber: '+1 (555) 123-4567',
    location: 'San Francisco, CA, USA'
  });
  
  const [startupInfo, setStartupInfo] = useState({
    startupName: 'TechVenture Inc.',
    entityType: 'Private Limited Company',
    sector: 'FinTech',
    founderName: 'John Doe',
    linkedinProfile: 'https://linkedin.com/in/johndoe'
  });

  // Dynamic tabs based on user role
  const getTabs = () => {
    const baseTabs = [
      { id: 'personal', label: 'Personal Info', icon: User },
      { id: 'notifications', label: 'Notifications', icon: Bell },
      { id: 'privacy', label: 'Privacy & Security', icon: Shield },
    ];

    if (user?.role === 'admin') {
      return [
        ...baseTabs,
        { id: 'admin-settings', label: 'Admin Settings', icon: SettingsIcon },
      ];
    } else {
      return [
        ...baseTabs,
        { id: 'startup', label: 'Startup Info', icon: Building },
      ];
    }
  };

  const tabs = getTabs();

  const handlePersonalInfoChange = (field: string, value: string) => {
    setPersonalInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleStartupInfoChange = (field: string, value: string) => {
    setStartupInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    // Save logic here
    setIsEditing(false);
    // Show success message
  };

  const handleTabChange = (tabId: string) => {
    if (tabId !== activeTab) {
      setTabTransition(true);
      setTimeout(() => {
        setActiveTab(tabId);
        setTabTransition(false);
      }, 150);
    }
  };

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
        let newIndex = currentIndex;
        
        switch (e.key) {
          case 'ArrowLeft':
            e.preventDefault();
            newIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
            break;
          case 'ArrowRight':
            e.preventDefault();
            newIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
            break;
          case '1':
          case '2':
          case '3':
          case '4':
            e.preventDefault();
            const tabNumber = parseInt(e.key) - 1;
            if (tabNumber < tabs.length) {
              newIndex = tabNumber;
            }
            break;
        }
        
        if (newIndex !== currentIndex) {
          handleTabChange(tabs[newIndex].id);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activeTab]);

  const renderPersonalInfo = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Personal Information</h3>
        <Button
          variant={isEditing ? 'primary' : 'outline'}
          size="sm"
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          className="flex items-center space-x-2"
        >
          {isEditing ? <Save className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
          <span>{isEditing ? 'Save Changes' : 'Edit'}</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Full Name"
          value={personalInfo.fullName}
          onChange={(e) => handlePersonalInfoChange('fullName', e.target.value)}
          disabled={!isEditing}
        />
        <Input
          label="Email"
          type="email"
          value={personalInfo.email}
          onChange={(e) => handlePersonalInfoChange('email', e.target.value)}
          disabled={!isEditing}
        />
        <Input
          label="Phone Number"
          value={personalInfo.phoneNumber}
          onChange={(e) => handlePersonalInfoChange('phoneNumber', e.target.value)}
          disabled={!isEditing}
        />
        <Input
          label="Location"
          value={personalInfo.location}
          onChange={(e) => handlePersonalInfoChange('location', e.target.value)}
          disabled={!isEditing}
        />
      </div>

      {isEditing && (
        <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
          <p className="text-sm text-blue-400">
            <strong>Note:</strong> Changes to your email address will require verification.
          </p>
        </div>
      )}
    </div>
  );

  const renderStartupInfo = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Startup Information</h3>
        <Button
          variant={isEditing ? 'primary' : 'outline'}
          size="sm"
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          className="flex items-center space-x-2"
        >
          {isEditing ? <Save className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
          <span>{isEditing ? 'Save Changes' : 'Edit'}</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Startup Name"
          value={startupInfo.startupName}
          onChange={(e) => handleStartupInfoChange('startupName', e.target.value)}
          disabled={!isEditing}
        />
        <Input
          label="Entity Type"
          value={startupInfo.entityType}
          onChange={(e) => handleStartupInfoChange('entityType', e.target.value)}
          disabled={!isEditing}
        />
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Sector</label>
          <select
            value={startupInfo.sector}
            onChange={(e) => handleStartupInfoChange('sector', e.target.value)}
            disabled={!isEditing}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50"
          >
            <option value="FinTech">FinTech</option>
            <option value="HealthTech">HealthTech</option>
            <option value="EdTech">EdTech</option>
            <option value="AgriTech">AgriTech</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <Input
          label="Founder Name"
          value={startupInfo.founderName}
          onChange={(e) => handleStartupInfoChange('founderName', e.target.value)}
          disabled={!isEditing}
        />
      </div>

      <Input
        label="LinkedIn Profile"
        value={startupInfo.linkedinProfile}
        onChange={(e) => handleStartupInfoChange('linkedinProfile', e.target.value)}
        disabled={!isEditing}
      />
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white">Notification Preferences</h3>
      
      <div className="space-y-4">
        {[
          { title: 'Email Notifications', description: 'Receive updates via email' },
          { title: 'Push Notifications', description: 'Browser notifications for important updates' },
          { title: 'Investor Updates', description: 'Notifications about investor activities' },
          { title: 'Mentorship Reminders', description: 'Reminders for upcoming mentorship sessions' },
          { title: 'Event Notifications', description: 'Updates about events and workshops' },
          { title: 'Weekly Reports', description: 'Weekly progress and analytics reports' },
        ].map((notification, index) => (
          <div key={index} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
            <div>
              <h4 className="text-white font-medium">{notification.title}</h4>
              <p className="text-sm text-gray-400">{notification.description}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked={index < 4} />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
            </label>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPrivacy = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white">Privacy & Security</h3>
      
      <div className="space-y-4">
        <Card className="p-4">
          <h4 className="text-white font-medium mb-2">Change Password</h4>
          <p className="text-sm text-gray-400 mb-4">Update your account password</p>
          <Button variant="outline" size="sm">Change Password</Button>
        </Card>

        <Card className="p-4">
          <h4 className="text-white font-medium mb-2">Two-Factor Authentication</h4>
          <p className="text-sm text-gray-400 mb-4">Add an extra layer of security to your account</p>
          <Button variant="outline" size="sm">Enable 2FA</Button>
        </Card>

        <Card className="p-4">
          <h4 className="text-white font-medium mb-2">Data Export</h4>
          <p className="text-sm text-gray-400 mb-4">Download a copy of your data</p>
          <Button variant="outline" size="sm">Request Data</Button>
        </Card>

        <Card className="p-4 border-red-600/30">
          <h4 className="text-red-400 font-medium mb-2">Delete Account</h4>
          <p className="text-sm text-gray-400 mb-4">Permanently delete your account and all data</p>
          <Button variant="danger" size="sm">Delete Account</Button>
        </Card>
      </div>
    </div>
  );

  // Admin-specific content - simplified
  const renderAdminSettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white">Admin Settings</h3>
      
      {/* Platform Overview */}
      <Card className="p-6">
        <h4 className="text-white font-medium mb-4 flex items-center">
          <BarChart3 className="h-5 w-5 mr-2 text-cyan-400" />
          Platform Overview
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">1,247</div>
            <div className="text-sm text-gray-400">Total Users</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-400">89</div>
            <div className="text-sm text-gray-400">Active Startups</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">23</div>
            <div className="text-sm text-gray-400">Pending Reviews</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">15</div>
            <div className="text-sm text-gray-400">Approved This Month</div>
          </div>
        </div>
      </Card>

      {/* Essential Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h4 className="text-white font-medium mb-4">Platform Settings</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Maintenance Mode</label>
              <select className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white">
                <option value="false">Disabled</option>
                <option value="true">Enabled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Auto-approve Applications</label>
              <select className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white">
                <option value="false">Manual Review</option>
                <option value="true">Auto-approve</option>
              </select>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h4 className="text-white font-medium mb-4">Notifications</h4>
          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <span className="text-gray-300">New User Alerts</span>
              <input type="checkbox" defaultChecked className="rounded" />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-gray-300">Application Reviews</span>
              <input type="checkbox" defaultChecked className="rounded" />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-gray-300">System Alerts</span>
              <input type="checkbox" defaultChecked className="rounded" />
            </label>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h4 className="text-white font-medium mb-4">Quick Actions</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button variant="outline" size="sm">Export Data</Button>
          <Button variant="outline" size="sm">Backup System</Button>
          <Button variant="outline" size="sm">Clear Cache</Button>
          <Button variant="danger" size="sm">Force Logout All</Button>
        </div>
      </Card>
    </div>
  );



  const renderContent = () => {
    switch (activeTab) {
      case 'personal': return renderPersonalInfo();
      case 'startup': return renderStartupInfo();
      case 'notifications': return renderNotifications();
      case 'privacy': return renderPrivacy();
      case 'admin-settings': return renderAdminSettings();
      default: return renderPersonalInfo();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">
          {user?.role === 'admin' ? 'Admin Settings' : 'Settings'}
        </h1>
        <p className="text-gray-400 mt-1">
          {user?.role === 'admin' 
            ? 'Manage platform settings, users, and system configuration' 
            : 'Manage your account and preferences'
          }
        </p>
      </div>

      {/* Horizontal Tab Navigation */}
      <Card className="p-2 bg-gray-800/50">
        <div className="flex flex-wrap gap-1 relative">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`relative flex items-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-cyan-500 text-white shadow-lg transform scale-105'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700/50 hover:transform hover:scale-105'
              }`}
              title={`${tab.label} (Ctrl/Cmd + ${tabs.findIndex(t => t.id === tab.id) + 1})`}
            >
              <tab.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
              {activeTab === tab.id && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>
              )}
            </button>
          ))}
        </div>
      </Card>

      {/* Content Area */}
      <Card className="p-6">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 mb-6 pb-4 border-b border-gray-700">
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <span>Settings</span>
            <span>/</span>
            <span className="text-cyan-400 font-medium">
              {tabs.find(tab => tab.id === activeTab)?.label}
            </span>
          </div>
        </div>
        
        <div className={`transition-all duration-300 ${
          tabTransition ? 'opacity-0 transform translate-y-2' : 'opacity-100 transform translate-y-0'
        }`}>
          {renderContent()}
        </div>
      </Card>
    </div>
  );
};

export default Settings;
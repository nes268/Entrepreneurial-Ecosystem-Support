import React, { useState } from 'react';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import { Search, Filter, Eye, Edit, Trash2, Building2, User, Mail } from 'lucide-react';
import { Startup, TRLLevel } from '../../../types';

const StartupManage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSector, setFilterSector] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterTRL, setFilterTRL] = useState('all');

  const startups: Startup[] = [
    {
      id: '1',
      name: 'EcoTech Solutions',
      founder: 'Sarah Johnson',
      sector: 'CleanTech',
      type: 'incubation',
      status: 'active',
      trlLevel: 6,
      email: 'sarah@ecotech.com',
      submissionDate: '2024-09-15',
    },
    {
      id: '2',
      name: 'HealthAI Pro',
      founder: 'Dr. Michael Chen',
      sector: 'HealthTech',
      type: 'innovation',
      status: 'active',
      trlLevel: 8,
      email: 'michael@healthai.com',
      submissionDate: '2024-08-20',
    },
    {
      id: '3',
      name: 'EduLearn Platform',
      founder: 'Lisa Rodriguez',
      sector: 'EdTech',
      type: 'incubation',
      status: 'completed',
      trlLevel: 9,
      email: 'lisa@edulearn.com',
      submissionDate: '2024-01-10',
    },
    {
      id: '4',
      name: 'FinanceFlow',
      founder: 'Robert Kim',
      sector: 'FinTech',
      type: 'innovation',
      status: 'active',
      trlLevel: 5,
      email: 'robert@financeflow.com',
      submissionDate: '2024-10-05',
    },
    {
      id: '5',
      name: 'FarmTech Innovations',
      founder: 'Maria Garcia',
      sector: 'AgriTech',
      type: 'incubation',
      status: 'dropout',
      trlLevel: 3,
      email: 'maria@farmtech.com',
      submissionDate: '2024-06-12',
    }
  ];

  const sectors = ['CleanTech', 'HealthTech', 'EdTech', 'FinTech', 'AgriTech', 'FoodTech', 'RetailTech', 'PropTech'];

  const filteredStartups = startups.filter(startup => {
    const matchesSearch = 
      startup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      startup.founder.toLowerCase().includes(searchTerm.toLowerCase()) ||
      startup.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSector = filterSector === 'all' || startup.sector === filterSector;
    const matchesType = filterType === 'all' || startup.type === filterType;
    const matchesStatus = filterStatus === 'all' || startup.status === filterStatus;
    const matchesTRL = filterTRL === 'all' || 
      (filterTRL === '1-3' && startup.trlLevel <= 3) ||
      (filterTRL === '4-6' && startup.trlLevel >= 4 && startup.trlLevel <= 6) ||
      (filterTRL === '7-9' && startup.trlLevel >= 7);

    return matchesSearch && matchesSector && matchesType && matchesStatus && matchesTRL;
  });

  const getMetrics = () => {
    return {
      total: startups.length,
      active: startups.filter(s => s.status === 'active').length,
      innovation: startups.filter(s => s.type === 'innovation').length,
      incubation: startups.filter(s => s.type === 'incubation').length
    };
  };

  const getTRLColor = (level: TRLLevel) => {
    if (level <= 3) return 'bg-red-500';
    if (level <= 6) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-900/30 text-green-400';
      case 'completed': return 'bg-blue-900/30 text-blue-400';
      case 'dropout': return 'bg-red-900/30 text-red-400';
      case 'pending': return 'bg-yellow-900/30 text-yellow-400';
      default: return 'bg-gray-700 text-gray-300';
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'incubation' ? 'bg-purple-900/30 text-purple-400' : 'bg-cyan-900/30 text-cyan-400';
  };

  const handleView = (startupId: string) => {
    console.log('View startup:', startupId);
  };

  const handleEdit = (startupId: string) => {
    console.log('Edit startup:', startupId);
  };

  const handleDelete = (startupId: string) => {
    if (window.confirm('Are you sure you want to delete this startup?')) {
      console.log('Delete startup:', startupId);
    }
  };

  const metrics = getMetrics();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Startup Management</h1>
        <p className="text-gray-400 mt-1">Manage all startups in the platform</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Total Startups</p>
              <p className="text-2xl font-bold text-white">{metrics.total}</p>
            </div>
            <Building2 className="h-8 w-8 text-cyan-400" />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Active Startups</p>
              <p className="text-2xl font-bold text-white">{metrics.active}</p>
            </div>
            <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center">
              <Building2 className="h-4 w-4 text-white" />
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Innovation Startups</p>
              <p className="text-2xl font-bold text-white">{metrics.innovation}</p>
            </div>
            <div className="h-8 w-8 bg-cyan-500 rounded-full flex items-center justify-center">
              <Building2 className="h-4 w-4 text-white" />
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Incubation Startups</p>
              <p className="text-2xl font-bold text-white">{metrics.incubation}</p>
            </div>
            <div className="h-8 w-8 bg-purple-500 rounded-full flex items-center justify-center">
              <Building2 className="h-4 w-4 text-white" />
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by startup name, founder, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-300">Filters:</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <select
              value={filterSector}
              onChange={(e) => setFilterSector(e.target.value)}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="all">All Sectors</option>
              {sectors.map(sector => (
                <option key={sector} value={sector}>{sector}</option>
              ))}
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="all">All Types</option>
              <option value="innovation">Innovation</option>
              <option value="incubation">Incubation</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="dropout">Dropout</option>
            </select>

            <select
              value={filterTRL}
              onChange={(e) => setFilterTRL(e.target.value)}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="all">All TRL Levels</option>
              <option value="1-3">TRL 1-3</option>
              <option value="4-6">TRL 4-6</option>
              <option value="7-9">TRL 7-9</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Startups Table */}
      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Startup Name</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Founder</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Sector</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Type</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Status</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">TRL Level</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Email</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStartups.map((startup) => (
                <tr key={startup.id} className="border-b border-gray-800 hover:bg-gray-700/20">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <Building2 className="h-5 w-5 text-cyan-400" />
                      <span className="text-white font-medium">{startup.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-300">{startup.founder}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-300">{startup.sector}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-1 rounded-full capitalize ${getTypeColor(startup.type)}`}>
                      {startup.type}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-1 rounded-full capitalize ${getStatusColor(startup.status)}`}>
                      {startup.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${getTRLColor(startup.trlLevel)}`} />
                      <span className="text-white text-sm font-medium">TRL {startup.trlLevel}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-300 text-sm">{startup.email}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleView(startup.id)}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEdit(startup.id)}
                        className="text-cyan-400 hover:text-cyan-300"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDelete(startup.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredStartups.length === 0 && (
          <div className="text-center py-8">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">No startups found</h3>
            <p className="text-gray-400">Try adjusting your search criteria or filters</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default StartupManage;
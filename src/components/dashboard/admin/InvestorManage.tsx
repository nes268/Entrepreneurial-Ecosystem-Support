import React, { useState } from 'react';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import { Plus, Edit, Trash2, Search, Filter, DollarSign, Mail, Phone, Building, AlertCircle, Loader2 } from 'lucide-react';
import { Investor, CreateInvestorData, UpdateInvestorData } from '../../../types';
import { useInvestors } from '../../../hooks/useInvestors';

const InvestorManage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingInvestor, setEditingInvestor] = useState<Investor | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    investors,
    loading,
    error,
    createInvestor,
    updateInvestor,
    deleteInvestor,
    refreshInvestors
  } = useInvestors();
  
  const [formData, setFormData] = useState<CreateInvestorData>({
    name: '',
    firm: '',
    email: '',
    phoneNumber: '',
    investmentRange: '',
    focusAreas: [],
    backgroundSummary: '',
    profilePicture: ''
  });

  const focusAreaOptions = [
    'SaaS', 'AI/ML', 'FinTech', 'HealthTech', 'EdTech', 'CleanTech',
    'E-commerce', 'B2B', 'B2C', 'Mobile', 'Blockchain', 'IoT',
    'Sustainability', 'Healthcare', 'Agriculture', 'Real Estate'
  ];

  const filteredInvestors = investors.filter(investor =>
    investor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    investor.firm.toLowerCase().includes(searchTerm.toLowerCase()) ||
    investor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    investor.focusAreas.some(area => area.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFocusAreaToggle = (area: string) => {
    setFormData(prev => ({
      ...prev,
      focusAreas: prev.focusAreas.includes(area)
        ? prev.focusAreas.filter(a => a !== area)
        : [...prev.focusAreas, area]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (editingInvestor) {
        await updateInvestor({
          id: editingInvestor.id,
          ...formData
        });
      } else {
        await createInvestor(formData);
      }
      
      resetForm();
    } catch (error) {
      console.error('Error saving investor:', error);
      // Error is handled by the hook and displayed in the UI
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      firm: '',
      email: '',
      phoneNumber: '',
      investmentRange: '',
      focusAreas: [],
      backgroundSummary: '',
      profilePicture: ''
    });
    setShowAddForm(false);
    setEditingInvestor(null);
  };

  const handleEdit = (investor: Investor) => {
    setFormData({
      name: investor.name,
      firm: investor.firm,
      email: investor.email,
      phoneNumber: investor.phoneNumber,
      investmentRange: investor.investmentRange,
      focusAreas: investor.focusAreas,
      backgroundSummary: investor.backgroundSummary,
      profilePicture: investor.profilePicture
    });
    setEditingInvestor(investor);
    setShowAddForm(true);
  };

  const handleDelete = async (investorId: string) => {
    if (window.confirm('Are you sure you want to delete this investor?')) {
      try {
        await deleteInvestor(investorId);
      } catch (error) {
        console.error('Error deleting investor:', error);
        // Error is handled by the hook and displayed in the UI
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Investor Management</h1>
            <p className="text-gray-400 mt-1">Manage investors available for startups</p>
          </div>
        </div>
        
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-3">
            <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
            <span className="text-gray-400">Loading investors...</span>
          </div>
        </div>
      </div>
    );
  }

  if (showAddForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={resetForm} disabled={isSubmitting}>
            ← Back to Investors
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">
              {editingInvestor ? 'Edit Investor' : 'Add New Investor'}
            </h1>
            <p className="text-gray-400 mt-1">
              {editingInvestor ? 'Update investor information' : 'Add a new investor to the platform'}
            </p>
          </div>
        </div>

        <Card className="p-6 max-w-4xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Investor Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter investor's full name"
                required
              />

              <Input
                label="Firm/Company"
                name="firm"
                value={formData.firm}
                onChange={handleInputChange}
                placeholder="Investment firm or company name"
                required
              />

              <Input
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="investor@example.com"
                required
              />

              <Input
                label="Phone Number"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="+1 (555) 123-4567"
              />

              <div className="md:col-span-2">
                <Input
                  label="Investment Range"
                  name="investmentRange"
                  value={formData.investmentRange}
                  onChange={handleInputChange}
                  placeholder="e.g., $100K - $2M"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">Focus Areas</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {focusAreaOptions.map(area => (
                  <label key={area} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.focusAreas.includes(area)}
                      onChange={() => handleFocusAreaToggle(area)}
                      className="rounded border-gray-600 text-cyan-600 focus:ring-cyan-500"
                    />
                    <span className="text-gray-300 text-sm">{area}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Background Summary</label>
              <textarea
                name="backgroundSummary"
                value={formData.backgroundSummary}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Brief background and investment philosophy..."
                required
              />
            </div>

            <div className="flex space-x-4">
              <Button type="button" variant="outline" onClick={resetForm} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {editingInvestor ? 'Updating...' : 'Adding...'}
                  </>
                ) : (
                  editingInvestor ? 'Update Investor' : 'Add Investor'
                )}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Investor Management</h1>
          <p className="text-gray-400 mt-1">Manage investors available for startups</p>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add Investor</span>
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="p-4 bg-red-900/20 border-red-500/50">
          <div className="flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div>
              <h3 className="text-red-400 font-medium">Error</h3>
              <p className="text-red-300 text-sm mt-1">{error}</p>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={refreshInvestors}
                className="mt-2 text-red-400 hover:text-red-300"
              >
                Try Again
              </Button>
            </div>
          </div>
        </Card>
      )}


      {/* Search and Filter */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search investors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500">
              <option value="all">All Focus Areas</option>
              <option value="saas">SaaS</option>
              <option value="fintech">FinTech</option>
              <option value="healthtech">HealthTech</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Investors Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredInvestors.map((investor) => (
          <Card key={investor.id} className="p-6" hover>
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 bg-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
                    {investor.profilePicture}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{investor.name}</h3>
                    <p className="text-sm text-cyan-400">{investor.firm}</p>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(investor)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(investor.id)}>
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-400">
                  <Mail className="h-4 w-4 mr-2" />
                  <span>{investor.email}</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-400">
                  <Phone className="h-4 w-4 mr-2" />
                  <span>{investor.phoneNumber}</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-400">
                  <DollarSign className="h-4 w-4 mr-2" />
                  <span>{investor.investmentRange}</span>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-400 mb-2">Focus Areas:</p>
                <div className="flex flex-wrap gap-2">
                  {investor.focusAreas.map(area => (
                    <span key={area} className="text-xs px-2 py-1 bg-cyan-900/30 text-cyan-400 rounded-full">
                      {area}
                    </span>
                  ))}
                </div>
              </div>

              <p className="text-sm text-gray-400 line-clamp-2">{investor.backgroundSummary}</p>
            </div>
          </Card>
        ))}
      </div>

      {filteredInvestors.length === 0 && (
        <Card className="p-12 text-center">
          <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-300 mb-2">
            {searchTerm ? 'No investors found' : 'No investors available'}
          </h3>
          <p className="text-gray-400 mb-6">
            {searchTerm 
              ? 'Try adjusting your search criteria' 
              : 'Add your first investor to get started'
            }
          </p>
          <Button onClick={() => setShowAddForm(true)}>
            Add First Investor
          </Button>
        </Card>
      )}
    </div>
  );
};

export default InvestorManage;
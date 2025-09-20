import React, { useState } from 'react';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import { Plus, Edit, Trash2, Search, Filter, User, Mail, Star, AlertCircle, Loader2 } from 'lucide-react';
import { Mentor, CreateMentorData, UpdateMentorData } from '../../../types';
import { useMentors } from '../../../hooks/useMentors';

const MentorManage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMentor, setEditingMentor] = useState<Mentor | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    mentors,
    loading,
    error,
    createMentor,
    updateMentor,
    deleteMentor,
    refreshMentors
  } = useMentors();
  
  const [formData, setFormData] = useState<CreateMentorData>({
    name: '',
    role: '',
    email: '',
    experience: '',
    bio: '',
    profilePicture: ''
  });

  const filteredMentors = mentors.filter(mentor =>
    mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mentor.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mentor.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (editingMentor) {
        await updateMentor({
          id: editingMentor.id,
          ...formData
        });
      } else {
        await createMentor(formData);
      }
      
      resetForm();
    } catch (error) {
      console.error('Error saving mentor:', error);
      // Error is handled by the hook and displayed in the UI
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      role: '',
      email: '',
      experience: '',
      bio: '',
      profilePicture: ''
    });
    setShowAddForm(false);
    setEditingMentor(null);
  };

  const handleEdit = (mentor: Mentor) => {
    setFormData({
      name: mentor.name,
      role: mentor.role,
      email: mentor.email,
      experience: mentor.experience,
      bio: mentor.bio,
      profilePicture: mentor.profilePicture
    });
    setEditingMentor(mentor);
    setShowAddForm(true);
  };

  const handleDelete = async (mentorId: string) => {
    if (window.confirm('Are you sure you want to delete this mentor?')) {
      try {
        await deleteMentor(mentorId);
      } catch (error) {
        console.error('Error deleting mentor:', error);
        // Error is handled by the hook and displayed in the UI
      }
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />);
    }
    if (rating % 1 !== 0) {
      stars.push(<Star key="half" className="h-4 w-4 text-yellow-400 fill-current opacity-50" />);
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Mentor Management</h1>
            <p className="text-gray-400 mt-1">Manage mentors available to startups</p>
          </div>
        </div>
        
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-3">
            <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
            <span className="text-gray-400">Loading mentors...</span>
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
            ← Back to Mentors
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">
              {editingMentor ? 'Edit Mentor' : 'Add New Mentor'}
            </h1>
            <p className="text-gray-400 mt-1">
              {editingMentor ? 'Update mentor information' : 'Add a new mentor to the platform'}
            </p>
          </div>
        </div>

        <Card className="p-6 max-w-4xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter mentor's full name"
                required
              />

              <Input
                label="Role/Title"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                placeholder="e.g., Tech Entrepreneur & VC Partner"
                required
              />

              <Input
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="mentor@example.com"
                required
              />

              <Input
                label="Experience"
                name="experience"
                value={formData.experience}
                onChange={handleInputChange}
                placeholder="e.g., 15+ years in tech startups"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Brief bio and expertise areas..."
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
                    {editingMentor ? 'Updating...' : 'Adding...'}
                  </>
                ) : (
                  editingMentor ? 'Update Mentor' : 'Add Mentor'
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
          <h1 className="text-3xl font-bold text-white">Mentor Management</h1>
          <p className="text-gray-400 mt-1">Manage mentors available to startups</p>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add Mentor</span>
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
                onClick={refreshMentors}
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
                placeholder="Search mentors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500">
              <option value="all">All Mentors</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Mentors Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredMentors.map((mentor) => (
          <Card key={mentor.id} className="p-6" hover>
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 bg-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
                    {mentor.profilePicture}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{mentor.name}</h3>
                    <p className="text-sm text-cyan-400">{mentor.role}</p>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(mentor)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(mentor.id)}>
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-1">
                  {renderStars(mentor.rating)}
                  <span className="text-gray-400 text-sm ml-1">({mentor.rating})</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-400">
                  <Mail className="h-4 w-4 mr-2" />
                  <span>{mentor.email}</span>
                </div>
                
                <p className="text-sm text-gray-300">{mentor.experience}</p>
              </div>

              <p className="text-sm text-gray-400 line-clamp-3">{mentor.bio}</p>

              <div className="pt-4 border-t border-gray-700">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Sessions this month:</span>
                  <span className="text-white font-medium">8</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Total sessions:</span>
                  <span className="text-white font-medium">142</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredMentors.length === 0 && (
        <Card className="p-12 text-center">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-300 mb-2">
            {searchTerm ? 'No mentors found' : 'No mentors available'}
          </h3>
          <p className="text-gray-400 mb-6">
            {searchTerm 
              ? 'Try adjusting your search criteria' 
              : 'Add your first mentor to get started'
            }
          </p>
          <Button onClick={() => setShowAddForm(true)}>
            Add First Mentor
          </Button>
        </Card>
      )}
    </div>
  );
};

export default MentorManage;
import React, { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Search, Filter, Star, User, MessageSquare, Loader2, AlertCircle } from 'lucide-react';
import { Mentor } from '../../types';
import { useMentors } from '../../hooks/useMentors';

const Mentors: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [showProfile, setShowProfile] = useState(false);

  const {
    mentors,
    loading,
    error,
    refreshMentors
  } = useMentors();

  const filteredMentors = mentors.filter(mentor =>
    mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mentor.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mentor.bio.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRequestSession = (mentor: Mentor) => {
    setSelectedMentor(mentor);
    setShowRequestForm(true);
  };

  const handleViewProfile = (mentor: Mentor) => {
    setSelectedMentor(mentor);
    setShowProfile(true);
  };

  const handleBackToMentors = () => {
    setShowProfile(false);
    setShowRequestForm(false);
    setSelectedMentor(null);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />);
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" className="h-4 w-4 text-yellow-400 fill-current opacity-50" />);
    }

    return stars;
  };

  if (showProfile && selectedMentor) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={handleBackToMentors}
          >
            ← Back to Mentors
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">Mentor Profile</h1>
            <p className="text-gray-400 mt-1">Detailed profile of {selectedMentor.name}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="p-6">
            <div className="text-center mb-6">
              <div className="h-24 w-24 bg-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
                {selectedMentor.profilePicture}
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">{selectedMentor.name}</h2>
              <p className="text-cyan-400 text-lg mb-3">{selectedMentor.role}</p>
              <div className="flex items-center justify-center space-x-1 mb-3">
                {renderStars(selectedMentor.rating)}
                <span className="text-gray-400 ml-2">({selectedMentor.rating}/5)</span>
              </div>
              <p className="text-gray-400">{selectedMentor.experience}</p>
            </div>

            <div className="space-y-4">
              <Button
                variant="primary"
                className="w-full"
                onClick={() => {
                  setShowProfile(false);
                  setShowRequestForm(true);
                }}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Request Session
              </Button>
              <Button variant="outline" className="w-full">
                <User className="h-4 w-4 mr-2" />
                Contact Mentor
              </Button>
            </div>
          </Card>

          {/* Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-white mb-4">About</h3>
              <p className="text-gray-300 leading-relaxed">{selectedMentor.bio}</p>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Expertise Areas</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-cyan-400 rounded-full"></div>
                  <span className="text-gray-300">Product Development</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-cyan-400 rounded-full"></div>
                  <span className="text-gray-300">Fundraising</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-cyan-400 rounded-full"></div>
                  <span className="text-gray-300">Scaling Operations</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-cyan-400 rounded-full"></div>
                  <span className="text-gray-300">Strategic Planning</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Contact Information</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-gray-700 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-gray-300" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Email</p>
                    <p className="text-white">{selectedMentor.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-gray-700 rounded-full flex items-center justify-center">
                    <Star className="h-4 w-4 text-gray-300" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Rating</p>
                    <p className="text-white">{selectedMentor.rating}/5.0</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (showRequestForm && selectedMentor) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={handleBackToMentors}
          >
            ← Back to Mentors
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">Request Session</h1>
            <p className="text-gray-400 mt-1">Schedule a mentoring session with {selectedMentor.name}</p>
          </div>
        </div>

        <Card className="p-6 max-w-2xl">
          <form className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Session Details</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Selected Mentor
              </label>
              <div className="flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg">
                <div className="h-10 w-10 bg-cyan-500 rounded-full flex items-center justify-center text-white font-medium">
                  {selectedMentor.profilePicture}
                </div>
                <div>
                  <p className="text-white font-medium">{selectedMentor.name}</p>
                  <p className="text-sm text-gray-400">{selectedMentor.role}</p>
                </div>
              </div>
            </div>

            <Input
              label="Startup Name"
              type="text"
              placeholder="Enter your startup name"
            />

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Topic
              </label>
              <select className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500">
                <option value="">Select a topic</option>
                <option value="business-strategy">Business Strategy</option>
                <option value="product-development">Product Development</option>
                <option value="marketing">Marketing & Growth</option>
                <option value="fundraising">Fundraising</option>
                <option value="operations">Operations</option>
                <option value="leadership">Leadership</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Preferred Time Slot
              </label>
              <select className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500">
                <option value="">Select preferred time</option>
                <option value="morning">Morning (9 AM - 12 PM)</option>
                <option value="afternoon">Afternoon (12 PM - 5 PM)</option>
                <option value="evening">Evening (5 PM - 8 PM)</option>
                <option value="flexible">Flexible</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Additional Notes
              </label>
              <textarea
                rows={4}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Describe what you'd like to discuss or any specific questions you have..."
              />
            </div>

            <div className="flex space-x-4">
              <Button type="button" variant="outline" onClick={handleBackToMentors}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                Send Request
              </Button>
            </div>
          </form>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Guidance Center</h1>
          <p className="text-gray-400 mt-1">Connect with experienced mentors to grow your startup</p>
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Guidance Center</h1>
        <p className="text-gray-400 mt-1">Connect with experienced mentors to grow your startup</p>
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
                placeholder="Search mentors by name, expertise, or bio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500">
              <option value="all">All Expertise</option>
              <option value="tech">Technology</option>
              <option value="marketing">Marketing</option>
              <option value="finance">Finance</option>
              <option value="operations">Operations</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Mentors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMentors.map((mentor) => (
          <Card key={mentor.id} className="p-6" hover>
            <div className="text-center mb-4">
              <div className="h-16 w-16 bg-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-3">
                {mentor.profilePicture}
              </div>
              <h3 className="text-xl font-semibold text-white mb-1">{mentor.name}</h3>
              <p className="text-cyan-400 text-sm mb-2">{mentor.role}</p>
              <div className="flex items-center justify-center space-x-1 mb-2">
                {renderStars(mentor.rating)}
                <span className="text-gray-400 text-sm ml-1">({mentor.rating})</span>
              </div>
              <p className="text-gray-400 text-sm">{mentor.experience}</p>
            </div>

            <p className="text-gray-300 text-sm mb-6 line-clamp-3">
              {mentor.bio}
            </p>

            <div className="space-y-3">
              <Button
                variant="primary"
                className="w-full"
                onClick={() => handleRequestSession(mentor)}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Request Session
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => handleViewProfile(mentor)}
              >
                <User className="h-4 w-4 mr-2" />
                View Profile
              </Button>
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
          <p className="text-gray-400">
            {searchTerm 
              ? 'Try adjusting your search criteria' 
              : 'Mentors will appear here once they are added by administrators'
            }
          </p>
        </Card>
      )}
    </div>
  );
};

export default Mentors;
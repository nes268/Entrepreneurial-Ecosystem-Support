import React, { useState } from 'react';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import { Calendar, Plus, Edit, Trash2, Users, MapPin, Clock, ExternalLink, AlertCircle, Loader2 } from 'lucide-react';
import { Event, CreateEventData, UpdateEventData } from '../../../types';
import { useEvents } from '../../../hooks/useEvents';
import { useAlerts } from '../../../context/AlertsContext';

const Events: React.FC = () => {
  const { createEventAlert } = useAlerts();
  
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed'>('upcoming');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    upcomingEvents,
    completedEvents,
    categories,
    loading,
    error,
    createEvent,
    updateEvent,
    deleteEvent,
    refreshEvents
  } = useEvents();
  
  const [formData, setFormData] = useState<CreateEventData>({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    category: '',
    organizedBy: '',
    registrationLink: '',
    onlineEventUrl: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      date: '',
      time: '',
      location: '',
      category: '',
      organizedBy: '',
      registrationLink: '',
      onlineEventUrl: ''
    });
    setEditingEvent(null);
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      location: event.location,
      category: event.category,
      organizedBy: event.organizedBy,
      registrationLink: event.registrationLink || '',
      onlineEventUrl: event.onlineEventUrl || ''
    });
    setShowCreateForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (editingEvent) {
        await updateEvent({
          id: editingEvent.id,
          ...formData
        });
      } else {
        await createEvent(formData);
        
        // Create automatic alert for new event
        createEventAlert(formData.title, formData.date, formData.category);
      }
      
      setShowCreateForm(false);
      resetForm();
    } catch (error) {
      console.error('Error saving event:', error);
      // Error is handled by the hook and displayed in the UI
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (eventId: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await deleteEvent(eventId);
      } catch (error) {
        console.error('Error deleting event:', error);
        // Error is handled by the hook and displayed in the UI
      }
    }
  };

  const handleCancel = () => {
    setShowCreateForm(false);
    resetForm();
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Workshop': 'bg-blue-900/30 text-blue-400',
      'Competition': 'bg-red-900/30 text-red-400',
      'Networking': 'bg-green-900/30 text-green-400',
      'Summit': 'bg-purple-900/30 text-purple-400',
      'Training': 'bg-yellow-900/30 text-yellow-400',
      'Conference': 'bg-indigo-900/30 text-indigo-400',
      'Meetup': 'bg-pink-900/30 text-pink-400',
      'Webinar': 'bg-cyan-900/30 text-cyan-400',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-700 text-gray-300';
  };

  if (showCreateForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={handleCancel}>
            ← Back to Events
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">
              {editingEvent ? 'Edit Event' : 'Create Event'}
            </h1>
            <p className="text-gray-400 mt-1">
              {editingEvent ? 'Update event details' : 'Add a new event to the platform'}
            </p>
          </div>
        </div>

        <Card className="p-6 max-w-4xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Input
                  label="Event Title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter event title"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="Event description"
                  required
                />
              </div>

              <Input
                label="Date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleInputChange}
                required
              />

              <Input
                label="Time"
                name="time"
                type="time"
                value={formData.time}
                onChange={handleInputChange}
                required
              />

              <Input
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Event location or 'Online'"
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  required
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <Input
                label="Organized By"
                name="organizedBy"
                value={formData.organizedBy}
                onChange={handleInputChange}
                placeholder="Organization name"
                required
              />

              <Input
                label="Registration Link (Optional)"
                name="registrationLink"
                type="url"
                value={formData.registrationLink}
                onChange={handleInputChange}
                placeholder="https://example.com/register"
              />

              <div className="md:col-span-2">
                <Input
                  label="Online Event URL (Optional)"
                  name="onlineEventUrl"
                  type="url"
                  value={formData.onlineEventUrl}
                  onChange={handleInputChange}
                  placeholder="https://zoom.us/j/example"
                />
              </div>
            </div>

            <div className="flex space-x-4">
              <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {editingEvent ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  editingEvent ? 'Update Event' : 'Create Event'
                )}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    );
  }

  const currentEvents = activeTab === 'upcoming' ? upcomingEvents : completedEvents;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Events Management</h1>
            <p className="text-gray-400 mt-1">Create and manage platform events</p>
          </div>
        </div>
        
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-3">
            <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
            <span className="text-gray-400">Loading events...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Events Management</h1>
          <p className="text-gray-400 mt-1">Create and manage platform events</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Create Event</span>
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
                onClick={refreshEvents}
                className="mt-2 text-red-400 hover:text-red-300"
              >
                Try Again
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'upcoming'
              ? 'bg-cyan-600 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Upcoming Events
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'completed'
              ? 'bg-cyan-600 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Completed Events
        </button>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {currentEvents.map((event) => (
          <Card key={event.id} className="p-6" hover>
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">{event.title}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(event.category)}`}>
                    {event.category}
                  </span>
                </div>
                {activeTab === 'upcoming' && (
                  <div className="flex space-x-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleEdit(event)}
                      title="Edit event"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDelete(event.id)}
                      title="Delete event"
                    >
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </Button>
                  </div>
                )}
              </div>

              <p className="text-gray-300 text-sm line-clamp-2">{event.description}</p>

              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-400">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{event.date} at {event.time}</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-400">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{event.location}</span>
                </div>

                <div className="flex items-center text-sm text-gray-400">
                  <Users className="h-4 w-4 mr-2" />
                  <span>by {event.organizedBy}</span>
                </div>
              </div>

              {(event.registrationLink || event.onlineEventUrl) && (
                <div className="pt-4 border-t border-gray-700 space-y-2">
                  {event.registrationLink && (
                    <a
                      href={event.registrationLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-sm text-cyan-400 hover:text-cyan-300"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Registration Link
                    </a>
                  )}
                  {event.onlineEventUrl && (
                    <a
                      href={event.onlineEventUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-sm text-cyan-400 hover:text-cyan-300"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Join Online
                    </a>
                  )}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {currentEvents.length === 0 && (
        <Card className="p-12 text-center">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-300 mb-2">
            No {activeTab} events
          </h3>
          <p className="text-gray-400 mb-6">
            {activeTab === 'upcoming' ? 'Create your first event to get started' : 'No completed events yet'}
          </p>
          {activeTab === 'upcoming' && (
            <Button onClick={() => setShowCreateForm(true)}>
              Create First Event
            </Button>
          )}
        </Card>
      )}
    </div>
  );
};

export default Events;
import React, { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Clock, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { Event } from '../../types';
import { useEvents } from '../../hooks/useEvents';

const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [showEventForm, setShowEventForm] = useState(false);
  
  // Use shared events API instead of local state
  const {
    events,
    loading,
    error,
    createEvent,
    refreshEvents
  } = useEvents();

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    category: ''
  });
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.title || !formData.date || !formData.time) {
      alert('Please fill in all required fields (Title, Date, Time)');
      return;
    }

    try {
      // Create new event using the shared API
      const eventData = {
        title: formData.title,
        description: formData.description,
        date: formData.date,
        time: formData.time,
        location: formData.location || 'TBD',
        category: formData.category || 'Meeting',
        organizedBy: 'Current User', // You might want to get this from auth context
        registrationLink: '',
        onlineEventUrl: ''
      };

      await createEvent(eventData);

      // Navigate to the month of the new event
      const eventDate = new Date(formData.date);
      setCurrentDate(eventDate);

      // Show success message
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);

      // Reset form and close
      setFormData({
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        category: ''
      });
      setShowEventForm(false);
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Error creating event. Please try again.');
    }
  };

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const renderMonthView = () => {
    const days = [];
    const totalCells = Math.ceil((daysInMonth + firstDayOfMonth) / 7) * 7;

    for (let i = 0; i < totalCells; i++) {
      const dayNumber = i - firstDayOfMonth + 1;
      const isCurrentMonth = dayNumber > 0 && dayNumber <= daysInMonth;
      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
      const dayEvents = events.filter(event => event.date === dateStr);
      const isToday = isCurrentMonth && dayNumber === new Date().getDate() && 
                     currentDate.getMonth() === new Date().getMonth() && 
                     currentDate.getFullYear() === new Date().getFullYear();

      days.push(
        <div key={i} className={`min-h-24 p-2 border border-gray-700 ${isCurrentMonth ? 'bg-gray-800' : 'bg-gray-900'}`}>
          {isCurrentMonth && (
            <>
              <div className={`text-sm font-medium mb-2 ${isToday ? 'text-cyan-400' : 'text-gray-300'}`}>
                {dayNumber}
              </div>
              <div className="space-y-1">
                {dayEvents.map(event => (
                  <div key={event.id} className="text-xs bg-cyan-600 text-white px-2 py-1 rounded truncate">
                    {event.title}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-7 gap-0">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-4 bg-gray-700 text-center text-sm font-medium text-gray-300 border border-gray-600">
            {day}
          </div>
        ))}
        {days}
      </div>
    );
  };

  // Show loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Calendar</h1>
            <p className="text-gray-400 mt-1">Manage your events and meetings</p>
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

  if (showEventForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => setShowEventForm(false)}>
            ← Back to Calendar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">Create Event</h1>
            <p className="text-gray-400 mt-1">Schedule a new event or meeting</p>
          </div>
        </div>

        <Card className="p-6 max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Event Title *</label>
              <input 
                type="text" 
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Enter event title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
              <textarea 
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Event description"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Date *</label>
                <input 
                  type="date" 
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Time *</label>
                <input 
                  type="time" 
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
              <input 
                type="text" 
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Event location or 'Online'"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
              <select 
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="">Select category</option>
                <option value="Meeting">Meeting</option>
                <option value="Mentorship">Mentorship</option>
                <option value="Presentation">Presentation</option>
                <option value="Workshop">Workshop</option>
                <option value="Networking">Networking</option>
              </select>
            </div>

            <div className="flex space-x-4">
              <Button type="button" variant="outline" onClick={() => setShowEventForm(false)}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                Create Event
              </Button>
            </div>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {showSuccessMessage && (
        <div className="bg-emerald-900/20 border border-emerald-500/50 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-emerald-400" />
            <span className="text-emerald-300">Event created successfully!</span>
          </div>
        </div>
      )}

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

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Calendar</h1>
          <p className="text-gray-400 mt-1">Manage your events and meetings</p>
        </div>
        <Button onClick={() => {
          setFormData({
            title: '',
            description: '',
            date: '',
            time: '',
            location: '',
            category: ''
          });
          setShowEventForm(true);
        }} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add Event</span>
        </Button>
      </div>

      {/* Calendar Controls */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button onClick={() => navigateMonth('prev')} className="p-2 hover:bg-gray-700 rounded-lg">
              <ChevronLeft className="h-5 w-5 text-gray-300" />
            </button>
            <h2 className="text-xl font-semibold text-white">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button onClick={() => navigateMonth('next')} className="p-2 hover:bg-gray-700 rounded-lg">
              <ChevronRight className="h-5 w-5 text-gray-300" />
            </button>
          </div>

          <div className="flex space-x-2">
            {(['month', 'week', 'day'] as const).map((viewType) => (
              <Button
                key={viewType}
                variant={view === viewType ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setView(viewType)}
                className="capitalize"
              >
                {viewType}
              </Button>
            ))}
          </div>
        </div>

        {/* Calendar Grid */}
        {view === 'month' && renderMonthView()}
      </Card>

      {/* Upcoming Events */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Clock className="h-5 w-5 mr-2" />
          Upcoming Events
        </h3>
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event.id} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-gray-600">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-cyan-500/10 rounded-lg">
                  <CalendarIcon className="h-4 w-4 text-cyan-400" />
                </div>
                <div>
                  <h4 className="text-white font-medium">{event.title}</h4>
                  <p className="text-sm text-gray-400">{event.description}</p>
                  <p className="text-xs text-gray-500">{event.date} at {event.time} • {event.location}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  event.category === 'Meeting' ? 'bg-blue-900/30 text-blue-400' :
                  event.category === 'Mentorship' ? 'bg-emerald-900/30 text-emerald-400' :
                  'bg-gray-700 text-gray-300'
                }`}>
                  {event.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Calendar;
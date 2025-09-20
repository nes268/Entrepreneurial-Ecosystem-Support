import { useState, useEffect, useCallback } from 'react';
import { Event, CreateEventData, UpdateEventData } from '../types';
import { eventsApi } from '../services/eventsApi';

export interface UseEventsReturn {
  events: Event[];
  upcomingEvents: Event[];
  completedEvents: Event[];
  categories: string[];
  loading: boolean;
  error: string | null;
  createEvent: (eventData: CreateEventData) => Promise<Event>;
  updateEvent: (eventData: UpdateEventData) => Promise<Event>;
  deleteEvent: (id: string) => Promise<void>;
  refreshEvents: () => Promise<void>;
}

export const useEvents = (): UseEventsReturn => {
  const [events, setEvents] = useState<Event[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [completedEvents, setCompletedEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [eventsData, upcomingData, completedData, categoriesData] = await Promise.all([
        eventsApi.getEvents(),
        eventsApi.getUpcomingEvents(),
        eventsApi.getCompletedEvents(),
        eventsApi.getEventCategories(),
      ]);

      setEvents(eventsData);
      setUpcomingEvents(upcomingData);
      setCompletedEvents(completedData);
      setCategories(categoriesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch events');
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createEvent = useCallback(async (eventData: CreateEventData): Promise<Event> => {
    try {
      setError(null);
      const newEvent = await eventsApi.createEvent(eventData);
      
      // Update local state
      setEvents(prev => [...prev, newEvent]);
      
      // Determine if it's upcoming or completed based on date
      const eventDate = new Date(newEvent.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (eventDate >= today) {
        setUpcomingEvents(prev => [...prev, newEvent]);
      } else {
        setCompletedEvents(prev => [...prev, newEvent]);
      }
      
      return newEvent;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create event';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const updateEvent = useCallback(async (eventData: UpdateEventData): Promise<Event> => {
    try {
      setError(null);
      const updatedEvent = await eventsApi.updateEvent(eventData);
      
      // Update local state
      setEvents(prev => prev.map(event => 
        event.id === updatedEvent.id ? updatedEvent : event
      ));
      
      // Update in appropriate list
      const eventDate = new Date(updatedEvent.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (eventDate >= today) {
        setUpcomingEvents(prev => prev.map(event => 
          event.id === updatedEvent.id ? updatedEvent : event
        ));
        setCompletedEvents(prev => prev.filter(event => event.id !== updatedEvent.id));
      } else {
        setCompletedEvents(prev => prev.map(event => 
          event.id === updatedEvent.id ? updatedEvent : event
        ));
        setUpcomingEvents(prev => prev.filter(event => event.id !== updatedEvent.id));
      }
      
      return updatedEvent;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update event';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const deleteEvent = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null);
      await eventsApi.deleteEvent(id);
      
      // Update local state
      setEvents(prev => prev.filter(event => event.id !== id));
      setUpcomingEvents(prev => prev.filter(event => event.id !== id));
      setCompletedEvents(prev => prev.filter(event => event.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete event';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const refreshEvents = useCallback(async (): Promise<void> => {
    await fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return {
    events,
    upcomingEvents,
    completedEvents,
    categories,
    loading,
    error,
    createEvent,
    updateEvent,
    deleteEvent,
    refreshEvents,
  };
};

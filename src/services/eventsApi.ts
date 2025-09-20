import { Event, CreateEventData, UpdateEventData } from '../types';
import { mockEventsApi } from './mockEventsApi';

// For now, use mock API. Replace with real API when backend is ready
const USE_MOCK_API = true;

class EventsApi {
  async getEvents(): Promise<Event[]> {
    if (USE_MOCK_API) {
      return mockEventsApi.getEvents();
    }
    // Real API implementation would go here
    throw new Error('Real API not implemented yet');
  }

  async getUpcomingEvents(): Promise<Event[]> {
    if (USE_MOCK_API) {
      return mockEventsApi.getUpcomingEvents();
    }
    throw new Error('Real API not implemented yet');
  }

  async getCompletedEvents(): Promise<Event[]> {
    if (USE_MOCK_API) {
      return mockEventsApi.getCompletedEvents();
    }
    throw new Error('Real API not implemented yet');
  }

  async getEventById(id: string): Promise<Event> {
    if (USE_MOCK_API) {
      return mockEventsApi.getEventById(id);
    }
    throw new Error('Real API not implemented yet');
  }

  async createEvent(eventData: CreateEventData): Promise<Event> {
    if (USE_MOCK_API) {
      return mockEventsApi.createEvent(eventData);
    }
    throw new Error('Real API not implemented yet');
  }

  async updateEvent(eventData: UpdateEventData): Promise<Event> {
    if (USE_MOCK_API) {
      return mockEventsApi.updateEvent(eventData);
    }
    throw new Error('Real API not implemented yet');
  }

  async deleteEvent(id: string): Promise<void> {
    if (USE_MOCK_API) {
      return mockEventsApi.deleteEvent(id);
    }
    throw new Error('Real API not implemented yet');
  }

  async getEventCategories(): Promise<string[]> {
    if (USE_MOCK_API) {
      return mockEventsApi.getEventCategories();
    }
    throw new Error('Real API not implemented yet');
  }
}

export const eventsApi = new EventsApi();

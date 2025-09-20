import { Event, CreateEventData, UpdateEventData } from '../types';

// Mock data storage - Start with empty array for dynamic behavior
let events: Event[] = [];

const categories = [
  'Workshop', 'Competition', 'Networking', 'Summit', 'Training', 'Conference', 'Meetup', 'Webinar'
];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class MockEventsApi {
  async getEvents(): Promise<Event[]> {
    await delay(500);
    return [...events];
  }

  async getUpcomingEvents(): Promise<Event[]> {
    await delay(500);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= today;
    });
  }

  async getCompletedEvents(): Promise<Event[]> {
    await delay(500);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate < today;
    });
  }

  async getEventById(id: string): Promise<Event> {
    await delay(300);
    const event = events.find(e => e.id === id);
    if (!event) {
      throw new Error('Event not found');
    }
    return event;
  }

  async createEvent(eventData: CreateEventData): Promise<Event> {
    await delay(800);
    
    const newEvent: Event = {
      id: Date.now().toString(),
      ...eventData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    events.push(newEvent);
    return newEvent;
  }

  async updateEvent(eventData: UpdateEventData): Promise<Event> {
    await delay(800);
    
    const { id, ...updateData } = eventData;
    const eventIndex = events.findIndex(e => e.id === id);
    
    if (eventIndex === -1) {
      throw new Error('Event not found');
    }
    
    events[eventIndex] = {
      ...events[eventIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    return events[eventIndex];
  }

  async deleteEvent(id: string): Promise<void> {
    await delay(500);
    
    const eventIndex = events.findIndex(e => e.id === id);
    if (eventIndex === -1) {
      throw new Error('Event not found');
    }
    
    events.splice(eventIndex, 1);
  }

  async getEventCategories(): Promise<string[]> {
    await delay(200);
    return [...categories];
  }
}

export const mockEventsApi = new MockEventsApi();

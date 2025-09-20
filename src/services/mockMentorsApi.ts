import { Mentor, CreateMentorData, UpdateMentorData } from '../types';

// Mock data storage - Start with empty array
let mentors: Mentor[] = [];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class MockMentorsApi {
  // Function to add sample mentors for testing
  addSampleMentors() {
    if (mentors.length === 0) {
      mentors = [
        {
          id: '1',
          name: 'Dr. Sarah Wilson',
          role: 'Tech Entrepreneur & VC Partner',
          email: 'sarah@techventures.com',
          experience: '15+ years in tech startups',
          bio: 'Former founder of 3 successful startups, now investing in early-stage tech companies. Expertise in product development, scaling operations, and fundraising.',
          profilePicture: 'SW',
          rating: 4.9,
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z'
        },
        {
          id: '2',
          name: 'Michael Chen',
          role: 'Marketing Strategy Expert',
          email: 'michael@growthlab.com',
          experience: '12+ years in growth marketing',
          bio: 'Growth marketing specialist who has helped over 50 startups achieve product-market fit. Expert in digital marketing, customer acquisition, and brand building.',
          profilePicture: 'MC',
          rating: 4.8,
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z'
        },
        {
          id: '3',
          name: 'Lisa Rodriguez',
          role: 'Finance & Operations Consultant',
          email: 'lisa@financeplus.com',
          experience: '10+ years in finance',
          bio: 'CFO advisor for multiple startups, specializing in financial planning, fundraising preparation, and operational efficiency.',
          profilePicture: 'LR',
          rating: 4.7,
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z'
        }
      ];
    }
  }

  async getMentors(): Promise<Mentor[]> {
    await delay(500);
    return [...mentors];
  }

  async getMentorById(id: string): Promise<Mentor> {
    await delay(300);
    const mentor = mentors.find(m => m.id === id);
    if (!mentor) {
      throw new Error('Mentor not found');
    }
    return mentor;
  }

  async createMentor(mentorData: CreateMentorData): Promise<Mentor> {
    await delay(800);
    
    const newMentor: Mentor = {
      id: Date.now().toString(),
      ...mentorData,
      rating: 5.0, // Default rating for new mentors
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    mentors.push(newMentor);
    return newMentor;
  }

  async updateMentor(mentorData: UpdateMentorData): Promise<Mentor> {
    await delay(800);
    
    const { id, ...updateData } = mentorData;
    const mentorIndex = mentors.findIndex(m => m.id === id);
    
    if (mentorIndex === -1) {
      throw new Error('Mentor not found');
    }
    
    mentors[mentorIndex] = {
      ...mentors[mentorIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    return mentors[mentorIndex];
  }

  async deleteMentor(id: string): Promise<void> {
    await delay(500);
    
    const mentorIndex = mentors.findIndex(m => m.id === id);
    if (mentorIndex === -1) {
      throw new Error('Mentor not found');
    }
    
    mentors.splice(mentorIndex, 1);
  }
}

export const mockMentorsApi = new MockMentorsApi();

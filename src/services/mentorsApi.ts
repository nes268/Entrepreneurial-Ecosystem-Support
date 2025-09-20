import { Mentor, CreateMentorData, UpdateMentorData } from '../types';
import { mockMentorsApi } from './mockMentorsApi';

// For now, use mock API. Replace with real API when backend is ready
const USE_MOCK_API = true;

class MentorsApi {
  async getMentors(): Promise<Mentor[]> {
    if (USE_MOCK_API) {
      return mockMentorsApi.getMentors();
    }
    throw new Error('Real API not implemented yet');
  }

  async getMentorById(id: string): Promise<Mentor> {
    if (USE_MOCK_API) {
      return mockMentorsApi.getMentorById(id);
    }
    throw new Error('Real API not implemented yet');
  }

  async createMentor(mentorData: CreateMentorData): Promise<Mentor> {
    if (USE_MOCK_API) {
      return mockMentorsApi.createMentor(mentorData);
    }
    throw new Error('Real API not implemented yet');
  }

  async updateMentor(mentorData: UpdateMentorData): Promise<Mentor> {
    if (USE_MOCK_API) {
      return mockMentorsApi.updateMentor(mentorData);
    }
    throw new Error('Real API not implemented yet');
  }

  async deleteMentor(id: string): Promise<void> {
    if (USE_MOCK_API) {
      return mockMentorsApi.deleteMentor(id);
    }
    throw new Error('Real API not implemented yet');
  }
}

export const mentorsApi = new MentorsApi();

import { useState, useEffect, useCallback } from 'react';
import { Mentor, CreateMentorData, UpdateMentorData } from '../types';
import { mentorsApi } from '../services/mentorsApi';

export interface UseMentorsReturn {
  mentors: Mentor[];
  loading: boolean;
  error: string | null;
  createMentor: (mentorData: CreateMentorData) => Promise<Mentor>;
  updateMentor: (mentorData: UpdateMentorData) => Promise<Mentor>;
  deleteMentor: (id: string) => Promise<void>;
  refreshMentors: () => Promise<void>;
}

export const useMentors = (): UseMentorsReturn => {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMentors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const mentorsData = await mentorsApi.getMentors();
      setMentors(mentorsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch mentors');
      console.error('Error fetching mentors:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createMentor = useCallback(async (mentorData: CreateMentorData): Promise<Mentor> => {
    try {
      setError(null);
      const newMentor = await mentorsApi.createMentor(mentorData);
      
      // Update local state
      setMentors(prev => [...prev, newMentor]);
      
      return newMentor;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create mentor';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const updateMentor = useCallback(async (mentorData: UpdateMentorData): Promise<Mentor> => {
    try {
      setError(null);
      const updatedMentor = await mentorsApi.updateMentor(mentorData);
      
      // Update local state
      setMentors(prev => prev.map(mentor => 
        mentor.id === updatedMentor.id ? updatedMentor : mentor
      ));
      
      return updatedMentor;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update mentor';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const deleteMentor = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null);
      await mentorsApi.deleteMentor(id);
      
      // Update local state
      setMentors(prev => prev.filter(mentor => mentor.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete mentor';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const refreshMentors = useCallback(async (): Promise<void> => {
    await fetchMentors();
  }, [fetchMentors]);

  useEffect(() => {
    fetchMentors();
  }, [fetchMentors]);

  return {
    mentors,
    loading,
    error,
    createMentor,
    updateMentor,
    deleteMentor,
    refreshMentors,
  };
};

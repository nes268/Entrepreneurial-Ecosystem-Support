import { useState, useEffect, useCallback } from 'react';
import { Investor, CreateInvestorData, UpdateInvestorData } from '../types';
import { investorsApi } from '../services/investorsApi';

export interface UseInvestorsReturn {
  investors: Investor[];
  loading: boolean;
  error: string | null;
  createInvestor: (investorData: CreateInvestorData) => Promise<Investor>;
  updateInvestor: (investorData: UpdateInvestorData) => Promise<Investor>;
  deleteInvestor: (id: string) => Promise<void>;
  refreshInvestors: () => Promise<void>;
}

export const useInvestors = (): UseInvestorsReturn => {
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvestors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const investorsData = await investorsApi.getInvestors();
      setInvestors(investorsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch investors');
      console.error('Error fetching investors:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createInvestor = useCallback(async (investorData: CreateInvestorData): Promise<Investor> => {
    try {
      setError(null);
      const newInvestor = await investorsApi.createInvestor(investorData);
      
      // Update local state
      setInvestors(prev => [...prev, newInvestor]);
      
      return newInvestor;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create investor';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const updateInvestor = useCallback(async (investorData: UpdateInvestorData): Promise<Investor> => {
    try {
      setError(null);
      const updatedInvestor = await investorsApi.updateInvestor(investorData);
      
      // Update local state
      setInvestors(prev => prev.map(investor => 
        investor.id === updatedInvestor.id ? updatedInvestor : investor
      ));
      
      return updatedInvestor;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update investor';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const deleteInvestor = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null);
      await investorsApi.deleteInvestor(id);
      
      // Update local state
      setInvestors(prev => prev.filter(investor => investor.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete investor';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const refreshInvestors = useCallback(async (): Promise<void> => {
    await fetchInvestors();
  }, [fetchInvestors]);

  useEffect(() => {
    fetchInvestors();
  }, [fetchInvestors]);

  return {
    investors,
    loading,
    error,
    createInvestor,
    updateInvestor,
    deleteInvestor,
    refreshInvestors,
  };
};

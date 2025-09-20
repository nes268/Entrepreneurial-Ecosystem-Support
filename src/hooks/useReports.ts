import { useState, useEffect, useCallback } from 'react';
import { Report, CreateReportData, UpdateReportData } from '../types';
import { reportsApi } from '../services/reportsApi';

export interface UseReportsReturn {
  reports: Report[];
  loading: boolean;
  error: string | null;
  createReport: (reportData: CreateReportData) => Promise<Report>;
  updateReport: (reportData: UpdateReportData) => Promise<Report>;
  deleteReport: (id: string) => Promise<void>;
  refreshReports: () => Promise<void>;
}

export const useReports = (): UseReportsReturn => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const reportsData = await reportsApi.getReports();
      setReports(reportsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch reports');
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createReport = useCallback(async (reportData: CreateReportData): Promise<Report> => {
    try {
      setError(null);
      const newReport = await reportsApi.createReport(reportData);
      
      // Update local state
      setReports(prev => [...prev, newReport]);
      
      return newReport;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create report';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const updateReport = useCallback(async (reportData: UpdateReportData): Promise<Report> => {
    try {
      setError(null);
      const updatedReport = await reportsApi.updateReport(reportData);
      
      // Update local state
      setReports(prev => prev.map(report => 
        report.id === updatedReport.id ? updatedReport : report
      ));
      
      return updatedReport;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update report';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const deleteReport = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null);
      await reportsApi.deleteReport(id);
      
      // Update local state
      setReports(prev => prev.filter(report => report.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete report';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const refreshReports = useCallback(async (): Promise<void> => {
    await fetchReports();
  }, [fetchReports]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return {
    reports,
    loading,
    error,
    createReport,
    updateReport,
    deleteReport,
    refreshReports,
  };
};

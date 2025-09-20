import { Report, CreateReportData, UpdateReportData } from '../types';
import { mockReportsApi } from './mockReportsApi';

// For now, use mock API. Replace with real API when backend is ready
const USE_MOCK_API = true;

class ReportsApi {
  async getReports(): Promise<Report[]> {
    if (USE_MOCK_API) {
      return mockReportsApi.getReports();
    }
    throw new Error('Real API not implemented yet');
  }

  async getReportById(id: string): Promise<Report> {
    if (USE_MOCK_API) {
      return mockReportsApi.getReportById(id);
    }
    throw new Error('Real API not implemented yet');
  }

  async createReport(reportData: CreateReportData): Promise<Report> {
    if (USE_MOCK_API) {
      return mockReportsApi.createReport(reportData);
    }
    throw new Error('Real API not implemented yet');
  }

  async updateReport(reportData: UpdateReportData): Promise<Report> {
    if (USE_MOCK_API) {
      return mockReportsApi.updateReport(reportData);
    }
    throw new Error('Real API not implemented yet');
  }

  async deleteReport(id: string): Promise<void> {
    if (USE_MOCK_API) {
      return mockReportsApi.deleteReport(id);
    }
    throw new Error('Real API not implemented yet');
  }
}

export const reportsApi = new ReportsApi();

import { Report, CreateReportData, UpdateReportData } from '../types';

// Mock data storage - Start with empty array
let reports: Report[] = [];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class MockReportsApi {
  // Function to add sample reports for testing
  addSampleReports() {
    if (reports.length === 0) {
      reports = [
        {
          id: '1',
          name: 'Monthly Startup Report - January 2025',
          type: 'Monthly Report',
          dateGenerated: '2025-01-31',
          fileSize: '2.3 MB',
          status: 'ready',
          createdAt: '2025-01-31T00:00:00Z',
          updatedAt: '2025-01-31T00:00:00Z'
        },
        {
          id: '2',
          name: 'TRL Distribution Analysis Q4 2024',
          type: 'Analytics Report',
          dateGenerated: '2025-01-15',
          fileSize: '1.8 MB',
          status: 'ready',
          createdAt: '2025-01-15T00:00:00Z',
          updatedAt: '2025-01-15T00:00:00Z'
        },
        {
          id: '3',
          name: 'Investor Engagement Report',
          type: 'Engagement Report',
          dateGenerated: '2025-01-10',
          fileSize: '3.1 MB',
          status: 'ready',
          createdAt: '2025-01-10T00:00:00Z',
          updatedAt: '2025-01-10T00:00:00Z'
        },
        {
          id: '4',
          name: 'Sector-wise Performance Analysis',
          type: 'Performance Report',
          dateGenerated: '2025-01-05',
          fileSize: '2.7 MB',
          status: 'ready',
          createdAt: '2025-01-05T00:00:00Z',
          updatedAt: '2025-01-05T00:00:00Z'
        }
      ];
    }
  }

  async getReports(): Promise<Report[]> {
    await delay(500);
    return [...reports];
  }

  async getReportById(id: string): Promise<Report> {
    await delay(300);
    const report = reports.find(r => r.id === id);
    if (!report) {
      throw new Error('Report not found');
    }
    return report;
  }

  async createReport(reportData: CreateReportData): Promise<Report> {
    await delay(800);
    
    const newReport: Report = {
      id: Date.now().toString(),
      ...reportData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    reports.push(newReport);
    return newReport;
  }

  async updateReport(reportData: UpdateReportData): Promise<Report> {
    await delay(800);
    
    const { id, ...updateData } = reportData;
    const reportIndex = reports.findIndex(r => r.id === id);
    
    if (reportIndex === -1) {
      throw new Error('Report not found');
    }
    
    reports[reportIndex] = {
      ...reports[reportIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    return reports[reportIndex];
  }

  async deleteReport(id: string): Promise<void> {
    await delay(500);
    
    const reportIndex = reports.findIndex(r => r.id === id);
    if (reportIndex === -1) {
      throw new Error('Report not found');
    }
    
    reports.splice(reportIndex, 1);
  }
}

export const mockReportsApi = new MockReportsApi();

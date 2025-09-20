import { Investor, CreateInvestorData, UpdateInvestorData } from '../types';
import { mockInvestorsApi } from './mockInvestorsApi';

// For now, use mock API. Replace with real API when backend is ready
const USE_MOCK_API = true;

class InvestorsApi {
  async getInvestors(): Promise<Investor[]> {
    if (USE_MOCK_API) {
      return mockInvestorsApi.getInvestors();
    }
    throw new Error('Real API not implemented yet');
  }

  async getInvestorById(id: string): Promise<Investor> {
    if (USE_MOCK_API) {
      return mockInvestorsApi.getInvestorById(id);
    }
    throw new Error('Real API not implemented yet');
  }

  async createInvestor(investorData: CreateInvestorData): Promise<Investor> {
    if (USE_MOCK_API) {
      return mockInvestorsApi.createInvestor(investorData);
    }
    throw new Error('Real API not implemented yet');
  }

  async updateInvestor(investorData: UpdateInvestorData): Promise<Investor> {
    if (USE_MOCK_API) {
      return mockInvestorsApi.updateInvestor(investorData);
    }
    throw new Error('Real API not implemented yet');
  }

  async deleteInvestor(id: string): Promise<void> {
    if (USE_MOCK_API) {
      return mockInvestorsApi.deleteInvestor(id);
    }
    throw new Error('Real API not implemented yet');
  }
}

export const investorsApi = new InvestorsApi();

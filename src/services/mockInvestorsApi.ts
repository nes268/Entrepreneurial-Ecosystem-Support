import { Investor, CreateInvestorData, UpdateInvestorData } from '../types';

// Mock data storage - Start with empty array
let investors: Investor[] = [];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class MockInvestorsApi {
  // Function to add sample investors for testing
  addSampleInvestors() {
    if (investors.length === 0) {
      investors = [
        {
          id: '1',
          name: 'Sarah Chen',
          firm: 'Tech Ventures',
          email: 'sarah@techventures.com',
          phoneNumber: '+1 (555) 123-4567',
          investmentRange: '$100K - $2M',
          focusAreas: ['SaaS', 'AI/ML', 'FinTech'],
          backgroundSummary: 'Focus on early-stage SaaS and AI startups with proven traction',
          profilePicture: 'SC',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z'
        },
        {
          id: '2',
          name: 'Michael Rodriguez',
          firm: 'Innovation Capital',
          email: 'michael@innovcapital.com',
          phoneNumber: '+1 (555) 234-5678',
          investmentRange: '$500K - $5M',
          focusAreas: ['FinTech', 'Healthcare', 'B2B'],
          backgroundSummary: 'Specializes in FinTech and Healthcare with 15+ years experience',
          profilePicture: 'MR',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z'
        },
        {
          id: '3',
          name: 'Emily Johnson',
          firm: 'Future Fund',
          email: 'emily@futurefund.com',
          phoneNumber: '+1 (555) 345-6789',
          investmentRange: '$250K - $3M',
          focusAreas: ['CleanTech', 'EdTech', 'Sustainability'],
          backgroundSummary: 'Invests in sustainable technology solutions and clean energy',
          profilePicture: 'EJ',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z'
        }
      ];
    }
  }

  async getInvestors(): Promise<Investor[]> {
    await delay(500);
    return [...investors];
  }

  async getInvestorById(id: string): Promise<Investor> {
    await delay(300);
    const investor = investors.find(i => i.id === id);
    if (!investor) {
      throw new Error('Investor not found');
    }
    return investor;
  }

  async createInvestor(investorData: CreateInvestorData): Promise<Investor> {
    await delay(800);
    
    const newInvestor: Investor = {
      id: Date.now().toString(),
      ...investorData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    investors.push(newInvestor);
    return newInvestor;
  }

  async updateInvestor(investorData: UpdateInvestorData): Promise<Investor> {
    await delay(800);
    
    const { id, ...updateData } = investorData;
    const investorIndex = investors.findIndex(i => i.id === id);
    
    if (investorIndex === -1) {
      throw new Error('Investor not found');
    }
    
    investors[investorIndex] = {
      ...investors[investorIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    return investors[investorIndex];
  }

  async deleteInvestor(id: string): Promise<void> {
    await delay(500);
    
    const investorIndex = investors.findIndex(i => i.id === id);
    if (investorIndex === -1) {
      throw new Error('Investor not found');
    }
    
    investors.splice(investorIndex, 1);
  }
}

export const mockInvestorsApi = new MockInvestorsApi();

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface FundingStage {
  id: string;
  name: string;
  status: 'completed' | 'current' | 'pending';
  progress: number;
  targetAmount?: number;
  raisedAmount?: number;
  date?: string;
  description: string;
}

interface FundingContextType {
  fundingStages: FundingStage[];
  currentStage: string;
  totalTargetAmount: number;
  totalRaisedAmount: number;
  updateStageProgress: (stageId: string, progress: number, raisedAmount?: number) => void;
  completeStage: (stageId: string) => void;
  setCurrentStage: (stageId: string) => void;
  updateFundingAmounts: (targetAmount: number, raisedAmount: number) => void;
}

const initialStages: FundingStage[] = [
  {
    id: 'idea',
    name: 'Idea',
    status: 'completed',
    progress: 100,
    targetAmount: 0,
    raisedAmount: 0,
    date: '2024-03-15',
    description: 'Concept development and initial planning'
  },
  {
    id: 'mvp',
    name: 'MVP',
    status: 'completed',
    progress: 100,
    targetAmount: 50000,
    raisedAmount: 50000,
    date: '2024-06-20',
    description: 'Minimum viable product development'
  },
  {
    id: 'seed',
    name: 'Seed',
    status: 'current',
    progress: 65,
    targetAmount: 200000,
    raisedAmount: 130000,
    date: '2024-09-01',
    description: 'Early stage funding for product development'
  },
  {
    id: 'series-a',
    name: 'Series A',
    status: 'pending',
    progress: 0,
    targetAmount: 1000000,
    raisedAmount: 0,
    description: 'Growth capital for market expansion'
  },
  {
    id: 'growth',
    name: 'Growth',
    status: 'pending',
    progress: 0,
    targetAmount: 5000000,
    raisedAmount: 0,
    description: 'Expansion funding for scaling operations'
  },
  {
    id: 'scale',
    name: 'Scale',
    status: 'pending',
    progress: 0,
    targetAmount: 20000000,
    raisedAmount: 0,
    description: 'Scaling operations and market dominance'
  }
];

const FundingContext = createContext<FundingContextType | undefined>(undefined);

export const FundingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [fundingStages, setFundingStages] = useState<FundingStage[]>(initialStages);
  const [currentStage, setCurrentStage] = useState('seed');

  const totalTargetAmount = fundingStages.reduce((sum, stage) => sum + (stage.targetAmount || 0), 0);
  const totalRaisedAmount = fundingStages.reduce((sum, stage) => sum + (stage.raisedAmount || 0), 0);

  const updateStageProgress = (stageId: string, progress: number, raisedAmount?: number) => {
    setFundingStages(prev => prev.map(stage => 
      stage.id === stageId 
        ? { 
            ...stage, 
            progress: Math.min(100, Math.max(0, progress)),
            raisedAmount: raisedAmount !== undefined ? raisedAmount : stage.raisedAmount
          }
        : stage
    ));
  };

  const completeStage = (stageId: string) => {
    setFundingStages(prev => prev.map(stage => 
      stage.id === stageId 
        ? { ...stage, status: 'completed', progress: 100, date: new Date().toISOString().split('T')[0] }
        : stage
    ));

    // Move to next stage
    const currentIndex = fundingStages.findIndex(stage => stage.id === stageId);
    if (currentIndex < fundingStages.length - 1) {
      const nextStage = fundingStages[currentIndex + 1];
      setCurrentStage(nextStage.id);
      setFundingStages(prev => prev.map(stage => 
        stage.id === nextStage.id 
          ? { ...stage, status: 'current' }
          : stage
      ));
    }
  };

  const updateFundingAmounts = (targetAmount: number, raisedAmount: number) => {
    setFundingStages(prev => prev.map(stage => 
      stage.id === currentStage 
        ? { ...stage, targetAmount, raisedAmount }
        : stage
    ));
  };

  return (
    <FundingContext.Provider value={{
      fundingStages,
      currentStage,
      totalTargetAmount,
      totalRaisedAmount,
      updateStageProgress,
      completeStage,
      setCurrentStage,
      updateFundingAmounts
    }}>
      {children}
    </FundingContext.Provider>
  );
};

export const useFunding = () => {
  const context = useContext(FundingContext);
  if (context === undefined) {
    throw new Error('useFunding must be used within a FundingProvider');
  }
  return context;
};

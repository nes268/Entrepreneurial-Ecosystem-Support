import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Startup } from '../types';

export interface Application extends Startup {
  id: string;
  name: string;
  founder: string;
  sector: string;
  type: 'incubation' | 'innovation';
  status: 'pending' | 'approved' | 'rejected';
  trlLevel: number;
  email: string;
  submissionDate: string;
  createdAt: string;
  updatedAt: string;
}

interface ApplicationsContextType {
  applications: Application[];
  addApplication: (application: Omit<Application, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => void;
  updateApplication: (id: string, updates: Partial<Application>) => void;
  deleteApplication: (id: string) => void;
  approveApplication: (id: string) => void;
  rejectApplication: (id: string) => void;
  getApplicationsByStatus: (status: Application['status']) => Application[];
  getApplicationById: (id: string) => Application | undefined;
}

const ApplicationsContext = createContext<ApplicationsContextType | undefined>(undefined);

export const ApplicationsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [applications, setApplications] = useState<Application[]>([]);

  const addApplication = (applicationData: Omit<Application, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
    const newApplication: Application = {
      ...applicationData,
      id: Date.now().toString(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setApplications(prev => [newApplication, ...prev]);
  };

  const updateApplication = (id: string, updates: Partial<Application>) => {
    setApplications(prev => 
      prev.map(application => 
        application.id === id 
          ? { ...application, ...updates, updatedAt: new Date().toISOString() }
          : application
      )
    );
  };

  const deleteApplication = (id: string) => {
    setApplications(prev => prev.filter(application => application.id !== id));
  };

  const approveApplication = (id: string) => {
    updateApplication(id, { status: 'approved' });
  };

  const rejectApplication = (id: string) => {
    updateApplication(id, { status: 'rejected' });
  };

  const getApplicationsByStatus = (status: Application['status']) => {
    return applications.filter(application => application.status === status);
  };

  const getApplicationById = (id: string) => {
    return applications.find(application => application.id === id);
  };

  return (
    <ApplicationsContext.Provider value={{
      applications,
      addApplication,
      updateApplication,
      deleteApplication,
      approveApplication,
      rejectApplication,
      getApplicationsByStatus,
      getApplicationById
    }}>
      {children}
    </ApplicationsContext.Provider>
  );
};

export const useApplications = () => {
  const context = useContext(ApplicationsContext);
  if (context === undefined) {
    throw new Error('useApplications must be used within an ApplicationsProvider');
  }
  return context;
};

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Alert {
  id: string;
  title: string;
  description?: string;
  date: string;
  type: 'meeting' | 'deadline' | 'session' | 'milestone' | 'funding' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

interface AlertsContextType {
  alerts: Alert[];
  addAlert: (alert: Omit<Alert, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => void;
  updateAlert: (id: string, updates: Partial<Alert>) => void;
  deleteAlert: (id: string) => void;
  markAsCompleted: (id: string) => void;
  getUpcomingAlerts: (days?: number) => Alert[];
  getAlertsByType: (type: Alert['type']) => Alert[];
  getAlertsByPriority: (priority: Alert['priority']) => Alert[];
  // Automatic alert generation functions
  createApplicationApprovalAlert: (startupName: string, approvedBy: string) => void;
  createEventAlert: (eventTitle: string, eventDate: string, eventType: string) => void;
  createReminderAlert: (title: string, description: string, dueDate: string, priority: Alert['priority']) => void;
  createMilestoneAlert: (milestoneName: string, dueDate: string) => void;
  createFundingAlert: (fundingStage: string, amount: number, dueDate: string) => void;
}

const initialAlerts: Alert[] = [
  {
    id: '1',
    title: 'Application Approved',
    description: 'Your application for CITBIF Incubation Program has been approved by Admin. Welcome to the program!',
    date: '2025-01-15',
    type: 'milestone',
    priority: 'high',
    status: 'pending',
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-15T10:00:00Z'
  },
  {
    id: '2',
    title: 'New Event: Startup Pitch Competition',
    description: 'A new pitch competition event has been organized for you. Don\'t miss out!',
    date: '2025-01-20',
    type: 'meeting',
    priority: 'medium',
    status: 'pending',
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-15T10:00:00Z'
  },
  {
    id: '3',
    title: 'Reminder: Financial Reports Due',
    description: 'Submit your quarterly financial reports and pitch deck updates by the deadline',
    date: '2025-01-22',
    type: 'deadline',
    priority: 'urgent',
    status: 'pending',
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-15T10:00:00Z'
  },
  {
    id: '4',
    title: 'Milestone Due: MVP Development',
    description: 'You have a milestone deadline approaching. Make sure to complete all requirements.',
    date: '2025-02-01',
    type: 'milestone',
    priority: 'high',
    status: 'pending',
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-15T10:00:00Z'
  },
  {
    id: '5',
    title: 'Funding Opportunity: Seed Stage',
    description: 'A new funding opportunity for Seed stage with $200,000 is available.',
    date: '2025-02-15',
    type: 'funding',
    priority: 'high',
    status: 'pending',
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-15T10:00:00Z'
  }
];

const AlertsContext = createContext<AlertsContextType | undefined>(undefined);

export const AlertsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);

  const addAlert = (alertData: Omit<Alert, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
    const newAlert: Alert = {
      ...alertData,
      id: Date.now().toString(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setAlerts(prev => [...prev, newAlert]);
  };

  const updateAlert = (id: string, updates: Partial<Alert>) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id 
        ? { ...alert, ...updates, updatedAt: new Date().toISOString() }
        : alert
    ));
  };

  const deleteAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const markAsCompleted = (id: string) => {
    updateAlert(id, { status: 'completed' });
  };

  const getUpcomingAlerts = (days: number = 30) => {
    const now = new Date();
    const futureDate = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));
    
    return alerts
      .filter(alert => {
        const alertDate = new Date(alert.date);
        return alert.status === 'pending' && alertDate >= now && alertDate <= futureDate;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const getAlertsByType = (type: Alert['type']) => {
    return alerts.filter(alert => alert.type === type && alert.status === 'pending');
  };

  const getAlertsByPriority = (priority: Alert['priority']) => {
    return alerts.filter(alert => alert.priority === priority && alert.status === 'pending');
  };

  // Automatic alert generation functions
  const createApplicationApprovalAlert = (startupName: string, approvedBy: string) => {
    const alert: Omit<Alert, 'id' | 'createdAt' | 'updatedAt' | 'status'> = {
      title: 'Application Approved',
      description: `Your application for ${startupName} has been approved by ${approvedBy}. Welcome to the program!`,
      date: new Date().toISOString().split('T')[0],
      type: 'milestone',
      priority: 'high'
    };
    addAlert(alert);
  };

  const createEventAlert = (eventTitle: string, eventDate: string, eventType: string) => {
    const alert: Omit<Alert, 'id' | 'createdAt' | 'updatedAt' | 'status'> = {
      title: `New Event: ${eventTitle}`,
      description: `A new ${eventType} event has been organized for you. Don't miss out!`,
      date: eventDate,
      type: 'meeting',
      priority: 'medium'
    };
    addAlert(alert);
  };

  const createReminderAlert = (title: string, description: string, dueDate: string, priority: Alert['priority']) => {
    const alert: Omit<Alert, 'id' | 'createdAt' | 'updatedAt' | 'status'> = {
      title: `Reminder: ${title}`,
      description: description,
      date: dueDate,
      type: 'deadline',
      priority: priority
    };
    addAlert(alert);
  };

  const createMilestoneAlert = (milestoneName: string, dueDate: string) => {
    const alert: Omit<Alert, 'id' | 'createdAt' | 'updatedAt' | 'status'> = {
      title: `Milestone Due: ${milestoneName}`,
      description: `You have a milestone deadline approaching. Make sure to complete all requirements.`,
      date: dueDate,
      type: 'milestone',
      priority: 'high'
    };
    addAlert(alert);
  };

  const createFundingAlert = (fundingStage: string, amount: number, dueDate: string) => {
    const alert: Omit<Alert, 'id' | 'createdAt' | 'updatedAt' | 'status'> = {
      title: `Funding Opportunity: ${fundingStage}`,
      description: `A new funding opportunity for ${fundingStage} stage with $${amount.toLocaleString()} is available.`,
      date: dueDate,
      type: 'funding',
      priority: 'high'
    };
    addAlert(alert);
  };

  return (
    <AlertsContext.Provider value={{
      alerts,
      addAlert,
      updateAlert,
      deleteAlert,
      markAsCompleted,
      getUpcomingAlerts,
      getAlertsByType,
      getAlertsByPriority,
      createApplicationApprovalAlert,
      createEventAlert,
      createReminderAlert,
      createMilestoneAlert,
      createFundingAlert
    }}>
      {children}
    </AlertsContext.Provider>
  );
};

export const useAlerts = () => {
  const context = useContext(AlertsContext);
  if (context === undefined) {
    throw new Error('useAlerts must be used within an AlertsProvider');
  }
  return context;
};

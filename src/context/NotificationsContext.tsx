import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface AdminNotification {
  id: string;
  message: string;
  time: string;
  type: 'new' | 'info' | 'feedback' | 'review' | 'signup' | 'application' | 'milestone';
  userId?: string;
  userName?: string;
  userEmail?: string;
  userRole?: 'individual' | 'enterprise';
  createdAt: string;
  read: boolean;
}

interface NotificationsContextType {
  notifications: AdminNotification[];
  addNotification: (notification: Omit<AdminNotification, 'id' | 'createdAt' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  getUnreadCount: () => number;
  getRecentNotifications: (limit?: number) => AdminNotification[];
  // Specific notification creators
  createSignupNotification: (userName: string, userEmail: string, userRole: 'individual' | 'enterprise') => void;
  createApplicationNotification: (startupName: string, founderName: string, sector: string) => void;
  createMilestoneNotification: (startupName: string, milestone: string) => void;
  createFeedbackNotification: (startupName: string, mentorName: string) => void;
  createReviewNotification: (startupName: string, reviewType: string) => void;
}

const initialNotifications: AdminNotification[] = [
  {
    id: '1',
    message: 'New startup application from TechCorp',
    time: '2 hours ago',
    type: 'application',
    userId: 'user1',
    userName: 'John Smith',
    userEmail: 'john@techcorp.com',
    userRole: 'enterprise',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    read: false
  },
  {
    id: '2',
    message: 'Monthly report generation completed',
    time: '4 hours ago',
    type: 'info',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    read: false
  },
  {
    id: '3',
    message: 'Mentor session feedback submitted',
    time: '6 hours ago',
    type: 'feedback',
    userName: 'Dr. Sarah Johnson',
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    read: true
  },
  {
    id: '4',
    message: 'Investment proposal requires review',
    time: '1 day ago',
    type: 'review',
    userName: 'Mike Chen',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    read: true
  }
];

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const NotificationsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<AdminNotification[]>(initialNotifications);

  const addNotification = (notificationData: Omit<AdminNotification, 'id' | 'createdAt' | 'read'>) => {
    const newNotification: AdminNotification = {
      ...notificationData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const getUnreadCount = () => {
    return notifications.filter(notification => !notification.read).length;
  };

  const getRecentNotifications = (limit: number = 10) => {
    return notifications
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  };

  // Specific notification creators
  const createSignupNotification = (userName: string, userEmail: string, userRole: 'individual' | 'enterprise') => {
    const roleText = userRole === 'enterprise' ? 'startup' : 'individual';
    const message = `New ${roleText} user registered: ${userName}`;
    
    addNotification({
      message,
      time: 'Just now',
      type: 'signup',
      userId: Date.now().toString(),
      userName,
      userEmail,
      userRole
    });
  };

  const createApplicationNotification = (startupName: string, founderName: string, sector: string) => {
    const message = `New application from ${startupName} (${sector}) by ${founderName}`;
    
    addNotification({
      message,
      time: 'Just now',
      type: 'application',
      userId: Date.now().toString(),
      userName: founderName,
      userRole: 'enterprise'
    });
  };

  const createMilestoneNotification = (startupName: string, milestone: string) => {
    const message = `${startupName} completed milestone: ${milestone}`;
    
    addNotification({
      message,
      time: 'Just now',
      type: 'milestone',
      userName: startupName
    });
  };

  const createFeedbackNotification = (startupName: string, mentorName: string) => {
    const message = `Mentor feedback submitted for ${startupName} by ${mentorName}`;
    
    addNotification({
      message,
      time: 'Just now',
      type: 'feedback',
      userName: mentorName
    });
  };

  const createReviewNotification = (startupName: string, reviewType: string) => {
    const message = `${startupName} ${reviewType} requires admin review`;
    
    addNotification({
      message,
      time: 'Just now',
      type: 'review',
      userName: startupName
    });
  };

  return (
    <NotificationsContext.Provider value={{
      notifications,
      addNotification,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      getUnreadCount,
      getRecentNotifications,
      createSignupNotification,
      createApplicationNotification,
      createMilestoneNotification,
      createFeedbackNotification,
      createReviewNotification
    }}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  hover = false 
}) => {
  return (
    <div className={`bg-gray-800 rounded-lg border border-gray-700 shadow-lg ${hover ? 'hover:shadow-xl hover:border-gray-600 transition-all duration-200' : ''} ${className}`}>
      {children}
    </div>
  );
};

export default Card;
import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ 
  current, 
  total, 
  className = '' 
}) => {
  const percentage = (current / total) * 100;

  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gray-300">Progress</span>
        <span className="text-sm text-cyan-400 font-medium">{Math.round(percentage)}%</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div 
          className="bg-gradient-to-r from-cyan-500 to-teal-500 h-2 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex justify-between mt-2">
        <span className="text-xs text-gray-400">Step {current} of {total}</span>
      </div>
    </div>
  );
};

export default ProgressBar;

import React from 'react';

export const LoadingIndicator: React.FC = () => {
  return (
    <div className="flex space-x-1.5 items-center py-1 px-2">
      <div className="w-2 h-2 rounded-full bg-loading-dot1 animate-loading-dot-1"></div>
      <div className="w-2 h-2 rounded-full bg-loading-dot2 animate-loading-dot-2"></div>
      <div className="w-2 h-2 rounded-full bg-loading-dot3 animate-loading-dot-3"></div>
    </div>
  );
};

export default LoadingIndicator;

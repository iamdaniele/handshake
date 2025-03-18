
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface LoadingIndicatorProps {
  className?: string;
}

const searchCaptions = [
  "Sifting through contacts...",
  "Retrieving contact information...",
  "Performing semantic search...",
  "Checking LinkedIn details...",
  "Analyzing communication history...",
  "Cross-referencing information..."
];

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ className }) => {
  const [currentCaptionIndex, setCurrentCaptionIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    // Fade caption in and out logic
    const fadeInterval = setInterval(() => {
      setIsVisible(prev => !prev);
    }, 1500);
    
    // Change caption logic
    const captionInterval = setInterval(() => {
      setCurrentCaptionIndex(prev => (prev + 1) % searchCaptions.length);
    }, 3000);
    
    return () => {
      clearInterval(fadeInterval);
      clearInterval(captionInterval);
    };
  }, []);
  
  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      {/* Rolodex/contact search animation */}
      <div className="relative w-20 h-16 mx-auto mb-1">
        <div className="absolute w-16 h-10 bg-blue-50 border border-blue-100 rounded-md left-2 top-0 animate-[searchCard1_3s_ease-in-out_infinite]"></div>
        <div className="absolute w-16 h-10 bg-indigo-50 border border-indigo-100 rounded-md left-1 top-1 animate-[searchCard2_3s_ease-in-out_infinite_500ms]"></div>
        <div className="absolute w-16 h-10 bg-purple-50 border border-purple-100 rounded-md left-0 top-2 animate-[searchCard3_3s_ease-in-out_infinite_1000ms]"></div>
        
        {/* Search icon */}
        <div className="absolute -right-2 top-3 w-6 h-6 border-2 border-primary rounded-full animate-pulse">
          <div className="absolute bottom-0 right-0 w-3 h-3 border-2 border-primary rotate-45 translate-y-1/2"></div>
        </div>
      </div>
      
      {/* Caption text with fade animation */}
      <div 
        className={cn(
          "text-sm text-gray-600 min-h-6 transition-opacity duration-500 text-center",
          isVisible ? "opacity-100" : "opacity-0"
        )}
      >
        {searchCaptions[currentCaptionIndex]}
      </div>
      
      {/* Classic loading dots for additional visual feedback */}
      <div className="flex space-x-1.5 items-center py-1">
        <div className="w-1.5 h-1.5 rounded-full bg-loading-dot1 animate-loading-dot-1"></div>
        <div className="w-1.5 h-1.5 rounded-full bg-loading-dot2 animate-loading-dot-2"></div>
        <div className="w-1.5 h-1.5 rounded-full bg-loading-dot3 animate-loading-dot-3"></div>
      </div>
    </div>
  );
};

export default LoadingIndicator;

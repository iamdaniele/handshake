
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SuggestionPillProps {
  label: string;
  message: string;
  onClick: (message: string) => void;
  icon?: React.ReactNode;
}

const SuggestionPill: React.FC<SuggestionPillProps> = ({
  label,
  message,
  onClick,
  icon
}) => {
  return (
    <Badge 
      variant="outline"
      className={cn(
        "px-3 py-1.5 text-xs cursor-pointer flex items-center gap-1.5",
        "bg-white hover:bg-slate-50 text-slate-700 border-slate-200",
        "transition-all duration-200 whitespace-nowrap"
      )}
      onClick={() => onClick(message)}
    >
      {icon}
      {label}
    </Badge>
  );
};

export default SuggestionPill;

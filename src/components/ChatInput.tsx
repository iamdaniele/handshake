
import React, { useState, FormEvent, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Send, Users, Star, Briefcase, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import SuggestionPill from './SuggestionPill';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isProcessing: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isProcessing }) => {
  const [message, setMessage] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Suggestion pills data
  const suggestions = [
    {
      label: "Contacts in social media",
      message: "find contacts who work at social media companies",
      icon: <Users size={14} />
    },
    {
      label: "Recent founders",
      message: "find founders who connected in the past month",
      icon: <Star size={14} />
    },
    {
      label: "Investors",
      message: "find contacts who are angel investors or work at an investment or VC firm",
      icon: <Briefcase size={14} />
    },
    {
      label: "Contacts worth knowing",
      message: "find people worth knowing based on what you know about them",
      icon: <Search size={14} />
    }
  ];

  useEffect(() => {
    // Focus the input on component mount
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    const trimmedMessage = message.trim();
    if (trimmedMessage && !isProcessing) {
      onSendMessage(trimmedMessage);
      setMessage('');
      setShowSuggestions(false); // Hide suggestions after manual message submission
    }
  };

  const handleSuggestionClick = (suggestionMessage: string) => {
    if (!isProcessing) {
      onSendMessage(suggestionMessage);
      setShowSuggestions(false); // Hide suggestions after clicking a pill
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter without Shift
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Auto resize textarea
  const handleInput = () => {
    const textarea = inputRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Suggestion pills - only show if showSuggestions is true */}
      {showSuggestions && (
        <div className="flex flex-wrap gap-2 px-1">
          {suggestions.map((suggestion, index) => (
            <SuggestionPill
              key={index}
              label={suggestion.label}
              message={suggestion.message}
              icon={suggestion.icon}
              onClick={handleSuggestionClick}
            />
          ))}
        </div>
      )}

      {/* Chat input form */}
      <form 
        onSubmit={handleSubmit} 
        className="flex items-end gap-2 bg-white p-4 rounded-2xl shadow-input"
      >
        <textarea
          ref={inputRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder="Type your message..."
          disabled={isProcessing}
          className="w-full resize-none max-h-[120px] outline-none border-0 p-2 bg-transparent text-[15px]"
          rows={1}
        />
        <Button 
          type="submit" 
          size="icon" 
          disabled={!message.trim() || isProcessing}
          className={cn(
            "rounded-full h-9 w-9 transition-all duration-200",
            message.trim() && !isProcessing 
              ? "bg-primary hover:bg-primary/90" 
              : "bg-muted text-muted-foreground"
          )}
        >
          <Send size={18} />
        </Button>
      </form>
    </div>
  );
};

export default ChatInput;

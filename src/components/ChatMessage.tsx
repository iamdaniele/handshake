
import React from 'react';
import { cn } from '@/lib/utils';
import { Message } from '@/types/chat';
import LoadingIndicator from './LoadingIndicator';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.sender === 'user';
  
  return (
    <div 
      className={cn(
        "flex w-full mb-4 animate-fade-in",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div 
        className={cn(
          "max-w-[80%] md:max-w-[70%] px-4 py-3 rounded-2xl shadow-message",
          isUser ? "bg-chat-user" : "bg-chat-bot border border-chat-border"
        )}
      >
        {message.isLoading ? (
          <LoadingIndicator className="py-2" />
        ) : (
          <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{message.content}</p>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;

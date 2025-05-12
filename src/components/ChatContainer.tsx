
import React, { useRef, useEffect } from 'react';
import { Message } from '@/types/chat';
import ChatMessage from './ChatMessage';
import LoadingIndicator from './LoadingIndicator';

interface ChatContainerProps {
  messages: Message[];
  isSearching: boolean;
}

const ChatContainer: React.FC<ChatContainerProps> = ({ messages, isSearching }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Chat messages */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto mb-4"
      >
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center p-6">
            <p className="text-gray-400 text-center">
              Who do you want to meet?
            </p>
          </div>
        ) : (
          <div className="py-4">
            {messages.map(message => (
              <ChatMessage 
                key={message.id} 
                message={message}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      {/* Global loading indicator */}
      {isSearching && (
        <div className="flex justify-center items-center my-4 animate-fade-in">
          <LoadingIndicator />
        </div>
      )}
    </>
  );
};

export default ChatContainer;

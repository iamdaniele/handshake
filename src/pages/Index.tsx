
import React from 'react';
import useChat from '@/hooks/useChat';
import ChatHeader from '@/components/ChatHeader';
import ChatContainer from '@/components/ChatContainer';
import ChatInput from '@/components/ChatInput';

const Index = () => {
  const { messages, isProcessing, isSearching, handleSendMessage } = useChat();

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="mx-auto w-full max-w-3xl flex flex-col flex-1">
        <ChatHeader />
        
        <div className="flex-1 flex flex-col justify-between glass-panel rounded-2xl p-4 md:p-6 shadow-sm overflow-hidden">
          <ChatContainer 
            messages={messages}
            isSearching={isSearching}
          />
          
          <ChatInput 
            onSendMessage={handleSendMessage} 
            isProcessing={isProcessing}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;

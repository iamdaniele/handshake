import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { Message } from '@/types/chat';
import { submitMessage, continueConversation } from '@/utils/api';
import ChatMessage from '@/components/ChatMessage';
import ChatInput from '@/components/ChatInput';
import LoadingIndicator from '@/components/LoadingIndicator';

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [currentRunId, setCurrentRunId] = useState<string | null>(null);
  const [chatId, setChatId] = useState<string>(`chat_${Date.now()}`);
  const { toast } = useToast();
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

  // Helper to update the bot's message content with streaming chunks
  const updateBotMessageContent = (messageId: string, content: string, append: boolean = true) => {
    // When we start receiving content, we're no longer in the searching state
    if (content && isSearching) {
      setIsSearching(false);
    }
    
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId
          ? { 
              ...msg, 
              content: append ? msg.content + content : content
            }
          : msg
      )
    );
  };

  // Helper to handle errors in the streaming process
  const handleStreamError = (error: Error) => {
    toast({
      title: 'Error',
      description: error.message || 'Something went wrong with the message streaming',
      variant: 'destructive',
    });
    
    // Remove any loading messages
    setMessages(prev => prev.filter(msg => !msg.isLoading));
    setIsProcessing(false);
  };

  const handleSendMessage = async (content: string) => {
    if (isProcessing) return;

    try {
      setIsProcessing(true);
      setIsSearching(true); // Set searching state when starting to process a message
      
      // Create user message
      const userMessage: Message = {
        id: `user_${Date.now()}`,
        content,
        sender: 'user',
        timestamp: new Date(),
      };

      // Add user message to state
      setMessages(prev => [...prev, userMessage]);
      
      // Create placeholder for bot response
      const botMessageId = `bot_${Date.now()}`;
      const placeholderMessage: Message = {
        id: botMessageId,
        content: '',
        sender: 'bot',
        timestamp: new Date(),
        isLoading: false, // We'll stream content instead of showing loading indicator
      };
      
      // Add placeholder message for bot's response
      setMessages(prev => [...prev, placeholderMessage]);
      
      // Handle streaming chunks and update the message
      const handleChunk = (chunk: string) => {
        if (chunk && isSearching) {
          setIsSearching(false); // Turn off searching as soon as we get the first chunk
        }
        updateBotMessageContent(botMessageId, chunk);
      };

      const handleComplete = () => {
        // Update the message to mark it as complete
        setMessages(prev => 
          prev.map(msg => 
            msg.id === botMessageId
              ? { ...msg, isLoading: false }
              : msg
          )
        );
        setIsProcessing(false);
        setIsSearching(false); // Ensure searching is turned off on completion
      };
      
      // Check if we're continuing a conversation or starting a new one
      if (currentRunId) {
        console.log('Continuing conversation with run ID:', currentRunId);
        // Continue conversation with the existing run ID and stream the response
        await continueConversation(
          currentRunId,
          content,
          handleChunk,
          handleComplete,
          handleStreamError
        );
      } else {
        console.log('Starting new conversation');
        // Start a new conversation and stream the response
        const runId = await submitMessage(
          { message: content, chatId },
          handleChunk,
          handleComplete,
          handleStreamError
        );
        
        // Save the run ID for future messages
        setCurrentRunId(runId);
        console.log('Set current run ID to:', runId);
      }
      
    } catch (error) {
      console.error('Error in send message flow:', error);
      // Show error toast
      toast({
        title: 'Error',
        description: 'Failed to process your message. Please try again.',
        variant: 'destructive',
      });
      
      // Clean up on error
      setMessages(prev => prev.filter(msg => !msg.isLoading));
      setIsProcessing(false);
      setIsSearching(false); // Ensure searching is turned off on error
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="mx-auto w-full max-w-3xl flex flex-col flex-1">
        <header className="text-center mb-8 bg-white/70 p-5 rounded-xl shadow-sm backdrop-blur-sm">
          <h1 className="text-3xl font-semibold text-gray-900 mb-3">Handshake 🤝</h1>
          <p className="text-gray-600 mb-4">Search my Linkedin contacts and I'll make an intro for you!</p>
          <div className="flex flex-col md:flex-row items-center justify-center space-y-2 md:space-y-0 md:space-x-3">
            <p className="text-gray-700">Built with <a href="https://toolhouse.ai" target="_blank" rel="noopener noreferrer" className="font-bold text-blue-600 hover:underline transition-all">Toolhouse</a></p>
            <a 
              href="https://app.toolhouse.ai/chat/69ba3e7e-d170-4a93-82d6-dc8cb0f86c7b" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline transition-all"
            >
              Clone this agent for FREE
            </a>
          </div>
        </header>
        
        <div className="flex-1 flex flex-col justify-between glass-panel rounded-2xl p-4 md:p-6 shadow-sm overflow-hidden">
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
          
          {/* Chat input */}
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

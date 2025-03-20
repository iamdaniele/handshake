
import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { Message } from '@/types/chat';
import { submitMessage, pollForResult, continueConversation } from '@/utils/api';
import ChatMessage from '@/components/ChatMessage';
import ChatInput from '@/components/ChatInput';

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
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

  const handleSendMessage = async (content: string) => {
    if (isProcessing) return;

    try {
      setIsProcessing(true);
      
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
      const placeholderMessage: Message = {
        id: `bot_${Date.now()}`,
        content: '',
        sender: 'bot',
        timestamp: new Date(),
        isLoading: true,
      };
      
      // Add placeholder message for bot's response
      setMessages(prev => [...prev, placeholderMessage]);
      
      let response;
      
      // Check if we're continuing a conversation or starting a new one
      if (currentRunId) {
        console.log('Continuing conversation with run ID:', currentRunId);
        // Continue conversation with the existing run ID
        response = await continueConversation(currentRunId, content);
      } else {
        console.log('Starting new conversation');
        // Start a new conversation
        response = await submitMessage({ message: content, chatId });
        
        // Save the chat ID if one is returned
        if (response.chatId) {
          setChatId(response.chatId);
        }
      }
      
      // Set the current run ID
      setCurrentRunId(response.id);
      console.log('Set current run ID to:', response.id);
      
      // Start polling for results
      await pollUntilComplete(response.id, placeholderMessage.id);
      
    } catch (error) {
      console.error('Error in send message flow:', error);
      // Show error toast
      toast({
        title: 'Error',
        description: 'Failed to process your message. Please try again.',
        variant: 'destructive',
      });
      
      // Remove loading message
      setMessages(prev => prev.filter(msg => !msg.isLoading));
      
    } finally {
      setIsProcessing(false);
    }
  };

  const pollUntilComplete = async (runId: string, messageId: string) => {
    let isComplete = false;
    let attempts = 0;
    const maxAttempts = 60; // 60 attempts with 1 second interval = 1 minute max polling time
    
    console.log('Starting polling for run ID:', runId, 'and message ID:', messageId);
    
    while (!isComplete && attempts < maxAttempts) {
      attempts++;
      console.log(`Polling attempt ${attempts} for run ID: ${runId}`);
      
      try {
        const result = await pollForResult(runId);
        console.log('Poll result:', result);
        
        if (result.status === 'completed' && result.answer) {
          console.log('Poll complete, updating message with answer');
          // Update bot message with the result
          setMessages(prev => 
            prev.map(msg => 
              msg.id === messageId 
                ? { ...msg, content: result.answer!, isLoading: false } 
                : msg
            )
          );
          isComplete = true;
        } else if (result.status === 'failed') {
          console.log('Poll error:', result.error);
          // Handle error
          toast({
            title: 'Error',
            description: result.error || 'An error occurred while retrieving the response.',
            variant: 'destructive',
          });
          
          // Remove loading message
          setMessages(prev => prev.filter(msg => msg.id !== messageId));
          isComplete = true;
        } else {
          console.log('Still pending, waiting before next poll');
          // If still pending, wait before polling again
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error('Error during polling:', error);
        // Handle unexpected errors during polling
        toast({
          title: 'Error',
          description: 'An unexpected error occurred while retrieving the response.',
          variant: 'destructive',
        });
        
        // Remove loading message
        setMessages(prev => prev.filter(msg => msg.id !== messageId));
        isComplete = true;
      }
    }
    
    if (!isComplete) {
      console.log('Polling timed out after max attempts');
      // Handle case where polling exceeded max attempts
      toast({
        title: 'Timeout',
        description: 'Request is taking longer than expected. Please try again.',
        variant: 'destructive',
      });
      
      // Remove loading message
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
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

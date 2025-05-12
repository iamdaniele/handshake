
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Message } from '@/types/chat';
import { submitMessage, continueConversation } from '@/utils/api';

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [currentRunId, setCurrentRunId] = useState<string | null>(null);
  const [chatId, setChatId] = useState<string>(`chat_${Date.now()}`);
  const { toast } = useToast();

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
    setIsSearching(false);
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

  return {
    messages,
    isProcessing,
    isSearching,
    handleSendMessage,
  };
};

export default useChat;

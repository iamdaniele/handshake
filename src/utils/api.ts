
import { ApiRequest, ApiResponse, PollingResult } from '@/types/chat';

// Helper function to create headers
const getHeaders = () => {
  return {
    'Authorization': `Bearer ${import.meta.env.VITE_API_KEY}`,
    'Content-Type': 'application/json'
  };
};

// Function to submit initial message to API with streaming
export const submitMessage = async (
  request: ApiRequest, 
  onChunk: (chunk: string) => void,
  onComplete: () => void,
  onError: (error: Error) => void
): Promise<string> => {
  try {
    console.log('Sending message to Toolhouse AI:', request.message);
    
    // Create a unique chat ID if not provided
    const chatId = request.chatId || `chat_${Date.now()}`;
    
    // Prepare request body
    const requestBody = {
      chat_id: import.meta.env.VITE_CHAT_ID,
      bundle: import.meta.env.VITE_BUNDLE_NAME,
      vars: {
        question: request.message,
        url: import.meta.env.VITE_CONTACTS_URL,
        contact_owner_name: 'Daniele',
        contact_owner_email: 'daniele@toolhouse.ai',
        current_date: new Date().toISOString().substring(0, 10)
      }
    };
    
    // Make API call
    const response = await fetch(`https://agents.toolhouse.ai/69ba3e7e-d170-4a93-82d6-dc8cb0f86c7b`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    // Handle the stream
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Response body is not readable');
    }

    const decoder = new TextDecoder();
    let runId = '';
    let firstChunkReceived = false;

    // Process the stream
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        onComplete();
        break;
      }
      
      const chunk = decoder.decode(value, { stream: true });
      
      // Mark the first chunk as received
      if (!firstChunkReceived && chunk.trim()) {
        firstChunkReceived = true;
        console.log('First chunk received, should stop showing loading indicator');
      }
      
      onChunk(chunk);
      
      // Try to extract runId from the first few chunks if possible
      if (!runId) {
        try {
          // Look for any JSON structure that might contain an ID
          const matches = chunk.match(/"id":"([^"]+)"/);
          if (matches && matches[1]) {
            runId = matches[1];
            console.log('Extracted runId:', runId);
          }
        } catch (e) {
          console.log('Could not extract runId yet');
        }
      }
    }
    
    return runId || chatId;
  } catch (error) {
    console.error('Error submitting message:', error);
    onError(error instanceof Error ? error : new Error('Unknown error'));
    throw error;
  }
};

// Function to continue a conversation by sending a follow-up message with streaming
export const continueConversation = async (
  runId: string,
  message: string,
  onChunk: (chunk: string) => void,
  onComplete: () => void,
  onError: (error: Error) => void
): Promise<void> => {
  try {
    console.log('Continuing conversation with message:', message);
    
    // Make API call to update the run with a new message
    const response = await fetch(`https://agents.toolhouse.ai/69ba3e7e-d170-4a93-82d6-dc8cb0f86c7b`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({
        message: message
      })
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    // Handle the stream
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Response body is not readable');
    }

    const decoder = new TextDecoder();
    let firstChunkReceived = false;

    // Process the stream
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        onComplete();
        break;
      }
      
      const chunk = decoder.decode(value, { stream: true });
      
      // Mark the first chunk as received
      if (!firstChunkReceived && chunk.trim()) {
        firstChunkReceived = true;
        console.log('First chunk received, should stop showing loading indicator');
      }
      
      onChunk(chunk);
    }
  } catch (error) {
    console.error('Error continuing conversation:', error);
    onError(error instanceof Error ? error : new Error('Unknown error'));
    throw error;
  }
};

// This function is kept for backward compatibility if needed
export const pollForResult = async (runId: string): Promise<PollingResult> => {
  console.warn('pollForResult is deprecated - using streaming responses now');
  return {
    id: runId,
    status: 'completed',
    answer: 'Using streaming responses now'
  };
};

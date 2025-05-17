
import { ApiRequest, ApiResponse, PollingResult } from '@/types/chat';

// Helper function to create headers
const getHeaders = () => {
  return {
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
    
    // Prepare request body
    const requestBody = {
      env: import.meta.env.VITE_TOOLHOUSE_ENV ?? 'production',
      vars: {
        question: request.message,
        contact_owner_name: import.meta.env.VITE_CONTACT_OWNER_NAME,
        contact_owner_email: import.meta.env.VITE_CONTACT_OWNER_EMAIL,
      }
    };
    
    // Make API call
    const response = await fetch(import.meta.env.VITE_TOOLHOUSE_AGENT_URL, {
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
    
    const runId = response.headers.get('x-toolhouse-run-id');
    return runId;
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
    const response = await fetch(`${import.meta.env.VITE_TOOLHOUSE_AGENT_URL}/${runId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({
        env: import.meta.env.VITE_TOOLHOUSE_ENV ?? 'production',
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

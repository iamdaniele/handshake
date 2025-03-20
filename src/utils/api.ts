
import { ApiRequest, ApiResponse, PollingResult } from '@/types/chat';

// Helper function to create headers
const getHeaders = () => {
  return {
    'Authorization': `Bearer ${import.meta.env.VITE_API_KEY}`,
    'Content-Type': 'application/json'
  };
};

// Function to submit message to API
export const submitMessage = async (request: ApiRequest): Promise<ApiResponse> => {
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
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/agent-runs`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const { data } = await response.json();
    console.log('Received response:', data);
    
    // Return with the run_id from the response
    return {
      id: data.id,
      answer: '', // Initially empty because we need to poll
      status: 'pending',
      chatId: chatId
    };
  } catch (error) {
    console.error('Error submitting message:', error);
    throw new Error('Failed to submit message to Toolhouse AI');
  }
};

// Function to poll for results
export const pollForResult = async (runId: string): Promise<PollingResult> => {
  try {
    console.log('Polling for result:', runId);
    
    // Make API call to get the current status
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/agent-runs/${runId}`, {
      method: 'GET',
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const { data } = await response.json();
    console.log('Poll response:', data);
    
    // Check if the run is complete
    if (data.status === 'completed') {
      // Safely handle the case where results might be empty or in a different format
      const results = data.results || [];
      const lastResult = results.length > 0 ? results[results.length - 1] : null;
      const content = lastResult && lastResult.content && lastResult.content.length > 0 
        ? lastResult.content[0].text 
        : 'No response content available';
        
      return {
        id: runId,
        status: 'complete',
        answer: content
      };
    } else if (data.status === 'failed') {
      // Safely handle failed state
      const results = data.results || [];
      const lastResult = results.length > 0 ? results[results.length - 1] : null;
      const errorContent = lastResult ? JSON.stringify(lastResult) : 'No error details available';
      
      return {
        id: runId,
        status: 'error',
        error: errorContent
      };
    } else {
      // Still running
      return {
        id: runId,
        status: 'pending'
      };
    }
  } catch (error) {
    console.error('Error polling for result:', error);
    return {
      id: runId,
      status: 'error',
      error: 'Failed to retrieve result from Toolhouse AI'
    };
  }
};

// Function to continue a conversation by sending a follow-up message
export const continueConversation = async (runId: string, message: string): Promise<ApiResponse> => {
  try {
    console.log('Continuing conversation for run:', runId);
    
    // Make API call to update the run with a new message
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/agent-runs/${runId}/continue`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        bundle: import.meta.env.VITE_BUNDLE_NAME,
        message: message
      })
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Continue conversation response:', data);
    
    // Return with the same run_id to maintain conversation context
    return {
      id: runId,
      answer: '', // Initially empty because we need to poll
      status: 'pending'
    };
  } catch (error) {
    console.error('Error continuing conversation:', error);
    throw new Error('Failed to continue conversation with Toolhouse AI');
  }
};


import { ApiRequest, ApiResponse, PollingResult } from '@/types/chat';

// Toolhouse AI API constants
const API_BASE_URL = 'https://api.toolhouse.ai/v1';
const API_KEY = '7685ad3f9b8a3a476cf93f08752df9ca';
const CHAT_ID = '69ba3e7e-d170-4a93-82d6-dc8cb0f86c7b';
const CONTACTS_URL = 'https://img.toolhouse.ai/Connections.csv';
const BUNDLE_NAME = 'linkedin agent';

// Helper function to create headers
const getHeaders = () => {
  return {
    'Authorization': `Bearer ${API_KEY}`,
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
      chat_id: CHAT_ID,
      bundle: BUNDLE_NAME,
      vars: {
        question: request.message,
        url: CONTACTS_URL,
        contact_owner_name: 'Daniele',
        contact_owner_email: 'daniele@toolhouse.ai'
      }
    };
    
    // Make API call
    const response = await fetch(`${API_BASE_URL}/agent-runs`, {
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
    const response = await fetch(`${API_BASE_URL}/agent-runs/${runId}`, {
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
      const answer = data.results.pop().content[0].text;
      return {
        id: runId,
        status: 'complete',
        answer: answer || 'No response content available'
      };
    } else if (data.status === 'failed') {
      return {
        id: runId,
        status: 'error',
        error: JSON.stringify(data.results.pop()) || 'No response content available'
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
    const response = await fetch(`${API_BASE_URL}/agent-runs/${runId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({
        bundle: BUNDLE_NAME,
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

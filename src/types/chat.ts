
export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  isLoading?: boolean;
}

export interface ApiRequest {
  message: string;
  userId?: string;
}

export interface ApiResponse {
  id: string;
  answer: string;
  status: 'complete' | 'pending' | 'error';
}

export interface PollingResult {
  id: string;
  status: 'complete' | 'pending' | 'error';
  answer?: string;
  error?: string;
}

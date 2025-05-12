
import React from 'react';

const ChatHeader: React.FC = () => {
  return (
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
  );
};

export default ChatHeader;

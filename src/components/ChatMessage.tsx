
import React from 'react';
import { cn } from '@/lib/utils';
import { Message } from '@/types/chat';
import LoadingIndicator from './LoadingIndicator';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.sender === 'user';
  
  return (
    <div 
      className={cn(
        "flex w-full mb-4 animate-fade-in",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div 
        className={cn(
          "max-w-[80%] md:max-w-[70%] px-4 py-3 rounded-2xl shadow-message",
          isUser ? "bg-chat-user" : "bg-chat-bot border border-chat-border"
        )}
      >
        {message.isLoading ? (
          <LoadingIndicator className="py-2" />
        ) : (
          <div className="text-[15px] leading-relaxed markdown-content">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                a: ({ node, ...props }) => <a className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
                ul: ({ node, ...props }) => <ul className="list-disc ml-5 mb-2" {...props} />,
                ol: ({ node, ...props }) => <ol className="list-decimal ml-5 mb-2" {...props} />,
                h1: ({ node, ...props }) => <h1 className="text-xl font-bold mb-2 mt-3" {...props} />,
                h2: ({ node, ...props }) => <h2 className="text-lg font-bold mb-2 mt-3" {...props} />,
                h3: ({ node, ...props }) => <h3 className="text-md font-bold mb-2 mt-3" {...props} />,
                h4: ({ node, ...props }) => <h4 className="font-bold mb-2 mt-3" {...props} />,
                code: ({ node, inline, ...props }) => 
                  inline ? 
                    <code className="bg-gray-100 px-1 py-0.5 rounded text-sm" {...props} /> : 
                    <code className="block bg-gray-100 p-2 rounded text-sm overflow-x-auto mb-2" {...props} />,
                pre: ({ node, ...props }) => <pre className="bg-gray-100 p-2 rounded overflow-x-auto mb-2" {...props} />,
                blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-gray-300 pl-4 italic my-2" {...props} />,
                hr: ({ node, ...props }) => <hr className="my-4 border-gray-300" {...props} />,
                table: ({ node, ...props }) => <table className="border-collapse table-auto w-full my-2" {...props} />,
                th: ({ node, ...props }) => <th className="border border-gray-300 px-4 py-2 text-left" {...props} />,
                td: ({ node, ...props }) => <td className="border border-gray-300 px-4 py-2" {...props} />,
                strong: ({ node, ...props }) => <strong className="font-bold" {...props} />,
                em: ({ node, ...props }) => <em className="italic" {...props} />,
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;

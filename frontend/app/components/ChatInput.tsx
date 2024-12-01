import React, { useState, KeyboardEvent, useRef, useEffect } from 'react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export const ChatInput = ({ onSend, disabled }: ChatInputProps) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      <div className="flex items-end space-x-2 max-w-4xl mx-auto">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message... (Press Enter to send, Shift+Enter for new line). Or type 'help' for assistance."
          disabled={disabled}
          className="flex-1 resize-none rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px] max-h-[200px] overflow-y-auto"
          rows={1}
        />
        <button
          onClick={handleSend}
          disabled={disabled || !message.trim()}
          className={`px-4 py-2 m-auto rounded-lg font-medium transition-colors ${
            disabled || !message.trim()
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          Send
        </button>
      </div>
    </div>
  );
};
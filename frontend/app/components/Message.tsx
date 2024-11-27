import React from 'react';

interface MessageProps {
  content: string;
  isUser: boolean;
  image?: string;
}

export const Message = ({ content, isUser, image }: MessageProps) => {
  // Split content by newlines to handle multiline messages
  const lines = content.split('\n');

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[80%] rounded-lg p-4 ${
          isUser
            ? 'bg-blue-500 text-white rounded-br-none'
            : 'bg-gray-100 text-gray-800 rounded-bl-none'
        }`}
      >
        {image && (
          <div className="mb-3">
            {/* Use regular img tag for blob URLs */}
            <img
              src={image}
              alt="Uploaded galaxy"
              className="rounded-lg max-w-full h-auto"
              style={{ maxHeight: '300px', objectFit: 'contain' }}
            />
          </div>
        )}
        <div className="text-sm whitespace-pre-wrap">
          {lines.map((line, i) => (
            <React.Fragment key={i}>
              {line}
              {i < lines.length - 1 && <br />}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};
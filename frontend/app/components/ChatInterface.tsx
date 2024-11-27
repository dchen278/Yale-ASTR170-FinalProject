"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Message } from './Message';
import { ChatInput } from './ChatInput';
import { ImageUpload } from './ImageUpload';

interface ChatMessage {
  content: string;
  isUser: boolean;
  image?: string;
}

export const ChatInterface = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      content: 'Welcome to Galaxy Classifer, a final project for ASTR 170 by David Chen, Jonathan Fan, and Byrant Li. This tool uses a convolutional neural network to identify elliptical, non-barred spiral, barred spiral, and lenticular galaxies.',
      isUser: false,
    },
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleImageUpload = async (file: File) => {
    setIsProcessing(true);
    const imageUrl = URL.createObjectURL(file);
    
    setMessages((prev) => [
      ...prev,
      {
        content: 'Here\'s my galaxy image for classification:',
        isUser: true,
        image: imageUrl,
      },
    ]);

    try {
      // Convert file to base64
      const base64String = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          resolve(base64);
        };
        reader.readAsDataURL(file);
      });

      // Send to backend
      const response = await fetch('/api/classify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64String,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to classify image');
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const confidencePercent = (data.confidence * 100).toFixed(2);
      
      setMessages((prev) => [
        ...prev,
        {
          content: `This appears to be a ${data.classification} galaxy (${confidencePercent}% confidence). ${data.explanation}`,
          isUser: false,
        },
      ]);
    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => [
        ...prev,
        {
          content: `Sorry, there was an error processing your image: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
          isUser: false,
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendMessage = async (content: string) => {
    setMessages((prev) => [...prev, { content, isUser: true }]);

    const lowerContent = content.toLowerCase();
    let response = 'To classify a galaxy, please upload an image using the upload button above.';

    if (lowerContent.includes('help') || lowerContent.includes('how')) {
      response = 'To get started, simply upload a galaxy image using the upload area above. I\'ll analyze it and tell you what type of galaxy it is. I can identify elliptical, spiral, barred spiral, and lenticular galaxies.';
    } else if (lowerContent.includes('type') || lowerContent.includes('kind')) {
      response = 'I can identify these types of galaxies:\n- Elliptical: Smooth, featureless systems of stars\n- Spiral: Galaxies with spiral arms\n- Barred Spiral: Spiral galaxies with a bar through their center\n- Lenticular: Disk galaxies without spiral arms';
    }

    setMessages((prev) => [
      ...prev,
      {
        content: response,
        isUser: false,
      },
    ]);
  };

  return (
    <div className="flex flex-col h-screen pt-16">
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <ImageUpload onImageUpload={handleImageUpload} disabled={isProcessing} />
          <div className="space-y-4">
            {messages.map((message, index) => (
              <Message key={index} {...message} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>
      <ChatInput onSend={handleSendMessage} disabled={isProcessing} />
    </div>
  );
};
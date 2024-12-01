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
      content: 'Welcome to Galaxy Classifier, a final project for ASTR 170 by David Chen, Jonathan Fan, and Bryant Li. This tool uses a convolutional neural network to identify various types of galaxies. The classification categories are as follows:\n\n' +
               '├── Class 0: Disk, Face-on, No Spiral\n' +
               '├── Class 1: Smooth, Completely round\n' +
               '├── Class 2: Smooth, In-between round\n' +
               '├── Class 3: Smooth, Cigar shaped\n' +
               '├── Class 4: Disk, Edge-on, Rounded Bulge\n' +
               '├── Class 5: Disk, Edge-on, Boxy Bulge\n' +
               '├── Class 6: Disk, Edge-on, No Bulge\n' +
               '├── Class 7: Disk, Face-on, Tight Spiral\n' +
               '├── Class 8: Disk, Face-on, Medium Spiral\n' +
               '└── Class 9: Disk, Face-on, Loose Spiral',
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
      const formData = new FormData();
      formData.append('image', file);

      // Send to backend
      const response = await fetch('/api/classify', {
        method: 'POST',
        body: formData, 
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
          content: `This appears to be a ${data.classification} galaxy (${confidencePercent}% confidence).\n\n${data.explanation}`,
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
      response = 'To get started, simply upload a galaxy image using the upload area above. I\'ll analyze it and classify the galaxy into one of the following categories: Disk (Face-on or Edge-on), Smooth (Round, In-between, or Cigar-shaped), and Spiral (Tight, Medium, or Loose). Each category reflects distinct galaxy structures and origins.';
    } else if (lowerContent.includes('type') || lowerContent.includes('kind')) {
      response = 'I can classify galaxies into these types:\n' +
                 '- Disk, Face-on, No Spiral: Disk galaxies viewed face-on without spiral structures.\n' +
                 '- Smooth, Completely Round: Uniform elliptical galaxies formed through mergers.\n' +
                 '- Smooth, In-between Round: Transitional shapes between round and elliptical.\n' +
                 '- Smooth, Cigar-shaped: Elongated elliptical galaxies shaped by rotation or tidal forces.\n' +
                 '- Disk, Edge-on, Rounded Bulge: Disk galaxies viewed edge-on with a central bulge.\n' +
                 '- Disk, Edge-on, Boxy Bulge: Edge-on galaxies with rectangular central bulges.\n' +
                 '- Disk, Edge-on, No Bulge: Younger or less evolved disk galaxies.\n' +
                 '- Disk, Face-on, Tight Spiral: Face-on galaxies with tightly wound spiral arms.\n' +
                 '- Disk, Face-on, Medium Spiral: Galaxies with moderately wound spiral arms.\n' +
                 '- Disk, Face-on, Loose Spiral: Galaxies with loosely wound spiral arms and lower star formation rates.';
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
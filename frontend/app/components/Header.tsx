import React from 'react';

export const Header = () => {
  return (
    <header className="fixed top-0 w-full bg-white border-b border-gray-200 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <h1 className="text-xl font-semibold text-gray-800">Galaxy Classifier</h1>
        </div>
        <nav className="flex items-center space-x-4">
          <a href="/" className="text-gray-600 hover:text-gray-900">Home</a>
          <a href="/about" className="text-gray-600 hover:text-gray-900">About</a>
        </nav>
      </div>
    </header>
  );
};
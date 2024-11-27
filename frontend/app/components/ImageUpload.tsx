import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface ImageUploadProps {
  onImageUpload: (file: File) => void;
  disabled?: boolean;
}

export const ImageUpload = ({ onImageUpload, disabled }: ImageUploadProps) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0 && !disabled) {
      onImageUpload(acceptedFiles[0]);
    }
  }, [onImageUpload, disabled]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxFiles: 1,
    disabled
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
        disabled
          ? 'cursor-not-allowed bg-gray-100 border-gray-300'
          : isDragActive
          ? 'cursor-pointer border-blue-500 bg-blue-50'
          : 'cursor-pointer border-gray-300 hover:border-gray-400'
      }`}
    >
      <input {...getInputProps()} />
      <div className="space-y-2">
        <div className="text-4xl">{disabled ? '⏳' : '🖼️'}</div>
        {disabled ? (
          <p className="text-gray-500">Processing image...</p>
        ) : isDragActive ? (
          <p className="text-blue-500">Drop the galaxy image here...</p>
        ) : (
          <>
            <p className="text-gray-600">Drag and drop a galaxy image here, or click to select</p>
            <p className="text-sm text-gray-500">Supports: JPG, JPEG, PNG</p>
          </>
        )}
      </div>
    </div>
  );
};
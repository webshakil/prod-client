import React from 'react';

export default function Loading({ text = 'Loading...' }) {
  return (
    <div className="flex items-center justify-center gap-3">
      <div className="w-5 h-5 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      <span className="text-gray-600 font-medium">{text}</span>
    </div>
  );
}
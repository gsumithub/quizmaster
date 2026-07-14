import React from 'react';

const Loader = ({ message = 'Loading workspace data...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <div className="relative">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        <div className="absolute top-0 left-0 animate-ping rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 opacity-20"></div>
      </div>
      <p className="text-dark-400 text-sm font-medium animate-pulse">{message}</p>
    </div>
  );
};

export default Loader;

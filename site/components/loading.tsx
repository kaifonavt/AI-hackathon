import React from 'react';
import Image from 'next/image';

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 bg-purple-950/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="animate-spin">
        <Image
          src="/images/santa.png"
          alt="Loading..."
          width={100}
          height={100}
          className="w-24 h-24"
        />
      </div>
    </div>
  );
};

export default LoadingScreen;
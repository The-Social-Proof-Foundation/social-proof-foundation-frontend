import React from 'react';
import Spline from '@splinetool/react-spline';

export const Hero: React.FC = () => {
  return (
    <div className="relative min-h-screen">
      {/* 3D Scene Background */}
      <div className="absolute inset-0 z-10">
        <Spline scene="https://prod.spline.design/HxL-rfOFfGiivZxy/scene.splinecode" />
      </div>
      
      {/* Content Overlay */}
      <div className="relative z-20 min-h-screen flex flex-col">
      </div>
    </div>
  );
};
import React from 'react';

export const Footer: React.FC = () => {
  return (
    <>
      <div className="w-full border-t border-white/20"></div>
      <footer className="w-full bg-black py-8">
        <div className="max-w-7xl mx-auto px-4">
          <p className="footer-text text-center text-white/70">
            © {new Date().getFullYear()} The Social Proof Foundation. All rights reserved.
          </p>
        </div>
      </footer>
    </>
  );
};
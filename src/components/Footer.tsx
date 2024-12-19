import React from 'react';

export const Footer: React.FC = () => {
  return (
    <>
      <div className="w-full border-t border-white/20"></div>
      <footer className="w-full bg-black py-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center">
          <a
            href="https://x.com/0xSocialProof"
            target="_blank"
            rel="noopener noreferrer"
            className="mb-8 text-white/70 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
          <div className="footer-text text-xs text-center text-white/70 uppercase font-extralight tracking-wider">
            <p>© {new Date().getFullYear()} The Social Proof Foundation.</p>
            <p>Made with ❤️ in America.</p>
          </div>
        </div>
      </footer>
    </>
  );
};
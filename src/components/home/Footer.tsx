
import React from 'react';
import { BookOpen, Heart } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-compact">
      <div className="container mx-auto px-6">
        
        {/* Main footer row */}
        <div className="footer-content">
          
          {/* Left - Brand */}
          <div className="footer-brand">
            <span className="brand-name">📖 Tale Forge</span>
            <p className="brand-tagline">Where every story becomes legend</p>
          </div>

          {/* Center - Links */}
          <div className="footer-links">
            <a href="/privacy-policy.html" target="_blank" rel="noopener noreferrer">Privacy</a>
            <a href="/terms-of-service.html" target="_blank" rel="noopener noreferrer">Terms</a>
            <a href="mailto:info@tale-forge.app">Contact</a>
            <a href="/roadmap">2025 Roadmap</a>
          </div>

          {/* Right - Support with Psychology */}
          <div className="footer-support">
            <div className="support-header">
              <span className="support-title">💝 Solo Dev Project</span>
              <span className="support-goal">$127 / $500 monthly</span>
            </div>
            
            {/* Mini progress bar */}
            <div className="mini-progress-bar">
              <div className="mini-progress-fill" style={{width: '25.4%'}}></div>
            </div>
            
            <p className="support-impact">$5 = Coffee & development time • $25 = Server & AI costs</p>
            
            <div className="support-actions">
              <a 
                href="https://paypal.me/zinfinityhs" 
                target="_blank" 
                rel="noopener noreferrer"
                className="paypal-btn"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h8.418c2.508 0 4.93.729 6.76 2.04 1.786 1.28 2.794 3.27 2.794 5.493 0 2.563-1.175 4.776-3.201 6.02 1.61 1.013 2.566 2.807 2.566 4.81 0 5.09-3.635 7.85-10.442 7.85H7.076zm6.726-13.457c2.523 0 4.03-1.273 4.03-3.407 0-2.134-1.507-3.407-4.03-3.407H9.478l-1.24 6.814h5.564zm.874 8.457c2.8 0 4.474-1.273 4.474-3.407s-1.674-3.407-4.474-3.407H8.544l-1.372 6.814h7.504z"/>
                </svg>
                Support on PayPal
              </a>
              <span className="supporter-count">🙏 47 supporters</span>
            </div>
          </div>
        </div>

        {/* Roadmap section - compact */}
        <div className="roadmap-compact">
          <h3 className="roadmap-header">🚀 What's Coming Next</h3>
          <div className="roadmap-grid-mini">
            <div className="roadmap-mini-item">
              <div className="roadmap-mini-icon">🌍</div>
              <span>Multi-language support (25+ languages)</span>
            </div>
            <div className="roadmap-mini-item">
              <div className="roadmap-mini-icon">📝</div>
              <span>Custom Prompts</span>
            </div>
            <div className="roadmap-mini-item">
              <div className="roadmap-mini-icon">🎬</div>
              <span>Story to Video</span>
            </div>
            <div className="roadmap-mini-item">
              <div className="roadmap-mini-icon">✏️</div>
              <span>Advanced Editor</span>
            </div>
            <div className="roadmap-mini-item">
              <div className="roadmap-mini-icon">🎨</div>
              <span>AI Image Studio</span>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="footer-bottom">
          <p>© 2025 Tale Forge • Made with ❤️ by <span className="creator">worshipblank</span> • Help me work full-time on this!</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

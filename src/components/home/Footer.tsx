
import React from 'react';
import { BookOpen, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="redesign-footer">
      <div className="redesign-container">
        {/* Main Footer Content */}
        <div className="flex flex-col lg:flex-row justify-between items-start gap-8 mb-8">
          {/* Brand Section - Left Side */}
          <div className="space-y-4 flex-1">
            <div className="flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-amber-400" />
              <span className="text-2xl font-bold text-white">Tale Forge</span>
            </div>
            <p className="text-gray-400 leading-relaxed max-w-md">
              Where every word weaves worlds, every choice crafts destiny, and every story becomes legend.
            </p>
          </div>

          {/* Support Section - Right Side */}
          <div className="space-y-4 flex-1 lg:max-w-md">
            <h3 className="text-xl font-semibold text-white">A Solo Endeavor</h3>
            <p className="text-gray-400 leading-relaxed">
              Tale Forge is a self-funded project driven by a passion for storytelling. If you enjoy the experience, any support is greatly appreciated and helps fuel future development.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                asChild
                className="bg-amber-500 hover:bg-amber-600 text-white"
              >
                <a 
                  href="https://www.linkedin.com/in/kevin-el-zarka-92bb5b260/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2"
                >
                  Connect with Creator
                </a>
              </Button>
              <Button
                asChild
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-medium"
              >
                <a 
                  href="https://paypal.me/zinfinityhs" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2"
                >
                  💝 Support on PayPal
                </a>
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Legal Links */}
            <div className="flex items-center gap-6 text-sm">
              <a 
                href="/privacy-policy.html" 
                className="text-gray-400 hover:text-white transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                Privacy Policy
              </a>
              <a 
                href="/terms-of-service.html" 
                className="text-gray-400 hover:text-white transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                Terms of Service
              </a>
              <a 
                href="mailto:info@tale-forge.app" 
                className="text-gray-400 hover:text-white transition-colors"
              >
                Contact
              </a>
            </div>
            
            {/* Copyright */}
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>© {currentYear} Tale Forge. Made with</span>
              <Heart className="h-4 w-4 text-red-400 fill-red-400" />
              <span>by storytellers, for storytellers.</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

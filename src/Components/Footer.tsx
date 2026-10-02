import React from 'react';
import { BrandLogo } from '../icons/BrandLogo';
import { TranslationDictionary } from '../translations';
import { ShieldCheck, Heart } from 'lucide-react';
import { ToolCategory } from '../types';

interface FooterProps {
  t: TranslationDictionary;
  onNavigateCategory: (category: ToolCategory) => void;
  onNavigateHome: () => void;
  onOpenAbout: () => void;
  onOpenContact: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  t,
  onNavigateCategory,
  onNavigateHome,
  onOpenAbout,
  onOpenContact,
}) => {
  return (
    <footer className="bg-[#020710] border-t border-cyan-500/15 pt-16 pb-12 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800/80">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <button
              onClick={onNavigateHome}
              className="flex items-center text-left focus:outline-hidden cursor-pointer"
            >
              <BrandLogo size={42} showText={true} subtitle={t.appSubtitle} />
            </button>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-sm">
              Smart PDF Studio provides 60 fast, secure, and private PDF and image tools running 100% locally in your browser. No registration, no server uploads, total privacy.
            </p>
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs pt-1">
              <ShieldCheck className="w-4 h-4 flex-shrink-0" />
              <span>Zero server document storage guaranteed</span>
            </div>
          </div>

          {/* Column 1: Tool Suites */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Tool Suites
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onNavigateCategory('All')}
                  className="hover:text-cyan-400 transition cursor-pointer"
                >
                  All 60 Tools
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateCategory('Convert')}
                  className="hover:text-cyan-400 transition cursor-pointer"
                >
                  Convert PDF
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateCategory('Organize')}
                  className="hover:text-cyan-400 transition cursor-pointer"
                >
                  Organize PDF
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateCategory('Edit')}
                  className="hover:text-cyan-400 transition cursor-pointer"
                >
                  Edit PDF
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateCategory('Image')}
                  className="hover:text-cyan-400 transition cursor-pointer"
                >
                  Image Tools
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateCategory('Utilities')}
                  className="hover:text-cyan-400 transition cursor-pointer"
                >
                  Utilities
                </button>
              </li>
            </ul>
          </div>

          {/* Column 2: Legal & Trust */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Legal & Trust
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={onOpenAbout}
                  className="hover:text-cyan-400 transition cursor-pointer"
                >
                  About Us
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenContact}
                  className="hover:text-cyan-400 transition cursor-pointer"
                >
                  Contact
                </button>
              </li>
              <li>
                <a href="./privacy.html" className="hover:text-cyan-400 transition">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="./terms.html" className="hover:text-cyan-400 transition">
                  Terms & Conditions
                </a>
              </li>
              <li>
                <a href="./disclaimer.html" className="hover:text-cyan-400 transition">
                  Disclaimer
                </a>
              </li>
              <li>
                <a href="./cookies.html" className="hover:text-cyan-400 transition">
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Resources & SEO */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Resources
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="./sitemap.xml" target="_blank" rel="noreferrer" className="hover:text-cyan-400 transition">
                  Sitemap XML
                </a>
              </li>
              <li>
                <a href="./robots.txt" target="_blank" rel="noreferrer" className="hover:text-cyan-400 transition">
                  Robots.txt
                </a>
              </li>
              <li>
                <a href="#search-console" className="hover:text-cyan-400 transition">
                  Search Console
                </a>
              </li>
              <li>
                <a href="./manifest.json" target="_blank" rel="noreferrer" className="hover:text-cyan-400 transition">
                  PWA Web Manifest
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-xs">
          <div>
            © {new Date().getFullYear()} Smart PDF Studio. {t.footerRights}
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Fast. Secure. Private. All in Your Browser.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

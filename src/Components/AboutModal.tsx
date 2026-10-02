import React from 'react';
import { X, ShieldCheck, Zap, Lock, Globe } from 'lucide-react';
import { BrandLogo } from '../icons/BrandLogo';

export const AboutModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#07162d] border border-cyan-500/30 p-6 sm:p-8 shadow-2xl text-slate-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <BrandLogo size={46} showText={true} />
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">
          About Smart PDF Studio
        </h2>
        <p className="text-sm leading-relaxed text-slate-300 mb-6">
          Smart PDF Studio is a browser-first suite of 60 document and image utilities created for individuals, businesses, educators, and privacy-conscious users around the world.
        </p>

        <div className="space-y-4 mb-6">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
            <Lock className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-white mb-0.5">Absolute Local Privacy</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Traditional PDF websites upload your sensitive contracts, tax returns, and private photos to remote servers. Smart PDF Studio executes all PDF parsing and image resizing locally in your browser memory.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
            <Zap className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-white mb-0.5">Modern Web Standards</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Built with React, TypeScript, HTML5 Canvas, and modern Web APIs, ensuring swift processing without server queues or upload limits.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
            <Globe className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-white mb-0.5">Global Accessibility</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Full multilingual support across 10 international languages, including bidirectional RTL layout for Arabic.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-sm transition cursor-pointer"
        >
          Close
        </button>
      </div>
    </div>
  );
};

import React from 'react';
import { TranslationDictionary } from '../translations';
import { ShieldCheck, HardDrive, Zap, Infinity, Lock, Cpu, Clock, CheckCircle } from 'lucide-react';

interface WhyChooseUsProps {
  t: TranslationDictionary;
}

export const WhyChooseUs: React.FC<WhyChooseUsProps> = ({ t }) => {
  const benefits = [
    {
      icon: HardDrive,
      title: t.badge1Title,
      subtitle: t.badge1Sub,
      description:
        'Zero software installations, browser plugins, or downloads required. Every tool executes instantly inside standard modern browsers.',
      color: 'from-cyan-500 to-blue-600',
    },
    {
      icon: ShieldCheck,
      title: t.badge2Title,
      subtitle: t.badge2Sub,
      description:
        'Supported document operations process files locally in your browser. OCR may download language and engine resources; document files are not sent to our processing server.',
      color: 'from-emerald-500 to-teal-600',
    },
    {
      icon: Zap,
      title: t.badge3Title,
      subtitle: t.badge3Sub,
      description:
        'Uses browser APIs and specialized engines. Processing speed depends on file size, browser memory, and device performance.',
      color: 'from-blue-500 to-indigo-600',
    },
    {
      icon: Infinity,
      title: t.badge4Title,
      subtitle: t.badge4Sub,
      description:
        'Free to use without an account. Very large files may be limited by available browser memory and device performance.',
      color: 'from-purple-500 to-pink-600',
    },
  ];

  return (
    <section className="py-16 lg:py-24 bg-[#030914] border-t border-cyan-500/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-3">
            <Lock className="w-3.5 h-3.5" />
            <span>Architecture & Principles</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {t.whyChooseTitle}
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mt-2">
            Engineered from the ground up for speed, security, and absolute privacy.
          </p>
        </div>

        {/* 4 Benefit Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, idx) => {
            const IconComponent = benefit.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-[#07162d] border border-cyan-500/15 hover:border-cyan-400/40 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${benefit.color} flex items-center justify-center text-white mb-5 shadow-lg shadow-cyan-900/30`}
                  >
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">
                    {benefit.title}
                  </h3>
                  <div className="text-xs font-semibold text-cyan-400 mb-3">
                    {benefit.subtitle}
                  </div>
                  <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                    {benefit.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center gap-2 text-xs font-medium text-slate-400">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Local processing where supported</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

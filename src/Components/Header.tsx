import React, { useState } from 'react';
import { BrandLogo } from '../icons/BrandLogo';
import { PWAInstallButton } from './PWAInstallButton';
import { SUPPORTED_LANGUAGES, TranslationDictionary } from '../translations';
import { SupportedLanguage } from '../types';
import { Globe, Moon, Sun, Menu, X, ChevronDown } from 'lucide-react';

interface HeaderProps {
  currentLang: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  isDark: boolean;
  onThemeToggle: () => void;
  t: TranslationDictionary;
  onNavigate: (section: 'home' | 'tools' | 'categories' | 'about' | 'contact') => void;
  onOpenAbout: () => void;
  onOpenContact: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLang,
  onLanguageChange,
  isDark,
  onThemeToggle,
  t,
  onNavigate,
  onOpenAbout,
  onOpenContact,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const selectedLangObj =
    SUPPORTED_LANGUAGES.find((l) => l.code === currentLang) || SUPPORTED_LANGUAGES[0];

  const handleNavClick = (section: 'home' | 'tools' | 'categories' | 'about' | 'contact') => {
    setMobileMenuOpen(false);
    if (section === 'about') {
      onOpenAbout();
    } else if (section === 'contact') {
      onOpenContact();
    } else {
      onNavigate(section);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#040d1a]/90 dark:bg-[#040d1a]/90 border-b border-cyan-500/15 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Left: Brand Logo & Title */}
        <button
          onClick={() => handleNavClick('home')}
          className="flex items-center text-left focus:outline-hidden group cursor-pointer"
        >
          <BrandLogo size={42} showText={true} subtitle={t.appSubtitle} />
        </button>

        {/* Center: Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          <button
            onClick={() => handleNavClick('home')}
            className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition cursor-pointer"
          >
            {t.navHome}
          </button>
          <button
            onClick={() => handleNavClick('tools')}
            className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition cursor-pointer"
          >
            {t.navAllTools}
          </button>
          <button
            onClick={() => handleNavClick('categories')}
            className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition cursor-pointer"
          >
            {t.navCategories}
          </button>
          <button
            onClick={() => handleNavClick('about')}
            className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition cursor-pointer"
          >
            {t.navAbout}
          </button>
          <button
            onClick={() => handleNavClick('contact')}
            className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition cursor-pointer"
          >
            {t.navContact}
          </button>
        </nav>

        {/* Right side: Language, Theme & PWA */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* PWA Install Button */}
          <div className="hidden sm:block">
            <PWAInstallButton />
          </div>

          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-700/60 bg-slate-900/60 text-xs font-medium text-slate-200 hover:bg-slate-800 hover:border-cyan-500/40 transition cursor-pointer"
              aria-label="Select language"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">{selectedLangObj.nativeName}</span>
              <span className="sm:hidden uppercase">{selectedLangObj.code}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {langDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setLangDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-48 rounded-xl bg-[#091830] border border-cyan-500/25 py-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 mb-1">
                    Select Language
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          onLanguageChange(lang.code);
                          setLangDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between transition cursor-pointer ${
                          currentLang === lang.code
                            ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                            : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                        }`}
                      >
                        <span>{lang.nativeName}</span>
                        <span className="text-[10px] text-slate-400 uppercase">{lang.code}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Theme Toggle (Dark/Light) */}
          <button
            onClick={onThemeToggle}
            aria-label="Toggle theme"
            className="p-2 rounded-xl border border-slate-700/60 bg-slate-900/60 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/40 transition cursor-pointer"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-cyan-400" />}
          </button>

          {/* Mobile Menu Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
            className="md:hidden p-2 rounded-xl border border-slate-700/60 bg-slate-900/60 text-slate-300 hover:text-white transition cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-[#040d1a] px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top-4 duration-200">
          <button
            onClick={() => handleNavClick('home')}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800"
          >
            {t.navHome}
          </button>
          <button
            onClick={() => handleNavClick('tools')}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800"
          >
            {t.navAllTools}
          </button>
          <button
            onClick={() => handleNavClick('categories')}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800"
          >
            {t.navCategories}
          </button>
          <button
            onClick={() => handleNavClick('about')}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800"
          >
            {t.navAbout}
          </button>
          <button
            onClick={() => handleNavClick('contact')}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800"
          >
            {t.navContact}
          </button>

          <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
            <PWAInstallButton />
          </div>
        </div>
      )}
    </header>
  );
};

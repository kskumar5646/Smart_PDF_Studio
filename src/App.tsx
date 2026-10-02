/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { TOOLS, POPULAR_TOOL_IDS } from './tools/toolRegistry';
import { ToolDefinition, ToolCategory, SupportedLanguage } from './types';
import { TRANSLATIONS, SUPPORTED_LANGUAGES } from './translations';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { PopularTools } from './components/PopularTools';
import { CategoryGrid } from './components/CategoryGrid';
import { ToolGrid } from './components/ToolGrid';
import { ToolWorkspace } from './components/ToolWorkspace';
import { WhyChooseUs } from './components/WhyChooseUs';
import { Footer } from './components/Footer';
import { AboutModal } from './components/AboutModal';
import { ContactModal } from './components/ContactModal';

export default function App() {
  const [currentLang, setCurrentLang] = useState<SupportedLanguage>(() => {
    const saved = localStorage.getItem('smart_pdf_lang');
    if (saved && ['en', 'hi', 'de', 'es', 'fr', 'pt', 'ru', 'ar', 'zh', 'ja'].includes(saved)) {
      return saved as SupportedLanguage;
    }
    return 'en';
  });

  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('smart_pdf_theme');
    return saved !== 'light'; // Default to dark navy
  });

  const [activeTool, setActiveTool] = useState<ToolDefinition | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory>('All');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [aboutOpen, setAboutOpen] = useState<boolean>(false);
  const [contactOpen, setContactOpen] = useState<boolean>(false);

  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  const currentLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === currentLang);
  const isRtl = currentLangObj?.dir === 'rtl';

  // Apply theme & RTL direction to document
  useEffect(() => {
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLang;

    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [isDark, isRtl, currentLang]);

  // Handle URL hash changes for deep linking (e.g. #tool/image-compressor)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#tool/')) {
        const toolId = hash.replace('#tool/', '');
        const found = TOOLS.find((tool) => tool.id === toolId);
        if (found) {
          setActiveTool(found);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
      }
      if (hash === '' || hash === '#home') {
        setActiveTool(null);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleLanguageChange = (lang: SupportedLanguage) => {
    setCurrentLang(lang);
    localStorage.setItem('smart_pdf_lang', lang);
  };

  const handleThemeToggle = () => {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem('smart_pdf_theme', next ? 'dark' : 'light');
  };

  const handleSelectTool = (tool: ToolDefinition) => {
    setActiveTool(tool);
    window.location.hash = `#tool/${tool.id}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToTools = () => {
    setActiveTool(null);
    window.location.hash = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigation = (section: 'home' | 'tools' | 'categories' | 'about' | 'contact') => {
    if (activeTool) {
      setActiveTool(null);
      window.location.hash = '';
    }

    setTimeout(() => {
      if (section === 'home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (section === 'tools') {
        document.getElementById('tools')?.scrollIntoView({ behavior: 'smooth' });
      } else if (section === 'categories') {
        document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
  };

  const handleSelectCategoryFilter = (category: ToolCategory) => {
    if (activeTool) {
      setActiveTool(null);
    }
    setSelectedCategory(category);
    setTimeout(() => {
      document.getElementById('tools')?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  const handleSearchSubmit = (query: string) => {
    if (activeTool) {
      setActiveTool(null);
    }
    setSearchFilter(query);
    setTimeout(() => {
      document.getElementById('tools')?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  const popularTools = TOOLS.filter((tool) => POPULAR_TOOL_IDS.includes(tool.id));

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-[#040d1a] text-slate-100' : 'bg-slate-100 text-slate-900'}`}>
      {/* Sticky Header */}
      <Header
        currentLang={currentLang}
        onLanguageChange={handleLanguageChange}
        isDark={isDark}
        onThemeToggle={handleThemeToggle}
        t={t}
        onNavigate={handleNavigation}
        onOpenAbout={() => setAboutOpen(true)}
        onOpenContact={() => setContactOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTool ? (
          /* Dedicated Tool Workspace Page */
          <ToolWorkspace tool={activeTool} onBack={handleBackToTools} t={t} />
        ) : (
          /* Homepage with Hero, Popular Tools, Category Grid, All 60 Tools & Why Choose Us */
          <>
            <Hero
              t={t}
              tools={TOOLS}
              onSelectTool={handleSelectTool}
              onSearchSubmit={handleSearchSubmit}
            />

            <PopularTools
              popularTools={popularTools}
              onSelectTool={handleSelectTool}
              t={t}
            />

            <CategoryGrid onSelectCategoryFilter={handleSelectCategoryFilter} />

            <ToolGrid
              tools={TOOLS}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              onSelectTool={handleSelectTool}
              t={t}
              searchFilter={searchFilter}
              onSearchChange={setSearchFilter}
            />

            <WhyChooseUs t={t} />
          </>
        )}
      </main>

      {/* Footer */}
      <Footer
        t={t}
        onNavigateCategory={handleSelectCategoryFilter}
        onNavigateHome={() => handleNavigation('home')}
        onOpenAbout={() => setAboutOpen(true)}
        onOpenContact={() => setContactOpen(true)}
      />

      {/* Dialog Modals */}
      <AboutModal isOpen={aboutOpen} onClose={() => setAboutOpen(false)} />
      <ContactModal isOpen={contactOpen} onClose={() => setContactOpen(false)} />
    </div>
  );
}

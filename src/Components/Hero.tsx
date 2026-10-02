import React, { useState } from 'react';
import { HeroIllustration } from './HeroIllustration';
import { TranslationDictionary } from '../translations';
import { ToolDefinition } from '../types';
import { Search, ShieldCheck, Zap, HardDrive, Infinity, ArrowRight } from 'lucide-react';

interface HeroProps {
  t: TranslationDictionary;
  tools: ToolDefinition[];
  onSelectTool: (tool: ToolDefinition) => void;
  onSearchSubmit: (query: string) => void;
}

export const Hero: React.FC<HeroProps> = ({
  t,
  tools,
  onSelectTool,
  onSearchSubmit,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const matchedTools = searchQuery.trim()
    ? tools.filter(
        (tool) =>
          tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tool.keywords.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase())) ||
          tool.category.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 6)
    : [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearchSubmit(searchQuery);
      setShowDropdown(false);
    }
  };

  return (
    <section className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24 border-b border-cyan-500/10">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-1/4 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left Column: Hero Content */}
          <div className="lg:col-span-7 flex flex-col text-left">
            {/* Small Label */}
            <div className="inline-flex items-center gap-2 self-start px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              SMART PDF STUDIO
            </div>

            {/* Large Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1] mb-3">
              {t.heroHeadingBefore}
              <span className="text-cyan-400 bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 bg-clip-text text-transparent">
                {t.heroHeadingPdf}
              </span>
              {t.heroHeadingAfter}
            </h1>

            {/* Subheading */}
            <p className="text-lg sm:text-xl font-semibold text-cyan-200/90 mb-4 tracking-tight">
              {t.tagline}
            </p>

            {/* Description */}
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-8 max-w-2xl font-normal">
              {t.heroDescription}
            </p>

            {/* Search Bar with live autocomplete */}
            <div className="relative w-full max-w-xl mb-10">
              <form onSubmit={handleSearch} className="relative flex items-center">
                <div className="absolute left-4 text-slate-400 pointer-events-none">
                  <Search className="w-5 h-5 text-cyan-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  placeholder={t.searchPlaceholder}
                  className="w-full pl-12 pr-28 py-4 rounded-2xl bg-[#091932] border border-cyan-500/30 text-white placeholder-slate-400 text-sm sm:text-base shadow-lg shadow-cyan-950/40 focus:outline-hidden focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                />
                <button
                  type="submit"
                  className="absolute right-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm shadow-md transition active:scale-95 cursor-pointer"
                >
                  {t.searchButton}
                </button>
              </form>

              {/* Live Search Autocomplete Dropdown */}
              {showDropdown && matchedTools.length > 0 && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowDropdown(false)} />
                  <div className="absolute left-0 right-0 mt-2 bg-[#091830] border border-cyan-500/30 rounded-2xl shadow-2xl p-2 z-40 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                      Matching Tools ({matchedTools.length})
                    </div>
                    {matchedTools.map((tool) => (
                      <button
                        key={tool.id}
                        onClick={() => {
                          onSelectTool(tool);
                          setShowDropdown(false);
                          setSearchQuery('');
                        }}
                        className="w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between hover:bg-slate-800/80 transition group cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-2 h-2 rounded-full bg-cyan-400" />
                          <div>
                            <div className="text-sm font-semibold text-white group-hover:text-cyan-400 transition">
                              {tool.name}
                            </div>
                            <div className="text-xs text-slate-400 line-clamp-1">
                              {tool.shortDescription}
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition" />
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* 4 Trust Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-2">
              {/* Badge 1 */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-start gap-2.5">
                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 flex-shrink-0 mt-0.5">
                  <HardDrive className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white leading-tight">
                    {t.badge1Title}
                  </div>
                  <div className="text-[11px] text-slate-400 leading-tight mt-0.5">
                    {t.badge1Sub}
                  </div>
                </div>
              </div>

              {/* Badge 2 */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-start gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 flex-shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white leading-tight">
                    {t.badge2Title}
                  </div>
                  <div className="text-[11px] text-slate-400 leading-tight mt-0.5">
                    {t.badge2Sub}
                  </div>
                </div>
              </div>

              {/* Badge 3 */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-start gap-2.5">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 flex-shrink-0 mt-0.5">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white leading-tight">
                    {t.badge3Title}
                  </div>
                  <div className="text-[11px] text-slate-400 leading-tight mt-0.5">
                    {t.badge3Sub}
                  </div>
                </div>
              </div>

              {/* Badge 4 */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-start gap-2.5">
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 flex-shrink-0 mt-0.5">
                  <Infinity className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white leading-tight">
                    {t.badge4Title}
                  </div>
                  <div className="text-[11px] text-slate-400 leading-tight mt-0.5">
                    {t.badge4Sub}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Large Dominant PDF Illustration */}
          <div className="lg:col-span-5 flex justify-center items-center">
            <HeroIllustration />
          </div>
        </div>
      </div>
    </section>
  );
};

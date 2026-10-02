import React, { useState } from 'react';
import { ToolDefinition, ToolCategory } from '../types';
import { CATEGORIES } from '../tools/toolRegistry';
import { ToolIcon } from '../icons/ToolIcons';
import { TranslationDictionary } from '../translations';
import { Search, Layers, ArrowRight } from 'lucide-react';

interface ToolGridProps {
  tools: ToolDefinition[];
  selectedCategory: ToolCategory;
  onSelectCategory: (cat: ToolCategory) => void;
  onSelectTool: (tool: ToolDefinition) => void;
  t: TranslationDictionary;
  searchFilter: string;
  onSearchChange: (val: string) => void;
}

export const ToolGrid: React.FC<ToolGridProps> = ({
  tools,
  selectedCategory,
  onSelectCategory,
  onSelectTool,
  t,
  searchFilter,
  onSearchChange,
}) => {
  const [internalSearch, setInternalSearch] = useState(searchFilter);

  const activeSearch = searchFilter || internalSearch;

  // Filter tools based on category and search query
  const filteredTools = tools.filter((tool) => {
    const matchesCategory =
      selectedCategory === 'All' || tool.category === selectedCategory;

    const matchesSearch =
      activeSearch.trim() === '' ||
      tool.name.toLowerCase().includes(activeSearch.toLowerCase()) ||
      tool.shortDescription.toLowerCase().includes(activeSearch.toLowerCase()) ||
      tool.description.toLowerCase().includes(activeSearch.toLowerCase()) ||
      tool.keywords.some((k) => k.toLowerCase().includes(activeSearch.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  return (
    <section id="tools" className="py-14 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2">
            <Layers className="w-3.5 h-3.5" />
            <span>Complete Catalogue</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {t.allToolsTitle}
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mt-2">
            {t.allToolsSubtitle}
          </p>
        </div>

        {/* Filter Bar & Search */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          {/* Category Tabs */}
          <div className="w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-none flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#07152b] border border-cyan-500/15">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Quick Search Input */}
          <div className="w-full md:w-72 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={activeSearch}
              onChange={(e) => {
                setInternalSearch(e.target.value);
                onSearchChange(e.target.value);
              }}
              placeholder="Filter 60 tools..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#07152b] border border-cyan-500/20 text-white text-xs sm:text-sm placeholder-slate-400 focus:outline-hidden focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
            />
          </div>
        </div>

        {/* Tool Count Summary */}
        <div className="flex items-center justify-between text-xs text-slate-400 mb-6 px-1">
          <span>
            Showing <strong className="text-cyan-400">{filteredTools.length}</strong> of{' '}
            <strong className="text-white">60</strong> tools
          </span>
          {activeSearch && (
            <button
              onClick={() => {
                setInternalSearch('');
                onSearchChange('');
              }}
              className="text-cyan-400 hover:underline cursor-pointer"
            >
              Clear search filter
            </button>
          )}
        </div>

        {/* Tools Cards Grid (All 60 tools responsive) */}
        {filteredTools.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-[#07152b] border border-cyan-500/15">
            <p className="text-slate-400 text-sm">{t.searchNoResults}</p>
            <button
              onClick={() => {
                setInternalSearch('');
                onSearchChange('');
                onSelectCategory('All');
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-cyan-600 text-white text-xs font-semibold hover:bg-cyan-500 transition"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {filteredTools.map((tool) => (
              <div
                key={tool.id}
                onClick={() => onSelectTool(tool)}
                className="group p-5 rounded-2xl bg-[#07162d]/90 hover:bg-[#0a1e3d] border border-cyan-500/15 hover:border-cyan-400/40 shadow-sm hover:shadow-cyan-500/10 transition-all duration-200 hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3.5">
                    <ToolIcon name={tool.iconName} size={48} />
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-slate-800 text-cyan-300 border border-slate-700/50">
                      {tool.category}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors mb-1.5">
                    {tool.name}
                  </h3>
                  <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">
                    {tool.shortDescription}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-slate-400 group-hover:text-cyan-400">
                  <span>Start tool</span>
                  <div className="w-7 h-7 rounded-full bg-slate-800/60 flex items-center justify-center group-hover:bg-cyan-500 group-hover:text-slate-900 transition-all">
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

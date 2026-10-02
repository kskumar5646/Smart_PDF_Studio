import React from 'react';
import { VISUAL_CATEGORIES } from '../tools/toolRegistry';
import { ToolIcon } from '../icons/ToolIcons';
import { ArrowRight, LayoutGrid } from 'lucide-react';
import { ToolCategory } from '../types';

interface CategoryGridProps {
  onSelectCategoryFilter: (category: ToolCategory) => void;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({ onSelectCategoryFilter }) => {
  return (
    <section id="categories" className="py-12 lg:py-16 bg-[#030a14]/60 border-y border-cyan-500/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-cyan-400 mb-1.5">
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Explore by Category</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Tool Categories
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Choose from dedicated suites built for every workflow
            </p>
          </div>
        </div>

        {/* 8 Category Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {VISUAL_CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              onClick={() => onSelectCategoryFilter(cat.filterCategory as ToolCategory)}
              className="group p-5 rounded-2xl bg-[#07152b] border border-cyan-500/15 hover:border-cyan-400/40 hover:bg-[#091b36] shadow-sm hover:shadow-cyan-500/10 transition-all duration-200 cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <ToolIcon name={cat.icon} size={46} />
                  <span className="text-[11px] font-semibold text-cyan-400 bg-cyan-950/70 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                    {cat.count}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors mb-1.5">
                  {cat.title}
                </h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  {cat.description}
                </p>
              </div>

              <div className="pt-4 mt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-medium text-slate-400 group-hover:text-cyan-400">
                <span>View tools</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

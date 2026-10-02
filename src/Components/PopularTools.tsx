import React from 'react';
import { ToolDefinition } from '../types';
import { ToolIcon } from '../icons/ToolIcons';
import { TranslationDictionary } from '../translations';
import { ArrowRight, Sparkles } from 'lucide-react';

interface PopularToolsProps {
  popularTools: ToolDefinition[];
  onSelectTool: (tool: ToolDefinition) => void;
  t: TranslationDictionary;
}

export const PopularTools: React.FC<PopularToolsProps> = ({
  popularTools,
  onSelectTool,
  t,
}) => {
  return (
    <section className="py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-cyan-400 mb-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t.popularTitle}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {t.popularTitle}
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              {t.popularSubtitle}
            </p>
          </div>
        </div>

        {/* 4 Prominent Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {popularTools.map((tool) => (
            <div
              key={tool.id}
              onClick={() => onSelectTool(tool)}
              className="group relative p-6 rounded-2xl bg-gradient-to-b from-[#091a33] to-[#061224] border border-cyan-500/20 hover:border-cyan-400/50 shadow-lg hover:shadow-cyan-500/10 transition-all duration-300 hover:-translate-y-1.5 cursor-pointer flex flex-col justify-between"
            >
              {/* Subtle card glow on hover */}
              <div className="absolute inset-0 rounded-2xl bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <ToolIcon name={tool.iconName} size={54} />
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold tracking-wide uppercase bg-slate-800/80 text-cyan-300 border border-slate-700/60">
                    {tool.category}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors mb-2">
                  {tool.name}
                </h3>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                  {tool.shortDescription}
                </p>
              </div>

              <div className="pt-6 mt-4 border-t border-slate-800/60 flex items-center justify-between text-xs font-semibold text-cyan-400 group-hover:text-cyan-300">
                <span>Open Tool</span>
                <div className="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center group-hover:bg-cyan-500 group-hover:text-slate-900 transition-all duration-300">
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

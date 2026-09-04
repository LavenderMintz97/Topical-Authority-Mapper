import React from 'react';
import { Search, Filter, X, Circle, Tag, Layers, Compass, CheckCircle2, AlertTriangle, Swords, Sparkles } from 'lucide-react';
import { FilterOptions, NodeType, SearchIntent } from '../types';

interface Props {
  filters: FilterOptions;
  onChange: (filters: FilterOptions) => void;
  categories: string[];
  totalCount: number;
  filteredCount: number;
  showGapFilter?: boolean;
}

export default function CategoryFilterBar({
  filters,
  onChange,
  categories,
  totalCount,
  filteredCount,
  showGapFilter = true
}: Props) {
  const isFiltered = 
    filters.searchQuery !== '' || 
    filters.nodeType !== 'all' || 
    filters.intent !== 'all' || 
    filters.category !== 'all' || 
    filters.gapStatus !== 'all';

  const resetFilters = () => {
    onChange({
      searchQuery: '',
      nodeType: 'all',
      intent: 'all',
      category: 'all',
      gapStatus: 'all'
    });
  };

  return (
    <div className="bg-[#F6F5F3] border-b border-[#141414] p-4 space-y-3">
      {/* Top row: Search and active state */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#141414]/40" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onChange({ ...filters, searchQuery: e.target.value })}
            placeholder="Filter by keyword, topic, or entity..."
            className="w-full bg-white border border-[#141414]/30 pl-8 pr-8 py-1.5 text-xs font-sans placeholder:text-[#141414]/40 focus:outline-none focus:border-[#141414] focus:ring-1 focus:ring-[#141414]"
          />
          {filters.searchQuery && (
            <button
              onClick={() => onChange({ ...filters, searchQuery: '' })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#141414]/50 hover:text-[#141414]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono uppercase opacity-70">
            Showing <strong className="text-[#141414] font-bold">{filteredCount}</strong> of {totalCount} Nodes
          </span>
          {isFiltered && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 text-[10px] font-mono uppercase bg-[#141414] text-[#E4E3E0] px-2.5 py-1 hover:bg-[#141414]/80 transition-colors"
            >
              <X className="w-2.5 h-2.5" /> Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Filter controls row */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#141414]/10 text-xs">
        {/* Category Filter */}
        <div className="flex items-center gap-1.5">
          <Tag className="w-3 h-3 text-[#141414]/50" />
          <span className="text-[10px] font-mono uppercase opacity-60">Category:</span>
          <select
            value={filters.category}
            onChange={(e) => onChange({ ...filters, category: e.target.value })}
            className="bg-white border border-[#141414]/30 text-[11px] font-mono px-2 py-1 focus:outline-none focus:border-[#141414] cursor-pointer"
          >
            <option value="all">All Categories ({categories.length})</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Node Type filter */}
        <div className="flex items-center gap-1 border-l border-[#141414]/15 pl-2 ml-1">
          <Layers className="w-3 h-3 text-[#141414]/50" />
          <span className="text-[10px] font-mono uppercase opacity-60">Type:</span>
          <div className="inline-flex border border-[#141414]/30 bg-white">
            {(['all', 'pillar', 'cluster', 'supporting'] as const).map((type) => (
              <button
                key={type}
                onClick={() => onChange({ ...filters, nodeType: type })}
                className={`text-[10px] font-mono uppercase px-2 py-1 transition-colors ${
                  filters.nodeType === type
                    ? 'bg-[#141414] text-[#E4E3E0]'
                    : 'text-[#141414] hover:bg-[#141414]/5'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Search Intent Filter */}
        <div className="flex items-center gap-1 border-l border-[#141414]/15 pl-2 ml-1">
          <Compass className="w-3 h-3 text-[#141414]/50" />
          <span className="text-[10px] font-mono uppercase opacity-60">Intent:</span>
          <select
            value={filters.intent}
            onChange={(e) => onChange({ ...filters, intent: e.target.value as any })}
            className="bg-white border border-[#141414]/30 text-[11px] font-mono px-2 py-1 focus:outline-none focus:border-[#141414] cursor-pointer"
          >
            <option value="all">All Intents</option>
            <option value="Informational">Informational</option>
            <option value="Commercial">Commercial</option>
            <option value="Transactional">Transactional</option>
            <option value="Navigational">Navigational</option>
          </select>
        </div>

        {/* Gap Status Filter (if enabled) */}
        {showGapFilter && (
          <div className="flex items-center gap-1 border-l border-[#141414]/15 pl-2 ml-1">
            <Filter className="w-3 h-3 text-[#141414]/50" />
            <span className="text-[10px] font-mono uppercase opacity-60">Status:</span>
            <div className="inline-flex border border-[#141414]/30 bg-white">
              <button
                onClick={() => onChange({ ...filters, gapStatus: 'all' })}
                className={`text-[10px] font-mono uppercase px-2 py-1 transition-colors ${
                  filters.gapStatus === 'all' ? 'bg-[#141414] text-[#E4E3E0]' : 'hover:bg-[#141414]/5'
                }`}
              >
                All
              </button>
              <button
                onClick={() => onChange({ ...filters, gapStatus: 'gaps_only' })}
                className={`flex items-center gap-1 text-[10px] font-mono uppercase px-2 py-1 transition-colors ${
                  filters.gapStatus === 'gaps_only' ? 'bg-amber-600 text-white font-bold' : 'hover:bg-amber-50 text-amber-900'
                }`}
              >
                <AlertTriangle className="w-2.5 h-2.5" /> Gaps Only
              </button>
              <button
                onClick={() => onChange({ ...filters, gapStatus: 'covered_only' })}
                className={`flex items-center gap-1 text-[10px] font-mono uppercase px-2 py-1 transition-colors ${
                  filters.gapStatus === 'covered_only' ? 'bg-emerald-700 text-white font-bold' : 'hover:bg-emerald-50 text-emerald-900'
                }`}
              >
                <CheckCircle2 className="w-2.5 h-2.5" /> Covered
              </button>
              <button
                onClick={() => onChange({ ...filters, gapStatus: 'competitor_gap' })}
                className={`flex items-center gap-1 text-[10px] font-mono uppercase px-2 py-1 transition-colors ${
                  filters.gapStatus === 'competitor_gap' ? 'bg-rose-700 text-white font-bold' : 'hover:bg-rose-50 text-rose-900'
                }`}
                title="Competitor Advantage: Competitor has it, you do not"
              >
                <Swords className="w-2.5 h-2.5" /> Competitor Threat
              </button>
              <button
                onClick={() => onChange({ ...filters, gapStatus: 'blue_ocean' })}
                className={`flex items-center gap-1 text-[10px] font-mono uppercase px-2 py-1 transition-colors ${
                  filters.gapStatus === 'blue_ocean' ? 'bg-blue-700 text-white font-bold' : 'hover:bg-blue-50 text-blue-900'
                }`}
                title="Blue Ocean: Neither you nor competitor has covered this"
              >
                <Sparkles className="w-2.5 h-2.5" /> Blue Ocean
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

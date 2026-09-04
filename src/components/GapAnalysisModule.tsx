import React, { useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Copy, 
  Download, 
  ExternalLink, 
  FileSpreadsheet, 
  Globe, 
  Layers, 
  Plus, 
  RefreshCw, 
  Search, 
  ShieldAlert, 
  Sparkles, 
  Swords, 
  Tag, 
  Trophy, 
  TrendingUp,
  X 
} from 'lucide-react';
import { TopicalMap, NodeGapItem, GapAnalysisSummary, FilterOptions } from '../types';
import { filterGapItems } from '../utils/gapAnalyzer';
import CategoryFilterBar from './CategoryFilterBar';
import CompetitorMatrixView from './CompetitorMatrixView';
import GapDemandTrendChart from './GapDemandTrendChart';

interface Props {
  mapData: TopicalMap;
  gapItems: NodeGapItem[];
  summary: GapAnalysisSummary;
  categories: string[];
  userUrlsText: string;
  competitorUrlsText: string;
  onUpdateUserUrls: (text: string) => void;
  onUpdateCompetitorUrls: (text: string) => void;
  onLoadSampleUrls: () => void;
  onSelectNode: (nodeId: string) => void;
  selectedNodeId: string | null;
  onToggleCovered: (nodeId: string) => void;
  onGenerateBrief?: (node: NodeGapItem) => void;
}

export default function GapAnalysisModule({
  mapData,
  gapItems,
  summary,
  categories,
  userUrlsText,
  competitorUrlsText,
  onUpdateUserUrls,
  onUpdateCompetitorUrls,
  onLoadSampleUrls,
  onSelectNode,
  selectedNodeId,
  onToggleCovered,
  onGenerateBrief
}: Props) {
  const [activeTab, setActiveTab] = useState<'audit' | 'matrix' | 'trends' | 'roadmap' | 'urls'>('audit');
  const [filters, setFilters] = useState<FilterOptions>({
    searchQuery: '',
    nodeType: 'all',
    intent: 'all',
    category: 'all',
    gapStatus: 'all'
  });

  const filteredItems = filterGapItems(gapItems, filters);

  const exportCSV = () => {
    const headers = [
      'Node ID',
      'Topic Label',
      'Category',
      'Type',
      'Search Intent',
      'Coverage Status',
      'User Matched URL',
      'User Match Score',
      'Competitor Covered',
      'Competitor Matched URL',
      'Competitive Matrix Status',
      'Action Priority',
      'Recommended Action',
      'Target URL Slug'
    ];

    const rows = gapItems.map(item => [
      item.nodeId,
      `"${item.nodeLabel.replace(/"/g, '""')}"`,
      `"${item.category.replace(/"/g, '""')}"`,
      item.nodeType,
      item.intent,
      item.userCovered ? 'Covered' : 'Content Gap',
      item.userMatchedUrl ? `"${item.userMatchedUrl}"` : '',
      `${item.userMatchScore}%`,
      item.competitorCovered ? 'Covered' : 'Gap',
      item.competitorMatchedUrl ? `"${item.competitorMatchedUrl}"` : '',
      item.matrixStatus,
      item.priority,
      `"${item.recommendedAction.replace(/"/g, '""')}"`,
      item.targetSlug
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `content-gap-analysis-${mapData.seed.toLowerCase().replace(/\s+/g, '-')}.csv`;
    link.click();
  };

  const exportMarkdown = () => {
    const gaps = gapItems.filter(i => !i.userCovered);
    const md = `# Content Gap & Competitor Analysis: ${mapData.seed}
Generated: ${new Date().toLocaleDateString()}

## Executive Summary
- **Total Entities in Topical Map:** ${summary.totalNodes}
- **Your Covered Content:** ${summary.userCoveredCount} (${summary.coveragePercentage}%)
- **Identified Content Gaps:** ${summary.userGapCount}
- **Competitor Advantage Threats:** ${summary.competitorAdvantageCount}
- **Blue Ocean White-Space Topics:** ${summary.blueOceanCount}

---

## High Priority Content Gaps (Immediate Action Items)
${gaps
  .filter(g => g.priority === 'High')
  .map(g => `### [${g.priority} Priority] ${g.nodeLabel} (${g.nodeType.toUpperCase()})
- **Category:** ${g.category}
- **Search Intent:** ${g.intent}
- **Matrix Status:** ${g.matrixStatus.replace('_', ' ').toUpperCase()}
- **Recommended Action:** ${g.recommendedAction}
- **Target URL Slug:** \`${g.targetSlug}\`
- **Key Entities to Cover:** ${g.entities.join(', ')}
${g.competitorMatchedUrl ? `- **Competitor URL:** ${g.competitorMatchedUrl}` : ''}
`).join('\n')}

---

## Medium & Low Priority Content Gaps
${gaps
  .filter(g => g.priority !== 'High')
  .map(g => `- **${g.nodeLabel}** (${g.category}) - Target: \`${g.targetSlug}\` - Intent: ${g.intent}`)
  .join('\n')}
`;

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `content-gaps-${mapData.seed.toLowerCase().replace(/\s+/g, '-')}.md`;
    link.click();
  };

  const userUrlCount = userUrlsText.trim().split('\n').filter(Boolean).length;
  const competitorUrlCount = competitorUrlsText.trim().split('\n').filter(Boolean).length;

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white">
      {/* Top Banner & Metrics Overview */}
      <div className="border-b border-[#141414] bg-[#E4E3E0] p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase bg-[#141414] text-[#E4E3E0] px-2 py-0.5 font-bold">
                Module
              </span>
              <h2 className="text-2xl font-serif italic tracking-tight">
                Content Gap & Competitor Audit
              </h2>
            </div>
            <p className="text-xs text-[#141414]/70 mt-1">
              Cross-references your published URLs and competitor articles against the generated topical architecture.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('urls')}
              className="flex items-center gap-1.5 text-xs font-mono uppercase border border-[#141414] px-3 py-1.5 bg-white hover:bg-[#141414] hover:text-[#E4E3E0] transition-colors"
            >
              <Globe className="w-3.5 h-3.5" />
              Configure URLs ({userUrlCount} User / {competitorUrlCount} Comp)
            </button>
            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 text-xs font-mono uppercase border border-[#141414] px-3 py-1.5 bg-white hover:bg-[#141414] hover:text-[#E4E3E0] transition-colors"
              title="Download full CSV gap audit"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" /> CSV
            </button>
            <button
              onClick={exportMarkdown}
              className="flex items-center gap-1.5 text-xs font-mono uppercase bg-[#141414] text-[#E4E3E0] px-3 py-1.5 hover:opacity-90 transition-opacity"
              title="Download Markdown action plan"
            >
              <Download className="w-3.5 h-3.5" /> Action Plan
            </button>
          </div>
        </div>

        {/* 5-Metric Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* Coverage rate */}
          <div className="bg-white border border-[#141414] p-3">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase opacity-60 mb-1">
              <span>Topical Coverage</span>
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-mono font-bold text-emerald-700">
                {summary.coveragePercentage}%
              </span>
              <span className="text-xs text-[#141414]/50">
                ({summary.userCoveredCount}/{summary.totalNodes})
              </span>
            </div>
            <div className="w-full h-1.5 bg-neutral-200 mt-2 overflow-hidden">
              <div
                className="h-full bg-emerald-600 transition-all duration-500"
                style={{ width: `${summary.coveragePercentage}%` }}
              />
            </div>
          </div>

          {/* Content Gaps */}
          <div className="bg-white border border-[#141414] p-3">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase opacity-60 mb-1">
              <span>Missing Gaps</span>
              <AlertTriangle className="w-3 h-3 text-amber-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-mono font-bold text-amber-700">
                {summary.userGapCount}
              </span>
              <span className="text-xs text-amber-900/60 font-mono">
                ({summary.highPriorityGapsCount} High Priority)
              </span>
            </div>
            <p className="text-[10px] text-[#141414]/50 mt-1">Unpublished architecture nodes</p>
          </div>

          {/* Competitor Advantage Threats */}
          <div className="bg-white border border-[#141414] p-3">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase opacity-60 mb-1">
              <span>Competitor Threats</span>
              <ShieldAlert className="w-3 h-3 text-rose-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-mono font-bold text-rose-700">
                {summary.competitorAdvantageCount}
              </span>
              <span className="text-xs text-rose-800/60 font-mono">Steal targets</span>
            </div>
            <p className="text-[10px] text-rose-700/60 mt-1">Competitor ranks; you lack page</p>
          </div>

          {/* Blue Ocean White-Space */}
          <div className="bg-white border border-[#141414] p-3">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase opacity-60 mb-1">
              <span>Blue Ocean</span>
              <Sparkles className="w-3 h-3 text-blue-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-mono font-bold text-blue-700">
                {summary.blueOceanCount}
              </span>
              <span className="text-xs text-blue-800/60 font-mono">White-space</span>
            </div>
            <p className="text-[10px] text-blue-700/60 mt-1">Unclaimed by both domains</p>
          </div>

          {/* Your Moat Advantage */}
          <div className="bg-white border border-[#141414] p-3">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase opacity-60 mb-1">
              <span>Your Moat</span>
              <Trophy className="w-3 h-3 text-emerald-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-mono font-bold text-emerald-800">
                {summary.userAdvantageCount}
              </span>
              <span className="text-xs text-emerald-900/60 font-mono">Unique topics</span>
            </div>
            <p className="text-[10px] text-emerald-800/60 mt-1">You cover; competitor has gap</p>
          </div>
        </div>

        {/* Sub-Tabs */}
        <div className="flex border border-[#141414] mt-5 bg-white w-fit">
          <button
            onClick={() => setActiveTab('audit')}
            className={`text-xs font-mono uppercase px-4 py-2 transition-colors flex items-center gap-2 ${
              activeTab === 'audit' ? 'bg-[#141414] text-[#E4E3E0]' : 'hover:bg-[#141414]/5'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> Content Gap Table ({gapItems.length})
          </button>
          <button
            onClick={() => setActiveTab('matrix')}
            className={`text-xs font-mono uppercase px-4 py-2 transition-colors border-l border-[#141414] flex items-center gap-2 ${
              activeTab === 'matrix' ? 'bg-[#141414] text-[#E4E3E0]' : 'hover:bg-[#141414]/5'
            }`}
          >
            <Swords className="w-3.5 h-3.5" /> Competitor 2x2 Matrix
          </button>
          <button
            onClick={() => setActiveTab('trends')}
            className={`text-xs font-mono uppercase px-4 py-2 transition-colors border-l border-[#141414] flex items-center gap-2 ${
              activeTab === 'trends' ? 'bg-[#141414] text-[#E4E3E0]' : 'hover:bg-[#141414]/5'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-blue-600" /> 12-Mo Demand Trends
          </button>
          <button
            onClick={() => setActiveTab('roadmap')}
            className={`text-xs font-mono uppercase px-4 py-2 transition-colors border-l border-[#141414] flex items-center gap-2 ${
              activeTab === 'roadmap' ? 'bg-[#141414] text-[#E4E3E0]' : 'hover:bg-[#141414]/5'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" /> Action Plan Roadmap ({summary.userGapCount} Gaps)
          </button>
          <button
            onClick={() => setActiveTab('urls')}
            className={`text-xs font-mono uppercase px-4 py-2 transition-colors border-l border-[#141414] flex items-center gap-2 ${
              activeTab === 'urls' ? 'bg-[#141414] text-[#E4E3E0]' : 'hover:bg-[#141414]/5'
            }`}
          >
            <Globe className="w-3.5 h-3.5" /> URL Input & Sitemaps
          </button>
        </div>
      </div>

      {/* 12-Month Demand Trends Tab */}
      {activeTab === 'trends' && (
        <div className="p-8 overflow-y-auto flex-1 max-w-6xl mx-auto w-full space-y-6">
          <GapDemandTrendChart
            gapItems={gapItems}
            categories={categories}
            seed={mapData.seed}
            onSelectNode={onSelectNode}
          />
        </div>
      )}

      {/* URL Input & Setup Tab */}
      {activeTab === 'urls' && (
        <div className="p-8 overflow-y-auto flex-1 max-w-5xl mx-auto w-full space-y-8">
          <div className="flex items-center justify-between border-b border-[#141414] pb-4">
            <div>
              <h3 className="font-serif italic text-2xl">URL Sources Configuration</h3>
              <p className="text-xs text-[#141414]/70">
                Paste existing URLs (one per line). The engine matches URL slugs against topical map entities.
              </p>
            </div>
            <button
              onClick={onLoadSampleUrls}
              className="flex items-center gap-1.5 text-xs font-mono uppercase border border-[#141414] px-3 py-1.5 bg-[#141414] text-[#E4E3E0] hover:opacity-90 transition-opacity"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Load Sample URLs
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* User URLs */}
            <div className="border border-[#141414] p-5 bg-[#FBFBFA] flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                  <label className="text-xs font-mono font-bold uppercase tracking-wider">
                    Your Existing URLs ({userUrlCount})
                  </label>
                </div>
                {userUrlsText && (
                  <button
                    onClick={() => onUpdateUserUrls('')}
                    className="text-[10px] font-mono uppercase text-[#141414]/50 hover:text-rose-600"
                  >
                    Clear All
                  </button>
                )}
              </div>
              <p className="text-[11px] text-[#141414]/60 mb-3">
                Paste your published blog, category, and landing page URLs or sitemap links.
              </p>
              <textarea
                value={userUrlsText}
                onChange={(e) => onUpdateUserUrls(e.target.value)}
                placeholder="https://example.com/blog/topic-name&#10;https://example.com/guides/guide-title&#10;https://example.com/services/solution"
                rows={12}
                className="w-full bg-white border border-[#141414]/30 p-3 text-xs font-mono focus:outline-none focus:border-[#141414] focus:ring-1 focus:ring-[#141414]"
              />
            </div>

            {/* Competitor URLs */}
            <div className="border border-[#141414] p-5 bg-[#FBFBFA] flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                  <label className="text-xs font-mono font-bold uppercase tracking-wider">
                    Competitor URLs ({competitorUrlCount})
                  </label>
                </div>
                {competitorUrlsText && (
                  <button
                    onClick={() => onUpdateCompetitorUrls('')}
                    className="text-[10px] font-mono uppercase text-[#141414]/50 hover:text-rose-600"
                  >
                    Clear All
                  </button>
                )}
              </div>
              <p className="text-[11px] text-[#141414]/60 mb-3">
                Paste competitor sitemap URLs or ranking articles for side-by-side gap analysis.
              </p>
              <textarea
                value={competitorUrlsText}
                onChange={(e) => onUpdateCompetitorUrls(e.target.value)}
                placeholder="https://competitor.com/complete-pillar-guide&#10;https://competitor.com/tools/comparison-tool&#10;https://competitor.com/blog/best-practices"
                rows={12}
                className="w-full bg-white border border-[#141414]/30 p-3 text-xs font-mono focus:outline-none focus:border-[#141414] focus:ring-1 focus:ring-[#141414]"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setActiveTab('audit')}
              className="bg-[#141414] text-[#E4E3E0] px-6 py-2.5 text-xs font-mono uppercase font-bold hover:opacity-90 transition-opacity"
            >
              Analyze & View Gap Table →
            </button>
          </div>
        </div>
      )}

      {/* Competitor Matrix Sub-Tab */}
      {activeTab === 'matrix' && (
        <div className="flex-1 overflow-y-auto">
          <CompetitorMatrixView
            items={gapItems}
            onSelectNode={onSelectNode}
            selectedNodeId={selectedNodeId}
            onGenerateBrief={onGenerateBrief}
          />
        </div>
      )}

      {/* Action Plan Roadmap Sub-Tab */}
      {activeTab === 'roadmap' && (
        <div className="flex-1 overflow-y-auto p-8 max-w-5xl mx-auto w-full space-y-6">
          <div className="border-b border-[#141414] pb-4">
            <h3 className="font-serif italic text-2xl">Prioritized Content Production Roadmap</h3>
            <p className="text-xs text-[#141414]/70">
              Ordered by strategic authority impact: High priority competitor gaps and pillar hubs first.
            </p>
          </div>

          {/* High Priority Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
              <h4 className="font-mono font-bold text-xs uppercase tracking-wider text-rose-950">
                Phase 1: Critical Authority Gaps ({gapItems.filter(i => !i.userCovered && i.priority === 'High').length})
              </h4>
            </div>

            <div className="space-y-2">
              {gapItems
                .filter(i => !i.userCovered && i.priority === 'High')
                .map(item => (
                  <div
                    key={item.nodeId}
                    onClick={() => onSelectNode(item.nodeId)}
                    className="border border-[#141414] p-4 bg-white hover:bg-neutral-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">{item.nodeLabel}</span>
                        <span className="text-[10px] font-mono uppercase bg-[#141414] text-[#E4E3E0] px-1.5 py-0.5">
                          {item.nodeType}
                        </span>
                        <span className="text-[10px] font-mono uppercase bg-amber-100 text-amber-800 px-1.5 py-0.5">
                          {item.category}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono uppercase text-rose-700 font-bold bg-rose-50 px-2 py-0.5 border border-rose-200">
                        {item.matrixStatus.replace('_', ' ')}
                      </span>
                    </div>

                    <p className="text-xs text-[#141414]/80 mb-2">{item.recommendedAction}</p>

                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-[#141414]/60 pt-2 border-t border-[#141414]/10">
                      <span>Target Slug: <strong className="text-blue-900">{item.targetSlug}</strong></span>
                      <span>Intent: {item.intent}</span>
                      <div className="flex items-center gap-2">
                        {onGenerateBrief && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onGenerateBrief(item);
                            }}
                            className="bg-[#141414] text-[#E4E3E0] hover:bg-blue-600 hover:text-white px-2.5 py-1 text-[10px] font-mono uppercase font-bold flex items-center gap-1 transition-colors"
                          >
                            <Sparkles className="w-3 h-3 text-amber-300" />
                            <span>AI Brief & LSI</span>
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleCovered(item.nodeId);
                          }}
                          className="text-[10px] uppercase text-emerald-700 hover:underline"
                        >
                          ✓ Mark as Published
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Medium Priority Section */}
          <div className="space-y-3 pt-6 border-t border-[#141414]/15">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <h4 className="font-mono font-bold text-xs uppercase tracking-wider text-amber-950">
                Phase 2: Supporting Cluster Nodes ({gapItems.filter(i => !i.userCovered && i.priority !== 'High').length})
              </h4>
            </div>

            <div className="space-y-2">
              {gapItems
                .filter(i => !i.userCovered && i.priority !== 'High')
                .map(item => (
                  <div
                    key={item.nodeId}
                    onClick={() => onSelectNode(item.nodeId)}
                    className="border border-[#141414]/30 p-3 bg-white hover:bg-neutral-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-xs">{item.nodeLabel}</span>
                      <span className="text-[10px] font-mono text-neutral-500">{item.category}</span>
                    </div>
                    <div className="text-[10px] font-mono text-neutral-600 flex justify-between items-center">
                      <span>Target: {item.targetSlug}</span>
                      <div className="flex items-center gap-2">
                        {onGenerateBrief && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onGenerateBrief(item);
                            }}
                            className="bg-[#141414] text-[#E4E3E0] hover:bg-blue-600 hover:text-white px-2 py-0.5 text-[9px] font-mono uppercase font-bold flex items-center gap-1 transition-colors"
                          >
                            <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                            <span>AI Brief</span>
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleCovered(item.nodeId);
                          }}
                          className="text-[10px] uppercase text-emerald-700 hover:underline"
                        >
                          ✓ Mark Published
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content Gap Audit Table */}
      {activeTab === 'audit' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Category & Attribute Filter Bar */}
          <CategoryFilterBar
            filters={filters}
            onChange={setFilters}
            categories={categories}
            totalCount={gapItems.length}
            filteredCount={filteredItems.length}
            showGapFilter={true}
          />

          {/* Table Header */}
          <div className="grid grid-cols-[130px_2fr_120px_1fr_100px_140px] px-6 py-2.5 border-b border-[#141414] bg-[#EBE9E6] text-[10px] font-mono uppercase tracking-wider sticky top-0 z-10">
            <span>Status</span>
            <span>Topic / Entity Node</span>
            <span>Category (Cluster)</span>
            <span>Matched URL</span>
            <span>Competitor</span>
            <span className="text-right">Action</span>
          </div>

          {/* Table Body */}
          <div className="flex-1 overflow-y-auto">
            {filteredItems.length === 0 ? (
              <div className="p-12 text-center text-sm font-mono opacity-50">
                No topic nodes match the current filter criteria.
              </div>
            ) : (
              filteredItems.map((item) => (
                <div
                  key={item.nodeId}
                  onClick={() => onSelectNode(item.nodeId)}
                  className={`grid grid-cols-[130px_2fr_120px_1fr_100px_140px] px-6 py-3.5 border-b border-[#141414]/15 items-center cursor-pointer transition-colors ${
                    selectedNodeId === item.nodeId
                      ? 'bg-[#141414] text-[#E4E3E0]'
                      : item.userCovered
                      ? 'hover:bg-emerald-50/40 bg-white'
                      : item.matrixStatus === 'competitor_advantage'
                      ? 'hover:bg-rose-50/60 bg-rose-50/20'
                      : 'hover:bg-amber-50/40 bg-white'
                  }`}
                >
                  {/* Status column */}
                  <div>
                    {item.userCovered ? (
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Covered
                      </span>
                    ) : (
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded ${
                        item.priority === 'High'
                          ? 'text-rose-800 bg-rose-100'
                          : 'text-amber-800 bg-amber-100'
                      }`}>
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        Gap ({item.priority})
                      </span>
                    )}
                  </div>

                  {/* Topic / Entity Label */}
                  <div className="pr-4">
                    <div className="font-bold text-xs flex items-center gap-2">
                      <span className="truncate">{item.nodeLabel}</span>
                      <span className={`text-[9px] font-mono uppercase px-1.5 py-0.2 border rounded ${
                        item.nodeType === 'pillar'
                          ? 'border-blue-500 text-blue-600'
                          : item.nodeType === 'cluster'
                          ? 'border-amber-500 text-amber-600'
                          : 'border-emerald-500 text-emerald-600'
                      }`}>
                        {item.nodeType}
                      </span>
                    </div>
                    <div className="text-[10px] opacity-70 truncate mt-0.5">
                      Intent: {item.intent} • Target: <code className="font-mono">{item.targetSlug}</code>
                    </div>
                  </div>

                  {/* Category */}
                  <div className="text-xs font-mono opacity-80 truncate">
                    <span className="border border-[#141414]/20 px-2 py-0.5 bg-neutral-100/50">
                      {item.category}
                    </span>
                  </div>

                  {/* Matched URL */}
                  <div className="pr-2">
                    {item.userMatchedUrl ? (
                      <div className="text-[10px] font-mono text-emerald-800 truncate flex items-center gap-1">
                        <span className="font-bold">({item.userMatchScore}%)</span>
                        <span className="truncate" title={item.userMatchedUrl}>
                          {item.userMatchedUrl.replace(/^https?:\/\//, '')}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[10px] font-mono text-[#141414]/40 italic">
                        No live URL mapped
                      </span>
                    )}
                  </div>

                  {/* Competitor Status */}
                  <div>
                    {item.competitorCovered ? (
                      <span className="text-[10px] font-mono text-rose-700 bg-rose-50 px-1.5 py-0.5 border border-rose-200">
                        Comp Ranks
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-blue-700 bg-blue-50 px-1.5 py-0.5 border border-blue-200">
                        Comp Gap
                      </span>
                    )}
                  </div>

                  {/* Action */}
                  <div className="text-right flex items-center justify-end gap-1.5">
                    {onGenerateBrief && !item.userCovered && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onGenerateBrief(item);
                        }}
                        className="text-[9px] font-mono uppercase px-2 py-1 bg-[#141414] text-[#E4E3E0] hover:bg-blue-600 hover:text-white flex items-center gap-1 transition-colors"
                        title="Generate AI Content Brief & LSI Keywords"
                      >
                        <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                        <span>Brief</span>
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleCovered(item.nodeId);
                      }}
                      className={`text-[10px] font-mono uppercase px-2 py-1 border transition-colors ${
                        item.userCovered
                          ? 'border-neutral-300 text-neutral-600 hover:bg-neutral-200'
                          : 'border-emerald-600 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 font-bold'
                      }`}
                      title={item.userCovered ? 'Mark as Gap' : 'Mark as Covered'}
                    >
                      {item.userCovered ? 'Mark Gap' : '✓ Covered'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  FileText, 
  Download, 
  Copy, 
  Check, 
  Settings2, 
  Target, 
  HelpCircle, 
  Link2, 
  ShieldCheck, 
  Swords, 
  Layers, 
  BookOpen, 
  Code,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  RefreshCw
} from 'lucide-react';
import { NodeGapItem, SEOEntity, SEOContentBrief, BriefOptions } from '../types';
import { 
  DEFAULT_BRIEF_OPTIONS, 
  generateContentBriefAI, 
  exportBriefAsMarkdown, 
  exportBriefAsJson, 
  copyToClipboard 
} from '../services/briefGenerator';

interface Props {
  node: NodeGapItem | SEOEntity | null;
  seedTopic: string;
  isOpen: boolean;
  onClose: () => void;
  competitorUrl?: string;
}

export default function ContentBriefModal({
  node,
  seedTopic,
  isOpen,
  onClose,
  competitorUrl
}: Props) {
  if (!isOpen || !node) return null;

  const nodeLabel = 'nodeLabel' in node ? node.nodeLabel : node.label;
  const category = ('category' in node && node.category) ? node.category : 'Topical Hub';
  const intent = node.intent || 'Informational';

  const [options, setOptions] = useState<BriefOptions>(DEFAULT_BRIEF_OPTIONS);
  const [brief, setBrief] = useState<SEOContentBrief | null>(null);
  const [loading, setLoading] = useState(false);
  const [showConfig, setShowConfig] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'keywords' | 'outline' | 'linking' | 'competitor'>('overview');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const generated = await generateContentBriefAI(node, options, seedTopic, competitorUrl);
      setBrief(generated);
      setShowConfig(false);
      setActiveTab('overview');
    } catch (err) {
      console.error('Failed to generate brief:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text: string, identifier: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedSection(identifier);
      setTimeout(() => setCopiedSection(null), 2000);
    }
  };

  const handleDownloadMarkdown = () => {
    if (!brief) return;
    const md = exportBriefAsMarkdown(brief);
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `brief-${nodeLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadJson = () => {
    if (!brief) return;
    const json = exportBriefAsJson(brief);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `brief-${nodeLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs">
      <div className="bg-white border-2 border-[#141414] w-full max-w-5xl h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-[#141414] bg-[#F4F3F0] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 text-white flex items-center justify-center border border-[#141414]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase bg-blue-100 text-blue-900 border border-blue-200 px-1.5 py-0.2">
                  AI Content Brief & LSI Generator
                </span>
                <span className="text-[10px] font-mono text-[#141414]/60">
                  {category}
                </span>
              </div>
              <h2 className="font-serif italic text-xl sm:text-2xl font-bold text-[#141414] leading-tight">
                {nodeLabel}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {brief && (
              <button
                onClick={() => setShowConfig(!showConfig)}
                className="text-xs font-mono border border-[#141414] px-3 py-1.5 bg-white hover:bg-[#141414]/5 flex items-center gap-1.5 transition-colors"
              >
                <Settings2 className="w-3.5 h-3.5" />
                <span>{showConfig ? 'Hide Choices' : 'Adjust Choices'}</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-[#141414]/10 transition-colors border border-transparent hover:border-[#141414]"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Choices Configurator Drawer / Header */}
        {showConfig && (
          <div className="p-5 border-b border-[#141414] bg-[#FAF9F7] shrink-0 space-y-4 max-h-[38vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase font-bold text-[#141414]/70 flex items-center gap-1.5">
                <Settings2 className="w-3.5 h-3.5 text-blue-600" />
                Customize Content Brief Parameters (Multiple Choices)
              </span>
              <span className="text-[11px] font-mono text-[#141414]/50">
                Tailors LSI keywords, search intent depth, and heading structure
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* Audience Choice */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase font-semibold text-[#141414]/80 block">
                  1. Target Audience Persona
                </label>
                <select
                  value={options.audience}
                  onChange={(e) => setOptions({ ...options, audience: e.target.value as any })}
                  className="w-full text-xs font-mono bg-white border border-[#141414] p-2 focus:outline-none focus:ring-1 focus:ring-blue-600"
                >
                  <option value="practitioner">Practitioner / Hands-on Operator</option>
                  <option value="beginner">Beginner / First-Time Learner</option>
                  <option value="executive">Executive / B2B Decision Maker</option>
                  <option value="technical">Technical Engineer / Architect</option>
                </select>
              </div>

              {/* Format Choice */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase font-semibold text-[#141414]/80 block">
                  2. Content Format & Archetype
                </label>
                <select
                  value={options.format}
                  onChange={(e) => setOptions({ ...options, format: e.target.value as any })}
                  className="w-full text-xs font-mono bg-white border border-[#141414] p-2 focus:outline-none focus:ring-1 focus:ring-blue-600"
                >
                  <option value="guide">Definitive Step-by-Step Guide</option>
                  <option value="comparison">Comparative Analysis & Buyer's Guide</option>
                  <option value="troubleshooting">Troubleshooting & Diagnostics</option>
                  <option value="playbook">Strategic Playbook & Best Practices</option>
                  <option value="checklist">Actionable Checklist & Cheat Sheet</option>
                </select>
              </div>

              {/* Tone of Voice */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase font-semibold text-[#141414]/80 block">
                  3. Tone of Voice
                </label>
                <select
                  value={options.tone}
                  onChange={(e) => setOptions({ ...options, tone: e.target.value as any })}
                  className="w-full text-xs font-mono bg-white border border-[#141414] p-2 focus:outline-none focus:ring-1 focus:ring-blue-600"
                >
                  <option value="authoritative">Authoritative & Methodical</option>
                  <option value="conversational">Direct & Conversational</option>
                  <option value="commercial">Commercial & Persuasive</option>
                  <option value="analytical">Analytical & Data-Driven</option>
                </select>
              </div>

              {/* Target Depth & Word Count */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase font-semibold text-[#141414]/80 block">
                  4. Word Count & Depth Scope
                </label>
                <select
                  value={options.wordCount}
                  onChange={(e) => setOptions({ ...options, wordCount: e.target.value as any })}
                  className="w-full text-xs font-mono bg-white border border-[#141414] p-2 focus:outline-none focus:ring-1 focus:ring-blue-600"
                >
                  <option value="standard">Comprehensive Standard (1,600 - 2,200 words)</option>
                  <option value="short">Snappy Tactical Post (1,000 - 1,200 words)</option>
                  <option value="pillar">Deep Topical Pillar Spec (2,800 - 3,500+ words)</option>
                </select>
              </div>

              {/* SERP Target Feature */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase font-semibold text-[#141414]/80 block">
                  5. SERP Feature Priority
                </label>
                <select
                  value={options.serpTarget}
                  onChange={(e) => setOptions({ ...options, serpTarget: e.target.value as any })}
                  className="w-full text-xs font-mono bg-white border border-[#141414] p-2 focus:outline-none focus:ring-1 focus:ring-blue-600"
                >
                  <option value="topical_depth">Deep Semantic Coverage & Entity Salience</option>
                  <option value="ai_overview">Google AI Overview Citation Priority</option>
                  <option value="featured_snippet">Featured Snippet (Paragraph/Table)</option>
                  <option value="paa_dominance">People Also Ask (PAA) Long-tail Cluster</option>
                </select>
              </div>

              {/* Competitor Angle Toggle */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase font-semibold text-[#141414]/80 block">
                  6. Competitor Counter-Strategy
                </label>
                <div className="flex items-center gap-2 p-2 bg-white border border-[#141414] h-[35px]">
                  <input
                    type="checkbox"
                    id="includeCompAngle"
                    checked={options.includeCompetitorAngle}
                    onChange={(e) => setOptions({ ...options, includeCompetitorAngle: e.target.checked })}
                    className="accent-blue-600 rounded"
                  />
                  <label htmlFor="includeCompAngle" className="text-xs font-mono cursor-pointer select-none">
                    Generate outranking edge angle
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#141414]/10">
              <span className="text-[11px] font-mono text-[#141414]/60">
                Primary Intent: <strong className="text-[#141414]">{intent}</strong> • Hub: <strong className="text-[#141414]">{seedTopic}</strong>
              </span>
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="bg-[#141414] text-[#E4E3E0] hover:bg-blue-600 hover:text-white px-5 py-2 text-xs font-mono uppercase font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing LSI & Intents...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>{brief ? 'Regenerate Brief with Choices' : 'Generate AI Content Brief'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-hidden flex flex-col bg-white">
          {!brief && !loading ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-4">
              <div className="w-14 h-14 bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center rounded-full">
                <BookOpen className="w-7 h-7" />
              </div>
              <div className="max-w-md space-y-2">
                <h3 className="font-serif italic text-2xl font-bold text-[#141414]">
                  SEO Content Brief for "{nodeLabel}"
                </h3>
                <p className="text-xs text-[#141414]/70 font-mono leading-relaxed">
                  Configure your audience persona, desired word count, and SERP focus above, then click <strong>Generate AI Content Brief</strong> to create a publication-ready brief with LSI keywords, search intent breakdown, and full heading architecture.
                </p>
              </div>
              <button
                onClick={handleGenerate}
                className="bg-[#141414] text-[#E4E3E0] hover:bg-blue-600 hover:text-white px-6 py-2.5 text-xs font-mono uppercase font-bold flex items-center gap-2 transition-colors"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Launch Analysis Now</span>
              </button>
            </div>
          ) : loading ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-4">
              <RefreshCw className="w-10 h-10 text-blue-600 animate-spin" />
              <div className="space-y-1">
                <h4 className="font-serif italic text-xl font-bold">
                  Extracting Latent Semantic Entities & Search Intents
                </h4>
                <p className="text-xs font-mono text-[#141414]/60">
                  Synthesizing People Also Ask queries, TF-IDF entities, and H2/H3 architecture...
                </p>
              </div>
            </div>
          ) : brief ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              
              {/* Secondary Navigation & Export Actions Bar */}
              <div className="p-3 border-b border-[#141414] bg-[#FBFBFA] flex flex-wrap items-center justify-between gap-2 shrink-0">
                <div className="flex items-center gap-1 overflow-x-auto">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`text-xs font-mono uppercase px-3 py-1.5 transition-colors border ${
                      activeTab === 'overview'
                        ? 'bg-[#141414] text-[#E4E3E0] border-[#141414] font-bold'
                        : 'border-transparent hover:border-[#141414]/20'
                    }`}
                  >
                    Meta & Intents
                  </button>
                  <button
                    onClick={() => setActiveTab('keywords')}
                    className={`text-xs font-mono uppercase px-3 py-1.5 transition-colors border flex items-center gap-1.5 ${
                      activeTab === 'keywords'
                        ? 'bg-[#141414] text-[#E4E3E0] border-[#141414] font-bold'
                        : 'border-transparent hover:border-[#141414]/20'
                    }`}
                  >
                    <span>LSI Keywords Bank</span>
                    <span className="text-[10px] bg-blue-100 text-blue-800 px-1 py-0.2 rounded font-bold">
                      {brief.lsiKeywords.synonymsAndVariants.length + brief.lsiKeywords.longTailQuestions.length + brief.lsiKeywords.semanticEntities.length}
                    </span>
                  </button>
                  <button
                    onClick={() => setActiveTab('outline')}
                    className={`text-xs font-mono uppercase px-3 py-1.5 transition-colors border ${
                      activeTab === 'outline'
                        ? 'bg-[#141414] text-[#E4E3E0] border-[#141414] font-bold'
                        : 'border-transparent hover:border-[#141414]/20'
                    }`}
                  >
                    Heading Outline ({brief.outline.length} Sections)
                  </button>
                  <button
                    onClick={() => setActiveTab('linking')}
                    className={`text-xs font-mono uppercase px-3 py-1.5 transition-colors border ${
                      activeTab === 'linking'
                        ? 'bg-[#141414] text-[#E4E3E0] border-[#141414] font-bold'
                        : 'border-transparent hover:border-[#141414]/20'
                    }`}
                  >
                    Linking & Technical SEO
                  </button>
                  {options.includeCompetitorAngle && (
                    <button
                      onClick={() => setActiveTab('competitor')}
                      className={`text-xs font-mono uppercase px-3 py-1.5 transition-colors border flex items-center gap-1 ${
                        activeTab === 'competitor'
                          ? 'bg-[#141414] text-[#E4E3E0] border-[#141414] font-bold'
                          : 'border-transparent hover:border-[#141414]/20'
                      }`}
                    >
                      <Swords className="w-3 h-3 text-amber-600" />
                      <span>Outranking Edge</span>
                    </button>
                  )}
                </div>

                {/* Export Buttons */}
                <div className="flex items-center gap-1.5 ml-auto">
                  <button
                    onClick={() => handleCopy(exportBriefAsMarkdown(brief), 'full-brief')}
                    className="text-xs font-mono uppercase border border-[#141414] bg-white hover:bg-[#141414]/5 px-2.5 py-1.5 flex items-center gap-1 transition-colors"
                    title="Copy full brief in markdown format"
                  >
                    {copiedSection === 'full-brief' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700 font-bold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-[#141414]/70" />
                        <span>Copy All</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleDownloadMarkdown}
                    className="text-xs font-mono uppercase border border-[#141414] bg-blue-50 text-blue-900 hover:bg-blue-100 px-2.5 py-1.5 flex items-center gap-1 transition-colors font-bold"
                    title="Download as Markdown file"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export .MD</span>
                  </button>

                  <button
                    onClick={handleDownloadJson}
                    className="text-xs font-mono uppercase border border-[#141414] bg-white hover:bg-[#141414]/5 px-2 py-1.5 flex items-center gap-1 transition-colors"
                    title="Download as JSON"
                  >
                    <Code className="w-3.5 h-3.5 text-[#141414]/70" />
                    <span>JSON</span>
                  </button>
                </div>
              </div>

              {/* Tab Content Panes */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* TAB 1: OVERVIEW & INTENTS */}
                {activeTab === 'overview' && (
                  <div className="space-y-6 max-w-4xl">
                    {/* Meta Spec Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="p-4 bg-white border border-[#141414]">
                        <span className="text-[10px] font-mono uppercase opacity-60 block mb-1">
                          Recommended Title Tag ({brief.titleTag.length} chars)
                        </span>
                        <div className="text-sm font-bold text-[#141414] leading-snug">
                          {brief.titleTag}
                        </div>
                      </div>

                      <div className="p-4 bg-white border border-[#141414]">
                        <span className="text-[10px] font-mono uppercase opacity-60 block mb-1">
                          Target URL Slug
                        </span>
                        <div className="text-sm font-mono font-bold text-blue-700 break-all">
                          {brief.targetSlug}
                        </div>
                      </div>

                      <div className="p-4 bg-white border border-[#141414]">
                        <span className="text-[10px] font-mono uppercase opacity-60 block mb-1">
                          Word Count Target
                        </span>
                        <div className="text-sm font-mono font-bold text-emerald-800">
                          {brief.wordCountEstimate}
                        </div>
                      </div>
                    </div>

                    {/* Meta Description Card */}
                    <div className="p-4 bg-white border border-[#141414] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase opacity-60">
                          Meta Description ({brief.metaDescription.length} chars)
                        </span>
                        <button
                          onClick={() => handleCopy(brief.metaDescription, 'meta')}
                          className="text-[10px] font-mono text-blue-600 hover:underline"
                        >
                          {copiedSection === 'meta' ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                      <p className="text-sm text-[#141414] font-medium leading-relaxed">
                        {brief.metaDescription}
                      </p>
                    </div>

                    {/* Search Intent Deep-Dive */}
                    <div className="p-5 bg-[#FAF9F7] border border-[#141414] space-y-4">
                      <div className="flex items-center justify-between border-b border-[#141414]/10 pb-2">
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4 text-blue-600" />
                          <h4 className="font-serif italic font-bold text-base">
                            User Search Intent & Psychological State
                          </h4>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono bg-blue-100 text-blue-900 border border-blue-200 px-2 py-0.5 font-bold">
                            Intent: {brief.intentAnalysis.primaryIntent}
                          </span>
                          <span className="text-xs font-mono bg-amber-100 text-amber-900 border border-amber-200 px-2 py-0.5 font-bold">
                            Stage: {brief.intentAnalysis.buyerJourneyStage}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <span className="text-xs font-mono font-bold text-[#141414] block">
                          Core Problem the Reader Must Solve:
                        </span>
                        <p className="text-xs font-mono text-[#141414]/80 leading-relaxed bg-white p-3 border border-[#141414]/20">
                          {brief.intentAnalysis.coreProblemToSolve}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <span className="text-xs font-mono font-bold text-[#141414] block">
                          Explicit User Questions to Directly Answer:
                        </span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {brief.intentAnalysis.specificUserQuestions.map((q, idx) => (
                            <div key={idx} className="bg-white p-3 border border-[#141414]/15 flex items-start gap-2">
                              <span className="text-blue-600 font-mono text-xs font-bold shrink-0">
                                Q{idx + 1}.
                              </span>
                              <span className="text-xs text-[#141414] leading-snug">
                                {q}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: LSI KEYWORDS BANK */}
                {activeTab === 'keywords' && (
                  <div className="space-y-6 max-w-4xl">
                    <div className="flex items-center justify-between border-b border-[#141414]/10 pb-2">
                      <div>
                        <h4 className="font-serif italic font-bold text-lg">
                          Categorized Latent Semantic Indexing (LSI) Keyword Bank
                        </h4>
                        <p className="text-xs text-[#141414]/60 font-mono">
                          Distribute these natural variants, entity co-occurrences, and questions throughout body copy and subheadings.
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          const allKw = [
                            ...brief.lsiKeywords.synonymsAndVariants,
                            ...brief.lsiKeywords.longTailQuestions,
                            ...brief.lsiKeywords.semanticEntities,
                            ...brief.lsiKeywords.commercialModifiers
                          ].join('\n');
                          handleCopy(allKw, 'all-kw');
                        }}
                        className="text-xs font-mono border border-[#141414] px-3 py-1.5 hover:bg-[#141414]/5 flex items-center gap-1.5"
                      >
                        <Copy className="w-3.5 h-3.5 text-[#141414]/70" />
                        <span>{copiedSection === 'all-kw' ? 'Copied All Keywords!' : 'Copy Entire Keyword Bank'}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* A. Semantic Synonyms */}
                      <div className="p-4 bg-white border border-[#141414] space-y-3">
                        <div className="flex items-center justify-between border-b border-[#141414]/10 pb-1.5">
                          <span className="text-xs font-mono uppercase font-bold text-blue-900">
                            A. Semantic Synonyms & Variations
                          </span>
                          <span className="text-[10px] font-mono opacity-50">
                            {brief.lsiKeywords.synonymsAndVariants.length} terms
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {brief.lsiKeywords.synonymsAndVariants.map((kw, i) => (
                            <span 
                              key={i} 
                              onClick={() => handleCopy(kw, `kw-${i}`)}
                              className="text-xs font-mono bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 px-2 py-1 rounded cursor-pointer transition-colors"
                              title="Click to copy"
                            >
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* B. Long-Tail Questions (PAA) */}
                      <div className="p-4 bg-white border border-[#141414] space-y-3">
                        <div className="flex items-center justify-between border-b border-[#141414]/10 pb-1.5">
                          <span className="text-xs font-mono uppercase font-bold text-purple-900">
                            B. Long-Tail Search Questions (PAA)
                          </span>
                          <span className="text-[10px] font-mono opacity-50">
                            {brief.lsiKeywords.longTailQuestions.length} questions
                          </span>
                        </div>
                        <div className="space-y-1.5">
                          {brief.lsiKeywords.longTailQuestions.map((q, i) => (
                            <div 
                              key={i} 
                              onClick={() => handleCopy(q, `q-${i}`)}
                              className="text-xs font-mono bg-purple-50/50 hover:bg-purple-100/60 text-purple-950 p-2 border border-purple-200 cursor-pointer transition-colors"
                              title="Click to copy"
                            >
                              • {q}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* C. Semantic Entities (TF-IDF) */}
                      <div className="p-4 bg-white border border-[#141414] space-y-3">
                        <div className="flex items-center justify-between border-b border-[#141414]/10 pb-1.5">
                          <span className="text-xs font-mono uppercase font-bold text-emerald-900">
                            C. Co-Occurring Entities (TF-IDF Salience)
                          </span>
                          <span className="text-[10px] font-mono opacity-50">
                            {brief.lsiKeywords.semanticEntities.length} entities
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {brief.lsiKeywords.semanticEntities.map((ent, i) => (
                            <span 
                              key={i} 
                              onClick={() => handleCopy(ent, `ent-${i}`)}
                              className="text-xs font-mono bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 px-2 py-1 rounded cursor-pointer font-semibold transition-colors"
                              title="Click to copy"
                            >
                              {ent}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* D. High-Intent Commercial Modifiers */}
                      <div className="p-4 bg-white border border-[#141414] space-y-3">
                        <div className="flex items-center justify-between border-b border-[#141414]/10 pb-1.5">
                          <span className="text-xs font-mono uppercase font-bold text-amber-900">
                            D. High-Intent Modifiers & Angles
                          </span>
                          <span className="text-[10px] font-mono opacity-50">
                            {brief.lsiKeywords.commercialModifiers.length} phrases
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {brief.lsiKeywords.commercialModifiers.map((mod, i) => (
                            <span 
                              key={i} 
                              onClick={() => handleCopy(mod, `mod-${i}`)}
                              className="text-xs font-mono bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 px-2 py-1 rounded cursor-pointer transition-colors"
                              title="Click to copy"
                            >
                              {mod}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: CONTENT OUTLINE */}
                {activeTab === 'outline' && (
                  <div className="space-y-4 max-w-4xl">
                    <div className="flex items-center justify-between border-b border-[#141414]/10 pb-2">
                      <div>
                        <h4 className="font-serif italic font-bold text-lg">
                          Recommended Heading Architecture (H2 & H3 Sequence)
                        </h4>
                        <p className="text-xs text-[#141414]/60 font-mono">
                          Structured for featured snippet capture and deep Google entity validation.
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          const outlineText = brief.outline.map(s => `${s.level.toUpperCase()}: ${s.heading}\nObjective: ${s.objective}\nEntities: ${s.targetEntities.join(', ')}`).join('\n\n');
                          handleCopy(outlineText, 'outline-copy');
                        }}
                        className="text-xs font-mono border border-[#141414] px-3 py-1.5 hover:bg-[#141414]/5 flex items-center gap-1.5"
                      >
                        <Copy className="w-3.5 h-3.5 text-[#141414]/70" />
                        <span>{copiedSection === 'outline-copy' ? 'Copied Outline!' : 'Copy Outline Only'}</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {brief.outline.map((sec, idx) => (
                        <div 
                          key={idx} 
                          className={`p-4 border border-[#141414] bg-white space-y-2 ${
                            sec.level === 'h3' ? 'ml-6 border-dashed bg-[#FAF9F7]' : ''
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded font-bold ${
                              sec.level === 'h2' 
                                ? 'bg-[#141414] text-[#E4E3E0]' 
                                : 'bg-neutral-200 text-neutral-800'
                            }`}>
                              {sec.level.toUpperCase()}
                            </span>
                            <h5 className="font-serif italic text-base font-bold text-[#141414]">
                              {sec.heading}
                            </h5>
                          </div>

                          <p className="text-xs text-[#141414]/80 leading-relaxed font-mono">
                            <span className="font-bold opacity-60 uppercase text-[10px]">Objective: </span>
                            {sec.objective}
                          </p>

                          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#141414]/10 text-[11px] font-mono">
                            <span className="opacity-60 text-[10px] uppercase font-bold">Target Entities:</span>
                            {sec.targetEntities.map((ent, i) => (
                              <span key={i} className="bg-neutral-100 border border-[#141414]/15 px-1.5 py-0.2 rounded text-[10px]">
                                {ent}
                              </span>
                            ))}
                          </div>

                          {sec.suggestedVisualOrCallout && (
                            <div className="text-[11px] font-mono text-blue-700 bg-blue-50/50 p-2 border border-blue-200 flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 shrink-0" />
                              <span><strong>Callout / Visual:</strong> {sec.suggestedVisualOrCallout}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 4: INTERNAL LINKING & TECHNICAL SEO */}
                {activeTab === 'linking' && (
                  <div className="space-y-6 max-w-4xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Inbound Parent Link */}
                      <div className="p-5 bg-white border border-[#141414] space-y-3">
                        <div className="flex items-center gap-2 border-b border-[#141414]/10 pb-2">
                          <Link2 className="w-4 h-4 text-amber-600" />
                          <h5 className="font-serif italic font-bold text-base">
                            Inbound Link (From Parent Pillar)
                          </h5>
                        </div>
                        <div className="space-y-1 text-xs font-mono">
                          <span className="opacity-60 text-[10px] uppercase block">Parent Hub URL:</span>
                          <span className="font-bold text-[#141414]">{brief.internalLinking.targetParent}</span>
                        </div>
                        <div className="space-y-1 text-xs font-mono">
                          <span className="opacity-60 text-[10px] uppercase block">Exact Anchor Text to Use:</span>
                          <div className="p-2.5 bg-amber-50 border border-amber-200 text-amber-950 font-bold">
                            "{brief.internalLinking.inboundAnchor}"
                          </div>
                        </div>
                      </div>

                      {/* Outbound Linking Recommendations */}
                      <div className="p-5 bg-white border border-[#141414] space-y-3">
                        <div className="flex items-center gap-2 border-b border-[#141414]/10 pb-2">
                          <ArrowRight className="w-4 h-4 text-blue-600" />
                          <h5 className="font-serif italic font-bold text-base">
                            Outbound Contextual Links
                          </h5>
                        </div>
                        <div className="space-y-2">
                          {brief.internalLinking.outboundRecommendations.map((r, i) => (
                            <div key={i} className="p-2 bg-neutral-50 border border-[#141414]/15 text-xs font-mono">
                              <span className="font-bold block text-blue-900">{r.label}</span>
                              <span className="text-[11px] text-[#141414]/70">Suggested Anchor: "{r.anchorText}"</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Technical Schema Specifications */}
                    <div className="p-5 bg-white border border-[#141414] space-y-4">
                      <div className="flex items-center justify-between border-b border-[#141414]/10 pb-2">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          <h5 className="font-serif italic font-bold text-base">
                            Technical SEO & Schema Markup Specification
                          </h5>
                        </div>
                        <span className="text-xs font-mono bg-emerald-100 text-emerald-900 border border-emerald-200 px-2 py-0.5 font-bold">
                          Schema: {brief.technicalSeo.schemaType}
                        </span>
                      </div>

                      <div className="space-y-3">
                        <span className="text-xs font-mono font-bold text-[#141414] block">
                          FAQ Schema Q&A Snippets (Optimized for AI Overviews):
                        </span>
                        {brief.technicalSeo.faqQuestions.map((f, i) => (
                          <div key={i} className="p-3 bg-[#FAF9F7] border border-[#141414]/20 space-y-1 text-xs font-mono">
                            <span className="font-bold text-[#141414] block">Q: {f.question}</span>
                            <span className="text-[#141414]/80 block">A: {f.answerSummary}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 5: COMPETITOR EDGE */}
                {activeTab === 'competitor' && (
                  <div className="space-y-5 max-w-4xl">
                    <div className="p-5 bg-white border border-[#141414] space-y-4">
                      <div className="flex items-center gap-2 border-b border-[#141414]/10 pb-2">
                        <Swords className="w-4 h-4 text-rose-600" />
                        <h4 className="font-serif italic font-bold text-lg">
                          Competitor Outranking Angle & Content Vulnerabilities
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-rose-50 border border-rose-200 space-y-2">
                          <span className="text-xs font-mono uppercase font-bold text-rose-900 block">
                            Competitor Weakness in Current SERP:
                          </span>
                          <p className="text-xs font-mono text-rose-950 leading-relaxed">
                            {brief.competitorWeaknessAndEdge.competitorFlaw}
                          </p>
                        </div>

                        <div className="p-4 bg-emerald-50 border border-emerald-200 space-y-2">
                          <span className="text-xs font-mono uppercase font-bold text-emerald-900 block">
                            Our Winning Strategic Differentiator:
                          </span>
                          <p className="text-xs font-mono text-emerald-950 leading-relaxed font-semibold">
                            {brief.competitorWeaknessAndEdge.ourWinningAngle}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer Actions */}
        <div className="p-3.5 border-t border-[#141414] bg-[#F4F3F0] flex items-center justify-between shrink-0 text-xs font-mono">
          <span className="text-[#141414]/60">
            {brief ? `Brief ID: ${brief.id.slice(0, 16)}...` : 'Ready to configure brief options'}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="border border-[#141414] px-4 py-1.5 bg-white hover:bg-[#141414]/5 transition-colors"
            >
              Close
            </button>
            {brief && (
              <button
                onClick={handleDownloadMarkdown}
                className="bg-[#141414] text-[#E4E3E0] hover:bg-blue-600 hover:text-white px-4 py-1.5 font-bold transition-colors flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Content Brief (.MD)</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

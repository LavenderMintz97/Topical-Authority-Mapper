/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Workflow, 
  Layers, 
  Network, 
  ChevronRight, 
  Download, 
  Info, 
  Link as LinkIcon,
  Circle,
  Database,
  ArrowRight,
  Loader2,
  List,
  Eye,
  FileText,
  FileCode,
  Swords,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Tag,
  ExternalLink,
  ShieldAlert,
  Sparkles,
  Trophy,
  BookOpen,
  HelpCircle,
  Compass
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { generateTopicalMap } from './services/geminiService';
import { TopicalMap, SEOEntity, NodeType, FilterOptions, NodeGapItem } from './types';
import TopicalGraph from './components/TopicalGraph';
import GapAnalysisModule from './components/GapAnalysisModule';
import CategoryFilterBar from './components/CategoryFilterBar';
import AuthorityFlowView from './components/AuthorityFlowView';
import GuidesCenter from './components/GuidesCenter';
import ContentBriefModal from './components/ContentBriefModal';
import { analyzeTopicalMapGaps, generateSampleUrls, filterGapItems } from './utils/gapAnalyzer';
import { loadPersistedState, savePersistedState, clearPersistedState } from './utils/storage';

export default function App() {
  const [savedSession] = useState(() => loadPersistedState());

  const [seed, setSeed] = useState(() => savedSession?.seed || '');
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [mapData, setMapData] = useState<TopicalMap | null>(() => savedSession?.mapData || null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(() => savedSession?.selectedNodeId || null);
  const [viewMode, setViewMode] = useState<'list' | 'graph' | 'gaps' | 'json' | 'help'>(() => {
    if (savedSession?.viewMode) return savedSession.viewMode;
    if (savedSession?.mapData) return 'graph';
    return 'help';
  });

  // URL inputs for Content Gap & Competitor Analysis
  const [userUrlsText, setUserUrlsText] = useState<string>(() => savedSession?.userUrlsText || '');
  const [competitorUrlsText, setCompetitorUrlsText] = useState<string>(() => savedSession?.competitorUrlsText || '');

  // Category and Node Filters
  const [filters, setFilters] = useState<FilterOptions>(() => savedSession?.filters || {
    searchQuery: '',
    nodeType: 'all',
    intent: 'all',
    category: 'all',
    gapStatus: 'all'
  });

  const [briefModalNode, setBriefModalNode] = useState<NodeGapItem | SEOEntity | null>(null);
  const [isBriefModalOpen, setIsBriefModalOpen] = useState(false);

  const handleOpenBriefModal = (nodeItem: NodeGapItem | SEOEntity) => {
    setBriefModalNode(nodeItem);
    setIsBriefModalOpen(true);
  };

  const [lastSavedTime, setLastSavedTime] = useState<number | null>(() => savedSession?.timestamp || null);

  // Auto-save session state to local storage whenever critical properties change
  useEffect(() => {
    if (mapData || userUrlsText || competitorUrlsText || seed) {
      const ok = savePersistedState({
        seed,
        mapData,
        userUrlsText,
        competitorUrlsText,
        filters,
        selectedNodeId,
        viewMode
      });
      if (ok) {
        setLastSavedTime(Date.now());
      }
    }
  }, [seed, mapData, userUrlsText, competitorUrlsText, filters, selectedNodeId, viewMode]);

  const handleClearSession = () => {
    if (window.confirm('Reset current topical map, URL lists, and filter states? This will clear locally cached session data.')) {
      clearPersistedState();
      setMapData(null);
      setSeed('');
      setUserUrlsText('');
      setCompetitorUrlsText('');
      setSelectedNodeId(null);
      setFilters({
        searchQuery: '',
        nodeType: 'all',
        intent: 'all',
        category: 'all',
        gapStatus: 'all'
      });
      setViewMode('help');
      setLastSavedTime(null);
    }
  };

  const loadingMessages = [
    "Initializing Semantic Neural Engine...",
    "Crawling Knowledge Graph Vertices...",
    "Clustering Entity Relationships...",
    "Calculating Topical Saturation Vector...",
    "Establishing Authority Pillar Hierarchies...",
    "Tracing Internal Linking Logic Paths...",
    "Polishing Semantic Domain Blueprint...",
    "Synthesizing Strategic Authority Map..."
  ];

  // Quick sample topics
  const sampleTopics = [
    "Vertical Farming",
    "Cold Brew Coffee",
    "Renewable Energy Grid",
    "B2B SaaS Architecture"
  ];

  // Run Gap Analysis across current mapData and URLs
  const gapAnalysis = useMemo(() => {
    if (!mapData) {
      return {
        items: [] as NodeGapItem[],
        summary: {
          totalNodes: 0,
          userCoveredCount: 0,
          userGapCount: 0,
          coveragePercentage: 0,
          competitorCoveredCount: 0,
          competitorGapCount: 0,
          competitorAdvantageCount: 0,
          blueOceanCount: 0,
          battlegroundCount: 0,
          userAdvantageCount: 0,
          highPriorityGapsCount: 0
        },
        categories: [] as string[]
      };
    }

    const userUrls = userUrlsText.split('\n').map(u => u.trim()).filter(Boolean);
    const competitorUrls = competitorUrlsText.split('\n').map(u => u.trim()).filter(Boolean);
    return analyzeTopicalMapGaps(mapData, userUrls, competitorUrls);
  }, [mapData, userUrlsText, competitorUrlsText]);

  // Quick helper to load sample URLs
  const handleLoadSampleUrls = () => {
    const samples = generateSampleUrls(seed || 'semantic-seo');
    setUserUrlsText(samples.userUrls.join('\n'));
    setCompetitorUrlsText(samples.competitorUrls.join('\n'));
  };

  // Toggle user covered status for a node
  const handleToggleCovered = (nodeId: string) => {
    const item = gapAnalysis.items.find(i => i.nodeId === nodeId);
    if (!item) return;

    if (item.userCovered) {
      if (item.userMatchedUrl) {
        setUserUrlsText(prev => prev.split('\n').filter(u => u.trim() !== item.userMatchedUrl).join('\n'));
      }
    } else {
      const newUrl = `https://example.com${item.targetSlug}`;
      setUserUrlsText(prev => (prev.trim() ? `${prev.trim()}\n${newUrl}` : newUrl));
    }
  };

  const exportReport = () => {
    if (!mapData) return;
    const report = `# Topical Authority Map: ${seed}
Generated on ${new Date().toLocaleDateString()}

## Strategic Coverage Overview
- Total Entities: ${gapAnalysis.summary.totalNodes}
- Your Covered Content: ${gapAnalysis.summary.userCoveredCount} (${gapAnalysis.summary.coveragePercentage}%)
- Identified Content Gaps: ${gapAnalysis.summary.userGapCount}
- Competitor Threats: ${gapAnalysis.summary.competitorAdvantageCount}

## Architectural Breakdown
${mapData.nodes.map(n => {
  const gapItem = gapAnalysis.items.find(i => i.nodeId === n.id);
  return `### ${n.label} (${n.type.toUpperCase()})
- Category: ${gapItem?.category || 'General'}
- Intent: ${n.intent}
- Gap Status: ${gapItem?.userCovered ? `Covered (${gapItem.userMatchedUrl})` : `Content Gap [Priority: ${gapItem?.priority || 'Medium'}]`}
- Action: ${gapItem?.recommendedAction || n.description}
- Target Slug: ${gapItem?.targetSlug || '/'}
- Internal Linking Logic: ${n.linkingLogic}
- Semantic Entities: ${n.entities.join(', ')}

`;
}).join('\n')}
`;
    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `topical-authority-${seed.toLowerCase().replace(/\s+/g, '-')}.md`;
    a.click();
  };

  const exportPDF = () => {
    if (!mapData) return;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;

    // Title
    doc.setFontSize(22);
    doc.text(`Topical Authority Map: ${seed}`, 20, y);
    y += 10;
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on ${new Date().toLocaleDateString()} • Coverage: ${gapAnalysis.summary.coveragePercentage}% (${gapAnalysis.summary.userCoveredCount}/${gapAnalysis.summary.totalNodes})`, 20, y);
    y += 15;

    mapData.nodes.forEach((node) => {
      if (y > 260) {
        doc.addPage();
        y = 20;
      }

      const gapItem = gapAnalysis.items.find(i => i.nodeId === node.id);

      doc.setFontSize(13);
      doc.setTextColor(0);
      doc.text(`${node.label} [${node.type.toUpperCase()}] - ${gapItem?.userCovered ? 'Covered' : 'Gap'}`, 20, y);
      y += 6;

      doc.setFontSize(9);
      doc.setTextColor(80);
      const desc = `Category: ${gapItem?.category || 'Core'} | Intent: ${node.intent} | Target: ${gapItem?.targetSlug || '/'}`;
      doc.text(desc, 20, y);
      y += 5;

      doc.setTextColor(50);
      const descriptionLines = doc.splitTextToSize(node.description, pageWidth - 40);
      doc.text(descriptionLines, 20, y);
      y += descriptionLines.length * 4.5 + 4;

      doc.setTextColor(30, 80, 150);
      const logicLines = doc.splitTextToSize(`Internal Linking: ${node.linkingLogic}`, pageWidth - 40);
      doc.text(logicLines, 20, y);
      y += logicLines.length * 4.5 + 8;
    });

    doc.save(`topical-report-${seed.toLowerCase().replace(/\s+/g, '-')}.pdf`);
  };

  const exportGraphAsImage = () => {
    const svg = document.querySelector('svg');
    if (!svg) return;
    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svg);
    if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
      source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    const url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);
    const a = document.createElement('a');
    a.href = url;
    a.download = `graph-${seed.toLowerCase().replace(/\s+/g, '-')}.svg`;
    a.click();
  };

  const handleGenerate = async (targetSeed?: string) => {
    const effectiveSeed = (targetSeed || seed).trim();
    if (!effectiveSeed) return;
    if (targetSeed) setSeed(targetSeed);

    setLoading(true);
    setLoadingProgress(0);
    setLoadingStatus(loadingMessages[0]);

    let currentProgress = 0;
    const progressInterval = setInterval(() => {
      currentProgress += Math.random() * 8;
      if (currentProgress > 98) currentProgress = 98;
      
      setLoadingProgress(currentProgress);
      
      const msgIndex = Math.min(
        Math.floor((currentProgress / 100) * loadingMessages.length), 
        loadingMessages.length - 1
      );
      setLoadingStatus(loadingMessages[msgIndex]);
    }, 200);

    try {
      const data = await generateTopicalMap(effectiveSeed);
      clearInterval(progressInterval);
      setLoadingProgress(100);
      setLoadingStatus("Analysis Complete. Initializing Gap & Authority Engine...");
      
      setTimeout(() => {
        setMapData(data);
        setLoading(false);
        setViewMode('list');
        setSelectedNodeId(null);

        // Pre-populate sample URLs if user hasn't supplied any yet
        if (!userUrlsText.trim()) {
          const sample = generateSampleUrls(effectiveSeed);
          setUserUrlsText(sample.userUrls.join('\n'));
          setCompetitorUrlsText(sample.competitorUrls.join('\n'));
        }
      }, 700);
    } catch (error) {
      clearInterval(progressInterval);
      setLoading(false);
      console.error("Generation failed:", error);
      alert("Failed to generate topical map. Please check your API key and try again.");
    }
  };

  const selectedNode = useMemo(() => {
    return mapData?.nodes.find(n => n.id === selectedNodeId) || null;
  }, [mapData, selectedNodeId]);

  const selectedNodeGap = useMemo(() => {
    if (!selectedNodeId) return null;
    return gapAnalysis.items.find(i => i.nodeId === selectedNodeId) || null;
  }, [gapAnalysis, selectedNodeId]);

  // Filtered nodes for the list view
  const filteredListItems = useMemo(() => {
    return filterGapItems(gapAnalysis.items, filters);
  }, [gapAnalysis.items, filters]);

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-[#141414] selection:text-[#E4E3E0] bg-[#FBFBFA]">
      {/* Header */}
      <header className="border-b border-[#141414] p-5 bg-[#E4E3E0] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Workflow className="w-8 h-8 text-[#141414]" />
            <div>
              <h1 className="text-xl font-bold uppercase tracking-tighter">Topical Authority Mapper</h1>
              <p className="text-[10px] uppercase font-mono opacity-60">Semantic SEO Architecture • Content Gap & Competitor Engine</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View switcher */}
            <div className="flex border border-[#141414] bg-white">
              <button 
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 text-[11px] font-mono uppercase px-3 py-1.5 transition-colors ${
                  viewMode === 'list' ? 'bg-[#141414] text-[#E4E3E0]' : 'hover:bg-[#141414]/10'
                }`}
              >
                <List className="w-3.5 h-3.5" /> List
              </button>

              <button 
                onClick={() => setViewMode('graph')}
                className={`flex items-center gap-1.5 text-[11px] font-mono uppercase px-3 py-1.5 transition-colors border-l border-[#141414] ${
                  viewMode === 'graph' ? 'bg-[#141414] text-[#E4E3E0]' : 'hover:bg-[#141414]/10'
                }`}
              >
                <Network className="w-3.5 h-3.5" /> Visual
              </button>

              <button 
                onClick={() => setViewMode('gaps')}
                className={`flex items-center gap-1.5 text-[11px] font-mono uppercase px-3 py-1.5 transition-colors border-l border-[#141414] ${
                  viewMode === 'gaps' ? 'bg-[#141414] text-[#E4E3E0]' : 'hover:bg-[#141414]/10'
                }`}
              >
                <Swords className="w-3.5 h-3.5" />
                <span>Gaps & Competitors</span>
                {mapData && gapAnalysis.summary.userGapCount > 0 && (
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-amber-500 text-white">
                    {gapAnalysis.summary.userGapCount}
                  </span>
                )}
              </button>

              <button 
                onClick={() => setViewMode('json')}
                className={`flex items-center gap-1.5 text-[11px] font-mono uppercase px-3 py-1.5 transition-colors border-l border-[#141414] ${
                  viewMode === 'json' ? 'bg-[#141414] text-[#E4E3E0]' : 'hover:bg-[#141414]/10'
                }`}
              >
                <Eye className="w-3.5 h-3.5" /> JSON
              </button>

              <button 
                onClick={() => setViewMode('help')}
                className={`flex items-center gap-1.5 text-[11px] font-mono uppercase px-3 py-1.5 transition-colors border-l border-[#141414] ${
                  viewMode === 'help' ? 'bg-[#141414] text-[#E4E3E0]' : 'hover:bg-[#141414]/10'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" /> Guides & Help
              </button>
            </div>

            {/* Auto-saved badge and Reset button */}
            {lastSavedTime && (
              <div className="hidden lg:flex items-center gap-2">
                <span 
                  className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-2 py-1 rounded" 
                  title="Autosaved to local storage. Your session will resume automatically next time."
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  <span>Autosaved</span>
                </span>
                {(mapData || seed || userUrlsText) && (
                  <button
                    onClick={handleClearSession}
                    title="Clear cached session data and start fresh"
                    className="text-[10px] font-mono uppercase border border-neutral-300 hover:border-[#141414] hover:bg-neutral-200 px-2 py-1 transition-colors text-neutral-600"
                  >
                    Reset
                  </button>
                )}
              </div>
            )}

            {/* Export buttons */}
            {mapData && (
              <div className="flex gap-2">
                <div className="flex border border-[#141414] overflow-hidden">
                  <button 
                    onClick={exportReport}
                    title="Download Markdown Report"
                    className="flex items-center gap-1 text-[10px] font-mono uppercase bg-white px-2.5 py-1.5 hover:bg-[#141414] hover:text-[#E4E3E0] transition-all border-r border-[#141414]"
                  >
                    <FileCode className="w-3 h-3" /> MD
                  </button>
                  <button 
                    onClick={exportPDF}
                    title="Download PDF Report"
                    className="flex items-center gap-1 text-[10px] font-mono uppercase bg-white px-2.5 py-1.5 hover:bg-[#141414] hover:text-[#E4E3E0] transition-all"
                  >
                    <FileText className="w-3 h-3" /> PDF
                  </button>
                </div>

                {viewMode === 'graph' && (
                  <button 
                    onClick={exportGraphAsImage}
                    className="flex items-center gap-1.5 text-[10px] font-mono uppercase border border-[#141414] bg-white px-2.5 py-1.5 hover:bg-[#141414] hover:text-[#E4E3E0] transition-all"
                  >
                    <Download className="w-3 h-3" /> SVG
                  </button>
                )}

                <button 
                  onClick={() => {
                    const blob = new Blob([JSON.stringify(mapData, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `topical-map-${seed.toLowerCase().replace(/\s+/g, '-')}.json`;
                    a.click();
                  }}
                  className="flex items-center gap-1 text-[10px] font-mono uppercase bg-[#141414] text-[#E4E3E0] px-3 py-1.5 hover:opacity-90 transition-opacity"
                >
                  <Download className="w-3 h-3" /> Data
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero / Input Section */}
      <section className="bg-[#E4E3E0] border-b border-[#141414] relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none select-none overflow-hidden">
          <div className="text-[12rem] font-serif italic absolute -top-20 -left-20">Authority</div>
          <div className="text-[10rem] font-mono absolute -bottom-20 -right-20">01010101</div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 py-10 relative z-10">
          <div className="max-w-3xl">
            <motion.h2 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-4xl md:text-5xl font-serif italic mb-4 leading-tight"
            >
              Architect your Semantic Authority & Close Content Gaps.
            </motion.h2>
            <p className="text-xs text-[#141414]/70 mb-4 font-mono">
              Build high-ranking topic clusters, trace internal linking authority flow, and find what competitors publish.
            </p>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-30" />
                <input 
                  type="text" 
                  value={seed}
                  onChange={(e) => setSeed(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                  placeholder="Define your Seed Entity (e.g. 'Vertical Farming', 'Cold Brew Coffee')"
                  className="w-full bg-white border border-[#141414] py-3.5 pl-12 pr-4 text-base focus:outline-none focus:ring-2 focus:ring-[#141414]/10 transition-all font-serif"
                />
              </div>
              <button 
                onClick={() => handleGenerate()}
                disabled={loading || !seed}
                className="bg-[#141414] text-[#E4E3E0] px-7 font-bold uppercase tracking-widest disabled:opacity-50 flex items-center gap-3 active:scale-95 transition-transform text-xs"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Network className="w-4 h-4" /> Analyze</>}
              </button>
            </div>

            {/* Beginner Quick-Launch Chips */}
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-[10px] font-mono uppercase opacity-50 flex items-center gap-1">
                <Compass className="w-3 h-3" /> Quick Examples:
              </span>
              {sampleTopics.map((topic, i) => (
                <button
                  key={i}
                  onClick={() => handleGenerate(topic)}
                  className="text-[11px] font-mono bg-white/80 hover:bg-white border border-[#141414]/20 px-2.5 py-0.5 rounded-full transition-all hover:border-[#141414] active:scale-95"
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden relative">
        {loading && (
          <div className="absolute inset-0 bg-[#E4E3E0]/95 backdrop-blur-md z-[100] flex flex-col items-center justify-center p-12 overflow-hidden">
            <div className="relative w-full max-w-xl">
              <div className="flex justify-between items-end mb-4">
                <div>
                  <h3 className="text-3xl font-serif italic mb-2">Analyzing Topic Graph</h3>
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <AnimatePresence mode="wait">
                      <motion.span 
                        key={loadingStatus}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="text-xs font-mono uppercase tracking-widest opacity-60"
                      >
                        {loadingStatus}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                </div>
                <span className="text-4xl font-mono opacity-20 tracking-tighter">{Math.floor(loadingProgress)}%</span>
              </div>
              
              <div className="w-full h-px bg-[#141414]/10 relative overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${loadingProgress}%` }}
                  className="absolute top-0 left-0 h-full bg-[#141414]"
                />
              </div>
            </div>
          </div>
        )}

        {/* View Mode: Guides & Help Center (Always accessible) */}
        {viewMode === 'help' ? (
          <div className="flex-1 flex overflow-hidden">
            <GuidesCenter />
          </div>
        ) : !mapData ? (
          /* Empty State Landing Screen */
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-8 md:p-16 text-center bg-[#FBFBFA]"
          >
            <div className="max-w-xl space-y-6">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#E4E3E0] border border-[#141414]/20 flex items-center justify-center">
                <Workflow className="w-8 h-8 text-[#141414]" />
              </div>

              <div>
                <h3 className="text-2xl font-serif italic mb-2">Ready to generate your Topical Architecture?</h3>
                <p className="text-xs text-[#141414]/70 leading-relaxed font-sans max-w-md mx-auto">
                  Type any industry, keyword, or product into the search bar above to create a full pillar-and-cluster semantic map with internal linking directives.
                </p>
              </div>

              {/* Quick Template Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                {sampleTopics.map((topic, i) => (
                  <button
                    key={i}
                    onClick={() => handleGenerate(topic)}
                    className="p-3.5 border border-[#141414]/20 bg-white hover:border-[#141414] hover:shadow-sm transition-all group"
                  >
                    <div className="flex items-center justify-between text-xs font-bold mb-1">
                      <span>{topic}</span>
                      <ArrowRight className="w-3 h-3 text-[#141414]/40 group-hover:translate-x-1 transition-transform" />
                    </div>
                    <p className="text-[10px] text-[#141414]/60 font-mono">Click to analyze full topic map & gaps</p>
                  </button>
                ))}
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setViewMode('help')}
                  className="inline-flex items-center gap-1.5 text-xs font-mono uppercase underline text-[#141414]/70 hover:text-[#141414]"
                >
                  <BookOpen className="w-3.5 h-3.5" /> Read the 3-Minute Beginner's Guide
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="flex-1 flex overflow-hidden">
            {/* VIEW 1: Architecture List View with Category and Gap Filters */}
            {viewMode === 'list' && (
              <div className="flex-1 border-r border-[#141414] flex flex-col overflow-hidden bg-white">
                {/* Category Filter Bar */}
                <CategoryFilterBar
                  filters={filters}
                  onChange={setFilters}
                  categories={gapAnalysis.categories}
                  totalCount={mapData.nodes.length}
                  filteredCount={filteredListItems.length}
                  showGapFilter={true}
                />

                {/* List Header */}
                <div className="grid grid-cols-[110px_2fr_130px_110px_90px_40px] px-6 py-3 border-b border-[#141414] bg-[#F0EFED] text-[10px] font-mono uppercase tracking-wider sticky top-0 z-10">
                  <span>Type</span>
                  <span>Node / Topic</span>
                  <span>Category</span>
                  <span>Status</span>
                  <span>Intent</span>
                  <span></span>
                </div>

                {/* List Rows */}
                <div className="flex-1 overflow-y-auto">
                  {filteredListItems.length === 0 ? (
                    <div className="p-12 text-center text-sm font-mono opacity-50">
                      No topic nodes match the current filter selection.
                    </div>
                  ) : (
                    filteredListItems.map((item) => (
                      <div 
                        key={item.nodeId}
                        onClick={() => setSelectedNodeId(item.nodeId)}
                        id={`node-${item.nodeId}`}
                        className={`grid grid-cols-[110px_2fr_130px_110px_90px_40px] px-6 py-4 border-b border-[#141414]/10 cursor-pointer items-center transition-colors ${
                          selectedNodeId === item.nodeId
                            ? 'bg-[#141414] text-[#E4E3E0]'
                            : 'hover:bg-[#141414]/5 bg-white'
                        }`}
                      >
                        <span className="text-[10px] font-mono uppercase opacity-80 flex items-center">
                          <Circle className={`w-2 h-2 mr-2 fill-current ${
                            item.nodeType === 'pillar' ? 'text-blue-500' : item.nodeType === 'cluster' ? 'text-amber-500' : 'text-emerald-500'
                          }`} />
                          {item.nodeType}
                        </span>

                        <span className="font-bold text-xs flex items-center gap-2 pr-2">
                          <span className="truncate">{item.nodeLabel}</span>
                          {item.nodeType === 'pillar' && <Database className="w-3 h-3 opacity-30 shrink-0" />}
                        </span>

                        <span className="text-[11px] font-mono opacity-70 truncate">
                          {item.category}
                        </span>

                        <div>
                          {item.userCovered ? (
                            <span className="text-[9px] font-mono uppercase text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 border border-emerald-200">
                              ✓ Covered
                            </span>
                          ) : (
                            <span className="text-[9px] font-mono uppercase text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 border border-amber-200">
                              ⚠ Gap ({item.priority})
                            </span>
                          )}
                        </div>

                        <span className="text-xs opacity-70 italic">{item.intent}</span>

                        <span className="flex items-center justify-end">
                          <ChevronRight className={`w-4 h-4 transition-transform ${selectedNodeId === item.nodeId ? 'translate-x-1' : ''}`} />
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* VIEW 2: Visual Graph with Live Gap & Category Filters */}
            {viewMode === 'graph' && (
              <div className="flex-1 border-r border-[#141414] flex flex-col overflow-hidden bg-white">
                {/* Category Filter on Graph */}
                <CategoryFilterBar
                  filters={filters}
                  onChange={setFilters}
                  categories={gapAnalysis.categories}
                  totalCount={mapData.nodes.length}
                  filteredCount={filteredListItems.length}
                  showGapFilter={true}
                />

                <div className="flex-1 relative overflow-hidden">
                  <TopicalGraph 
                    data={mapData} 
                    onSelectNode={setSelectedNodeId} 
                    selectedNodeId={selectedNodeId}
                    filters={filters}
                    gapItems={gapAnalysis.items}
                    showGapOverlayDefault={true}
                  />
                </div>
              </div>
            )}

            {/* VIEW 3: Content Gap & Competitor Audit Module */}
            {viewMode === 'gaps' && (
              <div className="flex-1 border-r border-[#141414] flex flex-col overflow-hidden">
                <GapAnalysisModule
                  mapData={mapData}
                  gapItems={gapAnalysis.items}
                  summary={gapAnalysis.summary}
                  categories={gapAnalysis.categories}
                  userUrlsText={userUrlsText}
                  competitorUrlsText={competitorUrlsText}
                  onUpdateUserUrls={setUserUrlsText}
                  onUpdateCompetitorUrls={setCompetitorUrlsText}
                  onLoadSampleUrls={handleLoadSampleUrls}
                  onSelectNode={setSelectedNodeId}
                  selectedNodeId={selectedNodeId}
                  onToggleCovered={handleToggleCovered}
                  onGenerateBrief={handleOpenBriefModal}
                />
              </div>
            )}

            {/* VIEW 4: JSON Mode */}
            {viewMode === 'json' && (
              <div className="flex-1 bg-[#1a1a1a] text-[#a9b7c6] p-8 font-mono text-xs overflow-auto selection:bg-[#2b2b2b]">
                <pre className="whitespace-pre-wrap">
                  {JSON.stringify({ topicalMap: mapData, gapAnalysis }, null, 2)}
                </pre>
              </div>
            )}

            {/* Sidebar: Entity Details, Authority Flow (D3 Mini-Graph), and Gap Status */}
            <aside className={`w-[420px] bg-[#F0EFED] border-l border-[#141414] flex flex-col transition-all z-20 shrink-0 ${
              selectedNode ? 'translate-x-0' : 'hidden'
            }`}>
              {selectedNode && (
                <>
                  <div className="p-5 border-b border-[#141414] flex justify-between items-center bg-[#E4E3E0]">
                    <h3 className="text-xs font-mono uppercase tracking-widest opacity-60">Entity Blueprint</h3>
                    <button 
                      onClick={() => setSelectedNodeId(null)} 
                      className="p-1 hover:bg-[#141414]/10 transition-colors border border-transparent hover:border-[#141414]/20"
                      title="Close Inspector"
                    >
                      <ChevronRight className="w-4 h-4 rotate-180" />
                    </button>
                  </div>

                  <div className="p-6 space-y-6 overflow-y-auto flex-1">
                    {/* Node Title & Tags */}
                    <div>
                      <h4 className="text-3xl font-serif italic mb-2 leading-tight">{selectedNode.label}</h4>
                      <div className="flex flex-wrap gap-2">
                        <span className="text-[10px] font-mono uppercase border border-[#141414] px-2 py-0.5 rounded-full bg-white">
                          {selectedNode.type}
                        </span>
                        <span className="text-[10px] font-mono uppercase border border-[#141414] px-2 py-0.5 rounded-full bg-white">
                          {selectedNode.intent}
                        </span>
                        {selectedNodeGap && (
                          <span className="text-[10px] font-mono uppercase border border-[#141414]/40 px-2 py-0.5 rounded-full bg-neutral-100">
                            {selectedNodeGap.category}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Content Gap & Competitor Status Card */}
                    {selectedNodeGap && (
                      <div className={`p-4 border border-[#141414] ${
                        selectedNodeGap.userCovered 
                          ? 'bg-emerald-50/50' 
                          : selectedNodeGap.matrixStatus === 'competitor_advantage'
                          ? 'bg-rose-50/50'
                          : 'bg-amber-50/50'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-mono uppercase tracking-wider font-bold">
                            Content Coverage Status
                          </span>
                          <button
                            onClick={() => handleToggleCovered(selectedNode.id)}
                            className="text-[10px] font-mono uppercase underline hover:opacity-75"
                          >
                            {selectedNodeGap.userCovered ? 'Mark as Gap' : '✓ Mark as Covered'}
                          </button>
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                          {selectedNodeGap.userCovered ? (
                            <span className="flex items-center gap-1 text-xs font-bold text-emerald-800">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Published ({selectedNodeGap.userMatchScore}% match)
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs font-bold text-amber-900">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                              Content Gap [{selectedNodeGap.priority} Priority]
                            </span>
                          )}
                        </div>

                        {selectedNodeGap.userMatchedUrl && (
                          <div className="text-[11px] font-mono text-emerald-900 truncate mb-1 flex items-center gap-1">
                            <ExternalLink className="w-3 h-3 shrink-0" />
                            <span className="truncate">{selectedNodeGap.userMatchedUrl}</span>
                          </div>
                        )}

                        <div className="text-[11px] text-[#141414]/80 mt-2 pt-2 border-t border-[#141414]/10">
                          <strong>Action:</strong> {selectedNodeGap.recommendedAction}
                        </div>

                        <div className="text-[10px] font-mono text-[#141414]/60 mt-1">
                          Target Slug: <code>{selectedNodeGap.targetSlug}</code>
                        </div>
                      </div>
                    )}

                    {/* Secondary AI Analysis: Content Brief & LSI Keywords */}
                    <div className="p-4 bg-gradient-to-br from-blue-50/70 to-indigo-50/40 border border-[#141414] space-y-2.5 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase font-bold text-blue-900 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                          AI Content Brief & LSI
                        </span>
                        <span className="text-[9px] font-mono uppercase bg-blue-100 text-blue-800 border border-blue-200 px-1.5 py-0.2 rounded font-semibold">
                          Custom Choices
                        </span>
                      </div>
                      <p className="text-[11px] text-[#141414]/75 font-mono leading-relaxed">
                        Generate categorized LSI keywords, search intent breakdown, PAA questions, and heading architecture tailored to your audience & format.
                      </p>
                      <button
                        onClick={() => handleOpenBriefModal(selectedNodeGap || selectedNode)}
                        className="w-full bg-[#141414] text-[#E4E3E0] hover:bg-blue-600 hover:text-white p-2 text-xs font-mono uppercase font-bold flex items-center justify-center gap-2 transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>Generate AI Content Brief</span>
                      </button>
                    </div>

                    {/* Architecture Description */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-[10px] font-mono opacity-50 uppercase tracking-wider">
                        <Info className="w-3 h-3" /> Architecture Overview
                      </div>
                      <p className="text-xs leading-relaxed text-[#141414]/80">{selectedNode.description}</p>
                    </div>

                    {/* Authority Flow D3 Force-Directed Graph Visualizer */}
                    <AuthorityFlowView
                      mapData={mapData}
                      node={selectedNode}
                      onSelectNode={setSelectedNodeId}
                    />

                    {/* Semantic Entity Connections */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-[10px] font-mono opacity-50 uppercase tracking-wider">
                        <Layers className="w-3 h-3" /> Semantic Entities ({selectedNode.entities.length})
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedNode.entities.map((ent, i) => (
                          <span key={i} className="text-[10px] font-mono border border-[#141414]/20 bg-white px-2 py-1 flex items-center gap-1">
                            <Circle className="w-1.5 h-1.5 fill-[#141414]" />
                            {ent}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Internal Linking Strategy */}
                    <div className="space-y-3 bg-white border border-[#141414] p-4">
                      <div className="flex items-center gap-2 text-[10px] font-mono opacity-50 uppercase tracking-wider">
                        <LinkIcon className="w-3 h-3" /> Internal Linking Directives
                      </div>
                      <p className="text-xs leading-relaxed font-serif italic text-blue-900">
                        {selectedNode.linkingLogic}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </aside>
          </div>
        )}
      </main>

      {/* Footer / Status Bar */}
      <footer className="bg-[#141414] text-[#E4E3E0] p-2.5 flex flex-wrap items-center justify-between text-[10px] font-mono uppercase tracking-widest px-6">
        <div className="flex items-center gap-4">
          <span>Architect Engine: Operational</span>
          <span className="opacity-40">|</span>
          <span>Coverage Engine: Active</span>
          <span className="opacity-40">|</span>
          <span>Model: Gemini 3.1 Pro</span>
        </div>
        {mapData && (
          <div className="opacity-70">
            {gapAnalysis.summary.userCoveredCount} Covered • {gapAnalysis.summary.userGapCount} Gaps • {gapAnalysis.summary.competitorAdvantageCount} Competitor Threats
          </div>
        )}
      </footer>

      {/* AI Content Brief & LSI Generator Modal */}
      <ContentBriefModal
        isOpen={isBriefModalOpen}
        onClose={() => setIsBriefModalOpen(false)}
        node={briefModalNode}
        seedTopic={mapData?.seed || seed || 'Topical Architecture'}
        competitorUrl={competitorUrlsText ? competitorUrlsText.split('\n')[0]?.trim() : undefined}
      />
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
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
  FileCode
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { generateTopicalMap } from './services/geminiService';
import { TopicalMap, SEOEntity, NodeType } from './types';
import TopicalGraph from './components/TopicalGraph';

export default function App() {
  const [seed, setSeed] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [mapData, setMapData] = useState<TopicalMap | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'graph' | 'json' | 'help'>('help');

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

  const exportReport = () => {
    if (!mapData) return;
    const report = `# Topical Authority Map: ${seed}
Generated on ${new Date().toLocaleDateString()}

## Strategic Overview
${mapData.nodes.map(n => `### ${n.label} (${n.type})
${n.description}
- Intent: ${n.intent}
- Internal Linking: ${n.linkingLogic}
- Entities: ${n.entities.join(', ')}

`).join('\n')}
`;
    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${seed.toLowerCase().replace(/\s+/g, '-')}.md`;
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
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 20, y);
    y += 20;

    mapData.nodes.forEach((node) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }

      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text(`${node.label} [${node.type.toUpperCase()}]`, 20, y);
      y += 7;

      doc.setFontSize(10);
      doc.setTextColor(50);
      const descriptionLines = doc.splitTextToSize(node.description, pageWidth - 40);
      doc.text(descriptionLines, 20, y);
      y += descriptionLines.length * 5 + 5;

      doc.setFontSize(9);
      doc.setTextColor(80);
      doc.text(`Intent: ${node.intent}`, 20, y);
      y += 5;
      
      const logicLines = doc.splitTextToSize(`Logic: ${node.linkingLogic}`, pageWidth - 40);
      doc.text(logicLines, 20, y);
      y += logicLines.length * 5 + 10;
    });

    doc.save(`report-${seed.toLowerCase().replace(/\s+/g, '-')}.pdf`);
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

  const handleGenerate = async () => {
    if (!seed.trim()) return;
    setLoading(true);
    setLoadingProgress(0);
    setLoadingStatus(loadingMessages[0]);

    // Fast-moving simulation that reacts to the actual API call
    let currentProgress = 0;
    const progressInterval = setInterval(() => {
      currentProgress += Math.random() * 8;
      if (currentProgress > 98) currentProgress = 98;
      
      setLoadingProgress(currentProgress);
      
      // Select message based on current progress percentage
      const msgIndex = Math.min(
        Math.floor((currentProgress / 100) * loadingMessages.length), 
        loadingMessages.length - 1
      );
      setLoadingStatus(loadingMessages[msgIndex]);
    }, 200);

    try {
      const data = await generateTopicalMap(seed);
      clearInterval(progressInterval);
      setLoadingProgress(100);
      setLoadingStatus("Analysis Complete. Rendering Map...");
      
      setTimeout(() => {
        setMapData(data);
        setLoading(false);
        setViewMode('list');
        setSelectedNodeId(null);
      }, 800);
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

  const sortedNodes = useMemo(() => {
    if (!mapData) return [];
    const order: NodeType[] = ['pillar', 'cluster', 'supporting'];
    return [...mapData.nodes].sort((a, b) => {
      if (a.type !== b.type) {
        return order.indexOf(a.type) - order.indexOf(b.type);
      }
      return a.label.localeCompare(b.label);
    });
  }, [mapData]);

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-[#141414] selection:text-[#E4E3E0]">
      {/* Header */}
      <header className="border-b border-[#141414] p-6 bg-[#E4E3E0] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Workflow className="w-8 h-8" />
            <div>
              <h1 className="text-xl font-bold uppercase tracking-tighter">Topical Authority Mapper</h1>
              <p className="text-[10px] uppercase font-mono opacity-50">Semantic SEO Architecture v1.0 / Entity-Based SEO</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex border border-[#141414]">
               <button 
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 text-[11px] font-mono uppercase px-3 py-1.5 transition-colors ${viewMode === 'list' ? 'bg-[#141414] text-[#E4E3E0]' : 'hover:bg-[#141414]/10'}`}
               >
                <List className="w-3 h-3" /> List
               </button>
               <button 
                onClick={() => setViewMode('graph')}
                className={`flex items-center gap-2 text-[11px] font-mono uppercase px-3 py-1.5 transition-colors border-l border-[#141414] ${viewMode === 'graph' ? 'bg-[#141414] text-[#E4E3E0]' : 'hover:bg-[#141414]/10'}`}
               >
                <Network className="w-3 h-3" /> Visual
               </button>
               <button 
                onClick={() => setViewMode('json')}
                className={`flex items-center gap-2 text-[11px] font-mono uppercase px-3 py-1.5 transition-colors border-l border-[#141414] ${viewMode === 'json' ? 'bg-[#141414] text-[#E4E3E0]' : 'hover:bg-[#141414]/10'}`}
               >
                <Eye className="w-3 h-3" /> JSON
               </button>
               <button 
                onClick={() => setViewMode('help')}
                className={`flex items-center gap-2 text-[11px] font-mono uppercase px-3 py-1.5 transition-colors border-l border-[#141414] ${viewMode === 'help' ? 'bg-[#141414] text-[#E4E3E0]' : 'hover:bg-[#141414]/10'}`}
               >
                <Info className="w-3 h-3" /> Help
               </button>
             </div>
             {mapData && (
               <div className="flex gap-2">
                 <div className="flex border border-[#141414] overflow-hidden">
                    <button 
                      onClick={exportReport}
                      title="Download Markdown Report"
                      className="flex items-center gap-2 text-[10px] font-mono uppercase bg-white px-3 py-1.5 hover:bg-[#141414] hover:text-[#E4E3E0] transition-all border-r border-[#141414]"
                    >
                      <FileCode className="w-3 h-3" />
                      MD
                    </button>
                    <button 
                      onClick={exportPDF}
                      title="Download PDF Report"
                      className="flex items-center gap-2 text-[10px] font-mono uppercase bg-white px-3 py-1.5 hover:bg-[#141414] hover:text-[#E4E3E0] transition-all"
                    >
                      <FileText className="w-3 h-3" />
                      PDF
                    </button>
                 </div>

                 {viewMode === 'graph' && (
                  <button 
                    onClick={exportGraphAsImage}
                    className="flex items-center gap-2 text-[10px] font-mono uppercase border border-[#141414] px-3 py-1.5 hover:bg-[#141414] hover:text-[#E4E3E0] transition-all"
                  >
                    <Download className="w-3 h-3" />
                    SVG
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
                  className="flex items-center gap-2 text-[10px] font-mono uppercase bg-[#141414] text-[#E4E3E0] px-3 py-1.5 hover:opacity-90 transition-opacity"
                 >
                  <Download className="w-3 h-3" />
                  Data
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
        
        <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
          <div className="max-w-3xl">
            <motion.h2 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-6xl font-serif italic mb-8 leading-tight"
            >
              Architect your <br/> Semantic Authority.
            </motion.h2>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-30" />
                <input 
                  type="text" 
                  value={seed}
                  onChange={(e) => setSeed(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                  placeholder="Define your Seed Entity (e.g. 'Vertical Farming')"
                  className="w-full bg-white border border-[#141414] py-5 pl-12 pr-4 text-xl focus:outline-none focus:ring-2 focus:ring-[#141414]/10 transition-all font-serif"
                />
              </div>
              <button 
                onClick={handleGenerate}
                disabled={loading || !seed}
                className="bg-[#141414] text-[#E4E3E0] px-10 font-bold uppercase tracking-widest disabled:opacity-50 flex items-center gap-3 active:scale-95 transition-transform"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Network className="w-5 h-5" /> Analyze</>}
              </button>
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

              <div className="mt-12 grid grid-cols-2 gap-8 opacity-20 select-none">
                <div className="space-y-2">
                  <div className="h-2 bg-[#141414] w-3/4"></div>
                  <div className="h-2 bg-[#141414] w-1/2"></div>
                  <div className="h-2 bg-[#141414] w-2/3"></div>
                </div>
                <div className="space-y-4">
                  <div className="w-8 h-8 rounded-full border border-[#141414]"></div>
                  <div className="w-8 h-8 rounded-full border border-[#141414]"></div>
                </div>
              </div>

              <motion.div 
                animate={{ 
                  scale: [1, 1.1, 1],
                  opacity: [0.1, 0.2, 0.1]
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-24 -right-24"
              >
                <Network className="w-48 h-48" />
              </motion.div>
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {!mapData ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex items-center justify-center p-12 text-center"
            >
              <div className="max-w-md">
                <Network className="w-16 h-16 mx-auto mb-6 opacity-10" />
                <p className="text-sm opacity-50 uppercase tracking-widest font-mono">
                  Enter a seed topic to generate a semantic architecture blueprint.
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="flex-1 flex overflow-hidden">
              {/* Architecture List / Data Grid */}
              <div className={`flex-1 border-r border-[#141414] overflow-y-auto ${viewMode !== 'list' ? 'hidden' : ''}`}>
                <div className="p-6 sticky top-0 bg-[#E4E3E0] border-b border-[#141414] z-10 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase bg-[#141414] text-[#E4E3E0] px-2 py-0.5 rounded">
                      <Layers className="w-3 h-3" />
                      {mapData.nodes.length} Nodes
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase border border-[#141414] px-2 py-0.5 rounded">
                      <LinkIcon className="w-3 h-3" />
                      {mapData.links.length} Links
                    </div>
                  </div>
                  <p className="font-serif italic text-xs">Scroll to navigate the architecture hierarchy</p>
                </div>

                <div className="min-w-full">
                  {/* Column Headers */}
                  <div className="grid grid-cols-[80px_2fr_1fr_1fr_40px] px-6 py-3 border-b border-[#141414] bg-[#F0EFED] sticky top-[73px] z-10">
                    <span className="col-header">Type</span>
                    <span className="col-header">Node/Topic</span>
                    <span className="col-header">Intent</span>
                    <span className="col-header">Connections</span>
                    <span></span>
                  </div>

                  {/* Rows */}
                  {sortedNodes.map((node) => (
                    <div 
                      key={node.id}
                      onClick={() => setSelectedNodeId(node.id)}
                      id={`node-${node.id}`}
                      className={`grid grid-cols-[80px_2fr_1fr_1fr_40px] px-6 py-4 data-row ${selectedNodeId === node.id ? 'bg-[#141414] text-[#E4E3E0]' : ''}`}
                    >
                      <span className="text-[10px] font-mono uppercase opacity-70 flex items-center">
                        <Circle className={`w-2 h-2 mr-2 fill-current ${node.type === 'pillar' ? 'text-blue-500' : node.type === 'cluster' ? 'text-amber-500' : 'text-emerald-500'}`} />
                        {node.type}
                      </span>
                      <span className="font-bold flex items-center gap-2">
                        {node.label}
                        {node.type === 'pillar' && <Database className="w-3 h-3 opacity-30" />}
                      </span>
                      <span className="text-xs opacity-70 flex items-center italic">{node.intent}</span>
                      <span className="text-[10px] font-mono flex items-center opacity-70">{node.entities.length} entities</span>
                      <span className="flex items-center justify-end">
                        <ChevronRight className={`w-4 h-4 transition-transform ${selectedNodeId === node.id ? 'translate-x-1' : ''}`} />
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Visual Graph View */}
              {viewMode === 'graph' && (
                <div className="flex-1 border-r border-[#141414] relative overflow-hidden bg-white">
                   <TopicalGraph 
                    data={mapData} 
                    onSelectNode={setSelectedNodeId} 
                    selectedNodeId={selectedNodeId} 
                   />
                </div>
              )}

              {/* JSON Mode */}
              {viewMode === 'json' && (
                <div className="flex-1 bg-[#1a1a1a] text-[#a9b7c6] p-8 font-mono text-xs overflow-auto selection:bg-[#2b2b2b]">
                  <pre className="whitespace-pre-wrap">
                    {JSON.stringify(mapData, null, 2)}
                  </pre>
                </div>
              )}

              {/* Help & Guidelines */}
              {viewMode === 'help' && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex-1 border-r border-[#141414] overflow-y-auto bg-[#E4E3E0] p-12"
                >
                  <div className="max-w-4xl mx-auto space-y-16">
                    <section>
                      <h2 className="text-7xl font-serif italic mb-6 tracking-tighter">Guidelines for Semantic Dominance.</h2>
                      <p className="text-2xl leading-relaxed text-[#141414]/70 font-light">
                        SEO is no longer about keywords; it is about **Entity-Attribute Relationships**. This architect solves for topical saturation by mapping the entire contextual graph.
                      </p>
                    </section>
                    
                    <div className="grid grid-cols-2 gap-12">
                      <motion.div 
                        whileHover={{ y: -5 }}
                        className="border border-[#141414] p-8 space-y-6 bg-white"
                      >
                        <div className="w-12 h-12 bg-[#141414] text-white flex items-center justify-center font-bold text-xl">01</div>
                        <h3 className="font-bold uppercase tracking-widest text-sm">Define Seed Entity</h3>
                        <p className="text-sm opacity-70 italic leading-relaxed">Provide a core industry entity (e.g., "Renewable Energy"). The engine will crawl related concepts from the Global Knowledge Graph to establish your authority boundaries.</p>
                      </motion.div>
                      <motion.div 
                        whileHover={{ y: -5 }}
                        className="border border-[#141414] p-8 space-y-6 bg-white"
                      >
                        <div className="w-12 h-12 bg-[#141414] text-white flex items-center justify-center font-bold text-xl">02</div>
                        <h3 className="font-bold uppercase tracking-widest text-sm">Visualize Saturation</h3>
                        <p className="text-sm opacity-70 italic leading-relaxed">Switch to **Visual** mode. Trace the internal linking logic. A healthy topical map shows clear hierarchical distribution between pillars and supporting nodes.</p>
                      </motion.div>
                    </div>

                    <section className="space-y-8">
                      <h3 className="text-xs font-mono uppercase tracking-[0.4em] opacity-40 border-b border-[#141414]/10 pb-4">The Hierarchical Blueprint</h3>
                      <div className="grid grid-cols-3 gap-8">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Circle className="w-3 h-3 text-blue-500 fill-current" />
                            <p className="font-bold uppercase text-[10px] tracking-widest">Pillars</p>
                          </div>
                          <p className="text-xs opacity-60">High-volume, broad intent macro-categories. These serve as the roots of your authority.</p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Circle className="w-3 h-3 text-amber-500 fill-current" />
                            <p className="font-bold uppercase text-[10px] tracking-widest">Clusters</p>
                          </div>
                          <p className="text-xs opacity-60">Specific informational sub-topics that target long-tail queries and user pain points.</p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Circle className="w-3 h-3 text-emerald-500 fill-current" />
                            <p className="font-bold uppercase text-[10px] tracking-widest">Supporting</p>
                          </div>
                          <p className="text-xs opacity-60">Entity definitions and entities identified via AI to solve for Search Engine confidence.</p>
                        </div>
                      </div>
                    </section>

                    <section className="bg-[#141414] text-[#E4E3E0] p-10 relative overflow-hidden group">
                      <div className="relative z-10">
                        <p className="font-serif italic text-3xl leading-snug mb-4">"Search Engines do not rank pages. They rank knowledge representations."</p>
                        <p className="text-[10px] font-mono uppercase opacity-50 tracking-widest">— Semantic SEO Philosophy</p>
                      </div>
                      <Network className="absolute -right-10 -bottom-10 w-48 h-48 opacity-10 group-hover:scale-110 transition-transform duration-1000" />
                    </section>
                  </div>
                </motion.div>
              )}

              {/* Sidebar: Entity Details */}
              <aside className={`w-96 bg-[#F0EFED] border-l border-[#141414] flex flex-col transition-all ${selectedNode ? 'translate-x-0' : 'translate-x-full absolute right-0'}`}>
                {selectedNode ? (
                  <>
                    <div className="p-6 border-b border-[#141414] flex justify-between items-center">
                      <h3 className="text-xs font-mono uppercase tracking-widest opacity-50">Entity Blueprint</h3>
                      <button onClick={() => setSelectedNodeId(null)} className="p-1 hover:bg-[#141414]/10 transition-colors">
                        <ChevronRight className="w-4 h-4 rotate-180" />
                      </button>
                    </div>
                    <div className="p-8 space-y-8 overflow-y-auto">
                      <div>
                        <h4 className="text-4xl font-serif italic mb-2">{selectedNode.label}</h4>
                        <div className="flex gap-2">
                          <span className="text-[10px] font-mono uppercase border border-[#141414] px-2 py-0.5 rounded-full">{selectedNode.type}</span>
                          <span className="text-[10px] font-mono uppercase border border-[#141414] px-2 py-0.5 rounded-full">{selectedNode.intent}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[10px] font-mono opacity-50 uppercase tracking-tighter">
                          <Info className="w-3 h-3" /> Architecture Overview
                        </div>
                        <p className="text-sm leading-relaxed text-[#141414]/80">{selectedNode.description}</p>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-[10px] font-mono opacity-50 uppercase tracking-tighter">
                          <Layers className="w-3 h-3" /> Semantic Connections
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {selectedNode.entities.map((ent, i) => (
                            <span key={i} className="text-[10px] font-mono border border-[#141414]/20 bg-white/50 px-2 py-1 flex items-center gap-1">
                              <Circle className="w-1.5 h-1.5 fill-[#141414]" />
                              {ent}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4 bg-white border border-[#141414] p-6">
                        <div className="flex items-center gap-2 text-[10px] font-mono opacity-50 uppercase tracking-tighter">
                          <LinkIcon className="w-3 h-3" /> Internal Linking Strategy
                        </div>
                        <p className="text-sm leading-relaxed font-serif italic text-blue-900">{selectedNode.linkingLogic}</p>
                        
                        <div className="pt-4 border-t border-[#141414]/10 space-y-2">
                          <p className="text-[10px] uppercase font-mono opacity-50">Outbound Relationships</p>
                          {mapData.links.filter(l => l.source === selectedNode.id).map((link, i) => (
                             <div key={i} className="flex items-center gap-2 text-[11px] group cursor-pointer" onClick={() => setSelectedNodeId(link.target)}>
                               <span className="opacity-40 italic">{link.relationship}</span>
                               <ArrowRight className="w-3 h-3 opacity-40 group-hover:opacity-100 transition-opacity" />
                               <span className="font-bold underline decoration-[#141414]/20 underline-offset-4 group-hover:decoration-[#141414] transition-all">
                                {mapData.nodes.find(n => n.id === link.target)?.label}
                               </span>
                             </div>
                          ))}
                           {mapData.links.filter(l => l.source === selectedNode.id).length === 0 && (
                            <p className="text-[10px] italic opacity-40">No specified outbound links.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                   <div className="flex-1 flex items-center justify-center p-8 text-center opacity-30 italic text-sm">
                    Select a node to inspect its semantic properties.
                   </div>
                )}
              </aside>
            </div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer / Status Bar */}
      <footer className="bg-[#141414] text-[#E4E3E0] p-2 flex items-center justify-between text-[10px] font-mono uppercase tracking-widest px-6">
        <div className="flex gap-4">
          <span>Architect Mode: Operational</span>
          <span className="opacity-50">|</span>
          <span>Engine: Gemini 3.1 Pro</span>
        </div>
        <div className="opacity-50">
          Topical Saturation Threshold: Optimized
        </div>
      </footer>
    </div>
  );
}

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { 
  ArrowDown, 
  ArrowRight, 
  Circle, 
  Layers, 
  Link as LinkIcon, 
  ShieldCheck, 
  Sparkles, 
  Info, 
  Network, 
  ListOrdered, 
  HelpCircle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { TopicalMap, SEOEntity } from '../types';

interface Props {
  mapData: TopicalMap;
  node: SEOEntity;
  onSelectNode: (id: string) => void;
}

export default function AuthorityFlowView({ mapData, node, onSelectNode }: Props) {
  const [viewType, setViewType] = useState<'d3' | 'list'>('d3');
  const [simpleMode, setSimpleMode] = useState<boolean>(true);
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Find direct incoming links (parents / authority sources)
  const inboundLinks = mapData.links.filter(l => {
    const targetId = typeof l.target === 'object' ? (l.target as any).id : l.target;
    return targetId === node.id;
  });

  // Find direct outgoing links (children / authority recipients)
  const outboundLinks = mapData.links.filter(l => {
    const sourceId = typeof l.source === 'object' ? (l.source as any).id : l.source;
    return sourceId === node.id;
  });

  // Find direct parent nodes
  const parentNodes: SEOEntity[] = [];
  inboundLinks.forEach(link => {
    const sId = typeof link.source === 'object' ? (link.source as any).id : link.source;
    const found = mapData.nodes.find(n => n.id === sId);
    if (found && !parentNodes.some(p => p.id === found.id)) {
      parentNodes.push(found);
    }
  });

  // Find direct child nodes
  const childNodes: { node: SEOEntity; relationship: string }[] = [];
  outboundLinks.forEach(link => {
    const tId = typeof link.target === 'object' ? (link.target as any).id : link.target;
    const found = mapData.nodes.find(n => n.id === tId);
    if (found && !childNodes.some(c => c.node.id === found.id)) {
      childNodes.push({ node: found, relationship: link.relationship });
    }
  });

  // D3 Force-Directed Mini-Graph
  useEffect(() => {
    if (viewType !== 'd3' || !svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 360;
    const height = 260;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Defs: markers for directional flow
    const defs = svg.append("defs");

    const addMarker = (id: string, color: string) => {
      defs.append("marker")
        .attr("id", id)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 22)
        .attr("refY", 0)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M0,-5L10,0L0,5")
        .attr("fill", color);
    };

    addMarker("flow-arrow-out", "#3b82f6");
    addMarker("flow-arrow-in", "#f59e0b");
    addMarker("flow-arrow-default", "#141414");

    const g = svg.append("g");

    // Assemble local sub-graph data: Current Node (center) + Parents + Children
    interface LocalGraphNode extends d3.SimulationNodeDatum {
      id: string;
      label: string;
      type: string;
      role: 'current' | 'parent' | 'child';
      intent: string;
      relationship?: string;
    }

    interface LocalGraphLink extends d3.SimulationLinkDatum<LocalGraphNode> {
      source: string | LocalGraphNode;
      target: string | LocalGraphNode;
      relationship: string;
      direction: 'inbound' | 'outbound';
    }

    const localNodes: LocalGraphNode[] = [
      {
        id: node.id,
        label: node.label,
        type: node.type,
        role: 'current',
        intent: node.intent
      }
    ];

    const localLinks: LocalGraphLink[] = [];

    // Add parents
    parentNodes.forEach(p => {
      localNodes.push({
        id: p.id,
        label: p.label,
        type: p.type,
        role: 'parent',
        intent: p.intent
      });
      const linkMatch = inboundLinks.find(l => {
        const sId = typeof l.source === 'object' ? (l.source as any).id : l.source;
        return sId === p.id;
      });
      localLinks.push({
        source: p.id,
        target: node.id,
        relationship: linkMatch?.relationship || 'Feeds Authority',
        direction: 'inbound'
      });
    });

    // Add children
    childNodes.forEach(c => {
      localNodes.push({
        id: c.node.id,
        label: c.node.label,
        type: c.node.type,
        role: 'child',
        intent: c.node.intent,
        relationship: c.relationship
      });
      localLinks.push({
        source: node.id,
        target: c.node.id,
        relationship: c.relationship || 'Distributes Equity',
        direction: 'outbound'
      });
    });

    // Force simulation
    const simulation = d3.forceSimulation<LocalGraphNode>(localNodes)
      .force("link", d3.forceLink<LocalGraphNode, LocalGraphLink>(localLinks).id(d => d.id).distance(d => d.direction === 'outbound' ? 85 : 75))
      .force("charge", d3.forceManyBody().strength(-280))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(40));

    // Fix current node closer to center
    const centerNode = localNodes.find(n => n.role === 'current');
    if (centerNode) {
      centerNode.fx = width / 2;
      centerNode.fy = height / 2;
    }

    // Draw Links
    const link = g.append("g")
      .selectAll("line")
      .data(localLinks)
      .join("line")
      .attr("stroke", d => d.direction === 'outbound' ? '#3b82f6' : '#f59e0b')
      .attr("stroke-width", d => d.direction === 'outbound' ? 2 : 1.5)
      .attr("stroke-dasharray", d => d.direction === 'inbound' ? "3 3" : "0")
      .attr("marker-end", d => d.direction === 'outbound' ? "url(#flow-arrow-out)" : "url(#flow-arrow-in)");

    // Draw Link Labels (Relationship)
    const linkLabel = g.append("g")
      .selectAll("text")
      .data(localLinks)
      .join("text")
      .text(d => d.relationship)
      .attr("font-size", "8px")
      .attr("font-family", "monospace")
      .attr("fill", "#64748b")
      .attr("text-anchor", "middle")
      .attr("dy", -3);

    // Draw Nodes
    const nodeGroup = g.append("g")
      .selectAll("g")
      .data(localNodes)
      .join("g")
      .attr("cursor", "pointer")
      .on("click", (event, d) => {
        if (d.role !== 'current') {
          onSelectNode(d.id);
        }
      });

    // Node Box / Rect
    nodeGroup.append("rect")
      .attr("width", d => Math.min(130, Math.max(70, d.label.length * 6.5 + 24)))
      .attr("height", d => d.role === 'current' ? 28 : 22)
      .attr("x", d => -Math.min(130, Math.max(70, d.label.length * 6.5 + 24)) / 2)
      .attr("y", d => d.role === 'current' ? -14 : -11)
      .attr("rx", d => d.role === 'current' ? 4 : 11)
      .attr("fill", d => {
        if (d.role === 'current') return "#141414";
        if (d.role === 'parent') return "#FFFBEB"; // light amber
        return "#EFF6FF"; // light blue
      })
      .attr("stroke", d => {
        if (d.role === 'current') return "#141414";
        if (d.role === 'parent') return "#d97706";
        return "#2563eb";
      })
      .attr("stroke-width", d => d.role === 'current' ? 2 : 1.2);

    // Role Indicator dot
    nodeGroup.append("circle")
      .attr("r", 3)
      .attr("cx", d => -Math.min(130, Math.max(70, d.label.length * 6.5 + 24)) / 2 + 8)
      .attr("cy", 0)
      .attr("fill", d => {
        if (d.role === 'current') return "#ffffff";
        if (d.role === 'parent') return "#d97706";
        return "#2563eb";
      });

    // Node Text
    nodeGroup.append("text")
      .text(d => {
        const maxLen = 14;
        return d.label.length > maxLen ? d.label.slice(0, maxLen) + '…' : d.label;
      })
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "middle")
      .attr("x", 4)
      .attr("font-size", d => d.role === 'current' ? "10px" : "9px")
      .attr("font-family", "sans-serif")
      .attr("font-weight", d => d.role === 'current' ? "700" : "500")
      .attr("fill", d => d.role === 'current' ? "#E4E3E0" : "#141414");

    // Tooltip behavior
    nodeGroup.append("title")
      .text(d => `${d.label} [${d.type.toUpperCase()}]\nRole: ${d.role.toUpperCase()}\nClick to inspect node.`);

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      linkLabel
        .attr("x", (d: any) => (d.source.x + d.target.x) / 2)
        .attr("y", (d: any) => (d.source.y + d.target.y) / 2);

      nodeGroup.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    return () => {
      simulation.stop();
    };
  }, [node, mapData, viewType]);

  return (
    <div className="space-y-3 bg-white border border-[#141414] p-4">
      {/* Header & View Toggles */}
      <div className="flex items-center justify-between border-b border-[#141414]/10 pb-2">
        <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider font-bold">
          <LinkIcon className="w-3 h-3 text-[#141414]" />
          Authority Flow & Linking Potential
        </div>

        <div className="flex items-center gap-1">
          <div className="inline-flex border border-[#141414]/30 bg-neutral-100">
            <button
              onClick={() => setViewType('d3')}
              className={`text-[9px] font-mono uppercase px-2 py-0.5 transition-colors ${
                viewType === 'd3' ? 'bg-[#141414] text-white font-bold' : 'hover:bg-neutral-200'
              }`}
              title="Interactive D3 Force Directed Graph"
            >
              <Network className="w-2.5 h-2.5 inline mr-1" />
              Graph
            </button>
            <button
              onClick={() => setViewType('list')}
              className={`text-[9px] font-mono uppercase px-2 py-0.5 transition-colors ${
                viewType === 'list' ? 'bg-[#141414] text-white font-bold' : 'hover:bg-neutral-200'
              }`}
              title="Step by step pathway list"
            >
              <ListOrdered className="w-2.5 h-2.5 inline mr-1" />
              Pathway
            </button>
          </div>
        </div>
      </div>

      {/* Beginner Friendly Plain-English Toggle & Summary */}
      <div className="bg-[#F6F5F3] border border-[#141414]/15 p-2.5 space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-[10px] font-mono uppercase font-semibold text-[#141414]">
            <HelpCircle className="w-3 h-3 text-blue-600" />
            <span>{simpleMode ? 'Plain-English Guide' : 'SEO Architecture Spec'}</span>
          </div>
          <button
            onClick={() => setSimpleMode(!simpleMode)}
            className="text-[9px] font-mono uppercase underline text-[#141414]/60 hover:text-[#141414]"
          >
            {simpleMode ? 'Switch to Advanced' : 'Switch to Plain English'}
          </button>
        </div>

        {simpleMode ? (
          <p className="text-[11px] text-[#141414]/80 leading-relaxed">
            {node.type === 'pillar' && (
              <>
                <strong>Main Pillar Guide:</strong> This is your primary hub page. When you publish articles on the child topics below, link them back to this page to signal to Google that this is the master resource.
              </>
            )}
            {node.type === 'cluster' && (
              <>
                <strong>Sub-Topic Chapter:</strong> Receives trust from the main guide. You should place internal links inside this article pointing to the specific tutorials below.
              </>
            )}
            {node.type === 'supporting' && (
              <>
                <strong>Targeted Tutorial:</strong> Answers a specific question. Place a link inside this article pointing back up to its parent cluster to complete the topical loop.
              </>
            )}
          </p>
        ) : (
          <p className="text-[10px] font-mono text-[#141414]/70 leading-relaxed">
            <strong>PageRank Flow:</strong> Distributes inbound link equity from {parentNodes.length} upstream node(s) down to {childNodes.length} downstream child cluster/supporting nodes.
          </p>
        )}
      </div>

      {/* D3 Force Directed Graph View */}
      {viewType === 'd3' && (
        <div className="relative border border-[#141414]/20 bg-[#FDFDFD] overflow-hidden" ref={containerRef}>
          <svg ref={svgRef} className="w-full h-[250px]" />

          {/* Interactive Graph Legend & Tip */}
          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[9px] font-mono uppercase bg-white/90 backdrop-blur px-2 py-1 border border-[#141414]/10">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> Inbound
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#141414]" /> Selected
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-600" /> Child Outbound
              </span>
            </div>
            <span className="opacity-50 hidden sm:inline">Click node to inspect</span>
          </div>
        </div>
      )}

      {/* Pathway List View */}
      {viewType === 'list' && (
        <div className="space-y-2 py-1 max-h-[260px] overflow-y-auto pr-1">
          {/* Inbound Parent Nodes */}
          {parentNodes.length > 0 && (
            <div className="space-y-1">
              <span className="text-[9px] font-mono uppercase opacity-50">Inbound Authority Sources (Parents)</span>
              {parentNodes.map(p => (
                <div
                  key={p.id}
                  onClick={() => onSelectNode(p.id)}
                  className="p-2 border border-amber-200 bg-amber-50/60 hover:bg-amber-100 cursor-pointer text-xs flex items-center justify-between"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Circle className="w-2 h-2 text-amber-600 fill-current shrink-0" />
                    <span className="font-semibold text-amber-950 truncate">{p.label}</span>
                  </div>
                  <span className="text-[9px] font-mono uppercase text-amber-800 bg-amber-200/60 px-1.5 py-0.2 rounded">
                    {p.type}
                  </span>
                </div>
              ))}
              <div className="flex justify-center text-amber-600 py-0.5">
                <ArrowDown className="w-3.5 h-3.5" />
              </div>
            </div>
          )}

          {/* Current Node */}
          <div className="p-2.5 border-2 border-[#141414] bg-[#141414] text-[#E4E3E0]">
            <div className="flex items-center justify-between text-xs mb-0.5">
              <span className="font-bold">{node.label}</span>
              <span className="text-[9px] font-mono uppercase bg-white/20 px-1.5 py-0.5 text-white">
                Current Page
              </span>
            </div>
            <span className="text-[10px] text-[#E4E3E0]/70 font-mono">
              {parentNodes.length} Inbound • {childNodes.length} Outbound Children
            </span>
          </div>

          {/* Outbound Children */}
          {childNodes.length > 0 && (
            <div className="space-y-1 pt-1">
              <div className="flex justify-center text-blue-600 py-0.5">
                <ArrowDown className="w-3.5 h-3.5" />
              </div>
              <span className="text-[9px] font-mono uppercase opacity-50">Direct Child Nodes (Outbound Flow)</span>
              {childNodes.map(({ node: c, relationship }) => (
                <div
                  key={c.id}
                  onClick={() => onSelectNode(c.id)}
                  className="p-2 border border-blue-200 bg-blue-50/60 hover:bg-blue-100 cursor-pointer text-xs flex items-center justify-between"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <ArrowRight className="w-3 h-3 text-blue-500 shrink-0" />
                    <span className="font-medium text-blue-950 truncate">{c.label}</span>
                  </div>
                  <span className="text-[9px] font-mono text-blue-700 truncate max-w-[100px]" title={relationship}>
                    {relationship}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Internal Linking Potential & Suggested Anchor Strategy */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between text-[10px] font-mono uppercase font-bold">
          <span className="text-[#141414]">Internal Linking Potential</span>
          <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2">
            {childNodes.length > 0 ? 'High Linking Potential' : 'Terminal Supporting Node'}
          </span>
        </div>

        <div className="space-y-1.5 text-xs">
          {childNodes.length > 0 ? (
            <div className="bg-neutral-50 border border-[#141414]/15 p-2.5 space-y-1.5">
              <p className="text-[11px] text-[#141414]/80 font-medium">
                Recommended Internal Links to place inside this page:
              </p>
              <div className="space-y-1">
                {childNodes.slice(0, 3).map(({ node: c, relationship }, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-[11px] text-[#141414]">
                    <span className="text-blue-600 font-bold shrink-0">→</span>
                    <div>
                      Link to <button onClick={() => onSelectNode(c.id)} className="font-bold underline hover:text-blue-700">{c.label}</button>
                      <span className="text-[10px] font-mono text-neutral-500 block">
                        Suggested anchor: <em className="text-blue-900">"{c.label}"</em> or <em className="text-blue-900">"{c.entities[0] || c.label}"</em>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-neutral-50 border border-[#141414]/15 p-2.5 text-[11px] text-[#141414]/70">
              💡 <strong>Loop Recommendation:</strong> This is a deep supporting tutorial. Be sure to link back up to its parent cluster to recirculate link equity!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

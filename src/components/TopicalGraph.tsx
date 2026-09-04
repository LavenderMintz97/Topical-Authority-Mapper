import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { TopicalMap, SEOEntity, FilterOptions, NodeGapItem } from '../types';
import { CheckCircle2, AlertTriangle, Eye, EyeOff } from 'lucide-react';

interface Props {
  data: TopicalMap;
  onSelectNode: (id: string) => void;
  selectedNodeId: string | null;
  filters?: FilterOptions;
  gapItems?: NodeGapItem[];
  showGapOverlayDefault?: boolean;
}

export default function TopicalGraph({ 
  data, 
  onSelectNode, 
  selectedNodeId,
  filters,
  gapItems = [],
  showGapOverlayDefault = true
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [showGapOverlay, setShowGapOverlay] = useState(showGapOverlayDefault);

  // Map of nodeId -> NodeGapItem for quick O(1) lookup
  const gapMap = useRef<Map<string, NodeGapItem>>(new Map());
  useEffect(() => {
    const map = new Map<string, NodeGapItem>();
    gapItems.forEach(item => map.set(item.nodeId, item));
    gapMap.current = map;
  }, [gapItems]);

  useEffect(() => {
    if (!svgRef.current || !data) return;

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const g = svg.append("g");

    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);

    // Filter check helper
    const isNodeMatchingFilter = (d: any) => {
      if (d.isSubEntity) return true;
      if (!filters) return true;

      if (filters.nodeType !== 'all' && d.type !== filters.nodeType) return false;
      if (filters.intent !== 'all' && d.intent !== filters.intent) return false;

      const gapItem = gapMap.current.get(d.id);
      if (filters.category !== 'all') {
        const cat = gapItem?.category || '';
        if (cat !== filters.category) return false;
      }

      if (filters.gapStatus === 'gaps_only' && gapItem?.userCovered) return false;
      if (filters.gapStatus === 'covered_only' && !gapItem?.userCovered) return false;
      if (filters.gapStatus === 'competitor_gap' && gapItem?.matrixStatus !== 'competitor_advantage') return false;
      if (filters.gapStatus === 'blue_ocean' && gapItem?.matrixStatus !== 'blue_ocean') return false;

      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        const matchLabel = d.label.toLowerCase().includes(q);
        const matchEntity = (d.entities || []).some((e: string) => e.toLowerCase().includes(q));
        if (!matchLabel && !matchEntity) return false;
      }

      return true;
    };

    // Dynamic data assembly including sub-entities if a node is selected
    const getActiveData = () => {
      const activeNodes = [...data.nodes.map(n => ({ ...n }))];
      const activeLinks = [...data.links.map(l => ({ 
        source: l.source ? (typeof l.source === 'object' ? (l.source as any).id : l.source) : '', 
        target: l.target ? (typeof l.target === 'object' ? (l.target as any).id : l.target) : '',
        relationship: l.relationship
      }))];

      if (selectedNodeId) {
        const selectedNodeData = data.nodes.find(n => n.id === selectedNodeId);
        if (selectedNodeData?.entities) {
          selectedNodeData.entities.forEach((entity, index) => {
            const entityId = `entity-${selectedNodeId}-${index}`;
            activeNodes.push({
              id: entityId,
              label: entity,
              type: 'supporting',
              intent: 'Informational',
              description: 'Related Semantic Entity',
              entities: [],
              linkingLogic: '',
              isSubEntity: true
            } as any);
            activeLinks.push({
              source: selectedNodeId,
              target: entityId,
              relationship: 'mentions'
            });
          });
        }
      }
      return { nodes: activeNodes, links: activeLinks };
    };

    const activeData = getActiveData();

    const simulation = d3.forceSimulation<any>(activeData.nodes)
      .force("link", d3.forceLink<any, any>(activeData.links).id((d: any) => d.id).distance((d: any) => d.relationship === 'mentions' ? 100 : 250))
      .force("charge", d3.forceManyBody().strength((d: any) => d.isSubEntity ? -150 : -1000))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius((d: any) => d.isSubEntity ? 60 : 140));

    // Links
    const link = g.append("g")
      .selectAll("line")
      .data(activeData.links)
      .join("line")
      .attr("stroke", (d: any) => {
        if (d.relationship === 'mentions') return "#94a3b8";
        if (d.relationship === 'pillar-to-cluster') return "#3b82f6";
        if (d.relationship === 'cluster-to-supporting') return "#f59e0b";
        return "#141414";
      })
      .attr("stroke-opacity", (d: any) => d.relationship === 'mentions' ? 0.3 : 0.6)
      .attr("stroke-width", (d: any) => {
        if (d.relationship === 'pillar-to-cluster') return 3;
        if (d.relationship === 'mentions') return 1;
        return 1.5;
      })
      .attr("stroke-dasharray", (d: any) => d.relationship === 'mentions' ? "3 3" : "0")
      .attr("class", (d: any) => d.relationship === 'pillar-to-cluster' ? "link-flow" : "")
      .attr("marker-end", (d: any) => {
        if (d.relationship === 'mentions') return "";
        if (d.relationship === 'pillar-to-cluster') return "url(#arrow-pillar)";
        if (d.relationship === 'cluster-to-supporting') return "url(#arrow-cluster)";
        return "url(#arrowhead)";
      })
      .on("mouseover", function(event, d: any) {
        d3.select(this).attr("stroke-opacity", 1).attr("stroke-width", (d: any) => {
           if (d.relationship === 'pillar-to-cluster') return 5;
           return 3;
        });
        
        // Tooltip logic
        const tooltip = d3.select("#graph-tooltip");
        tooltip.transition().duration(200).style("opacity", .9);
        tooltip.html(`Relationship: <span class="font-bold text-white">${d.relationship}</span>`)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function() {
        const d: any = d3.select(this).datum();
        d3.select(this)
          .attr("stroke-opacity", (d: any) => d.relationship === 'mentions' ? 0.3 : 0.6)
          .attr("stroke-width", (d: any) => {
            if (d.relationship === 'pillar-to-cluster') return 3;
            if (d.relationship === 'mentions') return 1;
            return 1.5;
          });
        d3.select("#graph-tooltip").transition().duration(500).style("opacity", 0);
      });

    // Markers
    const defs = svg.append("defs");
    
    const createMarker = (id: string, color: string) => {
      defs.append("marker")
        .attr("id", id)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 25)
        .attr("refY", 0)
        .attr("markerWidth", 5)
        .attr("markerHeight", 5)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M0,-5L10,0L0,5")
        .attr("fill", color);
    };

    createMarker("arrowhead", "#141414");
    createMarker("arrow-pillar", "#3b82f6");
    createMarker("arrow-cluster", "#f59e0b");

    // Nodes
    const node = g.append("g")
      .selectAll("g")
      .data(activeData.nodes)
      .join("g")
      .attr("cursor", "pointer")
      .style("opacity", (d: any) => isNodeMatchingFilter(d) ? 1 : 0.2)
      .on("mouseover", (event, d: any) => {
        const connectedNodeIds = new Set<string>();
        
        link.each((l: any) => {
          const sId = typeof l.source === 'object' ? l.source.id : l.source;
          const tId = typeof l.target === 'object' ? l.target.id : l.target;
          if (sId === d.id) connectedNodeIds.add(tId);
          if (tId === d.id) connectedNodeIds.add(sId);
        });

        node.style("opacity", (n: any) => {
          const isConnected = n.id === d.id || connectedNodeIds.has(n.id);
          if (!isConnected) return 0.08;
          return isNodeMatchingFilter(n) ? 1 : 0.3;
        });

        link.style("opacity", (l: any) => {
          const sId = typeof l.source === 'object' ? l.source.id : l.source;
          const tId = typeof l.target === 'object' ? l.target.id : l.target;
          return (sId === d.id || tId === d.id) ? 1 : 0.05;
        });

        // Tooltip with gap status
        const gapItem = gapMap.current.get(d.id);
        const tooltip = d3.select("#graph-tooltip");
        tooltip.transition().duration(150).style("opacity", 1);
        let content = `<div class="space-y-1"><div class="font-bold text-white">${d.label} [${d.type}]</div>`;
        if (gapItem && showGapOverlay) {
          content += `<div class="${gapItem.userCovered ? 'text-emerald-400' : 'text-amber-400'}">Status: ${gapItem.userCovered ? '✓ Covered' : '⚠ Content Gap (' + gapItem.priority + ')'}</div>`;
          if (gapItem.userMatchedUrl) {
            content += `<div class="text-neutral-300 text-[9px] truncate max-w-xs">URL: ${gapItem.userMatchedUrl}</div>`;
          }
          if (gapItem.matrixStatus) {
            content += `<div class="text-blue-300 text-[9px]">Competitor: ${gapItem.matrixStatus.replace('_', ' ')}</div>`;
          }
        }
        content += `</div>`;
        tooltip.html(content)
          .style("left", (event.pageX + 12) + "px")
          .style("top", (event.pageY - 30) + "px");
      })
      .on("mouseout", () => {
        node.style("opacity", (d: any) => isNodeMatchingFilter(d) ? 1 : 0.2);
        link.style("opacity", (l: any) => l.relationship === 'mentions' ? 0.3 : 0.6);
        d3.select("#graph-tooltip").transition().duration(300).style("opacity", 0);
      })
      .on("click", (event, d: any) => {
        if (!d.isSubEntity) {
          onSelectNode(d.id);
        }
      })
      .call(d3.drag<any, any>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    // Node background
    node.append("rect")
      .attr("width", (d: any) => d.isSubEntity ? (d.label.length * 7 + 20) : (d.label.length * 8 + 48))
      .attr("height", (d: any) => d.isSubEntity ? 24 : 36)
      .attr("x", (d: any) => d.isSubEntity ? -(d.label.length * 7 + 20) / 2 : -(d.label.length * 8 + 48) / 2)
      .attr("y", (d: any) => d.isSubEntity ? -12 : -18)
      .attr("rx", (d: any) => d.isSubEntity ? 12 : 4)
      .attr("fill", (d: any) => {
        if (d.isSubEntity) return "#FFFFFF";
        if (d.id === selectedNodeId) return "#141414";
        if (showGapOverlay && !d.isSubEntity) {
          const gapItem = gapMap.current.get(d.id);
          if (gapItem) {
            if (gapItem.userCovered) return "#F0FDF4"; // light green
            if (gapItem.matrixStatus === 'competitor_advantage') return "#FFF1F2"; // light rose
            return "#FFFBEB"; // light amber
          }
        }
        return "#FFFFFF";
      })
      .attr("stroke", (d: any) => {
        if (d.isSubEntity) return "#94a3b8";
        if (d.id === selectedNodeId) return "#141414";
        if (showGapOverlay) {
          const gapItem = gapMap.current.get(d.id);
          if (gapItem) {
            if (gapItem.userCovered) return "#16a34a"; // green
            if (gapItem.matrixStatus === 'competitor_advantage') return "#e11d48"; // rose
            return "#d97706"; // amber
          }
        }
        return "#141414";
      })
      .attr("stroke-width", (d: any) => {
        if (d.isSubEntity) return 1;
        if (d.id === selectedNodeId) return 2.5;
        if (showGapOverlay) return 2;
        return 1.5;
      })
      .attr("stroke-dasharray", (d: any) => {
        if (showGapOverlay && !d.isSubEntity) {
          const gapItem = gapMap.current.get(d.id);
          if (gapItem && !gapItem.userCovered) return "4 3";
        }
        return "0";
      });

    // Node Type / Gap Indicator Circle
    node.append("circle")
      .attr("r", (d: any) => d.isSubEntity ? 3 : 4.5)
      .attr("cx", (d: any) => d.isSubEntity ? -(d.label.length * 7 + 20) / 2 + 10 : -(d.label.length * 8 + 48) / 2 + 15)
      .attr("cy", 0)
      .attr("fill", (d: any) => {
        if (d.isSubEntity) return '#94a3b8';
        if (showGapOverlay) {
          const gapItem = gapMap.current.get(d.id);
          if (gapItem) {
            if (gapItem.userCovered) return '#16a34a';
            if (gapItem.matrixStatus === 'competitor_advantage') return '#e11d48';
            return '#f59e0b';
          }
        }
        return d.type === 'pillar' ? '#3b82f6' : d.type === 'cluster' ? '#f59e0b' : '#10b981';
      });

    // Node Label
    node.append("text")
      .text((d: any) => d.label)
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "middle")
      .attr("x", (d: any) => d.isSubEntity ? 6 : 10)
      .attr("font-family", "Inter, sans-serif")
      .attr("font-size", (d: any) => d.isSubEntity ? "10px" : "12px")
      .attr("font-weight", (d: any) => d.isSubEntity ? "400" : "600")
      .attr("fill", (d: any) => {
        if (d.isSubEntity) return "#141414";
        return d.id === selectedNodeId ? "#E4E3E0" : "#141414";
      });

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return () => {
      simulation.stop();
    };
  }, [data, selectedNodeId, onSelectNode, filters, showGapOverlay, gapItems]);

  return (
    <div className="w-full h-full relative bg-white">
      <svg ref={svgRef} className="w-full h-full" />
      <div 
        id="graph-tooltip" 
        className="absolute pointer-events-none opacity-0 bg-[#141414] text-[#E4E3E0] text-[10px] font-mono px-3 py-2 uppercase tracking-widest z-[200] transition-opacity whitespace-nowrap shadow-lg border border-neutral-700"
      />
      
      {/* Legend and Gap Overlay Toggle */}
      <div className="absolute bottom-4 left-4 flex flex-wrap items-center gap-3 text-[10px] uppercase font-mono bg-[#E4E3E0]/90 backdrop-blur p-2.5 border border-[#141414]/15 rounded shadow-sm z-10">
        <button
          onClick={() => setShowGapOverlay(!showGapOverlay)}
          className={`flex items-center gap-1.5 px-2 py-1 border transition-colors ${
            showGapOverlay 
              ? 'bg-[#141414] text-[#E4E3E0] border-[#141414]' 
              : 'bg-white text-[#141414] border-[#141414]/30 hover:bg-neutral-100'
          }`}
          title="Toggle content gap status colors on graph nodes"
        >
          {showGapOverlay ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
          Gap Overlay: {showGapOverlay ? 'ON' : 'OFF'}
        </button>

        <div className="h-4 w-px bg-[#141414]/20" />

        {showGapOverlay ? (
          <>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-600" /> Covered</div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Content Gap</div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-rose-600" /> Competitor Threat</div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500" /> Pillar</div>
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500" /> Cluster</div>
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Supporting</div>
          </>
        )}
      </div>
    </div>
  );
}

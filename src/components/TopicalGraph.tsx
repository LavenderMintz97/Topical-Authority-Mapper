import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { TopicalMap, SEOEntity } from '../types';

interface Props {
  data: TopicalMap;
  onSelectNode: (id: string) => void;
  selectedNodeId: string | null;
}

export default function TopicalGraph({ data, onSelectNode, selectedNodeId }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);

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
      .on("mouseover", (event, d: any) => {
        const connectedNodeIds = new Set<string>();
        
        link.each((l: any) => {
          const sId = typeof l.source === 'object' ? l.source.id : l.source;
          const tId = typeof l.target === 'object' ? l.target.id : l.target;
          if (sId === d.id) connectedNodeIds.add(tId);
          if (tId === d.id) connectedNodeIds.add(sId);
        });

        node.style("opacity", (n: any) => (n.id === d.id || connectedNodeIds.has(n.id)) ? 1 : 0.1);
        link.style("opacity", (l: any) => {
          const sId = typeof l.source === 'object' ? l.source.id : l.source;
          const tId = typeof l.target === 'object' ? l.target.id : l.target;
          return (sId === d.id || tId === d.id) ? 1 : 0.05;
        });
      })
      .on("mouseout", () => {
        node.style("opacity", 1);
        link.style("opacity", (l: any) => l.relationship === 'mentions' ? 0.3 : 0.6);
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
      .attr("width", (d: any) => d.isSubEntity ? (d.label.length * 7 + 20) : (d.label.length * 8 + 40))
      .attr("height", (d: any) => d.isSubEntity ? 24 : 36)
      .attr("x", (d: any) => d.isSubEntity ? -(d.label.length * 7 + 20) / 2 : -(d.label.length * 8 + 40) / 2)
      .attr("y", (d: any) => d.isSubEntity ? -12 : -18)
      .attr("rx", (d: any) => d.isSubEntity ? 12 : 4)
      .attr("fill", (d: any) => {
        if (d.isSubEntity) return "#FFFFFF";
        return d.id === selectedNodeId ? "#141414" : "#FFFFFF";
      })
      .attr("stroke", "#141414")
      .attr("stroke-width", (d: any) => d.isSubEntity ? 1 : 1.5);

    // Node Type Indicator
    node.append("circle")
      .attr("r", (d: any) => d.isSubEntity ? 3 : 4)
      .attr("cx", (d: any) => d.isSubEntity ? -(d.label.length * 7 + 20) / 2 + 10 : -(d.label.length * 8 + 40) / 2 + 15)
      .attr("cy", 0)
      .attr("fill", (d: any) => 
        d.isSubEntity ? '#94a3b8' : (d.type === 'pillar' ? '#3b82f6' : d.type === 'cluster' ? '#f59e0b' : '#10b981')
      );

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
  }, [data, selectedNodeId, onSelectNode]);

  return (
    <div className="w-full h-full relative bg-white">
      <svg ref={svgRef} className="w-full h-full" />
      <div 
        id="graph-tooltip" 
        className="absolute pointer-events-none opacity-0 bg-[#141414] text-[#E4E3E0] text-[10px] font-mono px-3 py-1.5 uppercase tracking-widest z-[200] transition-opacity whitespace-nowrap"
      />
      <div className="absolute bottom-4 left-4 flex gap-4 text-[10px] uppercase font-mono bg-[#E4E3E0]/80 backdrop-blur p-2 border border-[#141414]/10 rounded shadow-sm">
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500" /> Pillar</div>
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500" /> Cluster</div>
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Supporting</div>
      </div>
    </div>
  );
}

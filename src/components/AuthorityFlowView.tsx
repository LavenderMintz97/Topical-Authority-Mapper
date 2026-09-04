import React from 'react';
import { ArrowDown, ArrowRight, Circle, Layers, Link as LinkIcon, ShieldCheck } from 'lucide-react';
import { TopicalMap, SEOEntity } from '../types';

interface Props {
  mapData: TopicalMap;
  node: SEOEntity;
  onSelectNode: (id: string) => void;
}

export default function AuthorityFlowView({ mapData, node, onSelectNode }: Props) {
  // Find pillar node
  const pillar = mapData.nodes.find(n => n.type === 'pillar');

  // Find direct incoming links
  const inboundLinks = mapData.links.filter(l => {
    const targetId = typeof l.target === 'object' ? (l.target as any).id : l.target;
    return targetId === node.id;
  });

  // Find direct outgoing links
  const outboundLinks = mapData.links.filter(l => {
    const sourceId = typeof l.source === 'object' ? (l.source as any).id : l.source;
    return sourceId === node.id;
  });

  // Find parent clusters if this is supporting
  const parentNodes: SEOEntity[] = [];
  inboundLinks.forEach(link => {
    const sId = typeof link.source === 'object' ? (link.source as any).id : link.source;
    const found = mapData.nodes.find(n => n.id === sId);
    if (found) parentNodes.push(found);
  });

  return (
    <div className="space-y-4 bg-white border border-[#141414] p-5">
      <div className="flex items-center justify-between border-b border-[#141414]/10 pb-2">
        <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest opacity-60">
          <LinkIcon className="w-3 h-3 text-[#141414]" />
          Authority Flow Pathway
        </div>
        <span className="text-[9px] font-mono uppercase bg-[#141414]/5 px-2 py-0.5 border border-[#141414]/10">
          {node.type}
        </span>
      </div>

      {/* Visual Pathway diagram */}
      <div className="space-y-2 py-1">
        {/* Step 1: Pillar anchor */}
        {pillar && pillar.id !== node.id && (
          <div className="space-y-2">
            <div 
              onClick={() => onSelectNode(pillar.id)}
              className="p-2.5 border border-blue-200 bg-blue-50/50 hover:bg-blue-100/50 cursor-pointer transition-colors flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2 truncate">
                <Circle className="w-2.5 h-2.5 text-blue-600 fill-current shrink-0" />
                <span className="font-bold text-blue-950 truncate">{pillar.label}</span>
              </div>
              <span className="text-[9px] font-mono uppercase text-blue-700 bg-blue-100 px-1.5 py-0.2 rounded shrink-0">
                Pillar
              </span>
            </div>
            <div className="flex items-center justify-center text-blue-500 py-0.5">
              <ArrowDown className="w-3.5 h-3.5 animate-pulse" />
            </div>
          </div>
        )}

        {/* Step 2: Parent Cluster (if applicable) */}
        {parentNodes.length > 0 && (
          <div className="space-y-2">
            {parentNodes.map(p => (
              <div
                key={p.id}
                onClick={() => onSelectNode(p.id)}
                className="p-2.5 border border-amber-200 bg-amber-50/50 hover:bg-amber-100/50 cursor-pointer transition-colors flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2 truncate">
                  <Circle className="w-2.5 h-2.5 text-amber-600 fill-current shrink-0" />
                  <span className="font-semibold text-amber-950 truncate">{p.label}</span>
                </div>
                <span className="text-[9px] font-mono uppercase text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded shrink-0">
                  {p.type}
                </span>
              </div>
            ))}
            <div className="flex items-center justify-center text-amber-500 py-0.5">
              <ArrowDown className="w-3.5 h-3.5" />
            </div>
          </div>
        )}

        {/* Step 3: Current Node (highlighted) */}
        <div className="p-3 border-2 border-[#141414] bg-[#141414] text-[#E4E3E0] shadow-sm">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-bold tracking-tight">{node.label}</span>
            <span className="text-[9px] font-mono uppercase bg-white/20 px-1.5 py-0.5 text-white">
              Target
            </span>
          </div>
          <p className="text-[10px] text-[#E4E3E0]/70 font-mono">
            {inboundLinks.length} Inbound Link{inboundLinks.length === 1 ? '' : 's'} • {outboundLinks.length} Outbound Link{outboundLinks.length === 1 ? '' : 's'}
          </p>
        </div>

        {/* Step 4: Downstream Outbound Links */}
        {outboundLinks.length > 0 && (
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-center text-[#141414]/40 py-0.5">
              <ArrowDown className="w-3.5 h-3.5" />
            </div>
            <div className="space-y-1.5">
              {outboundLinks.map((link, i) => {
                const tId = typeof link.target === 'object' ? (link.target as any).id : link.target;
                const targetNode = mapData.nodes.find(n => n.id === tId);
                return (
                  <div
                    key={i}
                    onClick={() => onSelectNode(tId)}
                    className="p-2 border border-[#141414]/15 bg-neutral-50 hover:bg-neutral-100 cursor-pointer text-xs flex items-center justify-between"
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <ArrowRight className="w-3 h-3 text-[#141414]/40 shrink-0" />
                      <span className="font-medium text-[#141414] truncate">{targetNode?.label || tId}</span>
                    </div>
                    <span className="text-[9px] font-mono text-[#141414]/50 italic shrink-0">
                      {link.relationship}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Equity Guidance Note */}
      <div className="text-[10px] font-mono text-[#141414]/70 bg-neutral-100 p-2.5 border border-[#141414]/10 leading-relaxed flex items-start gap-2">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
        <div>
          <strong>Equity Rule:</strong> Pass topical relevance downward from Pillar to Cluster using exact anchor match, and loop back with contextual supporting anchors.
        </div>
      </div>
    </div>
  );
}

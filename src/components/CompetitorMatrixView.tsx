import React from 'react';
import { Swords, ShieldAlert, Sparkles, Trophy, ArrowRight, Circle, ExternalLink } from 'lucide-react';
import { NodeGapItem, MatrixStatus } from '../types';

interface Props {
  items: NodeGapItem[];
  onSelectNode: (nodeId: string) => void;
  selectedNodeId: string | null;
}

export default function CompetitorMatrixView({ items, onSelectNode, selectedNodeId }: Props) {
  const competitorAdvantage = items.filter(i => i.matrixStatus === 'competitor_advantage');
  const blueOcean = items.filter(i => i.matrixStatus === 'blue_ocean');
  const battleground = items.filter(i => i.matrixStatus === 'battleground');
  const userAdvantage = items.filter(i => i.matrixStatus === 'user_advantage');

  return (
    <div className="space-y-6 p-6">
      {/* Introduction banner */}
      <div className="bg-[#141414] text-[#E4E3E0] p-6 border border-[#141414]">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Swords className="w-5 h-5 text-amber-400" />
              <h3 className="font-serif italic text-2xl">Competitive Authority Matrix</h3>
            </div>
            <p className="text-xs text-[#E4E3E0]/70 max-w-2xl leading-relaxed">
              Cross-referencing your topical coverage against competitors reveals where you can seize 
              uncontested market share (Blue Ocean), defend existing rankings (Battleground), and close 
              critical deficits where competitors currently dominate (Competitor Advantage).
            </p>
          </div>
          <div className="text-right font-mono">
            <span className="text-3xl font-bold text-amber-400">{competitorAdvantage.length}</span>
            <p className="text-[10px] uppercase opacity-60">High-Threat Gaps</p>
          </div>
        </div>
      </div>

      {/* 2x2 Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quadrant 1: Competitor Advantage (Urgent Gaps) */}
        <div className="border-2 border-rose-600 bg-rose-50/40 p-5 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-rose-200 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-rose-600 text-white flex items-center justify-center">
                <ShieldAlert className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-rose-950 uppercase tracking-tight">Competitor Advantage (Topical Threat)</h4>
                <p className="text-[10px] text-rose-700">Competitor ranks; You do not</p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold bg-rose-200 text-rose-900 px-2 py-0.5 rounded">
              {competitorAdvantage.length} Topics
            </span>
          </div>

          <p className="text-xs text-rose-900/80 mb-4 italic">
            Urgent Content Gaps: Competitor has established topical links and authority here. Prioritize these to reclaim SERP share.
          </p>

          <div className="space-y-2 flex-1 max-h-72 overflow-y-auto pr-1">
            {competitorAdvantage.length === 0 ? (
              <p className="text-xs text-rose-600 italic py-4 text-center">No immediate competitor advantage gaps found.</p>
            ) : (
              competitorAdvantage.map(item => (
                <div
                  key={item.nodeId}
                  onClick={() => onSelectNode(item.nodeId)}
                  className={`p-3 border text-xs cursor-pointer transition-all ${
                    selectedNodeId === item.nodeId
                      ? 'bg-[#141414] text-[#E4E3E0] border-[#141414]'
                      : 'bg-white border-rose-200 hover:border-rose-400'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold mb-1">
                    <span className="truncate">{item.nodeLabel}</span>
                    <span className="text-[9px] font-mono uppercase bg-rose-100 text-rose-800 px-1.5 py-0.5 ml-2">
                      {item.intent}
                    </span>
                  </div>
                  <p className="text-[11px] opacity-80 line-clamp-1 mb-1">{item.recommendedAction}</p>
                  {item.competitorMatchedUrl && (
                    <div className="text-[10px] font-mono text-rose-700 truncate flex items-center gap-1">
                      <ExternalLink className="w-2.5 h-2.5" />
                      Competitor URL: {item.competitorMatchedUrl}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quadrant 2: Blue Ocean (Unclaimed Authority) */}
        <div className="border-2 border-blue-600 bg-blue-50/40 p-5 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-blue-200 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-blue-600 text-white flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-blue-950 uppercase tracking-tight">Blue Ocean (White-Space Opportunity)</h4>
                <p className="text-[10px] text-blue-700">Neither you nor competitor has covered</p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold bg-blue-200 text-blue-900 px-2 py-0.5 rounded">
              {blueOcean.length} Topics
            </span>
          </div>

          <p className="text-xs text-blue-900/80 mb-4 italic">
            First-Mover Advantage: High-opportunity untapped semantic entities. Publish early to build unassailable early authority.
          </p>

          <div className="space-y-2 flex-1 max-h-72 overflow-y-auto pr-1">
            {blueOcean.length === 0 ? (
              <p className="text-xs text-blue-600 italic py-4 text-center">All topics have existing coverage from you or competitors.</p>
            ) : (
              blueOcean.map(item => (
                <div
                  key={item.nodeId}
                  onClick={() => onSelectNode(item.nodeId)}
                  className={`p-3 border text-xs cursor-pointer transition-all ${
                    selectedNodeId === item.nodeId
                      ? 'bg-[#141414] text-[#E4E3E0] border-[#141414]'
                      : 'bg-white border-blue-200 hover:border-blue-400'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold mb-1">
                    <span className="truncate">{item.nodeLabel}</span>
                    <span className="text-[9px] font-mono uppercase bg-blue-100 text-blue-800 px-1.5 py-0.5 ml-2">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-[11px] opacity-80 line-clamp-1 mb-1">{item.recommendedAction}</p>
                  <div className="text-[10px] font-mono text-blue-700 truncate">
                    Suggested Target: {item.targetSlug}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quadrant 3: Battleground (Head-to-Head Parity) */}
        <div className="border border-[#141414] bg-amber-50/40 p-5 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-amber-200 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-amber-600 text-white flex items-center justify-center">
                <Swords className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-amber-950 uppercase tracking-tight">Battleground (Head-to-Head Parity)</h4>
                <p className="text-[10px] text-amber-800">Both you and competitor have published</p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded">
              {battleground.length} Topics
            </span>
          </div>

          <p className="text-xs text-amber-900/80 mb-4 italic">
            Content Quality & Entity Depth Race: Outrank competitor by injecting schema markup, expert quotes, and richer entity connections.
          </p>

          <div className="space-y-2 flex-1 max-h-72 overflow-y-auto pr-1">
            {battleground.length === 0 ? (
              <p className="text-xs text-amber-600 italic py-4 text-center">No overlapping covered topics found.</p>
            ) : (
              battleground.map(item => (
                <div
                  key={item.nodeId}
                  onClick={() => onSelectNode(item.nodeId)}
                  className={`p-3 border text-xs cursor-pointer transition-all ${
                    selectedNodeId === item.nodeId
                      ? 'bg-[#141414] text-[#E4E3E0] border-[#141414]'
                      : 'bg-white border-amber-200 hover:border-amber-400'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold mb-1">
                    <span className="truncate">{item.nodeLabel}</span>
                    <span className="text-[9px] font-mono uppercase bg-amber-100 text-amber-800 px-1.5 py-0.5 ml-2">
                      Parity
                    </span>
                  </div>
                  <div className="text-[10px] font-mono text-emerald-800 truncate">
                    Your URL: {item.userMatchedUrl}
                  </div>
                  <div className="text-[10px] font-mono text-rose-800 truncate">
                    Competitor URL: {item.competitorMatchedUrl}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quadrant 4: User Advantage (Your Competitive Moat) */}
        <div className="border border-emerald-600 bg-emerald-50/40 p-5 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-emerald-200 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-emerald-600 text-white flex items-center justify-center">
                <Trophy className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-emerald-950 uppercase tracking-tight">User Advantage (Competitive Moat)</h4>
                <p className="text-[10px] text-emerald-700">You cover this; Competitor has a gap</p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded">
              {userAdvantage.length} Topics
            </span>
          </div>

          <p className="text-xs text-emerald-900/80 mb-4 italic">
            Moat Protection: You hold exclusive authority here. Funnel internal links from these URLs into your new target pages.
          </p>

          <div className="space-y-2 flex-1 max-h-72 overflow-y-auto pr-1">
            {userAdvantage.length === 0 ? (
              <p className="text-xs text-emerald-600 italic py-4 text-center">No unique covered topics against competitors yet.</p>
            ) : (
              userAdvantage.map(item => (
                <div
                  key={item.nodeId}
                  onClick={() => onSelectNode(item.nodeId)}
                  className={`p-3 border text-xs cursor-pointer transition-all ${
                    selectedNodeId === item.nodeId
                      ? 'bg-[#141414] text-[#E4E3E0] border-[#141414]'
                      : 'bg-white border-emerald-200 hover:border-emerald-400'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold mb-1">
                    <span className="truncate">{item.nodeLabel}</span>
                    <span className="text-[9px] font-mono uppercase bg-emerald-100 text-emerald-800 px-1.5 py-0.5 ml-2">
                      Moat Protected
                    </span>
                  </div>
                  <div className="text-[10px] font-mono text-emerald-800 truncate">
                    Live URL: {item.userMatchedUrl}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

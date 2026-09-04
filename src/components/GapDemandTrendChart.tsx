import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { 
  TrendingUp, 
  Layers, 
  Calendar, 
  Sparkles, 
  ArrowUpRight, 
  Eye, 
  Filter, 
  Info,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { NodeGapItem, ClusterDemandTrend, MonthlyTrendPoint } from '../types';
import { generateClusterDemandTrends } from '../utils/trendGenerator';

interface Props {
  gapItems: NodeGapItem[];
  categories: string[];
  seed: string;
  onSelectNode?: (nodeId: string) => void;
}

export default function GapDemandTrendChart({
  gapItems,
  categories,
  seed,
  onSelectNode
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Selected cluster filter: 'all' (aggregate) or specific category name
  const [selectedCluster, setSelectedCluster] = useState<string>('all');
  const [hoveredPoint, setHoveredPoint] = useState<{
    month: string;
    volume: number;
    category: string;
    color: string;
    topTopics: string[];
    x: number;
    y: number;
  } | null>(null);

  const trendAnalysis = useMemo(() => {
    return generateClusterDemandTrends(gapItems, categories);
  }, [gapItems, categories]);

  // Render D3 Trend Chart
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 700;
    const height = 340;
    const margin = { top: 25, right: 35, bottom: 45, left: 65 };

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Determine dataset to display
    const isAggregate = selectedCluster === 'all';
    const activeTrends = isAggregate 
      ? trendAnalysis.trends 
      : trendAnalysis.trends.filter(t => t.category === selectedCluster);

    // Compute max volume for Y scale
    let maxVal = 0;
    if (isAggregate) {
      maxVal = (d3.max(trendAnalysis.aggregateMonthlyData, (d: MonthlyTrendPoint) => d.volume) as number) || 10000;
    } else {
      const active = trendAnalysis.trends.find(t => t.category === selectedCluster);
      maxVal = active ? ((d3.max(active.monthlyData, (d: MonthlyTrendPoint) => d.volume) as number) || 5000) : 5000;
    }

    const months = trendAnalysis.aggregateMonthlyData.map(d => d.month);

    // Scales
    const xScale = d3.scalePoint()
      .domain(months)
      .range([margin.left, width - margin.right])
      .padding(0.2);

    const yScale = d3.scaleLinear()
      .domain([0, maxVal * 1.18])
      .nice()
      .range([height - margin.bottom, margin.top]);

    // Gridlines
    const yAxisGrid = d3.axisLeft(yScale)
      .ticks(5)
      .tickSize(-(width - margin.left - margin.right))
      .tickFormat(() => '');

    svg.append("g")
      .attr("transform", `translate(${margin.left}, 0)`)
      .attr("class", "grid")
      .call(yAxisGrid)
      .selectAll("line")
      .attr("stroke", "#e5e7eb")
      .attr("stroke-dasharray", "2,2");

    svg.selectAll(".domain").remove();

    // Defs: Area Gradients
    const defs = svg.append("defs");

    // Aggregate gradient
    const aggGrad = defs.append("linearGradient")
      .attr("id", "agg-gradient")
      .attr("x1", "0%").attr("y1", "0%")
      .attr("x2", "0%").attr("y2", "100%");
    aggGrad.append("stop").attr("offset", "0%").attr("stop-color", "#2563eb").attr("stop-opacity", 0.28);
    aggGrad.append("stop").attr("offset", "100%").attr("stop-color", "#2563eb").attr("stop-opacity", 0.01);

    // Area generator
    const areaGen = d3.area<{ month: string; volume: number }>()
      .x(d => xScale(d.month) || 0)
      .y0(height - margin.bottom)
      .y1(d => yScale(d.volume))
      .curve(d3.curveMonotoneX);

    // Line generator
    const lineGen = d3.line<{ month: string; volume: number }>()
      .x(d => xScale(d.month) || 0)
      .y(d => yScale(d.volume))
      .curve(d3.curveMonotoneX);

    if (isAggregate) {
      // 1. Draw aggregate filled area
      svg.append("path")
        .datum(trendAnalysis.aggregateMonthlyData)
        .attr("fill", "url(#agg-gradient)")
        .attr("d", areaGen);

      // 2. Draw subtle individual cluster lines
      activeTrends.forEach(trend => {
        svg.append("path")
          .datum(trend.monthlyData)
          .attr("fill", "none")
          .attr("stroke", trend.color)
          .attr("stroke-width", 1.5)
          .attr("stroke-opacity", 0.5)
          .attr("d", lineGen);
      });

      // 3. Draw bold aggregate line on top
      svg.append("path")
        .datum(trendAnalysis.aggregateMonthlyData)
        .attr("fill", "none")
        .attr("stroke", "#141414")
        .attr("stroke-width", 2.8)
        .attr("d", lineGen);

      // Aggregate data points
      svg.selectAll(".agg-dot")
        .data(trendAnalysis.aggregateMonthlyData)
        .join("circle")
        .attr("class", "agg-dot")
        .attr("cx", (d: any) => xScale(d.month) || 0)
        .attr("cy", (d: any) => yScale(d.volume))
        .attr("r", 4.5)
        .attr("fill", "#ffffff")
        .attr("stroke", "#141414")
        .attr("stroke-width", 2);

    } else {
      // Single Selected Cluster
      const active = trendAnalysis.trends.find(t => t.category === selectedCluster);
      if (active) {
        // Gradient
        const singleGrad = defs.append("linearGradient")
          .attr("id", `grad-${active.category.replace(/\s+/g, '-')}`)
          .attr("x1", "0%").attr("y1", "0%")
          .attr("x2", "0%").attr("y2", "100%");
        singleGrad.append("stop").attr("offset", "0%").attr("stop-color", active.color).attr("stop-opacity", 0.35);
        singleGrad.append("stop").attr("offset", "100%").attr("stop-color", active.color).attr("stop-opacity", 0.02);

        svg.append("path")
          .datum(active.monthlyData)
          .attr("fill", `url(#grad-${active.category.replace(/\s+/g, '-')})`)
          .attr("d", areaGen);

        svg.append("path")
          .datum(active.monthlyData)
          .attr("fill", "none")
          .attr("stroke", active.color)
          .attr("stroke-width", 3)
          .attr("d", lineGen);

        svg.selectAll(".cluster-dot")
          .data(active.monthlyData)
          .join("circle")
          .attr("class", "cluster-dot")
          .attr("cx", (d: any) => xScale(d.month) || 0)
          .attr("cy", (d: any) => yScale(d.volume))
          .attr("r", 5)
          .attr("fill", "#ffffff")
          .attr("stroke", active.color)
          .attr("stroke-width", 2.5);
      }
    }

    // Axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale)
      .ticks(5)
      .tickFormat(d => d3.format("~s")(d as number));

    svg.append("g")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .call(xAxis)
      .attr("font-family", "monospace")
      .attr("font-size", "10px")
      .attr("color", "#64748b");

    svg.append("g")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(yAxis)
      .attr("font-family", "monospace")
      .attr("font-size", "10px")
      .attr("color", "#64748b");

    // Y Axis Label
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 16)
      .attr("x", -(height / 2))
      .attr("text-anchor", "middle")
      .attr("font-size", "10px")
      .attr("font-family", "monospace")
      .attr("fill", "#64748b")
      .text("Estimated Monthly Searches");

    // Invisible hover tracking overlay
    const overlay = svg.append("rect")
      .attr("width", width - margin.left - margin.right)
      .attr("height", height - margin.top - margin.bottom)
      .attr("transform", `translate(${margin.left}, ${margin.top})`)
      .attr("fill", "transparent")
      .attr("cursor", "crosshair");

    overlay.on("mousemove", (event) => {
      const [mouseX] = d3.pointer(event);
      // Find closest month
      const eachBand = (width - margin.left - margin.right) / (months.length - 1);
      const index = Math.min(months.length - 1, Math.max(0, Math.round(mouseX / eachBand)));
      const targetMonth = months[index];

      if (isAggregate) {
        const point = trendAnalysis.aggregateMonthlyData[index];
        setHoveredPoint({
          month: targetMonth,
          volume: point.volume,
          category: 'All Missing Clusters (Total Demand)',
          color: '#141414',
          topTopics: trendAnalysis.trends.flatMap(t => t.topGapTopics).slice(0, 3),
          x: (xScale(targetMonth) || 0),
          y: yScale(point.volume)
        });
      } else {
        const active = trendAnalysis.trends.find(t => t.category === selectedCluster);
        if (active) {
          const point = active.monthlyData[index];
          setHoveredPoint({
            month: targetMonth,
            volume: point.volume,
            category: active.category,
            color: active.color,
            topTopics: active.topGapTopics,
            x: (xScale(targetMonth) || 0),
            y: yScale(point.volume)
          });
        }
      }
    });

    overlay.on("mouseleave", () => {
      setHoveredPoint(null);
    });

  }, [trendAnalysis, selectedCluster]);

  if (trendAnalysis.trends.length === 0) {
    return (
      <div className="p-12 text-center bg-white border border-[#141414] space-y-3">
        <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-600" />
        <h3 className="font-serif italic text-xl">No Content Gaps Detected</h3>
        <p className="text-xs text-[#141414]/60 font-mono">
          Your published URLs cover all clusters in the current topical architecture.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white border border-[#141414] p-4">
          <span className="text-[10px] font-mono uppercase opacity-60 block mb-1">
            Current Monthly Opportunity
          </span>
          <div className="text-2xl font-mono font-bold text-blue-700">
            {trendAnalysis.totalMonthlyVolume.toLocaleString()}
            <span className="text-xs font-normal text-[#141414]/50 ml-1">searches/mo</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-700 font-semibold mt-1 flex items-center gap-0.5">
            <ArrowUpRight className="w-3 h-3" /> Combined Uncaptured Demand
          </span>
        </div>

        <div className="bg-white border border-[#141414] p-4">
          <span className="text-[10px] font-mono uppercase opacity-60 block mb-1">
            Annual Search Value
          </span>
          <div className="text-2xl font-mono font-bold text-[#141414]">
            {trendAnalysis.totalAnnualVolume.toLocaleString()}
            <span className="text-xs font-normal text-[#141414]/50 ml-1">annual total</span>
          </div>
          <span className="text-[10px] font-mono opacity-60 mt-1 block">
            12-Month Projected Volume
          </span>
        </div>

        <div className="bg-white border border-[#141414] p-4">
          <span className="text-[10px] font-mono uppercase opacity-60 block mb-1">
            Fastest Growing Cluster
          </span>
          <div className="text-lg font-bold text-amber-900 truncate">
            {trendAnalysis.fastestGrowingCluster}
          </div>
          <span className="text-[10px] font-mono text-amber-700 font-semibold mt-1 flex items-center gap-0.5">
            <Sparkles className="w-3 h-3" /> Rising Search Trend
          </span>
        </div>

        <div className="bg-white border border-[#141414] p-4">
          <span className="text-[10px] font-mono uppercase opacity-60 block mb-1">
            Seasonal Peak Demand
          </span>
          <div className="text-2xl font-mono font-bold text-purple-800">
            {trendAnalysis.peakMonth}
          </div>
          <span className="text-[10px] font-mono opacity-60 mt-1 block">
            Optimal Publishing Target
          </span>
        </div>
      </div>

      {/* Main Chart Card */}
      <div className="bg-white border border-[#141414] p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#141414]/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <h3 className="font-serif italic text-xl font-bold">
                12-Month Search Demand Trends by Missing Cluster
              </h3>
            </div>
            <p className="text-xs text-[#141414]/70 mt-0.5">
              Estimated search volume trajectories showing seasonal demand and growth velocity for unwritten content hubs.
            </p>
          </div>

          {/* Cluster Filter Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setSelectedCluster('all')}
              className={`text-xs font-mono uppercase px-3 py-1 border transition-all ${
                selectedCluster === 'all'
                  ? 'bg-[#141414] text-[#E4E3E0] border-[#141414] font-bold'
                  : 'bg-white border-[#141414]/20 hover:border-[#141414]'
              }`}
            >
              Aggregate Demand
            </button>
            {trendAnalysis.trends.map(t => (
              <button
                key={t.category}
                onClick={() => setSelectedCluster(t.category)}
                className={`text-xs font-mono uppercase px-2.5 py-1 border transition-all flex items-center gap-1.5 ${
                  selectedCluster === t.category
                    ? 'bg-[#141414] text-white border-[#141414] font-bold'
                    : 'bg-white border-[#141414]/20 hover:border-[#141414]'
                }`}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} />
                <span>{t.category}</span>
                <span className="text-[10px] opacity-60">({t.gapCount})</span>
              </button>
            ))}
          </div>
        </div>

        {/* D3 Graph Area */}
        <div className="relative" ref={containerRef}>
          <svg ref={svgRef} className="w-full h-[340px]" />

          {/* Interactive Floating Tooltip */}
          {hoveredPoint && (
            <div 
              className="absolute pointer-events-none z-20 bg-[#141414] text-[#E4E3E0] p-3 border border-white/20 shadow-xl text-xs max-w-xs transition-transform duration-75"
              style={{
                left: `${Math.min(hoveredPoint.x + 15, (containerRef.current?.clientWidth || 600) - 220)}px`,
                top: `${Math.max(10, hoveredPoint.y - 70)}px`
              }}
            >
              <div className="flex items-center justify-between gap-2 border-b border-white/20 pb-1 mb-1.5 font-mono text-[10px]">
                <span className="font-bold uppercase tracking-wider">{hoveredPoint.month} Demand</span>
                <span className="text-emerald-400 font-bold">{hoveredPoint.volume.toLocaleString()} searches</span>
              </div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: hoveredPoint.color }} />
                <span className="font-bold truncate">{hoveredPoint.category}</span>
              </div>
              {hoveredPoint.topTopics.length > 0 && (
                <div className="mt-1.5 pt-1.5 border-t border-white/10 text-[10px] text-[#E4E3E0]/70 font-mono">
                  <span className="block opacity-50 mb-0.5">Key Missing Topics:</span>
                  {hoveredPoint.topTopics.map((top, idx) => (
                    <div key={idx} className="truncate">• {top}</div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Cluster Demand Table Breakdown */}
      <div className="bg-white border border-[#141414] overflow-hidden">
        <div className="p-4 border-b border-[#141414] bg-[#F0EFED] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#141414]" />
            <h4 className="font-serif italic font-bold text-base">
              Missing Cluster Search Demand Breakdown
            </h4>
          </div>
          <span className="text-[10px] font-mono uppercase opacity-60">
            {trendAnalysis.trends.length} Clusters with Content Gaps
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-[#141414] bg-[#FBFBFA] font-mono text-[10px] uppercase text-[#141414]/70">
                <th className="p-3">Cluster Category</th>
                <th className="p-3">Gaps Count</th>
                <th className="p-3">Avg. Monthly Volume</th>
                <th className="p-3">Annual Opportunity</th>
                <th className="p-3">YoY Velocity</th>
                <th className="p-3">Peak Month</th>
                <th className="p-3">Top Missing Entity Topics</th>
              </tr>
            </thead>
            <tbody>
              {trendAnalysis.trends.map((cluster) => (
                <tr 
                  key={cluster.category} 
                  className={`border-b border-[#141414]/10 hover:bg-[#141414]/5 transition-colors cursor-pointer ${
                    selectedCluster === cluster.category ? 'bg-blue-50/50 font-semibold' : ''
                  }`}
                  onClick={() => setSelectedCluster(cluster.category)}
                >
                  <td className="p-3 font-bold flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cluster.color }} />
                    <span>{cluster.category}</span>
                  </td>
                  <td className="p-3 font-mono">
                    <span className="bg-amber-100 text-amber-900 border border-amber-200 px-2 py-0.5 rounded text-[10px] font-bold">
                      {cluster.gapCount} articles
                    </span>
                  </td>
                  <td className="p-3 font-mono font-bold text-[#141414]">
                    {cluster.averageMonthlyVolume.toLocaleString()}/mo
                  </td>
                  <td className="p-3 font-mono text-[#141414]/80">
                    {cluster.annualTotalVolume.toLocaleString()}/yr
                  </td>
                  <td className="p-3 font-mono">
                    <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 border border-emerald-200 font-bold text-[10px]">
                      +{cluster.growthPercentage}%
                    </span>
                  </td>
                  <td className="p-3 font-mono text-purple-800">
                    {cluster.peakMonth}
                  </td>
                  <td className="p-3 text-[11px] text-[#141414]/80">
                    <div className="flex flex-wrap gap-1">
                      {cluster.topGapTopics.map((topic, i) => (
                        <span 
                          key={i} 
                          className="bg-neutral-100 border border-[#141414]/15 px-1.5 py-0.2 rounded text-[10px] font-mono truncate max-w-[140px]"
                          title={topic}
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

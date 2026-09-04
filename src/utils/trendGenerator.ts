import { NodeGapItem, ClusterDemandTrend, MonthlyTrendPoint } from '../types';

const MONTH_LABELS = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
const YEAR_MONTHS = [
  '2025-10', '2025-11', '2025-12', 
  '2026-01', '2026-02', '2026-03', 
  '2026-04', '2026-05', '2026-06', 
  '2026-07', '2026-08', '2026-09'
];

const CLUSTER_COLORS = [
  '#2563eb', // Blue
  '#d97706', // Amber
  '#059669', // Emerald
  '#dc2626', // Red / Rose
  '#7c3aed', // Purple
  '#0891b2', // Cyan
  '#db2777', // Pink
  '#4b5563'  // Slate
];

// Simple deterministic hash for stable trend simulations
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function generateClusterDemandTrends(
  gapItems: NodeGapItem[],
  categories: string[]
): {
  trends: ClusterDemandTrend[];
  totalMonthlyVolume: number;
  totalAnnualVolume: number;
  fastestGrowingCluster: string;
  peakMonth: string;
  aggregateMonthlyData: MonthlyTrendPoint[];
} {
  const missingItems = gapItems.filter(item => !item.userCovered);

  // Group missing items by category
  const categoryMap = new Map<string, NodeGapItem[]>();
  categories.forEach(c => categoryMap.set(c, []));

  missingItems.forEach(item => {
    const list = categoryMap.get(item.category) || [];
    list.push(item);
    categoryMap.set(item.category, list);
  });

  const trends: ClusterDemandTrend[] = [];

  let colorIdx = 0;
  categoryMap.forEach((items, category) => {
    if (items.length === 0) return;

    const hash = simpleHash(category);
    const color = CLUSTER_COLORS[colorIdx % CLUSTER_COLORS.length];
    colorIdx++;

    // Calculate base demand per gap item
    let baseVolume = 0;
    items.forEach(item => {
      let weight = 1200;
      if (item.priority === 'High') weight += 1800;
      if (item.intent === 'Commercial') weight += 800;
      if (item.intent === 'Informational') weight += 400;
      baseVolume += weight;
    });

    // Generate 12-month trajectory with seasonal variations & YoY growth
    const growthRate = 0.12 + ((hash % 20) / 100); // 12% to 32% growth
    const seasonalPeakOffset = (hash % 6) + 2; // Peak in Spring/Summer/Fall

    let maxVol = 0;
    let peakMonth = MONTH_LABELS[0];
    let annualSum = 0;

    const monthlyData: MonthlyTrendPoint[] = MONTH_LABELS.map((month, idx) => {
      // Base growth curve
      const growthFactor = 1 + (growthRate * (idx / 11));
      // Seasonal sine wave
      const seasonalFactor = 1 + (0.18 * Math.sin(((idx + seasonalPeakOffset) / 11) * Math.PI * 2));
      // Small random jitter
      const jitterFactor = 1 + (((hash * (idx + 1)) % 11 - 5) / 100);

      const vol = Math.round(baseVolume * growthFactor * seasonalFactor * jitterFactor);
      annualSum += vol;

      if (vol > maxVol) {
        maxVol = vol;
        peakMonth = month;
      }

      return {
        month,
        yearMonth: YEAR_MONTHS[idx],
        volume: vol
      };
    });

    const avgVol = Math.round(annualSum / 12);
    const growthPercentage = Math.round(growthRate * 100);

    trends.push({
      category,
      color,
      gapCount: items.length,
      averageMonthlyVolume: avgVol,
      annualTotalVolume: annualSum,
      growthPercentage,
      peakMonth,
      topGapTopics: items.map(i => i.nodeLabel).slice(0, 4),
      monthlyData
    });
  });

  // Calculate Aggregate Monthly Data across all missing clusters
  let totalAnnualVolume = 0;
  let highestAggVol = 0;
  let overallPeakMonth = MONTH_LABELS[0];

  const aggregateMonthlyData: MonthlyTrendPoint[] = MONTH_LABELS.map((month, idx) => {
    const sumVol = trends.reduce((acc, t) => acc + (t.monthlyData[idx]?.volume || 0), 0);
    totalAnnualVolume += sumVol;

    if (sumVol > highestAggVol) {
      highestAggVol = sumVol;
      overallPeakMonth = month;
    }

    return {
      month,
      yearMonth: YEAR_MONTHS[idx],
      volume: sumVol
    };
  });

  const latestMonthlyVolume = aggregateMonthlyData[aggregateMonthlyData.length - 1]?.volume || 0;

  // Fastest growing cluster
  const fastest = [...trends].sort((a, b) => b.growthPercentage - a.growthPercentage)[0];

  return {
    trends,
    totalMonthlyVolume: latestMonthlyVolume,
    totalAnnualVolume,
    fastestGrowingCluster: fastest ? `${fastest.category} (+${fastest.growthPercentage}%)` : 'None',
    peakMonth: overallPeakMonth,
    aggregateMonthlyData
  };
}

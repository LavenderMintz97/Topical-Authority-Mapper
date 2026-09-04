import { TopicalMap, SEOEntity, NodeGapItem, GapAnalysisSummary, FilterOptions, MatrixStatus, GapPriority } from '../types';

const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'as',
  'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can',
  'did', 'do', 'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had',
  'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself', 'his', 'how',
  'i', 'if', 'in', 'into', 'is', 'it', 'its', 'itself', 'just', 'me', 'more', 'most', 'my', 'myself',
  'no', 'nor', 'not', 'now', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'our', 'ours', 'ourselves',
  'out', 'over', 'own', 'same', 'she', 'should', 'so', 'some', 'such', 'than', 'that', 'the', 'their',
  'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they', 'this', 'those', 'through', 'to',
  'too', 'under', 'until', 'up', 'very', 'was', 'we', 'were', 'what', 'when', 'where', 'which', 'while',
  'who', 'whom', 'why', 'with', 'would', 'you', 'your', 'yours', 'yourself', 'yourselves', 'vs', 'guide'
]);

function normalizeToken(token: string): string {
  let t = token.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (t.endsWith('ies') && t.length > 4) t = t.slice(0, -3) + 'y';
  else if (t.endsWith('es') && t.length > 4) t = t.slice(0, -2);
  else if (t.endsWith('s') && !t.endsWith('ss') && t.length > 3) t = t.slice(0, -1);
  else if (t.endsWith('ing') && t.length > 5) t = t.slice(0, -3);
  return t;
}

export function extractTokens(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[\s\-_/\\.:,;?&=#+]+/)
    .map(normalizeToken)
    .filter(t => t.length > 1 && !STOP_WORDS.has(t));
}

export function extractUrlTokens(rawUrl: string): string[] {
  try {
    let clean = rawUrl.trim();
    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
      clean = 'https://' + clean;
    }
    const parsed = new URL(clean);
    const pathAndQuery = `${parsed.pathname} ${parsed.search}`;
    return extractTokens(pathAndQuery);
  } catch {
    return extractTokens(rawUrl);
  }
}

export function calculateMatchScore(
  nodeTokens: Set<string>,
  entityTokens: Set<string>,
  urlTokens: string[]
): number {
  if (nodeTokens.size === 0 || urlTokens.length === 0) return 0;

  const urlSet = new Set(urlTokens);
  let labelMatches = 0;
  nodeTokens.forEach(token => {
    if (urlSet.has(token)) labelMatches++;
  });

  let entityMatches = 0;
  entityTokens.forEach(token => {
    if (urlSet.has(token)) entityMatches++;
  });

  const labelScore = (labelMatches / Math.max(1, nodeTokens.size)) * 80;
  const entityScore = Math.min(20, (entityMatches / Math.max(1, entityTokens.size)) * 20);

  return Math.min(100, Math.round(labelScore + entityScore));
}

export function findBestMatchingUrl(
  node: SEOEntity,
  urls: string[]
): { matchedUrl?: string; matchScore: number } {
  const nodeTokens = new Set(extractTokens(node.label));
  const entityTokens = new Set(extractTokens(node.entities.join(' ')));

  let bestUrl: string | undefined = undefined;
  let bestScore = 0;

  for (const url of urls) {
    const trimmed = url.trim();
    if (!trimmed) continue;
    const urlTokens = extractUrlTokens(trimmed);
    const score = calculateMatchScore(nodeTokens, entityTokens, urlTokens);

    if (score > bestScore) {
      bestScore = score;
      bestUrl = trimmed;
    }
  }

  // Threshold: 35% overlap qualifies as covered
  return {
    matchedUrl: bestScore >= 35 ? bestUrl : undefined,
    matchScore: bestScore
  };
}

export function inferNodeCategories(mapData: TopicalMap): Map<string, string> {
  const categoryMap = new Map<string, string>();
  const clusterMap = new Map<string, string>();

  // Assign cluster categories
  mapData.nodes.forEach(node => {
    if (node.type === 'pillar') {
      categoryMap.set(node.id, 'Core Pillar');
    } else if (node.type === 'cluster') {
      const catName = node.label.replace(/^(the|a|an)\s+/i, '').trim();
      categoryMap.set(node.id, catName);
      clusterMap.set(node.id, catName);
    }
  });

  // Assign supporting nodes to the category of their incoming cluster
  mapData.nodes.forEach(node => {
    if (node.type === 'supporting') {
      const incomingLinks = mapData.links.filter(l => {
        const targetId = typeof l.target === 'object' ? (l.target as any).id : l.target;
        return targetId === node.id;
      });

      let assignedCat = 'Supporting Topic';
      for (const link of incomingLinks) {
        const sourceId = typeof link.source === 'object' ? (link.source as any).id : link.source;
        if (clusterMap.has(sourceId)) {
          assignedCat = clusterMap.get(sourceId)!;
          break;
        }
      }
      categoryMap.set(node.id, assignedCat);
    }
  });

  return categoryMap;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-');
}

export function determineMatrixStatus(userCovered: boolean, competitorCovered: boolean): MatrixStatus {
  if (userCovered && !competitorCovered) return 'user_advantage';
  if (!userCovered && competitorCovered) return 'competitor_advantage';
  if (userCovered && competitorCovered) return 'battleground';
  return 'blue_ocean';
}

export function determinePriority(
  node: SEOEntity,
  matrixStatus: MatrixStatus,
  userCovered: boolean
): GapPriority {
  if (userCovered) return 'Low';
  if (node.type === 'pillar' || node.type === 'cluster') return 'High';
  if (matrixStatus === 'competitor_advantage') return 'High';
  if (node.intent === 'Commercial' || node.intent === 'Transactional') return 'High';
  return 'Medium';
}

export function generateRecommendedAction(
  node: SEOEntity,
  matrixStatus: MatrixStatus,
  userCovered: boolean
): string {
  if (userCovered) {
    if (matrixStatus === 'battleground') {
      return 'Update & Enhance: Optimize entities & Schema to outperform competitor ranking.';
    }
    return 'Defend & Internal Link: Maintain freshness and link equity down to supporting clusters.';
  }

  if (matrixStatus === 'competitor_advantage') {
    return 'Immediate Content Gap: Competitor ranks here. Publish comprehensive pillar/cluster asset to reclaim market share.';
  }

  if (matrixStatus === 'blue_ocean') {
    return 'First-Mover Opportunity: Neither you nor competitor covers this. Publish early to dominate authority.';
  }

  return 'Create New Article: Draft structured guide according to semantic entities and internal link logic.';
}

export function analyzeTopicalMapGaps(
  mapData: TopicalMap,
  userUrls: string[],
  competitorUrls: string[] = []
): { items: NodeGapItem[]; summary: GapAnalysisSummary; categories: string[] } {
  const categoryMap = inferNodeCategories(mapData);
  const categoriesSet = new Set<string>();

  const items: NodeGapItem[] = mapData.nodes.map(node => {
    const category = categoryMap.get(node.id) || (node.type === 'pillar' ? 'Core Pillar' : 'General Topic');
    categoriesSet.add(category);

    const userMatch = findBestMatchingUrl(node, userUrls);
    const competitorMatch = findBestMatchingUrl(node, competitorUrls);

    const userCovered = userMatch.matchScore >= 35;
    const competitorCovered = competitorMatch.matchScore >= 35;

    const matrixStatus = determineMatrixStatus(userCovered, competitorCovered);
    const priority = determinePriority(node, matrixStatus, userCovered);
    const recommendedAction = generateRecommendedAction(node, matrixStatus, userCovered);
    const targetSlug = `/${slugify(category)}/${slugify(node.label)}`;

    return {
      nodeId: node.id,
      nodeLabel: node.label,
      nodeType: node.type,
      intent: node.intent,
      category,
      entities: node.entities,
      userCovered,
      userMatchedUrl: userMatch.matchedUrl,
      userMatchScore: userMatch.matchScore,
      competitorCovered,
      competitorMatchedUrl: competitorMatch.matchedUrl,
      competitorMatchScore: competitorMatch.matchScore,
      matrixStatus,
      priority,
      recommendedAction,
      targetSlug
    };
  });

  const totalNodes = items.length;
  const userCoveredCount = items.filter(i => i.userCovered).length;
  const userGapCount = totalNodes - userCoveredCount;
  const coveragePercentage = totalNodes > 0 ? Math.round((userCoveredCount / totalNodes) * 100) : 0;

  const competitorCoveredCount = items.filter(i => i.competitorCovered).length;
  const competitorGapCount = totalNodes - competitorCoveredCount;
  const competitorAdvantageCount = items.filter(i => i.matrixStatus === 'competitor_advantage').length;
  const blueOceanCount = items.filter(i => i.matrixStatus === 'blue_ocean').length;
  const battlegroundCount = items.filter(i => i.matrixStatus === 'battleground').length;
  const userAdvantageCount = items.filter(i => i.matrixStatus === 'user_advantage').length;
  const highPriorityGapsCount = items.filter(i => !i.userCovered && i.priority === 'High').length;

  const summary: GapAnalysisSummary = {
    totalNodes,
    userCoveredCount,
    userGapCount,
    coveragePercentage,
    competitorCoveredCount,
    competitorGapCount,
    competitorAdvantageCount,
    blueOceanCount,
    battlegroundCount,
    userAdvantageCount,
    highPriorityGapsCount
  };

  return {
    items,
    summary,
    categories: Array.from(categoriesSet).sort()
  };
}

export function filterGapItems(items: NodeGapItem[], filters: FilterOptions): NodeGapItem[] {
  return items.filter(item => {
    // Search query filter
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase();
      const matchesLabel = item.nodeLabel.toLowerCase().includes(q);
      const matchesCategory = item.category.toLowerCase().includes(q);
      const matchesEntity = item.entities.some(e => e.toLowerCase().includes(q));
      const matchesUrl = (item.userMatchedUrl || '').toLowerCase().includes(q);
      if (!matchesLabel && !matchesCategory && !matchesEntity && !matchesUrl) {
        return false;
      }
    }

    // Node Type filter
    if (filters.nodeType !== 'all' && item.nodeType !== filters.nodeType) {
      return false;
    }

    // Search Intent filter
    if (filters.intent !== 'all' && item.intent !== filters.intent) {
      return false;
    }

    // Category filter
    if (filters.category !== 'all' && item.category !== filters.category) {
      return false;
    }

    // Gap Status filter
    if (filters.gapStatus === 'gaps_only' && item.userCovered) {
      return false;
    }
    if (filters.gapStatus === 'covered_only' && !item.userCovered) {
      return false;
    }
    if (filters.gapStatus === 'competitor_gap' && item.matrixStatus !== 'competitor_advantage') {
      return false;
    }
    if (filters.gapStatus === 'blue_ocean' && item.matrixStatus !== 'blue_ocean') {
      return false;
    }

    return true;
  });
}

export function generateSampleUrls(seed: string): { userUrls: string[]; competitorUrls: string[] } {
  const clean = slugify(seed || 'semantic-seo');
  return {
    userUrls: [
      `https://example.com/blog/${clean}-fundamentals`,
      `https://example.com/guides/beginner-tutorial-for-${clean}`,
      `https://example.com/${clean}-checklist`,
      `https://example.com/resources/what-is-${clean}`
    ],
    competitorUrls: [
      `https://competitor.com/${clean}-complete-pillar-guide`,
      `https://competitor.com/solutions/advanced-${clean}-strategies`,
      `https://competitor.com/tools/${clean}-software-comparison`,
      `https://competitor.com/blog/common-mistakes-in-${clean}`,
      `https://competitor.com/research/future-trends-roi-${clean}`
    ]
  };
}

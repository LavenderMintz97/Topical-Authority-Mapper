export type SearchIntent = 'Informational' | 'Transactional' | 'Navigational' | 'Commercial';
export type NodeType = 'pillar' | 'cluster' | 'supporting';

export interface SEOEntity {
  id: string;
  label: string;
  type: NodeType;
  intent: SearchIntent;
  description: string;
  entities: string[]; // Connections to other entities
  linkingLogic: string; // Internal linking notes
  category?: string; // Assigned or inferred cluster category
}

export interface SEOLink {
  source: string;
  target: string;
  relationship: string;
}

export interface TopicalMap {
  seed: string;
  nodes: SEOEntity[];
  links: SEOLink[];
}

export interface SEONodeDimensions {
  width: number;
  height: number;
  x: number;
  y: number;
}

export type MatrixStatus = 'user_advantage' | 'competitor_advantage' | 'battleground' | 'blue_ocean';
export type GapPriority = 'High' | 'Medium' | 'Low';

export interface NodeGapItem {
  nodeId: string;
  nodeLabel: string;
  nodeType: NodeType;
  intent: SearchIntent;
  category: string;
  entities: string[];
  userCovered: boolean;
  userMatchedUrl?: string;
  userMatchScore: number; // 0 - 100%
  competitorCovered: boolean;
  competitorMatchedUrl?: string;
  competitorMatchScore: number; // 0 - 100%
  matrixStatus: MatrixStatus;
  priority: GapPriority;
  recommendedAction: string;
  targetSlug: string;
}

export interface GapAnalysisSummary {
  totalNodes: number;
  userCoveredCount: number;
  userGapCount: number;
  coveragePercentage: number;
  competitorCoveredCount: number;
  competitorGapCount: number;
  competitorAdvantageCount: number;
  blueOceanCount: number;
  battlegroundCount: number;
  userAdvantageCount: number;
  highPriorityGapsCount: number;
}

export interface FilterOptions {
  searchQuery: string;
  nodeType: 'all' | NodeType;
  intent: 'all' | SearchIntent;
  category: string; // 'all' or category name
  gapStatus: 'all' | 'gaps_only' | 'covered_only' | 'competitor_gap' | 'blue_ocean';
}


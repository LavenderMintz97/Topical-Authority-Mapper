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

import { TopicalMap, SEOEntity, SEOLink } from '../types';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || (typeof process !== 'undefined' ? process.env?.GEMINI_API_KEY : '');

function createFallbackMap(seed: string): TopicalMap {
  const cleanSeed = seed.trim() || 'Semantic SEO';
  const pillarId = 'pillar-core';

  const nodes: SEOEntity[] = [
    {
      id: pillarId,
      label: cleanSeed,
      type: 'pillar',
      intent: 'Informational',
      description: `Comprehensive core pillar guide covering foundational concepts, best practices, and strategic implementations for ${cleanSeed}.`,
      entities: [`${cleanSeed} Architecture`, 'Core Principles', 'Taxonomy', 'Strategy'],
      linkingLogic: 'Central thematic anchor linking downward to all cluster hubs.'
    },
    {
      id: 'cluster-fundamentals',
      label: `${cleanSeed} Fundamentals`,
      type: 'cluster',
      intent: 'Informational',
      description: `Core mechanisms, key terminology, and foundational building blocks of ${cleanSeed}.`,
      entities: ['Definitions', 'Key Methodologies', 'Standard Workflows'],
      linkingLogic: 'Links up to Pillar; distributes contextual link equity to supporting tutorials.'
    },
    {
      id: 'cluster-advanced',
      label: `Advanced ${cleanSeed} Strategies`,
      type: 'cluster',
      intent: 'Commercial',
      description: `Scalable execution models, enterprise patterns, and advanced optimizations for ${cleanSeed}.`,
      entities: ['Optimization Frameworks', 'Scalability', 'Case Studies'],
      linkingLogic: 'Reciprocal link with Pillar; points to implementation guides.'
    },
    {
      id: 'cluster-tools',
      label: `${cleanSeed} Tools & Technologies`,
      type: 'cluster',
      intent: 'Commercial',
      description: `Evaluation criteria, technology stack comparisons, and automation workflows.`,
      entities: ['Software Evaluation', 'Integration APIs', 'Automation'],
      linkingLogic: 'Cross-links with Advanced Strategies and links up to Pillar.'
    },
    {
      id: 'support-1',
      label: `Beginner Tutorial for ${cleanSeed}`,
      type: 'supporting',
      intent: 'Informational',
      description: `Step-by-step onboarding walkthrough for beginners entering ${cleanSeed}.`,
      entities: ['Getting Started', 'Prerequisites', 'Checklist'],
      linkingLogic: 'Links up to Fundamentals cluster and to Troubleshooting guide.'
    },
    {
      id: 'support-2',
      label: `Common Mistakes in ${cleanSeed}`,
      type: 'supporting',
      intent: 'Informational',
      description: `Pitfalls, anti-patterns, and troubleshooting diagnostics to avoid.`,
      entities: ['Risk Mitigation', 'Quality Assurance', 'Audits'],
      linkingLogic: 'Contextual bridge between Fundamentals and Advanced clusters.'
    },
    {
      id: 'support-3',
      label: `${cleanSeed} Implementation Checklist`,
      type: 'supporting',
      intent: 'Transactional',
      description: `Actionable deployment guide with phase-by-phase execution items.`,
      entities: ['Action Items', 'Milestones', 'Verification'],
      linkingLogic: 'Links directly to Advanced Strategies cluster.'
    },
    {
      id: 'support-4',
      label: `Comparative Benchmark & Alternatives`,
      type: 'supporting',
      intent: 'Commercial',
      description: `Side-by-side performance, cost, and efficiency comparisons in the ${cleanSeed} ecosystem.`,
      entities: ['Benchmarking', 'ROI Metrics', 'Vendor Selection'],
      linkingLogic: 'Points to Tools & Technologies cluster.'
    },
    {
      id: 'support-5',
      label: `Future Trends & ROI in ${cleanSeed}`,
      type: 'supporting',
      intent: 'Informational',
      description: `Emerging developments, predictions, and long-term value drivers.`,
      entities: ['Market Projections', 'Innovation', 'Strategic Roadmap'],
      linkingLogic: 'Links to Pillar and Advanced Strategies.'
    }
  ];

  const links: SEOLink[] = [
    { source: pillarId, target: 'cluster-fundamentals', relationship: 'Foundational Subtopic' },
    { source: pillarId, target: 'cluster-advanced', relationship: 'Strategic Extension' },
    { source: pillarId, target: 'cluster-tools', relationship: 'Tooling Ecosystem' },
    { source: 'cluster-fundamentals', target: 'support-1', relationship: 'Introductory Guide' },
    { source: 'cluster-fundamentals', target: 'support-2', relationship: 'Troubleshooting Resource' },
    { source: 'cluster-advanced', target: 'support-3', relationship: 'Execution Spec' },
    { source: 'cluster-advanced', target: 'support-5', relationship: 'Strategic Analysis' },
    { source: 'cluster-tools', target: 'support-4', relationship: 'Comparative Analysis' },
    { source: 'support-2', target: 'cluster-advanced', relationship: 'Resolution Path' },
    { source: 'cluster-fundamentals', target: 'cluster-tools', relationship: 'Tooling Bridge' }
  ];

  return {
    seed: cleanSeed,
    nodes,
    links
  };
}

export async function generateTopicalMap(keyword: string): Promise<TopicalMap> {
  const cleanKeyword = keyword.trim() || 'Semantic SEO';

  if (!API_KEY) {
    console.info('No API key detected; using semantic model template generator for:', cleanKeyword);
    return createFallbackMap(cleanKeyword);
  }

  const prompt = `You are a world-class Semantic SEO and Information Architecture architect.
Generate an entity-based Topical Authority Map for the seed keyword: "${cleanKeyword}".

Format your response strictly as valid JSON without markdown wrapping:
{
  "seed": "${cleanKeyword}",
  "nodes": [
    {
      "id": "pillar-1",
      "label": "...",
      "type": "pillar",
      "intent": "Informational",
      "description": "...",
      "entities": ["entity1", "entity2", "entity3"],
      "linkingLogic": "..."
    },
    {
      "id": "cluster-1",
      "label": "...",
      "type": "cluster",
      "intent": "Informational",
      "description": "...",
      "entities": ["entity1", "entity2"],
      "linkingLogic": "..."
    }
  ],
  "links": [
    {
      "source": "pillar-1",
      "target": "cluster-1",
      "relationship": "Internal Hub Link"
    }
  ]
}

Ensure there is exactly 1 'pillar' node, 3-4 'cluster' nodes, and 5-8 'supporting' nodes. Types must strictly be 'pillar', 'cluster', or 'supporting'. Intents must strictly be 'Informational', 'Transactional', 'Navigational', or 'Commercial'. Link source and target must match node ids.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.4
          }
        })
      }
    );

    if (!response.ok) {
      console.warn(`Gemini API error ${response.status}. Falling back to semantic template.`);
      return createFallbackMap(cleanKeyword);
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      return createFallbackMap(cleanKeyword);
    }

    const cleanedText = rawText.replace(/```json\s*|\s*```/g, '').trim();
    const parsed = JSON.parse(cleanedText) as TopicalMap;

    if (Array.isArray(parsed.nodes) && parsed.nodes.length > 0) {
      return {
        seed: parsed.seed || cleanKeyword,
        nodes: parsed.nodes,
        links: Array.isArray(parsed.links) ? parsed.links : []
      };
    }
    return createFallbackMap(cleanKeyword);
  } catch (error) {
    console.warn('Error querying Gemini API:', error);
    return createFallbackMap(cleanKeyword);
  }
}
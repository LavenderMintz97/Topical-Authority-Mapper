import { SEOContentBrief, BriefOptions, NodeGapItem, SEOEntity } from '../types';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || (typeof process !== 'undefined' ? process.env?.GEMINI_API_KEY : '');

export const DEFAULT_BRIEF_OPTIONS: BriefOptions = {
  audience: 'practitioner',
  format: 'guide',
  tone: 'authoritative',
  wordCount: 'standard',
  serpTarget: 'topical_depth',
  includeCompetitorAngle: true
};

export function createFallbackBrief(
  item: NodeGapItem | SEOEntity,
  options: BriefOptions,
  seedTopic: string
): SEOContentBrief {
  const label = 'nodeLabel' in item ? item.nodeLabel : item.label;
  const category = ('category' in item && item.category) ? item.category : 'General Cluster';
  const nodeId = 'nodeId' in item ? item.nodeId : item.id;
  const entities = item.entities || [];
  const cleanSlug = label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const wordCountMap = {
    short: '1,000 - 1,200 words',
    standard: '1,600 - 2,200 words',
    pillar: '2,800 - 3,500+ words'
  };

  const audienceLabel = {
    beginner: 'Beginners & First-Time Readers',
    practitioner: 'Practitioners & Hands-on Implementers',
    executive: 'Decision Makers & Strategy Leaders',
    technical: 'Technical Engineers & Architects'
  }[options.audience];

  return {
    id: `brief-${nodeId}-${Date.now()}`,
    generatedAt: Date.now(),
    nodeId,
    topicTitle: label,
    category,
    targetSlug: `/${cleanSlug}`,
    titleTag: `${label}: The Complete 2026 Semantic Guide`,
    metaDescription: `Discover the complete guide to ${label}. Learn step-by-step methodologies, key entity architectures, and actionable implementation frameworks.`,
    wordCountEstimate: wordCountMap[options.wordCount],
    options,
    intentAnalysis: {
      primaryIntent: item.intent || 'Informational',
      buyerJourneyStage: options.format === 'comparison' ? 'Consideration' : (options.format === 'playbook' ? 'Decision' : 'Awareness'),
      coreProblemToSolve: `Users searching for "${label}" need an actionable, jargon-free reference to understand core principles, eliminate common implementation failures, and align with ${seedTopic} standards.`,
      specificUserQuestions: [
        `What exactly is ${label} and why is it critical to ${seedTopic}?`,
        `How do I implement ${label} step-by-step without common pitfalls?`,
        `What are the best-in-class tools and metrics used to evaluate ${label}?`,
        `How does ${label} interact with broader search entity architectures?`
      ]
    },
    lsiKeywords: {
      synonymsAndVariants: [
        `${label} tutorial`,
        `${label} best practices`,
        `${label} framework`,
        `${label} architecture`,
        `how to optimize ${label}`,
        `semantic ${label}`
      ],
      longTailQuestions: [
        `What is the difference between ${label} and traditional approaches?`,
        `How much does it cost to set up ${label}?`,
        `What are the most common mistakes in ${label}?`,
        `How to measure the ROI of ${label}?`,
        `Can ${label} be automated with AI workflows?`
      ],
      semanticEntities: [
        ...entities,
        `${seedTopic} Pillar`,
        'Information Architecture',
        'Entity Salience',
        'Knowledge Graph',
        'Content Velocity',
        'Topical Authority'
      ],
      commercialModifiers: [
        `best ${label} tools`,
        `${label} checklist 2026`,
        `${label} platform comparison`,
        `${label} implementation cost`,
        `${label} software review`
      ]
    },
    outline: [
      {
        heading: `Introduction: Defining ${label} in the Context of ${seedTopic}`,
        level: 'h2',
        objective: `Hook the ${audienceLabel.toLowerCase()} audience, provide a direct concise definition for Google AI Overviews, and establish topical relevance.`,
        targetEntities: [label, seedTopic, 'Semantic Foundation'],
        suggestedVisualOrCallout: 'Key Takeaways summary box (3 bullet points) for instant featured snippet capture.'
      },
      {
        heading: `Core Mechanics & Anatomical Framework of ${label}`,
        level: 'h2',
        objective: 'Break down foundational taxonomy, prerequisite knowledge, and essential structural components.',
        targetEntities: entities.slice(0, 2),
        suggestedVisualOrCallout: 'Visual Architecture Diagram or Flowchart mapping inputs to outputs.'
      },
      {
        heading: `Step-by-Step Implementation Blueprint`,
        level: 'h2',
        objective: 'Deliver an authoritative, sequential execution walkthrough with specific parameters and actionable examples.',
        targetEntities: ['Execution Framework', 'Verification Metric'],
        suggestedVisualOrCallout: 'Numbered Step Sequence with code or configuration callouts.'
      },
      {
        heading: `Common Anti-Patterns and Costly Mistakes to Avoid`,
        level: 'h3',
        objective: 'Highlight edge cases and diagnostic troubleshooting steps that low-quality competitor content glosses over.',
        targetEntities: ['Troubleshooting', 'Quality Assurance'],
        suggestedVisualOrCallout: 'Do vs Don\'t 2-column comparative table.'
      },
      {
        heading: `Tools, Metrics & Evaluation Checklist`,
        level: 'h2',
        objective: 'Provide quantifiable KPIs, recommended toolchains, and a ready-to-use audit checklist.',
        targetEntities: ['Performance Metrics', 'Toolchain Integration'],
        suggestedVisualOrCallout: 'Interactive markdown checklist with estimated completion times.'
      },
      {
        heading: `Frequently Asked Questions About ${label}`,
        level: 'h2',
        objective: 'Directly address the top People Also Ask queries to dominate long-tail SERP rich results.',
        targetEntities: ['FAQ Schema', 'Long-tail Queries'],
        suggestedVisualOrCallout: 'Accordion FAQ layout with direct concise 45-word answers.'
      }
    ],
    internalLinking: {
      inboundAnchor: `Comprehensive ${seedTopic} Architecture`,
      targetParent: `/${seedTopic.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      outboundRecommendations: entities.slice(0, 3).map(ent => ({
        label: ent,
        anchorText: `Read our in-depth guide on ${ent}`
      }))
    },
    technicalSeo: {
      schemaType: options.format === 'troubleshooting' ? 'HowTo' : 'FAQPage, Article',
      faqQuestions: [
        {
          question: `What is the primary benefit of ${label}?`,
          answerSummary: `${label} establishes contextual entity trust, closes high-intent keyword gaps, and distributes link equity across the ${seedTopic} knowledge hub.`
        },
        {
          question: `How long does it take to see organic rankings from ${label}?`,
          answerSummary: 'Within 4 to 8 weeks after proper internal linking to the parent pillar and search console indexing.'
        }
      ]
    },
    competitorWeaknessAndEdge: {
      competitorFlaw: 'Competitor content relies on surface-level keyword stuffing without structuring entity co-occurrences or answering concrete practitioner questions.',
      ourWinningAngle: `Structure this guide with rich schema, direct 45-word definition hooks for AI Overviews, and a dedicated 2-column Do/Don't troubleshooting matrix.`
    }
  };
}

export async function generateContentBriefAI(
  item: NodeGapItem | SEOEntity,
  options: BriefOptions,
  seedTopic: string,
  competitorUrl?: string
): Promise<SEOContentBrief> {
  const label = 'nodeLabel' in item ? item.nodeLabel : item.label;
  const category = ('category' in item && item.category) ? item.category : 'Topical Cluster';
  const nodeId = 'nodeId' in item ? item.nodeId : item.id;
  const entities = item.entities || [];

  if (!API_KEY) {
    console.info('No Gemini API key present, using semantic brief engine.');
    return createFallbackBrief(item, options, seedTopic);
  }

  const prompt = `You are an elite Senior Semantic SEO Director and Content Strategist.
Generate a comprehensive, actionable, publication-ready SEO Content Brief for an unwritten content gap node:
- Target Topic: "${label}"
- Cluster Category: "${category}"
- Parent Seed Hub: "${seedTopic}"
- Related Entities: ${JSON.stringify(entities)}
- User Selection Choices:
  * Audience Persona: ${options.audience}
  * Content Format: ${options.format}
  * Tone of Voice: ${options.tone}
  * Target Word Count Level: ${options.wordCount}
  * SERP Feature Priority: ${options.serpTarget}
  * Include Competitor Analysis: ${options.includeCompetitorAngle ? 'Yes' : 'No'}
  * Competitor Reference URL: ${competitorUrl || 'None provided'}

Generate a strict JSON response with no markdown formatting or backticks:
{
  "titleTag": "Max 60 chars, high CTR with primary entity",
  "metaDescription": "Max 155 chars, compelling action verb and target keyword",
  "wordCountEstimate": "e.g. 1,800 - 2,200 words",
  "targetSlug": "/slug-format",
  "intentAnalysis": {
    "primaryIntent": "${item.intent || 'Informational'}",
    "buyerJourneyStage": "Awareness | Consideration | Decision",
    "coreProblemToSolve": "Deep explanation of user search dilemma and desired outcome",
    "specificUserQuestions": ["4 detailed real search queries"]
  },
  "lsiKeywords": {
    "synonymsAndVariants": ["6 semantic synonym phrases"],
    "longTailQuestions": ["6 natural language search questions"],
    "semanticEntities": ["8 crucial co-occurring entity terms for TF-IDF relevance"],
    "commercialModifiers": ["5 high-intent modifier phrases"]
  },
  "outline": [
    {
      "heading": "H2 or H3 heading title",
      "level": "h2",
      "objective": "Strategic purpose for this section",
      "targetEntities": ["entity1", "entity2"],
      "suggestedVisualOrCallout": "Graphic, diagram, table, or callout spec"
    }
  ],
  "internalLinking": {
    "inboundAnchor": "Exact anchor text pointing back to parent pillar",
    "targetParent": "/parent-hub-url",
    "outboundRecommendations": [
      {
        "label": "Related Topic Name",
        "anchorText": "Contextual sentence anchor text"
      }
    ]
  },
  "technicalSeo": {
    "schemaType": "Article, FAQPage, or HowTo",
    "faqQuestions": [
      {
        "question": "Clear common user question",
        "answerSummary": "Direct 40-50 word answer optimized for Google AI Overview"
      }
    ]
  },
  "competitorWeaknessAndEdge": {
    "competitorFlaw": "What competing search results fail to explain or lack depth in",
    "ourWinningAngle": "The unique structural angle or data element that will outrank them"
  }
}`;

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
            temperature: 0.35
          }
        })
      }
    );

    if (!response.ok) {
      console.warn(`Gemini brief API error ${response.status}. Using fallback brief.`);
      return createFallbackBrief(item, options, seedTopic);
    }

    const data = await response.json();
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!raw) return createFallbackBrief(item, options, seedTopic);

    const cleaned = raw.replace(/```json\s*|\s*```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return {
      id: `brief-${nodeId}-${Date.now()}`,
      generatedAt: Date.now(),
      nodeId,
      topicTitle: label,
      category,
      targetSlug: parsed.targetSlug || `/${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      titleTag: parsed.titleTag || `${label}: 2026 Definitive Guide`,
      metaDescription: parsed.metaDescription || `Comprehensive guide to ${label}.`,
      wordCountEstimate: parsed.wordCountEstimate || '1,800 - 2,200 words',
      options,
      intentAnalysis: parsed.intentAnalysis || {
        primaryIntent: item.intent || 'Informational',
        buyerJourneyStage: 'Consideration',
        coreProblemToSolve: `Mastering ${label} within ${seedTopic}.`,
        specificUserQuestions: []
      },
      lsiKeywords: parsed.lsiKeywords || {
        synonymsAndVariants: [],
        longTailQuestions: [],
        semanticEntities: entities,
        commercialModifiers: []
      },
      outline: Array.isArray(parsed.outline) ? parsed.outline : [],
      internalLinking: parsed.internalLinking || {
        inboundAnchor: seedTopic,
        targetParent: `/${seedTopic.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        outboundRecommendations: []
      },
      technicalSeo: parsed.technicalSeo || {
        schemaType: 'Article',
        faqQuestions: []
      },
      competitorWeaknessAndEdge: parsed.competitorWeaknessAndEdge || {
        competitorFlaw: 'Thin coverage of core concepts.',
        ourWinningAngle: 'Deeper entity integration and step-by-step guidance.'
      }
    };
  } catch (err) {
    console.warn('Gemini brief generation failed:', err);
    return createFallbackBrief(item, options, seedTopic);
  }
}

export function exportBriefAsMarkdown(brief: SEOContentBrief): string {
  const dateStr = new Date(brief.generatedAt).toISOString().split('T')[0];

  return `# SEO Content Brief: ${brief.topicTitle}
*Generated on ${dateStr} for ${brief.category} | Target Slug: \`${brief.targetSlug}\`*

---

## 1. Meta & Core Specifications
- **Target Keyword / Topic:** ${brief.topicTitle}
- **Recommended Title Tag:** ${brief.titleTag} (${brief.titleTag.length} chars)
- **Meta Description:** ${brief.metaDescription} (${brief.metaDescription.length} chars)
- **Target Word Count:** ${brief.wordCountEstimate}
- **Target Audience:** ${brief.options.audience}
- **Content Format:** ${brief.options.format}
- **Tone of Voice:** ${brief.options.tone}
- **SERP Priority:** ${brief.options.serpTarget}

---

## 2. Search Intent & User Psychology
- **Primary Search Intent:** ${brief.intentAnalysis.primaryIntent}
- **Buyer Journey Stage:** ${brief.intentAnalysis.buyerJourneyStage}
- **Core Search Problem to Solve:**
> ${brief.intentAnalysis.coreProblemToSolve}

### Specific User Questions to Answer:
${brief.intentAnalysis.specificUserQuestions.map(q => `- ${q}`).join('\n')}

---

## 3. LSI Keywords & Semantic Entity Bank
### A. Semantic Synonyms & Variations:
${brief.lsiKeywords.synonymsAndVariants.map(k => `- \`${k}\``).join('\n')}

### B. Long-Tail Search Questions (PAA):
${brief.lsiKeywords.longTailQuestions.map(k => `- ${k}`).join('\n')}

### C. Co-Occurring Entities (TF-IDF Essential Inclusions):
${brief.lsiKeywords.semanticEntities.map(k => `- **${k}**`).join('\n')}

### D. High-Intent Commercial Modifiers:
${brief.lsiKeywords.commercialModifiers.map(k => `- \`${k}\``).join('\n')}

---

## 4. Article Outline & Content Architecture

${brief.outline.map(sec => `### ${sec.level.toUpperCase()}: ${sec.heading}
- **Objective:** ${sec.objective}
- **Required Entities:** ${sec.targetEntities.join(', ')}
${sec.suggestedVisualOrCallout ? `- **Visual / Callout:** *${sec.suggestedVisualOrCallout}*` : ''}
`).join('\n')}

---

## 5. Internal Linking Directives
- **Inbound Link from Parent Hub:** Link to this page using anchor text: \`${brief.internalLinking.inboundAnchor}\`
- **Outbound Link to Parent Pillar:** Link back to \`${brief.internalLinking.targetParent}\` in the introduction.
- **Outbound Contextual Links:**
${brief.internalLinking.outboundRecommendations.map(r => `  - Link to **${r.label}** using anchor text: *" ${r.anchorText} "*`).join('\n')}

---

## 6. Technical SEO & Schema Specifications
- **Recommended Schema Markup:** \`${brief.technicalSeo.schemaType}\`
### Target FAQ Schema Data:
${brief.technicalSeo.faqQuestions.map(f => `**Q: ${f.question}**\nA: ${f.answerSummary}\n`).join('\n')}

---

## 7. Competitor Outranking Counter-Strategy
- **Competitor Flaws in Top 10:** ${brief.competitorWeaknessAndEdge.competitorFlaw}
- **Our Winning Angle:** ${brief.competitorWeaknessAndEdge.ourWinningAngle}
`;
}

export function exportBriefAsJson(brief: SEOContentBrief): string {
  return JSON.stringify(brief, null, 2);
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    // Fallback for older browsers / iframe restrictions
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.warn('Failed to copy to clipboard:', err);
    return false;
  }
}

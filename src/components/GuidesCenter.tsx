import React, { useState } from 'react';
import { 
  BookOpen, 
  HelpCircle, 
  Layers, 
  Link as LinkIcon, 
  CheckSquare, 
  Swords, 
  Search, 
  Sparkles, 
  ArrowRight, 
  Copy, 
  Check, 
  Network,
  Lightbulb,
  ShieldCheck,
  AlertTriangle,
  FileText
} from 'lucide-react';

export default function GuidesCenter() {
  const [activeGuide, setActiveGuide] = useState<string>('quickstart');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedTemplate, setCopiedTemplate] = useState<boolean>(false);

  const guides = [
    {
      id: 'quickstart',
      title: '1. Beginner Quickstart (3-Minute Guide)',
      category: 'Basics',
      summary: 'What is a Topical Map and how to build one in 3 simple steps without any SEO background.'
    },
    {
      id: 'authority-flow',
      title: '2. Internal Linking & Authority Flow Playbook',
      category: 'Strategy',
      summary: 'How link equity passes from your main pillar guide down to sub-articles, and how to pick anchor text.'
    },
    {
      id: 'gaps-competitors',
      title: '3. Content Gap & Competitor Steal Guide',
      category: 'Execution',
      summary: 'How to paste existing URLs, spot what competitors rank for, and target Blue Ocean opportunities.'
    },
    {
      id: 'writer-checklist',
      title: '4. Content Creator Brief & Pre-Publish Checklist',
      category: 'Templates',
      summary: 'Practical article structure and checklist to hand to writers before hitting publish.'
    },
    {
      id: 'glossary',
      title: '5. Plain-English SEO Glossary',
      category: 'Reference',
      summary: 'Simple definitions for technical terms: Entities, Pillars, Search Intent, and Topical Saturation.'
    }
  ];

  const filteredGuides = guides.filter(g => 
    g.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    g.summary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const copyWriterBrief = () => {
    const brief = `# Content Creation Brief & Checklist

## Article Metadata
- **Target Topic:** [Insert Node Label]
- **Target URL Slug:** /[category]/[slug-name]
- **Primary Search Intent:** [Informational / Commercial / Transactional]
- **Estimated Word Count:** 1,200 - 2,000 words

## Required Entities & Subtopics to Include
- [Primary Entity 1]
- [Secondary Entity 2]
- [Contextual Entity 3]

## Internal Linking Directives
1. **Inbound Link:** Link back to the parent Pillar Page with descriptive anchor text.
2. **Outbound Child Links:** Include 2-3 links pointing to the designated supporting tutorials.
3. **Anchor Text Rule:** Use descriptive keywords (e.g., "guide to indoor farming costs"), NEVER generic words like "click here" or "read more".

## Quality Checklist Before Publishing
- [ ] Direct answer provided in the first 100 words (for AI Overview / Featured Snippet).
- [ ] Proper H1, H2, and H3 semantic heading structure.
- [ ] High-resolution images or diagrams with descriptive alt text.
- [ ] At least 2 internal links to related topic nodes.
- [ ] Meta title (under 60 chars) and meta description (under 155 chars) written.
`;
    navigator.clipboard.writeText(brief);
    setCopiedTemplate(true);
    setTimeout(() => setCopiedTemplate(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row bg-[#FBFBFA] overflow-hidden">
      {/* Sidebar Navigation */}
      <div className="w-full md:w-80 border-r border-[#141414] bg-[#F0EFED] flex flex-col shrink-0">
        <div className="p-5 border-b border-[#141414] bg-[#E4E3E0]">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-4 h-4 text-[#141414]" />
            <h3 className="font-serif italic text-lg font-bold">Platform Learning Center</h3>
          </div>
          <p className="text-[11px] text-[#141414]/70">
            Step-by-step guides for beginners, content creators, and SEO architects.
          </p>

          <div className="mt-3 relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#141414]/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search guides..."
              className="w-full bg-white border border-[#141414]/30 pl-8 pr-3 py-1.5 text-xs font-sans placeholder:text-[#141414]/40 focus:outline-none focus:border-[#141414]"
            />
          </div>
        </div>

        {/* Guide Links */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {filteredGuides.map(guide => (
            <button
              key={guide.id}
              onClick={() => setActiveGuide(guide.id)}
              className={`w-full text-left p-3 border transition-all text-xs ${
                activeGuide === guide.id
                  ? 'bg-[#141414] text-[#E4E3E0] border-[#141414] shadow-sm'
                  : 'bg-white border-[#141414]/15 hover:border-[#141414]/50 hover:bg-neutral-50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs truncate">{guide.title}</span>
                <span className={`text-[9px] font-mono uppercase px-1.5 py-0.2 rounded ${
                  activeGuide === guide.id ? 'bg-white/20 text-white' : 'bg-neutral-100 text-neutral-600'
                }`}>
                  {guide.category}
                </span>
              </div>
              <p className={`text-[11px] line-clamp-2 leading-relaxed ${
                activeGuide === guide.id ? 'text-[#E4E3E0]/80' : 'text-[#141414]/60'
              }`}>
                {guide.summary}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Guide Content Display */}
      <div className="flex-1 overflow-y-auto p-8 md:p-12 max-w-4xl">
        {/* Guide 1: Quickstart */}
        {activeGuide === 'quickstart' && (
          <div className="space-y-8">
            <div className="border-b border-[#141414] pb-5">
              <span className="text-[10px] font-mono uppercase text-blue-700 bg-blue-100 px-2 py-0.5 font-bold">
                Step-by-Step Tutorial
              </span>
              <h2 className="text-4xl font-serif italic mt-2 mb-2">How to Build a Topical Authority Map in 3 Minutes</h2>
              <p className="text-sm text-[#141414]/70 leading-relaxed">
                Everything you need to know if you're not an SEO expert, explained with simple analogies.
              </p>
            </div>

            {/* What is a topical map? */}
            <div className="bg-white border border-[#141414] p-6 space-y-3">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <h3 className="font-bold text-base">What is a Topical Map?</h3>
              </div>
              <p className="text-sm text-[#141414]/80 leading-relaxed">
                Think of Google like a library. If your website only writes one random article about "Indoor Farming", the librarian doesn't know if you're a true expert.
              </p>
              <p className="text-sm text-[#141414]/80 leading-relaxed">
                A <strong>Topical Map</strong> is your website's book outline. It maps out the main textbook (the <strong>Pillar</strong>), the chapters (the <strong>Clusters</strong>), and the detailed recipes and tutorials (the <strong>Supporting Pages</strong>). When you publish all of them and link them together, Google recognizes your domain as an authoritative master on that topic.
              </p>
            </div>

            {/* 3 Simple Steps */}
            <div className="space-y-6">
              <h3 className="text-xs font-mono uppercase tracking-widest opacity-60 border-b border-[#141414]/15 pb-2">
                The 3-Step Process
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border border-[#141414] p-5 bg-white space-y-3">
                  <div className="w-8 h-8 rounded-full bg-[#141414] text-white flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <h4 className="font-bold text-sm">Type Your Core Topic</h4>
                  <p className="text-xs text-[#141414]/70 leading-relaxed">
                    Type your main product, service, or industry into the search bar (e.g., <em>"Vertical Farming"</em> or <em>"Cold Brew Coffee"</em>) and click <strong>Analyze</strong>.
                  </p>
                </div>

                <div className="border border-[#141414] p-5 bg-white space-y-3">
                  <div className="w-8 h-8 rounded-full bg-[#141414] text-white flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <h4 className="font-bold text-sm">Inspect the Hierarchy</h4>
                  <p className="text-xs text-[#141414]/70 leading-relaxed">
                    Explore the <strong>List</strong> or <strong>Visual</strong> tab. Click any node to see its internal linking logic, related entities, and the interactive <strong>Authority Flow</strong> graph.
                  </p>
                </div>

                <div className="border border-[#141414] p-5 bg-white space-y-3">
                  <div className="w-8 h-8 rounded-full bg-[#141414] text-white flex items-center justify-center font-bold text-sm">
                    3
                  </div>
                  <h4 className="font-bold text-sm">Find Missing Content Gaps</h4>
                  <p className="text-xs text-[#141414]/70 leading-relaxed">
                    Switch to <strong>Gaps & Competitors</strong>. Paste your existing website URLs to see which articles you already have and which high-priority topics you're missing!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Guide 2: Internal Linking Playbook */}
        {activeGuide === 'authority-flow' && (
          <div className="space-y-8">
            <div className="border-b border-[#141414] pb-5">
              <span className="text-[10px] font-mono uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 font-bold">
                Internal Linking Strategy
              </span>
              <h2 className="text-4xl font-serif italic mt-2 mb-2">The Internal Linking & Authority Flow Playbook</h2>
              <p className="text-sm text-[#141414]/70 leading-relaxed">
                How link equity (PageRank) flows through your site and why internal links are your most powerful ranking lever.
              </p>
            </div>

            {/* The Water Pipe Analogy */}
            <div className="bg-[#141414] text-[#E4E3E0] p-6 space-y-3">
              <div className="flex items-center gap-2">
                <Network className="w-4 h-4 text-amber-400" />
                <h3 className="font-serif italic text-xl">The Water Pipe Analogy</h3>
              </div>
              <p className="text-xs text-[#E4E3E0]/80 leading-relaxed">
                Imagine your website’s authority as water stored in a water tower (your <strong>Pillar page</strong>).
                When your Pillar page links down to your Cluster chapters, authority flows down the pipe.
                When your supporting tutorials link back up to the Pillar, they pump authority back to the top, creating a closed, high-pressure loop that search engine crawlers love.
              </p>
            </div>

            {/* The 3 Hierarchy Tiers */}
            <div className="space-y-4">
              <h3 className="font-bold text-sm uppercase tracking-wide">The 3 Tiers of Authority:</h3>

              <div className="space-y-3">
                <div className="border border-blue-200 bg-blue-50/60 p-4 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                    <h4 className="font-bold text-xs text-blue-950 uppercase">Tier 1: Pillar Page (The Main Guide)</h4>
                  </div>
                  <p className="text-xs text-blue-900/80 leading-relaxed">
                    Broad, high-volume topic. Covers the entire subject at a high level and provides links downward to every cluster hub.
                  </p>
                </div>

                <div className="border border-amber-200 bg-amber-50/60 p-4 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
                    <h4 className="font-bold text-xs text-amber-950 uppercase">Tier 2: Clusters (Sub-Topic Hubs)</h4>
                  </div>
                  <p className="text-xs text-amber-900/80 leading-relaxed">
                    Deep dives into specific categories (e.g., "Equipment", "Costs & ROI", "Troubleshooting"). Links upward to Pillar and downward to specific questions.
                  </p>
                </div>

                <div className="border border-emerald-200 bg-emerald-50/60 p-4 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                    <h4 className="font-bold text-xs text-emerald-950 uppercase">Tier 3: Supporting Nodes (Direct Answers)</h4>
                  </div>
                  <p className="text-xs text-emerald-900/80 leading-relaxed">
                    Answers ultra-specific long-tail questions (e.g., "How much electricity does vertical farming use?"). Loops back to its parent cluster.
                  </p>
                </div>
              </div>
            </div>

            {/* Anchor Text Rules */}
            <div className="border border-[#141414] p-5 bg-white space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider">Golden Rules for Anchor Text:</h3>
              <ul className="text-xs text-[#141414]/80 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-700 font-bold">✓ DO:</span>
                  <span>Use descriptive keywords that tell the reader where they are going (e.g., <em>"see our guide to vertical farming setup costs"</em>).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-700 font-bold">✗ DON'T:</span>
                  <span>Never use generic anchor words like <em>"click here"</em>, <em>"read this"</em>, or <em>"link"</em>. Google uses anchor text to understand what the destination page is about.</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Guide 3: Content Gaps & Competitor Steals */}
        {activeGuide === 'gaps-competitors' && (
          <div className="space-y-8">
            <div className="border-b border-[#141414] pb-5">
              <span className="text-[10px] font-mono uppercase text-rose-700 bg-rose-100 px-2 py-0.5 font-bold">
                Competitive Strategy
              </span>
              <h2 className="text-4xl font-serif italic mt-2 mb-2">Finding Content Gaps & Outranking Competitors</h2>
              <p className="text-sm text-[#141414]/70 leading-relaxed">
                How to prioritize what to write next to maximize traffic and revenue.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border border-rose-600 bg-rose-50/50 p-5 space-y-2">
                <div className="flex items-center gap-2">
                  <Swords className="w-4 h-4 text-rose-600" />
                  <h4 className="font-bold text-xs text-rose-950 uppercase">Competitor Advantage (Topical Threat)</h4>
                </div>
                <p className="text-xs text-rose-900/80 leading-relaxed">
                  Competitors have published this page, but you have not. This is a direct leak of potential customers. Prioritize creating a higher-quality guide here immediately.
                </p>
              </div>

              <div className="border border-blue-600 bg-blue-50/50 p-5 space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <h4 className="font-bold text-xs text-blue-950 uppercase">Blue Ocean (White-Space Opportunity)</h4>
                </div>
                <p className="text-xs text-blue-900/80 leading-relaxed">
                  Neither you nor your competitors have published on this topic. By publishing first, you establish immediate early authority and claim top Google rankings unchallenged.
                </p>
              </div>
            </div>

            {/* Practical workflow */}
            <div className="border border-[#141414] p-5 bg-white space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wide">How to run the audit:</h3>
              <ol className="text-xs text-[#141414]/80 space-y-2 list-decimal list-inside">
                <li>Go to the <strong>Gaps & Competitors</strong> tab in the top navigation.</li>
                <li>Click <strong>Configure URLs</strong>.</li>
                <li>Paste your published URLs (e.g. from your XML sitemap or CMS post list).</li>
                <li>Paste your competitor's key URLs into the Competitor box.</li>
                <li>Review the prioritized Action Plan Roadmap and export as CSV or Markdown!</li>
              </ol>
            </div>
          </div>
        )}

        {/* Guide 4: Content Writer Checklist */}
        {activeGuide === 'writer-checklist' && (
          <div className="space-y-8">
            <div className="border-b border-[#141414] pb-5 flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-amber-800 bg-amber-100 px-2 py-0.5 font-bold">
                  Ready-to-Use Template
                </span>
                <h2 className="text-4xl font-serif italic mt-2 mb-2">Content Creator Brief & Checklist</h2>
                <p className="text-sm text-[#141414]/70 leading-relaxed">
                  Copy and paste this template into your writing workflow or hand it to freelance writers.
                </p>
              </div>
              <button
                onClick={copyWriterBrief}
                className="flex items-center gap-1.5 text-xs font-mono uppercase bg-[#141414] text-[#E4E3E0] px-4 py-2 hover:opacity-90 transition-opacity shrink-0"
              >
                {copiedTemplate ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedTemplate ? 'Copied!' : 'Copy Template'}
              </button>
            </div>

            <div className="bg-white border border-[#141414] p-6 space-y-4">
              <h3 className="font-bold text-sm uppercase">Pre-Publish Article Quality Checklist:</h3>

              <div className="space-y-2 text-xs">
                <label className="flex items-center gap-2 p-2 border border-[#141414]/10 bg-neutral-50 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#141414]" />
                  <span><strong>The Direct Answer:</strong> Did you answer the core question within the first 100 words? (Crucial for Google AI Overviews).</span>
                </label>

                <label className="flex items-center gap-2 p-2 border border-[#141414]/10 bg-neutral-50 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#141414]" />
                  <span><strong>Entity Inclusions:</strong> Did you include the recommended semantic entities in H2 and H3 headings?</span>
                </label>

                <label className="flex items-center gap-2 p-2 border border-[#141414]/10 bg-neutral-50 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#141414]" />
                  <span><strong>Parent Link:</strong> Is there a contextual link pointing up to the parent pillar or cluster?</span>
                </label>

                <label className="flex items-center gap-2 p-2 border border-[#141414]/10 bg-neutral-50 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#141414]" />
                  <span><strong>Child Supporting Links:</strong> Are there 2-3 links pointing down to related tutorials?</span>
                </label>

                <label className="flex items-center gap-2 p-2 border border-[#141414]/10 bg-neutral-50 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#141414]" />
                  <span><strong>Descriptive Anchors:</strong> Did you verify that no links use generic words like "click here"?</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Guide 5: Glossary */}
        {activeGuide === 'glossary' && (
          <div className="space-y-8">
            <div className="border-b border-[#141414] pb-5">
              <span className="text-[10px] font-mono uppercase text-neutral-800 bg-neutral-200 px-2 py-0.5 font-bold">
                Jargon-Free Definitions
              </span>
              <h2 className="text-4xl font-serif italic mt-2 mb-2">Plain-English SEO Glossary</h2>
              <p className="text-sm text-[#141414]/70 leading-relaxed">
                Simple, memorable explanations for complex technical terms.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-[#141414] p-4 bg-white space-y-1">
                <h4 className="font-bold text-xs uppercase text-blue-800">Entity</h4>
                <p className="text-xs text-[#141414]/80 leading-relaxed">
                  A distinct concept, person, place, or thing recognized by Google’s Knowledge Graph (e.g., "Photosynthesis", not just the string of letters).
                </p>
              </div>

              <div className="border border-[#141414] p-4 bg-white space-y-1">
                <h4 className="font-bold text-xs uppercase text-amber-800">Topical Authority</h4>
                <p className="text-xs text-[#141414]/80 leading-relaxed">
                  The credibility and trust your site earns by comprehensively answering every sub-question and angle within a specific subject area.
                </p>
              </div>

              <div className="border border-[#141414] p-4 bg-white space-y-1">
                <h4 className="font-bold text-xs uppercase text-emerald-800">Search Intent</h4>
                <p className="text-xs text-[#141414]/80 leading-relaxed">
                  The reason why someone searches. <strong>Informational</strong> (wants to learn), <strong>Commercial</strong> (comparing products), or <strong>Transactional</strong> (ready to buy).
                </p>
              </div>

              <div className="border border-[#141414] p-4 bg-white space-y-1">
                <h4 className="font-bold text-xs uppercase text-rose-800">Content Gap</h4>
                <p className="text-xs text-[#141414]/80 leading-relaxed">
                  A topic in the topical map that searchers expect your website to have, but which has not yet been written or published on your site.
                </p>
              </div>

              <div className="border border-[#141414] p-4 bg-white space-y-1">
                <h4 className="font-bold text-xs uppercase text-purple-800">Link Equity / PageRank</h4>
                <p className="text-xs text-[#141414]/80 leading-relaxed">
                  The amount of SEO "trust" that a web page can pass along to other pages through internal hyperlinks.
                </p>
              </div>

              <div className="border border-[#141414] p-4 bg-white space-y-1">
                <h4 className="font-bold text-xs uppercase text-neutral-800">Orphan Page</h4>
                <p className="text-xs text-[#141414]/80 leading-relaxed">
                  A published page on your website that has zero internal links pointing to it. Google crawlers struggle to find and rank orphan pages.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

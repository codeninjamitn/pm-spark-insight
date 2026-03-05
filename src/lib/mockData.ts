export type InsightCategory = 
  | "Design Feedback" 
  | "Feature Requests" 
  | "Competitive Intel" 
  | "Churn Risks" 
  | "Future Releases";

export type SourceType = 
  | "Customer Feedback" 
  | "Field Report" 
  | "Partner Insight" 
  | "Analyst Transcript" 
  | "Market Report";

export type InsightPriority = "high" | "medium" | "low";

export interface Source {
  id: string;
  title: string;
  type: SourceType;
  date: string;
  snippet: string;
  author?: string;
}

export interface Insight {
  id: string;
  title: string;
  summary: string;
  category: InsightCategory;
  priority: InsightPriority;
  sources: Source[];
  createdAt: string;
  validated: boolean;
  tags: string[];
}

export const mockSources: Source[] = [
  { id: "s1", title: "Q4 Customer Survey Results", type: "Customer Feedback", date: "2026-02-28", snippet: "72% of enterprise users cited 'slow onboarding' as their primary friction point. Average time-to-value exceeds 14 days.", author: "Sarah Chen" },
  { id: "s2", title: "Acme Corp Field Visit Notes", type: "Field Report", date: "2026-02-15", snippet: "CTO mentioned they're evaluating alternatives due to lack of SSO support. Deal at risk — $240K ARR.", author: "Marcus Rivera" },
  { id: "s3", title: "Gartner MQ Analysis 2026", type: "Market Report", date: "2026-01-20", snippet: "Leaders quadrant requires automated compliance reporting. Three competitors now offer this natively.", author: "Gartner Research" },
  { id: "s4", title: "Partner Channel Feedback — EMEA", type: "Partner Insight", date: "2026-02-10", snippet: "EMEA partners requesting localized dashboards and GDPR-specific data residency controls.", author: "Julia Weber" },
  { id: "s5", title: "Forrester Wave Transcript", type: "Analyst Transcript", date: "2026-01-30", snippet: "Analyst specifically asked about AI-powered insights. Competitors X and Y demoed this capability.", author: "Forrester" },
  { id: "s6", title: "NPS Detractor Analysis", type: "Customer Feedback", date: "2026-03-01", snippet: "Top 3 detractor themes: (1) mobile experience, (2) export limitations, (3) notification fatigue.", author: "CX Team" },
  { id: "s7", title: "Sales Engineering Debrief — FinTech", type: "Field Report", date: "2026-02-22", snippet: "Lost deal to competitor Z. Key differentiator was their real-time collaboration features.", author: "Alex Kim" },
  { id: "s8", title: "AWS re:Invent Partner Roundtable", type: "Partner Insight", date: "2026-01-15", snippet: "Multiple partners expressed interest in white-label capabilities for their own customer portals.", author: "Partnerships Team" },
];

export const mockInsights: Insight[] = [
  {
    id: "i1",
    title: "Onboarding friction driving churn risk",
    summary: "Multiple data points confirm that enterprise onboarding exceeds 14 days on average. This correlates with a 3x higher churn rate in the first 90 days. Immediate intervention recommended.",
    category: "Churn Risks",
    priority: "high",
    sources: [mockSources[0], mockSources[5]],
    createdAt: "2026-03-02",
    validated: true,
    tags: ["onboarding", "retention", "enterprise"],
  },
  {
    id: "i2",
    title: "SSO is now table-stakes for enterprise deals",
    summary: "Field reports indicate active deal risk ($240K+) due to missing SSO. Gartner MQ criteria also lists SSO as a baseline requirement for the Leaders quadrant.",
    category: "Feature Requests",
    priority: "high",
    sources: [mockSources[1], mockSources[2]],
    createdAt: "2026-03-01",
    validated: true,
    tags: ["SSO", "enterprise", "security"],
  },
  {
    id: "i3",
    title: "AI-powered insights becoming competitive differentiator",
    summary: "Analyst transcripts confirm competitors are demoing AI capabilities. Market reports suggest this will be a key evaluation criterion by Q3 2026.",
    category: "Competitive Intel",
    priority: "high",
    sources: [mockSources[4], mockSources[2]],
    createdAt: "2026-02-28",
    validated: false,
    tags: ["AI", "competitive", "roadmap"],
  },
  {
    id: "i4",
    title: "EMEA localization gaps blocking partner growth",
    summary: "Partners in EMEA are requesting localized dashboards and GDPR-specific controls. This is blocking channel expansion in a $2M pipeline opportunity.",
    category: "Feature Requests",
    priority: "medium",
    sources: [mockSources[3]],
    createdAt: "2026-02-25",
    validated: true,
    tags: ["EMEA", "localization", "GDPR", "partners"],
  },
  {
    id: "i5",
    title: "Mobile experience is a top-3 detractor theme",
    summary: "NPS detractor analysis reveals mobile experience as the #1 complaint. This aligns with field observations of customers avoiding mobile use entirely.",
    category: "Design Feedback",
    priority: "medium",
    sources: [mockSources[5], mockSources[6]],
    createdAt: "2026-02-20",
    validated: true,
    tags: ["mobile", "UX", "NPS"],
  },
  {
    id: "i6",
    title: "Real-time collaboration as a competitive moat",
    summary: "Lost a key FinTech deal to a competitor with real-time collaboration. Multiple field reports suggest this is increasingly expected in enterprise evaluations.",
    category: "Competitive Intel",
    priority: "medium",
    sources: [mockSources[6]],
    createdAt: "2026-02-18",
    validated: false,
    tags: ["collaboration", "competitive", "FinTech"],
  },
  {
    id: "i7",
    title: "White-label opportunity from partner channel",
    summary: "Partners at AWS re:Invent expressed strong interest in white-label capabilities. Could unlock a new revenue stream via partner-embedded deployments.",
    category: "Future Releases",
    priority: "low",
    sources: [mockSources[7]],
    createdAt: "2026-02-15",
    validated: false,
    tags: ["white-label", "partners", "revenue"],
  },
  {
    id: "i8",
    title: "Export and notification UX needs overhaul",
    summary: "Export limitations and notification fatigue are recurring themes across NPS surveys and field reports. Quick wins available in both areas.",
    category: "Design Feedback",
    priority: "medium",
    sources: [mockSources[5]],
    createdAt: "2026-02-12",
    validated: true,
    tags: ["export", "notifications", "UX"],
  },
];

export const categories: InsightCategory[] = [
  "Design Feedback",
  "Feature Requests",
  "Competitive Intel",
  "Churn Risks",
  "Future Releases",
];

export const sourceTypes: SourceType[] = [
  "Customer Feedback",
  "Field Report",
  "Partner Insight",
  "Analyst Transcript",
  "Market Report",
];

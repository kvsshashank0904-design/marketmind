export type Sector =
  | 'Technology'
  | 'Semiconductors'
  | 'Consumer & Cloud'
  | 'Communication Services'
  | 'Automotive & Energy'
  | 'Financials'
  | 'Financial Services'
  | 'Healthcare'
  | 'Consumer Staples'
  | 'Consumer Discretionary'
  | 'Energy'
  | 'Industrials'
  | 'Entertainment';

export interface Company {
  ticker: string;
  name: string;
  sector: Sector;
  cik: string;
  exchange: string;
  region: string;
  description: string;
  founded?: number;
  employees?: string;
  headquarters?: string;
}

export interface RawXbrlFact {
  start?: string;
  end: string;
  val: number;
  fy?: number;
  fp?: string;
  form: string;
  filed: string;
  frame?: string;
  accn?: string;
}

export interface MetricFact {
  fiscalYear: number;
  periodEnd: string;
  value: number;
  form: string;
  filed: string;
  tag: string;
  unit: string;
}

export interface AnnualRecord {
  fiscalYear: number;
  periodEnd: string;
  form: string;
  filed: string;
  revenue?: number;
  costOfRevenue?: number;
  grossProfit?: number;
  operatingIncome?: number;
  netIncome?: number;
  operatingCashFlow?: number;
  capitalExpenditure?: number;
  freeCashFlow?: number;
  totalAssets?: number;
  totalLiabilities?: number;
  stockholdersEquity?: number;
  cashAndEquivalents?: number;
  longTermDebt?: number;
}

export interface FinancialRatio {
  id: string;
  name: string;
  category: 'Profitability' | 'Efficiency' | 'Liquidity' | 'Solvency' | 'Cash Flow';
  value: number | null;
  formatted: string;
  formula: string;
  sourceInputs: string;
  benchmark?: string;
  interpretation: string;
  status: 'good' | 'neutral' | 'caution' | 'na';
}

export interface HealthScore {
  overall: number; // 0 - 100
  rating: 'Exceptional' | 'Strong' | 'Moderate' | 'Vulnerable' | 'Distressed';
  summary: string;
  strengths: string[];
  cautions: string[];
  pillars: {
    growth: { score: number; label: string; text: string };
    profitability: { score: number; label: string; text: string };
    cashFlow: { score: number; label: string; text: string };
    solvency: { score: number; label: string; text: string };
    consistency: { score: number; label: string; text: string };
  };
}

export interface CompanyFinancials {
  company: Company;
  entityName: string;
  cik: string;
  latestYear: number;
  history: AnnualRecord[];
  ratios: FinancialRatio[];
  health: HealthScore;
  retrievedAt: string;
  disclaimer: string;
  source: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface LessonSection {
  title: string;
  content: string[];
  example?: string;
  takeaway?: string;
}

export interface LessonModule {
  id: string;
  moduleNumber: string;
  title: string;
  subtitle: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estMinutes: number;
  learningObjectives: string[];
  sections: LessonSection[];
  keyTerms: { term: string; definition: string }[];
  quiz: QuizQuestion[];
}

export interface GlossaryConcept {
  id: string;
  term: string;
  category: 'Fundamentals' | 'Financial Statements' | 'Valuation' | 'Risk & Macro' | 'Portfolio';
  shortDefinition: string;
  detailedExplanation: string;
  formula?: string;
  example: string;
  whyItMatters: string;
  beginnerTip: string;
}

export interface SimulationParams {
  initialInvestment: number;
  monthlyContribution: number;
  years: number;
  annualReturnPct: number;
  inflationPct: number;
}

export interface SimulationYearData {
  year: number;
  nominalTotal: number;
  realTotal: number;
  totalContributions: number;
  nominalGrowth: number;
  realGrowth: number;
}

export interface SimulationResult {
  nominalFinal: number;
  realFinal: number;
  totalContributions: number;
  nominalGrowth: number;
  realGrowth: number;
  purchasingPowerLoss: number;
  yearlyBreakdown: SimulationYearData[];
  milestones: { target: number; achievedInYear: number | null }[];
}

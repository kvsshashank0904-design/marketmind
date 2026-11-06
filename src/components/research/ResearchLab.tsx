import React, { useState, useEffect } from 'react';
import {
  Search,
  ArrowUpRight,
  ShieldCheck,
  Building2,
  Calendar,
  Layers,
  Activity,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  DollarSign,
  PieChart,
} from 'lucide-react';
import { companies } from '../../data/companies';
import { Company, CompanyFinancials, Sector } from '../../types';
import { fetchCompanyFinancials } from '../../services/secApi';
import { formatCurrency, formatPercent } from '../../services/financialCalculations';
import { FinancialBarChart, BarChartItem } from '../shared/Chart';

interface ResearchLabProps {
  initialTicker?: string;
  onNavigateCompare?: (tickerA: string, tickerB: string) => void;
}

export const ResearchLab: React.FC<ResearchLabProps> = ({ initialTicker = 'NVDA', onNavigateCompare }) => {
  const [selectedTicker, setSelectedTicker] = useState<string>(initialTicker);
  const [search, setSearch] = useState('');
  const [selectedSector, setSelectedSector] = useState<string>('All');
  const [financials, setFinancials] = useState<CompanyFinancials | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeStatementTab, setActiveStatementTab] = useState<'income' | 'balance' | 'cashFlow'>('income');

  const currentCompany = companies.find((c) => c.ticker === selectedTicker) || companies[0];

  const sectors: string[] = [
    'All',
    'Technology',
    'Semiconductors',
    'Consumer & Cloud',
    'Communication Services',
    'Healthcare',
    'Financials',
    'Consumer Staples',
    'Energy',
    'Industrials',
  ];

  const filteredCompanies = companies.filter((c) => {
    const matchesSearch = (c.name + c.ticker + c.sector).toLowerCase().includes(search.toLowerCase());
    const matchesSector = selectedSector === 'All' || c.sector === selectedSector;
    return matchesSearch && matchesSector;
  });

  const loadData = async (company: Company) => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchCompanyFinancials(company);
      setFinancials(data);
    } catch (err: any) {
      setError(err.message || 'Unable to load company filing data.');
      setFinancials(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(currentCompany);
  }, [selectedTicker]);

  // Chart data mappings
  const revNetIncomeChartData: BarChartItem[] = financials
    ? [...financials.history].reverse().map((h) => ({
        label: `FY${h.fiscalYear}`,
        value: h.revenue || 0,
        secondaryValue: h.netIncome || 0,
      }))
    : [];

  const cashFlowChartData: BarChartItem[] = financials
    ? [...financials.history].reverse().map((h) => ({
        label: `FY${h.fiscalYear}`,
        value: h.operatingCashFlow || 0,
        secondaryValue: h.freeCashFlow || 0,
      }))
    : [];

  const balanceSheetChartData: BarChartItem[] = financials
    ? [...financials.history].reverse().map((h) => ({
        label: `FY${h.fiscalYear}`,
        value: h.totalAssets || 0,
        secondaryValue: h.totalLiabilities || 0,
      }))
    : [];

  return (
    <div className="page-workspace">
      {/* Page Header */}
      <div className="workspace-header">
        <div>
          <div className="eyebrow">FLAGSHIP WORKSPACE · FUNDAMENTAL RESEARCH</div>
          <h1>AI Stock Research Lab</h1>
          <p className="intro">
            Perform deep-dive fundamental analysis from audited SEC EDGAR Form 10-K filings.
            Examine up to 5 consecutive historical fiscal years, analyze operational margins, verify cash flow quality,
            and review balance-sheet resilience.
          </p>
        </div>
      </div>

      <div className="research-layout">
        {/* Left Column: Company Directory & Filters */}
        <aside className="company-sidebar">
          <div className="searchbox">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search ticker, name, or sector..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Filter company directory"
            />
          </div>

          {/* Sector Filter Chips */}
          <div className="sector-chips" role="tablist" aria-label="Filter by Sector">
            {sectors.slice(0, 6).map((sec) => (
              <button
                key={sec}
                className={`sector-chip ${selectedSector === sec ? 'active' : ''}`}
                onClick={() => setSelectedSector(sec)}
              >
                {sec}
              </button>
            ))}
          </div>

          <div className="company-list">
            {filteredCompanies.map((c) => (
              <button
                key={c.ticker}
                className={`company-list-item ${selectedTicker === c.ticker ? 'active' : ''}`}
                onClick={() => setSelectedTicker(c.ticker)}
              >
                <div className="list-item-header">
                  <b className="ticker">{c.ticker}</b>
                  <span className="exchange">{c.exchange}</span>
                </div>
                <div className="name">{c.name}</div>
                <small className="sector">{c.sector}</small>
              </button>
            ))}
            {filteredCompanies.length === 0 && (
              <div className="no-companies">No companies found in this filter.</div>
            )}
          </div>
        </aside>

        {/* Right Main Pane */}
        <main className="research-content">
          {/* Company Hero Profile */}
          <div className="company-profile-card">
            <div className="profile-main">
              <div className="profile-title-row">
                <div>
                  <span className="meta-pill">{currentCompany.exchange} · {currentCompany.region} · CIK: {currentCompany.cik}</span>
                  <h2>{currentCompany.name}</h2>
                </div>
                <span className="large-ticker">{currentCompany.ticker}</span>
              </div>
              <p className="company-desc">{currentCompany.description}</p>
              <div className="profile-meta-grid">
                <div><span>Sector:</span> <b>{currentCompany.sector}</b></div>
                <div><span>Headquarters:</span> <b>{currentCompany.headquarters || 'United States'}</b></div>
                <div><span>Founded:</span> <b>{currentCompany.founded || 'N/A'}</b></div>
                <div><span>Employees:</span> <b>{currentCompany.employees || 'N/A'}</b></div>
              </div>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="status-banner error">
              <AlertTriangle size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="loading-card">
              <div className="spinner" />
              <p>Requesting and validating audited Form 10-K facts from SEC EDGAR for {currentCompany.ticker}...</p>
            </div>
          )}

          {/* Loaded Financial Content */}
          {financials && !loading && (
            <>
              {/* Financial Health Summary Banner */}
              <div className="health-scorecard-card">
                <div className="scorecard-header">
                  <div>
                    <span className="eyebrow">DIAGNOSTIC ENGINE</span>
                    <h3>Financial Health Evaluation</h3>
                  </div>
                  <div className="score-badge-group">
                    <span className={`rating-pill ${financials.health.rating.toLowerCase()}`}>
                      {financials.health.rating}
                    </span>
                    <div className="score-circle">
                      <b>{financials.health.overall}</b>
                      <small>/100</small>
                    </div>
                  </div>
                </div>

                <p className="health-summary-text">{financials.health.summary}</p>

                {/* 5 Pillar Progress Bars */}
                <div className="pillars-grid">
                  {Object.entries(financials.health.pillars).map(([key, pillar]) => (
                    <div key={key} className="pillar-item">
                      <div className="pillar-top">
                        <span className="pillar-name">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                        <b className="pillar-score">{pillar.score}% ({pillar.label})</b>
                      </div>
                      <div className="pillar-track">
                        <div
                          className="pillar-fill"
                          style={{
                            width: `${pillar.score}%`,
                            backgroundColor: pillar.score >= 70 ? '#35d49a' : pillar.score >= 50 ? '#38bdf8' : '#eab308',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Strengths and Cautions */}
                <div className="insights-columns">
                  <div className="insights-box strengths">
                    <b><CheckCircle2 size={15} /> Identified Strengths</b>
                    <ul>
                      {financials.health.strengths.map((s, idx) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="insights-box cautions">
                    <b><AlertTriangle size={15} /> Noted Cautions & Risks</b>
                    <ul>
                      {financials.health.cautions.length > 0 ? (
                        financials.health.cautions.map((c, idx) => (
                          <li key={idx}>{c}</li>
                        ))
                      ) : (
                        <li>No significant structural balance-sheet weaknesses identified in current filing.</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Visual Analytics Charts */}
              <div className="charts-split-grid">
                <FinancialBarChart
                  data={revNetIncomeChartData}
                  title="5-Year Revenue & Net Income Trend"
                  primaryLegend="Total Revenue"
                  secondaryLegend="Net Income"
                  primaryColor="#35d49a"
                  secondaryColor="#38bdf8"
                />

                <FinancialBarChart
                  data={cashFlowChartData}
                  title="Cash Flow & Free Cash Flow"
                  primaryLegend="Operating Cash Flow"
                  secondaryLegend="Free Cash Flow"
                  primaryColor="#10b981"
                  secondaryColor="#a855f7"
                />
              </div>

              {/* Multi-Year Financial Statements Tabbed View */}
              <div className="financial-statements-card">
                <div className="statements-header">
                  <div>
                    <span className="eyebrow">AUDITED SEC EDGAR 10-K FILINGS</span>
                    <h3>5-Year Historical Financial Statements</h3>
                  </div>

                  <div className="tab-pill-group" role="tablist">
                    <button
                      id="income-tab"
                      role="tab"
                      aria-selected={activeStatementTab === 'income'}
                      aria-controls="financial-statements"
                      className={`tab-pill ${activeStatementTab === 'income' ? 'active' : ''}`}
                      onClick={() => setActiveStatementTab('income')}
                    >
                      Income Statement
                    </button>
                    <button
                      id="balance-tab"
                      role="tab"
                      aria-selected={activeStatementTab === 'balance'}
                      aria-controls="financial-statements"
                      className={`tab-pill ${activeStatementTab === 'balance' ? 'active' : ''}`}
                      onClick={() => setActiveStatementTab('balance')}
                    >
                      Balance Sheet
                    </button>
                    <button
                      id="cash-flow-tab"
                      role="tab"
                      aria-selected={activeStatementTab === 'cashFlow'}
                      aria-controls="financial-statements"
                      className={`tab-pill ${activeStatementTab === 'cashFlow' ? 'active' : ''}`}
                      onClick={() => setActiveStatementTab('cashFlow')}
                    >
                      Cash Flows
                    </button>
                  </div>
                </div>

                <div id="financial-statements" className="table-responsive" role="tabpanel" aria-labelledby={`${activeStatementTab === 'cashFlow' ? 'cash-flow' : activeStatementTab}-tab`}>
                  <table className="statement-table">
                    <thead>
                      <tr>
                        <th className="metric-col">Metric (USD)</th>
                        {financials.history.map((h) => (
                          <th key={h.fiscalYear} className="val-col">
                            <div>FY{h.fiscalYear}</div>
                            <small className="date-sub">{h.periodEnd}</small>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {activeStatementTab === 'income' && (
                        <>
                          <tr>
                            <td className="metric-name"><b>Total Revenue</b></td>
                            {financials.history.map((h) => (
                              <td key={h.fiscalYear} className="metric-val highlight">
                                <b>{formatCurrency(h.revenue)}</b>
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td className="metric-name">Cost of Revenue</td>
                            {financials.history.map((h) => (
                              <td key={h.fiscalYear} className="metric-val">
                                {formatCurrency(h.costOfRevenue)}
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td className="metric-name">Gross Profit</td>
                            {financials.history.map((h) => (
                              <td key={h.fiscalYear} className="metric-val">
                                {formatCurrency(h.grossProfit)}
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td className="metric-name">Operating Income (EBIT)</td>
                            {financials.history.map((h) => (
                              <td key={h.fiscalYear} className="metric-val">
                                {formatCurrency(h.operatingIncome)}
                              </td>
                            ))}
                          </tr>
                          <tr className="summary-row">
                            <td className="metric-name"><b>Net Income (Bottom Line)</b></td>
                            {financials.history.map((h) => (
                              <td key={h.fiscalYear} className="metric-val highlight">
                                <b>{formatCurrency(h.netIncome)}</b>
                              </td>
                            ))}
                          </tr>
                        </>
                      )}

                      {activeStatementTab === 'balance' && (
                        <>
                          <tr>
                            <td className="metric-name"><b>Total Assets</b></td>
                            {financials.history.map((h) => (
                              <td key={h.fiscalYear} className="metric-val highlight">
                                <b>{formatCurrency(h.totalAssets)}</b>
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td className="metric-name">Cash & Cash Equivalents</td>
                            {financials.history.map((h) => (
                              <td key={h.fiscalYear} className="metric-val">
                                {formatCurrency(h.cashAndEquivalents)}
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td className="metric-name">Total Liabilities</td>
                            {financials.history.map((h) => (
                              <td key={h.fiscalYear} className="metric-val">
                                {formatCurrency(h.totalLiabilities)}
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td className="metric-name">Long-Term Debt</td>
                            {financials.history.map((h) => (
                              <td key={h.fiscalYear} className="metric-val">
                                {formatCurrency(h.longTermDebt)}
                              </td>
                            ))}
                          </tr>
                          <tr className="summary-row">
                            <td className="metric-name"><b>Stockholders’ Equity</b></td>
                            {financials.history.map((h) => (
                              <td key={h.fiscalYear} className="metric-val highlight">
                                <b>{formatCurrency(h.stockholdersEquity)}</b>
                              </td>
                            ))}
                          </tr>
                        </>
                      )}

                      {activeStatementTab === 'cashFlow' && (
                        <>
                          <tr>
                            <td className="metric-name"><b>Operating Cash Flow</b></td>
                            {financials.history.map((h) => (
                              <td key={h.fiscalYear} className="metric-val highlight">
                                <b>{formatCurrency(h.operatingCashFlow)}</b>
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td className="metric-name">Capital Expenditures (CapEx)</td>
                            {financials.history.map((h) => (
                              <td key={h.fiscalYear} className="metric-val">
                                {h.capitalExpenditure !== undefined ? `-${formatCurrency(h.capitalExpenditure)}` : 'N/A'}
                              </td>
                            ))}
                          </tr>
                          <tr className="summary-row">
                            <td className="metric-name"><b>Free Cash Flow (FCF)</b></td>
                            {financials.history.map((h) => (
                              <td key={h.fiscalYear} className="metric-val highlight">
                                <b>{formatCurrency(h.freeCashFlow)}</b>
                              </td>
                            ))}
                          </tr>
                        </>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="table-attribution">
                  <ShieldCheck size={14} />
                  <span>
                    Source: Official SEC EDGAR XBRL Data API (CIK: {currentCompany.cik}) · Standardized 10-K Annual Reports · Multi-tag recency verified.
                  </span>
                </div>
              </div>

              {/* Financial Ratios Studio */}
              <div className="ratios-card">
                <div className="ratios-head">
                  <div>
                    <span className="eyebrow">TRANSPARENT ACCOUNTING METRICS</span>
                    <h3>Key Financial Health Ratios</h3>
                    <p>Every ratio includes its explicit mathematical formula and source inputs.</p>
                  </div>
                </div>

                <div className="ratios-grid">
                  {financials.ratios.map((ratio) => (
                    <div key={ratio.id} className="ratio-card">
                      <div className="ratio-top">
                        <span className="ratio-cat">{ratio.category}</span>
                        <span className={`status-tag ${ratio.status}`}>
                          {ratio.status === 'good' ? 'Healthy' : ratio.status === 'neutral' ? 'Moderate' : 'Caution'}
                        </span>
                      </div>
                      <h4>{ratio.name}</h4>
                      <div className="ratio-value">{ratio.formatted}</div>
                      <div className="ratio-formula">
                        <code>{ratio.formula}</code>
                      </div>
                      <p className="ratio-interpretation">{ratio.interpretation}</p>
                      <div className="ratio-inputs">
                        <small>{ratio.sourceInputs}</small>
                      </div>
                      {ratio.benchmark && (
                        <div className="ratio-benchmark">
                          <small>Benchmark: {ratio.benchmark}</small>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Research Checklist & Due Diligence Guide */}
              <div className="checklist-card">
                <span className="eyebrow">ANALYST DUE DILIGENCE</span>
                <h3>Fundamental Investigation Questions</h3>
                <p>When auditing this business, investigate these critical questions inside the official 10-K filing:</p>
                <div className="checklist-grid">
                  <div className="check-item">
                    <b>01 / Revenue Quality & Concentration</b>
                    <p>Are sales concentrated among a small handful of customers, or is revenue well diversified across geographies and product segments?</p>
                  </div>
                  <div className="check-item">
                    <b>02 / Cash Conversion Efficiency</b>
                    <p>Does Operating Cash Flow consistently match or exceed Net Income, or are paper profits stuck in unpaid accounts receivable?</p>
                  </div>
                  <div className="check-item">
                    <b>03 / Capital Reinvestment & CapEx</b>
                    <p>How much capital expenditure is required to maintain the current asset base versus funding genuine top-line expansion?</p>
                  </div>
                  <div className="check-item">
                    <b>04 / Balance Sheet Leverage & Debt Maturities</b>
                    <p>Does the company have significant debt maturing in the next 12-24 months during a high-interest-rate macroeconomic environment?</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Layers3, AlertTriangle, ShieldCheck, ArrowRight, ArrowUpRight, Scale, Info } from 'lucide-react';
import { companies } from '../../data/companies';
import { Company, CompanyFinancials } from '../../types';
import { fetchCompanyFinancials } from '../../services/secApi';
import { formatCurrency, formatPercent } from '../../services/financialCalculations';
import { FinancialBarChart, BarChartItem } from '../shared/Chart';

export const ComparisonStudio: React.FC = () => {
  const [tickerA, setTickerA] = useState<string>('AAPL');
  const [tickerB, setTickerB] = useState<string>('MSFT');
  const [dataA, setDataA] = useState<CompanyFinancials | null>(null);
  const [dataB, setDataB] = useState<CompanyFinancials | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const companyA = companies.find((c) => c.ticker === tickerA) || companies[0];
  const companyB = companies.find((c) => c.ticker === tickerB) || companies[1];

  useEffect(() => {
    let isMounted = true;
    async function loadBoth() {
      setLoading(true);
      setError(null);
      try {
        const [resA, resB] = await Promise.all([
          fetchCompanyFinancials(companyA),
          fetchCompanyFinancials(companyB),
        ]);
        if (isMounted) {
          setDataA(resA);
          setDataB(resB);
        }
      } catch (err: any) {
        if (isMounted) setError(err.message || 'Error loading comparative filings.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadBoth();
    return () => {
      isMounted = false;
    };
  }, [tickerA, tickerB]);

  const latestA = dataA?.history[0];
  const latestB = dataB?.history[0];

  // Compare chart data
  const compareRevenueChart: BarChartItem[] = [
    { label: companyA.ticker, value: latestA?.revenue || 0 },
    { label: companyB.ticker, value: latestB?.revenue || 0 },
  ];

  const compareNetIncomeChart: BarChartItem[] = [
    { label: companyA.ticker, value: latestA?.netIncome || 0 },
    { label: companyB.ticker, value: latestB?.netIncome || 0 },
  ];

  const compareOcfChart: BarChartItem[] = [
    { label: companyA.ticker, value: latestA?.operatingCashFlow || 0 },
    { label: companyB.ticker, value: latestB?.operatingCashFlow || 0 },
  ];

  // Fiscal period alignment notice
  const periodsUnaligned = latestA && latestB && latestA.periodEnd !== latestB.periodEnd;

  return (
    <div className="page-workspace">
      <div className="workspace-header">
        <div className="eyebrow">SIDE-BY-SIDE AUDIT · RELATIVE VALUATION</div>
        <h1>Comparison Studio</h1>
        <p className="intro">
          Audit competing corporations side-by-side using standardized SEC Form 10-K filings.
          Inspect margin differences, cash generation profiles, and capital leverage.
        </p>
      </div>

      {/* Selectors */}
      <div className="compare-picker-bar">
        <div className="picker-box">
          <label htmlFor="company-a-select">Company A</label>
          <select
            id="company-a-select"
            value={tickerA}
            onChange={(e) => setTickerA(e.target.value)}
          >
            {companies.map((c) => (
              <option key={c.ticker} value={c.ticker} disabled={c.ticker === tickerB}>
                {c.ticker} - {c.name} ({c.sector})
              </option>
            ))}
          </select>
        </div>

        <div className="vs-badge">VS</div>

        <div className="picker-box">
          <label htmlFor="company-b-select">Company B</label>
          <select
            id="company-b-select"
            value={tickerB}
            onChange={(e) => setTickerB(e.target.value)}
          >
            {companies.map((c) => (
              <option key={c.ticker} value={c.ticker} disabled={c.ticker === tickerA}>
                {c.ticker} - {c.name} ({c.sector})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Reporting Period Alignment Banner */}
      {periodsUnaligned && latestA && latestB && (
        <div className="notice-banner warning">
          <AlertTriangle size={18} />
          <div>
            <b>Fiscal Calendar Note:</b> {companyA.ticker} fiscal year ends on <code>{latestA.periodEnd}</code>, while {companyB.ticker} fiscal year ends on <code>{latestB.periodEnd}</code>.
            Direct comparisons reflect each company’s respective annual accounting cycle.
          </div>
        </div>
      )}

      {loading && (
        <div className="loading-card">
          <div className="spinner" />
          <p>Retrieving and aligning SEC EDGAR filings for {companyA.ticker} and {companyB.ticker}...</p>
        </div>
      )}

      {error && (
        <div className="status-banner error">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {dataA && dataB && !loading && latestA && latestB && (
        <div className="compare-content">
          {/* Side-by-Side Hero Cards */}
          <div className="compare-cards-grid">
            <div className="compare-entity-card">
              <div className="entity-top">
                <span className="ticker-badge">{companyA.ticker}</span>
                <span className="exchange-pill">{companyA.exchange}</span>
              </div>
              <h3>{companyA.name}</h3>
              <p>{companyA.description}</p>
              <div className="meta-line"><span>Sector:</span> <b>{companyA.sector}</b></div>
              <div className="meta-line"><span>Fiscal Period End:</span> <b>{latestA.periodEnd} (FY{latestA.fiscalYear})</b></div>
              <div className="meta-line"><span>Health Rating:</span> <b>{dataA.health.rating} ({dataA.health.overall}/100)</b></div>
            </div>

            <div className="compare-entity-card">
              <div className="entity-top">
                <span className="ticker-badge">{companyB.ticker}</span>
                <span className="exchange-pill">{companyB.exchange}</span>
              </div>
              <h3>{companyB.name}</h3>
              <p>{companyB.description}</p>
              <div className="meta-line"><span>Sector:</span> <b>{companyB.sector}</b></div>
              <div className="meta-line"><span>Fiscal Period End:</span> <b>{latestB.periodEnd} (FY{latestB.fiscalYear})</b></div>
              <div className="meta-line"><span>Health Rating:</span> <b>{dataB.health.rating} ({dataB.health.overall}/100)</b></div>
            </div>
          </div>

          {/* Comparative Metrics Table */}
          <div className="comparison-table-card">
            <div className="table-card-head">
              <span className="eyebrow">HEAD-TO-HEAD AUDIT</span>
              <h3>Audited Fundamental Metrics</h3>
            </div>

            <div className="table-responsive">
              <table className="comparison-table">
                <thead>
                  <tr>
                    <th>Metric</th>
                    <th>{companyA.ticker} (FY{latestA.fiscalYear})</th>
                    <th>{companyB.ticker} (FY{latestB.fiscalYear})</th>
                    <th>Interpretation & Analysis</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><b>Total Revenue</b></td>
                    <td className="metric-cell"><b>{formatCurrency(latestA.revenue)}</b></td>
                    <td className="metric-cell"><b>{formatCurrency(latestB.revenue)}</b></td>
                    <td className="note-cell">Top-line business scale and market volume.</td>
                  </tr>
                  <tr>
                    <td><b>Operating Income (EBIT)</b></td>
                    <td className="metric-cell">{formatCurrency(latestA.operatingIncome)}</td>
                    <td className="metric-cell">{formatCurrency(latestB.operatingIncome)}</td>
                    <td className="note-cell">Operating profit generated prior to debt interest and corporate taxes.</td>
                  </tr>
                  <tr>
                    <td><b>Operating Profit Margin</b></td>
                    <td className="metric-cell">
                      <b>{latestA.revenue && latestA.operatingIncome ? `${((latestA.operatingIncome / latestA.revenue) * 100).toFixed(1)}%` : 'N/A'}</b>
                    </td>
                    <td className="metric-cell">
                      <b>{latestB.revenue && latestB.operatingIncome ? `${((latestB.operatingIncome / latestB.revenue) * 100).toFixed(1)}%` : 'N/A'}</b>
                    </td>
                    <td className="note-cell">Percentage of revenue remaining after operating costs. Indicates business pricing power.</td>
                  </tr>
                  <tr>
                    <td><b>Net Income (Bottom Line)</b></td>
                    <td className="metric-cell"><b>{formatCurrency(latestA.netIncome)}</b></td>
                    <td className="metric-cell"><b>{formatCurrency(latestB.netIncome)}</b></td>
                    <td className="note-cell">Final accounting profit attributable to common shareholders.</td>
                  </tr>
                  <tr>
                    <td><b>Net Profit Margin</b></td>
                    <td className="metric-cell">
                      {latestA.revenue && latestA.netIncome ? `${((latestA.netIncome / latestA.revenue) * 100).toFixed(1)}%` : 'N/A'}
                    </td>
                    <td className="metric-cell">
                      {latestB.revenue && latestB.netIncome ? `${((latestB.netIncome / latestB.revenue) * 100).toFixed(1)}%` : 'N/A'}
                    </td>
                    <td className="note-cell">Bottom-line conversion: cents of profit retained per dollar of revenue.</td>
                  </tr>
                  <tr>
                    <td><b>Operating Cash Flow</b></td>
                    <td className="metric-cell"><b>{formatCurrency(latestA.operatingCashFlow)}</b></td>
                    <td className="metric-cell"><b>{formatCurrency(latestB.operatingCashFlow)}</b></td>
                    <td className="note-cell">Actual physical cash collected from core commercial operations.</td>
                  </tr>
                  <tr>
                    <td><b>Free Cash Flow</b></td>
                    <td className="metric-cell">{formatCurrency(latestA.freeCashFlow)}</td>
                    <td className="metric-cell">{formatCurrency(latestB.freeCashFlow)}</td>
                    <td className="note-cell">Discretionary cash generated after funding necessary capital expenditures.</td>
                  </tr>
                  <tr>
                    <td><b>Total Assets</b></td>
                    <td className="metric-cell">{formatCurrency(latestA.totalAssets)}</td>
                    <td className="metric-cell">{formatCurrency(latestB.totalAssets)}</td>
                    <td className="note-cell">Total productive economic resources controlled by the corporation.</td>
                  </tr>
                  <tr>
                    <td><b>Stockholders’ Equity</b></td>
                    <td className="metric-cell">{formatCurrency(latestA.stockholdersEquity)}</td>
                    <td className="metric-cell">{formatCurrency(latestB.stockholdersEquity)}</td>
                    <td className="note-cell">Net asset value belonging to owners after deducting all liabilities.</td>
                  </tr>
                  <tr>
                    <td><b>Total Liabilities to Equity</b></td>
                    <td className="metric-cell">
                      {latestA.totalLiabilities && latestA.stockholdersEquity && latestA.stockholdersEquity > 0
                        ? `${(latestA.totalLiabilities / latestA.stockholdersEquity).toFixed(2)}x`
                        : 'N/A'}
                    </td>
                    <td className="metric-cell">
                      {latestB.totalLiabilities && latestB.stockholdersEquity && latestB.stockholdersEquity > 0
                        ? `${(latestB.totalLiabilities / latestB.stockholdersEquity).toFixed(2)}x`
                        : 'N/A'}
                    </td>
                    <td className="note-cell">Balance sheet leverage. Ratios below 1.5x reflect conservative capital structures.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="table-attribution">
              <ShieldCheck size={14} />
              <span>
                Standardized annual Form 10-K data retrieved from SEC EDGAR. Comparative metrics are factual reported statements, not subjective endorsements.
              </span>
            </div>
          </div>

          {/* Comparative Visual Charts */}
          <div className="compare-charts-row">
            <FinancialBarChart
              data={compareRevenueChart}
              title="Revenue Comparison (Latest FY)"
              primaryLegend="Total Revenue"
              primaryColor="#35d49a"
            />
            <FinancialBarChart
              data={compareNetIncomeChart}
              title="Net Income Comparison (Latest FY)"
              primaryLegend="Net Income"
              primaryColor="#38bdf8"
            />
          </div>
        </div>
      )}
    </div>
  );
};

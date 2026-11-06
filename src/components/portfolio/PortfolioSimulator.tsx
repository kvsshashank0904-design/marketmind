import React, { useState, useMemo } from 'react';
import { Wallet, TrendingUp, ShieldCheck, ArrowRight, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';
import { runPortfolioSimulation } from '../../services/portfolioSimulation';
import { formatCurrency } from '../../services/financialCalculations';
import { GrowthAreaChart, AreaPoint } from '../shared/Chart';

export const PortfolioSimulator: React.FC = () => {
  const [initialInvestment, setInitialInvestment] = useState<number>(10000);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(300);
  const [years, setYears] = useState<number>(20);
  const [annualReturnPct, setAnnualReturnPct] = useState<number>(7.0);
  const [inflationPct, setInflationPct] = useState<number>(2.5);

  const simulation = useMemo(() => {
    return runPortfolioSimulation({
      initialInvestment,
      monthlyContribution,
      years,
      annualReturnPct,
      inflationPct,
    });
  }, [initialInvestment, monthlyContribution, years, annualReturnPct, inflationPct]);

  // Area chart data mapping
  const chartData: AreaPoint[] = useMemo(() => {
    const points: AreaPoint[] = [
      {
        label: 'Year 0',
        nominal: initialInvestment,
        real: initialInvestment,
        contributions: initialInvestment,
      },
    ];

    simulation.yearlyBreakdown.forEach((yb) => {
      points.push({
        label: `Yr ${yb.year}`,
        nominal: yb.nominalTotal,
        real: yb.realTotal,
        contributions: yb.totalContributions,
      });
    });

    return points;
  }, [simulation, initialInvestment]);

  const applyScenario = (returnRate: number, inflationRate: number) => {
    setAnnualReturnPct(returnRate);
    setInflationPct(inflationRate);
  };

  return (
    <div className="page-workspace">
      <div className="workspace-header">
        <div className="eyebrow">HYPOTHETICAL LEARNING MODEL · COMPOUND INTEREST</div>
        <h1>Portfolio Simulator</h1>
        <p className="intro">
          Explore the mathematical mechanics of regular monthly contributions and compound growth over multi-decade horizons.
          Toggle between nominal paper values and inflation-adjusted real purchasing power.
        </p>
      </div>

      <div className="sim-workspace-layout">
        {/* Controls Card */}
        <div className="sim-controls-card">
          <div className="controls-header">
            <h3>Simulation Parameters</h3>
            <div className="preset-buttons">
              <button
                className={`preset-btn ${annualReturnPct === 4.0 ? 'active' : ''}`}
                onClick={() => applyScenario(4.0, 2.0)}
              >
                Conservative (4%)
              </button>
              <button
                className={`preset-btn ${annualReturnPct === 7.0 ? 'active' : ''}`}
                onClick={() => applyScenario(7.0, 2.5)}
              >
                Moderate (7%)
              </button>
              <button
                className={`preset-btn ${annualReturnPct === 10.0 ? 'active' : ''}`}
                onClick={() => applyScenario(10.0, 3.0)}
              >
                Optimistic (10%)
              </button>
            </div>
          </div>

          <div className="input-group-grid">
            <div className="sim-field">
              <label htmlFor="initial-investment">Initial Lump Sum (USD)</label>
              <input
                id="initial-investment"
                type="number"
                min="0"
                step="500"
                value={initialInvestment}
                onChange={(e) => setInitialInvestment(Math.max(0, +e.target.value))}
              />
            </div>

            <div className="sim-field">
              <label htmlFor="monthly-contribution">Monthly Contribution (USD)</label>
              <input
                id="monthly-contribution"
                type="number"
                min="0"
                step="50"
                value={monthlyContribution}
                onChange={(e) => setMonthlyContribution(Math.max(0, +e.target.value))}
              />
            </div>

            <div className="sim-field">
              <div className="field-label-row">
                <label htmlFor="horizon-years">Time Horizon: {years} Years</label>
              </div>
              <input
                id="horizon-years"
                type="range"
                min="1"
                max="40"
                value={years}
                onChange={(e) => setYears(+e.target.value)}
              />
            </div>

            <div className="sim-field">
              <div className="field-label-row">
                <label htmlFor="annual-return">Expected Annual Return: {annualReturnPct.toFixed(1)}%</label>
              </div>
              <input
                id="annual-return"
                type="range"
                min="1"
                max="15"
                step="0.5"
                value={annualReturnPct}
                onChange={(e) => setAnnualReturnPct(+e.target.value)}
              />
            </div>

            <div className="sim-field full-width">
              <div className="field-label-row">
                <label htmlFor="inflation-rate">Assumed Annual Inflation: {inflationPct.toFixed(1)}%</label>
                <small className="field-hint">U.S. historical long-term CPI benchmark is ~2.5%</small>
              </div>
              <input
                id="inflation-rate"
                type="range"
                min="0"
                max="8"
                step="0.1"
                value={inflationPct}
                onChange={(e) => setInflationPct(+e.target.value)}
              />
            </div>
          </div>

          <div className="sim-note">
            <AlertCircle size={14} />
            <span>
              All projections assume constant reinvestment with monthly compounding. Real-world returns fluctuate with market volatility.
            </span>
          </div>
        </div>

        {/* Results Card */}
        <div className="sim-results-card">
          <div className="results-top">
            <span className="eyebrow">HYPOTHETICAL END VALUE ({years} YEARS)</span>
            <div className="nominal-display">
              <h2>{formatCurrency(simulation.nominalFinal)}</h2>
              <span className="nominal-tag">Nominal Value</span>
            </div>
            <div className="real-purchasing-power">
              <b>{formatCurrency(simulation.realFinal)}</b>
              <small>Real Purchasing Power (Inflation-Adjusted)</small>
            </div>
          </div>

          <div className="breakdown-stat-rows">
            <div className="stat-row">
              <span>Your Total Contributions:</span>
              <b>{formatCurrency(simulation.totalContributions)}</b>
            </div>
            <div className="stat-row">
              <span>Compound Growth Generated:</span>
              <b className="growth-text">+{formatCurrency(simulation.nominalGrowth)}</b>
            </div>
            <div className="stat-row">
              <span>Estimated Inflation Drag:</span>
              <b className="inflation-text">-{formatCurrency(simulation.purchasingPowerLoss)}</b>
            </div>
          </div>

          {/* Growth Curve Chart */}
          <div className="sim-chart-box">
            <GrowthAreaChart data={chartData} title={`${years}-Year Compounding vs Real Purchasing Power`} />
          </div>

          {/* Milestones Tracker */}
          <div className="milestones-card">
            <h4>Estimated Capital Milestones</h4>
            <div className="milestones-grid">
              {simulation.milestones.map((ms) => (
                <div
                  key={ms.target}
                  className={`milestone-pill ${ms.achievedInYear !== null ? 'achieved' : 'pending'}`}
                >
                  <span className="target-num">{formatCurrency(ms.target)}</span>
                  <span className="timeline-stat">
                    {ms.achievedInYear !== null
                      ? ms.achievedInYear === 0
                        ? 'Day 1'
                        : `Year ${ms.achievedInYear}`
                      : 'Beyond Horizon'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="disclaimer-banner">
        <ShieldCheck size={16} />
        <span>
          <strong>Educational Demonstration:</strong> This compounding simulation is a simplified mathematical illustration.
          It excludes transaction costs, income taxes, dividend taxation, and market drawdown volatility. It does not constitute a financial forecast.
        </span>
      </div>
    </div>
  );
};

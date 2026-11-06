import { describe, it, expect } from 'vitest';
import { runPortfolioSimulation } from '../src/services/portfolioSimulation';

describe('Portfolio Simulator: Compounding & Inflation Modeling', () => {
  it('correctly models basic compound interest over time', () => {
    const res = runPortfolioSimulation({
      initialInvestment: 10000,
      monthlyContribution: 500,
      years: 10,
      annualReturnPct: 7.0,
      inflationPct: 2.5,
    });

    // 10 years * 12 months = 120 months * 500 = 60,000 + 10,000 = 70,000 total contributions
    expect(res.totalContributions).toBe(70000);
    // Compound growth must be greater than contributions
    expect(res.nominalFinal).toBeGreaterThan(res.totalContributions);
    expect(res.nominalGrowth).toBe(res.nominalFinal - res.totalContributions);
    // Real purchasing power must be less than nominal final due to inflation
    expect(res.realFinal).toBeLessThan(res.nominalFinal);
    expect(res.purchasingPowerLoss).toBe(res.nominalFinal - res.realFinal);
    // Yearly breakdown should have exactly 10 entries
    expect(res.yearlyBreakdown.length).toBe(10);
  });

  it('accurately identifies investment milestones achieved', () => {
    const res = runPortfolioSimulation({
      initialInvestment: 25000,
      monthlyContribution: 1000,
      years: 15,
      annualReturnPct: 8.0,
      inflationPct: 2.5,
    });

    // $25k was achieved on Day 1 (year 0)
    const m25k = res.milestones.find((m) => m.target === 25000);
    expect(m25k?.achievedInYear).toBe(0);

    // $50k and $100k should be achieved well within 15 years
    const m50k = res.milestones.find((m) => m.target === 50000);
    const m100k = res.milestones.find((m) => m.target === 100000);
    expect(m50k?.achievedInYear).toBeGreaterThan(0);
    expect(m100k?.achievedInYear).toBeGreaterThan(0);
    expect(m100k!.achievedInYear!).toBeGreaterThan(m50k!.achievedInYear!);
  });

  it('discounts the ending nominal value by cumulative inflation for real purchasing power', () => {
    const res = runPortfolioSimulation({
      initialInvestment: 10000,
      monthlyContribution: 0,
      years: 10,
      annualReturnPct: 7,
      inflationPct: 2.5,
    });
    expect(Math.abs(res.realFinal - res.nominalFinal / Math.pow(1.025, 10))).toBeLessThan(1);
  });
});

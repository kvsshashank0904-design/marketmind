import { describe, it, expect } from 'vitest';
import {
  calculateFinancialRatios,
  evaluateFinancialHealth,
  formatCurrency,
  formatPercent,
  formatMultiple,
} from '../src/services/financialCalculations';
import { AnnualRecord } from '../src/types';

describe('Financial Calculations & Health Diagnostics', () => {
  it('correctly calculates core profitability and solvency ratios', () => {
    const record: AnnualRecord = {
      fiscalYear: 2025,
      periodEnd: '2025-12-31',
      form: '10-K',
      filed: '2026-02-01',
      revenue: 1000000000,
      grossProfit: 600000000,
      operatingIncome: 250000000,
      netIncome: 200000000,
      totalAssets: 1500000000,
      totalLiabilities: 500000000,
      stockholdersEquity: 1000000000,
      operatingCashFlow: 220000000,
      freeCashFlow: 180000000,
      cashAndEquivalents: 300000000,
      longTermDebt: 200000000,
    };

    const ratios = calculateFinancialRatios(record);
    const grossMargin = ratios.find((r) => r.id === 'gross-margin');
    const opMargin = ratios.find((r) => r.id === 'operating-margin');
    const netMargin = ratios.find((r) => r.id === 'net-margin');
    const roe = ratios.find((r) => r.id === 'roe');
    const roa = ratios.find((r) => r.id === 'roa');
    const de = ratios.find((r) => r.id === 'debt-to-equity');
    const cashQuality = ratios.find((r) => r.id === 'cash-quality');

    expect(grossMargin?.value).toBeCloseTo(60.0);
    expect(opMargin?.value).toBeCloseTo(25.0);
    expect(netMargin?.value).toBeCloseTo(20.0);
    expect(roe?.value).toBeCloseTo(20.0); // 200M / 1000M
    expect(roa?.value).toBeCloseTo(13.33, 1); // 200M / 1500M
    expect(de?.value).toBeCloseTo(0.5); // 500M / 1000M
    expect(cashQuality?.value).toBeCloseTo(1.1); // 220M / 200M
  });

  it('safely handles zero denominators and missing fields without crashing', () => {
    const emptyRecord: AnnualRecord = {
      fiscalYear: 2025,
      periodEnd: '2025-12-31',
      form: '10-K',
      filed: '2026-02-01',
      revenue: 0,
      netIncome: undefined,
    };

    const ratios = calculateFinancialRatios(emptyRecord);
    // Should not throw and should omit invalid zero-division ratios
    expect(ratios.find((r) => r.id === 'net-margin')).toBeUndefined();
    expect(ratios.find((r) => r.id === 'gross-margin')).toBeUndefined();
  });

  it('uses average balance-sheet values when a prior annual record is available', () => {
    const current: AnnualRecord = {
      fiscalYear: 2025, periodEnd: '2025-12-31', form: '10-K', filed: '2026-02-01',
      revenue: 300, netIncome: 30, totalAssets: 200, stockholdersEquity: 100,
    };
    const prior: AnnualRecord = {
      fiscalYear: 2024, periodEnd: '2024-12-31', form: '10-K', filed: '2025-02-01',
      totalAssets: 100, stockholdersEquity: 50,
    };
    const ratios = calculateFinancialRatios(current, prior);
    expect(ratios.find((r) => r.id === 'roa')?.value).toBeCloseTo(20); // 30 / average assets of 150
    expect(ratios.find((r) => r.id === 'roe')?.value).toBeCloseTo(40); // 30 / average equity of 75
    expect(ratios.find((r) => r.id === 'asset-turnover')?.value).toBeCloseTo(2); // 300 / average assets of 150
  });

  it('correctly evaluates financial health scoring and ratings', () => {
    const history: AnnualRecord[] = [
      {
        fiscalYear: 2025,
        periodEnd: '2025-12-31',
        form: '10-K',
        filed: '2026-02-01',
        revenue: 200000000,
        netIncome: 50000000,
        operatingCashFlow: 55000000,
        stockholdersEquity: 150000000,
        totalLiabilities: 50000000,
      },
      {
        fiscalYear: 2024,
        periodEnd: '2024-12-31',
        form: '10-K',
        filed: '2025-02-01',
        revenue: 150000000,
        netIncome: 35000000,
        operatingCashFlow: 40000000,
        stockholdersEquity: 120000000,
        totalLiabilities: 45000000,
      },
    ];

    const health = evaluateFinancialHealth(history);
    expect(health.overall).toBeGreaterThanOrEqual(70);
    expect(['Strong', 'Exceptional']).toContain(health.rating);
    expect(health.strengths.length).toBeGreaterThan(0);
    expect(health.pillars.growth.score).toBeGreaterThanOrEqual(70);
  });

  it('formats currency and percentages properly', () => {
    expect(formatCurrency(1500000000)).toBe('$1.5B');
    expect(formatCurrency(25000000)).toBe('$25.0M');
    expect(formatCurrency(null)).toBe('N/A');
    expect(formatPercent(15.42)).toBe('+15.4%');
    expect(formatPercent(-4.2)).toBe('-4.2%');
    expect(formatMultiple(1.456)).toBe('1.46x');
  });
});

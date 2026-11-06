import { describe, it, expect } from 'vitest';
import {
  isAnnualDurationFact,
  isAnnualInstantFact,
  extractAnnualMetricMap,
  parseSecCompanyFacts,
} from '../src/services/financialParser';
import { RawXbrlFact } from '../src/types';

describe('Financial Parser: XBRL Validation & Bug Prevention', () => {
  it('correctly validates annual duration facts (330 to 385 days) on 10-K', () => {
    const annualFact: RawXbrlFact = {
      start: '2025-01-01',
      end: '2025-12-31',
      val: 1000000,
      form: '10-K',
      filed: '2026-02-15',
    };
    expect(isAnnualDurationFact(annualFact)).toBe(true);

    // Amended 10-K/A should also be accepted
    const amendedFact: RawXbrlFact = {
      ...annualFact,
      form: '10-K/A',
      filed: '2026-04-10',
    };
    expect(isAnnualDurationFact(amendedFact)).toBe(true);
  });

  it('rejects quarterly facts and 10-Q filings from annual duration', () => {
    // 90 day quarter on 10-K (e.g. Q4 breakdown)
    const quarterlyFact: RawXbrlFact = {
      start: '2025-10-01',
      end: '2025-12-31',
      val: 250000,
      form: '10-K',
      filed: '2026-02-15',
    };
    expect(isAnnualDurationFact(quarterlyFact)).toBe(false);

    // 10-Q filing
    const tenQFact: RawXbrlFact = {
      start: '2025-01-01',
      end: '2025-03-31',
      val: 250000,
      form: '10-Q',
      filed: '2025-04-15',
    };
    expect(isAnnualDurationFact(tenQFact)).toBe(false);
  });

  it('correctly validates instant facts on 10-K', () => {
    const instantFact: RawXbrlFact = {
      end: '2025-12-31',
      val: 5000000,
      form: '10-K',
      filed: '2026-02-15',
    };
    expect(isAnnualInstantFact(instantFact)).toBe(true);
  });

  it('prioritizes amended filings (10-K/A) with later filed date for the same period', () => {
    const gaap = {
      Revenues: {
        units: {
          USD: [
            {
              start: '2024-01-01',
              end: '2024-12-31',
              val: 100000000,
              form: '10-K',
              filed: '2025-02-10',
            },
            {
              start: '2024-01-01',
              end: '2024-12-31',
              val: 105000000, // restated
              form: '10-K/A',
              filed: '2025-05-20',
            },
          ],
        },
      },
    };

    const map = extractAnnualMetricMap(gaap, ['Revenues'], true);
    const observation = map.get(2024);
    expect(observation).toBeDefined();
    expect(observation?.val).toBe(105000000);
    expect(observation?.form).toBe('10-K/A');
  });

  it('preserves candidate-tag priority when later filings contain comparative facts', () => {
    const gaap = {
      Revenues: {
        units: {
          USD: [{
            start: '2024-01-01', end: '2024-12-31', val: 100000000,
            form: '10-K', filed: '2025-02-01',
          }],
        },
      },
      RevenueFromContractWithCustomerExcludingAssessedTax: {
        units: {
          USD: [{
            start: '2024-01-01', end: '2024-12-31', val: 99000000,
            form: '10-K', filed: '2026-02-01',
          }],
        },
      },
    };

    const observation = extractAnnualMetricMap(gaap, [
      'Revenues',
      'RevenueFromContractWithCustomerExcludingAssessedTax',
    ]).get(2024);
    expect(observation?.val).toBe(100000000);
    expect(observation?.tag).toBe('Revenues');
  });

  it('does not join a duration fact from a different period end', () => {
    const records = parseSecCompanyFacts({
      facts: {
        'us-gaap': {
          Revenues: { units: { USD: [{ start: '2024-01-01', end: '2024-12-31', val: 100, form: '10-K', filed: '2025-02-01' }] } },
          NetIncomeLoss: { units: { USD: [{ start: '2024-02-01', end: '2025-01-31', val: 20, form: '10-K', filed: '2025-02-01' }] } },
        },
      },
    });

    expect(records[0].revenue).toBe(100);
    expect(records[0].netIncome).toBeUndefined();
  });

  it('CRITICAL TEST: Resolves NVIDIA revenue concept deprecation bug', () => {
    // NVIDIA switched from RevenueFromContractWithCustomerExcludingAssessedTax (ended in 2022) to Revenues (recent years)
    const mockNvidiaGaap = {
      'RevenueFromContractWithCustomerExcludingAssessedTax': {
        units: {
          USD: [
            {
              start: '2021-02-01',
              end: '2022-01-30',
              val: 26914000000, // $26.9B from 2022
              form: '10-K',
              filed: '2022-03-18',
            },
          ],
        },
      },
      'Revenues': {
        units: {
          USD: [
            {
              start: '2025-01-27',
              end: '2026-01-25',
              val: 215938000000, // $215.9B from 2026
              form: '10-K',
              filed: '2026-02-25',
            },
            {
              start: '2024-01-29',
              end: '2025-01-26',
              val: 130496000000, // $130.5B from 2025
              form: '10-K',
              filed: '2026-02-25',
            },
          ],
        },
      },
      'NetIncomeLoss': {
        units: {
          USD: [
            {
              start: '2025-01-27',
              end: '2026-01-25',
              val: 120100000000, // $120.1B in 2026
              form: '10-K',
              filed: '2026-02-25',
            },
          ],
        },
      },
    };

    const mockSecJson = {
      entityName: 'NVIDIA CORP',
      facts: { 'us-gaap': mockNvidiaGaap },
    };

    const records = parseSecCompanyFacts(mockSecJson);
    expect(records.length).toBeGreaterThan(0);

    const latest = records[0];
    expect(latest.fiscalYear).toBe(2026);
    // Explicit verification: revenue is $215.9B, NOT the old $26.9B!
    expect(latest.revenue).toBe(215938000000);
    expect(latest.netIncome).toBe(120100000000);
    // Net Income should be LESS than Revenue (sanity check)
    expect(latest.netIncome).toBeLessThan(latest.revenue!);
  });

  it('safely computes derived Gross Profit and Free Cash Flow when components are available', () => {
    const mockGaap = {
      Revenues: {
        units: {
          USD: [{ start: '2024-01-01', end: '2024-12-31', val: 500000, form: '10-K', filed: '2025-02-01' }],
        },
      },
      CostOfRevenue: {
        units: {
          USD: [{ start: '2024-01-01', end: '2024-12-31', val: 200000, form: '10-K', filed: '2025-02-01' }],
        },
      },
      NetCashProvidedByUsedInOperatingActivities: {
        units: {
          USD: [{ start: '2024-01-01', end: '2024-12-31', val: 150000, form: '10-K', filed: '2025-02-01' }],
        },
      },
      PaymentsToAcquirePropertyPlantAndEquipment: {
        units: {
          USD: [{ start: '2024-01-01', end: '2024-12-31', val: 50000, form: '10-K', filed: '2025-02-01' }],
        },
      },
    };

    const records = parseSecCompanyFacts({ facts: { 'us-gaap': mockGaap } });
    expect(records.length).toBe(1);
    const r = records[0];
    expect(r.grossProfit).toBe(300000); // 500,000 - 200,000
    expect(r.freeCashFlow).toBe(100000); // 150,000 - 50,000
  });
});

import { AnnualRecord, RawXbrlFact } from '../types';

interface XbrlUnitFact extends RawXbrlFact {
  tag?: string;
  endYear?: number;
}

/**
 * Validates whether a duration fact covers an annual reporting period (~330 to 385 days)
 * and belongs to an official annual filing (10-K or 10-K/A).
 */
export function isAnnualDurationFact(item: RawXbrlFact): boolean {
  if (item.form !== '10-K' && item.form !== '10-K/A') return false;
  if (!item.start || !item.end) return false;

  const startMs = new Date(item.start).getTime();
  const endMs = new Date(item.end).getTime();
  if (isNaN(startMs) || isNaN(endMs) || endMs <= startMs) return false;

  const diffDays = (endMs - startMs) / (1000 * 60 * 60 * 24);
  // Standard full-year fiscal reporting period: 52-53 weeks (330 - 385 days)
  return diffDays >= 330 && diffDays <= 385;
}

/**
 * Validates whether an instant (point-in-time) fact belongs to an annual 10-K filing.
 */
export function isAnnualInstantFact(item: RawXbrlFact): boolean {
  if (item.form !== '10-K' && item.form !== '10-K/A') return false;
  if (!item.end) return false;
  const endMs = new Date(item.end).getTime();
  return !isNaN(endMs);
}

/**
 * Collects annual observations grouped by the calendar year of periodEnd.
 *
 * Candidate tags are intentionally evaluated in the supplied order. A newer filing
 * using a fallback concept must not replace an observation from the preferred
 * concept for the same fiscal period: issuers often include comparative facts in
 * later 10-Ks under several concepts. Within one concept, a later filed amendment
 * or restatement takes precedence.
 */
export function extractAnnualMetricMap(
  gaap: Record<string, any>,
  candidateTags: string[],
  isDuration: boolean = true
): Map<number, XbrlUnitFact> {
  const map = new Map<number, XbrlUnitFact>();

  for (const tag of candidateTags) {
    const concept = gaap[tag];
    if (!concept || !concept.units) continue;

    // Check USD units primarily, fallback to any currency or shares if applicable
    const unitList: RawXbrlFact[] = concept.units.USD || concept.units.shares || [];
    for (const item of unitList) {
      const isValid = isDuration ? isAnnualDurationFact(item) : isAnnualInstantFact(item);
      if (!isValid) continue;

      const endYear = new Date(item.end).getFullYear();
      if (isNaN(endYear)) continue;

      const existing = map.get(endYear);
      if (!existing) {
        map.set(endYear, { ...item, tag, endYear });
        continue;
      }

      // Preserve tag priority; only resolve newer filings within the same concept.
      if (existing.tag === tag) {
        const currentFiledMs = new Date(item.filed).getTime();
        const existingFiledMs = new Date(existing.filed).getTime();
        if (currentFiledMs > existingFiledMs ||
          (currentFiledMs === existingFiledMs && item.form === '10-K/A' && existing.form !== '10-K/A')) {
          map.set(endYear, { ...item, tag, endYear });
        }
      }
    }
  }

  return map;
}

/**
 * Robust SEC XBRL parser for MarketMind.
 * Extracts up to 5 consecutive historical annual statements with aligned fiscal periods.
 */
export function parseSecCompanyFacts(rawJson: any): AnnualRecord[] {
  if (!rawJson || !rawJson.facts) return [];
  const gaap = rawJson.facts['us-gaap'] || {};

  // 1. Duration metrics (Income Statement & Cash Flow)
  const revenueMap = extractAnnualMetricMap(gaap, [
    'Revenues',
    'RevenueFromContractWithCustomerExcludingAssessedTax',
    'SalesRevenueNet',
    'SalesRevenueGoodsNet',
    'TotalRevenuesAndOtherIncome',
  ], true);

  const costOfRevenueMap = extractAnnualMetricMap(gaap, [
    'CostOfGoodsAndServicesSold',
    'CostOfRevenue',
    'CostOfGoodsSold',
  ], true);

  const grossProfitMap = extractAnnualMetricMap(gaap, ['GrossProfit'], true);

  const operatingIncomeMap = extractAnnualMetricMap(gaap, [
    'OperatingIncomeLoss',
  ], true);

  const netIncomeMap = extractAnnualMetricMap(gaap, [
    'NetIncomeLoss',
    'ProfitLoss',
    'NetIncomeLossAvailableToCommonStockholdersBasic',
  ], true);

  const ocfMap = extractAnnualMetricMap(gaap, [
    'NetCashProvidedByUsedInOperatingActivities',
  ], true);

  const capexMap = extractAnnualMetricMap(gaap, [
    'PaymentsToAcquirePropertyPlantAndEquipment',
    'PaymentsToAcquireProductiveAssets',
  ], true);

  // 2. Instant metrics (Balance Sheet)
  const assetsMap = extractAnnualMetricMap(gaap, ['Assets'], false);

  const liabilitiesMap = extractAnnualMetricMap(gaap, [
    'Liabilities',
  ], false);

  const equityMap = extractAnnualMetricMap(gaap, [
    'StockholdersEquity',
    'StockholdersEquityIncludingPortionAttributableToNoncontrollingInterest',
  ], false);

  const cashMap = extractAnnualMetricMap(gaap, [
    'CashAndCashEquivalentsAtCarryingValue',
    'CashCashEquivalentsRestrictedCashAndRestrictedCashEquivalents',
  ], false);

  const debtMap = extractAnnualMetricMap(gaap, [
    'LongTermDebtNoncurrent',
    'LongTermDebt',
    'LongTermDebtAndCapitalLeaseObligations',
  ], false);

  // Revenue is the statement anchor. This avoids joining metrics from different
  // annual periods merely because their calendar end years happen to match.
  const anchorYears = revenueMap.size > 0
    ? Array.from(revenueMap.keys())
    : Array.from(new Set<number>([
      ...netIncomeMap.keys(),
      ...operatingIncomeMap.keys(),
      ...assetsMap.keys(),
      ...ocfMap.keys(),
    ]));

  const sortedYears = anchorYears
    .sort((a, b) => b - a)
    .slice(0, 5); // Take up to 5 most recent fiscal years

  return sortedYears.map((year) => {
    const rev = revenueMap.get(year);
    const anchor = rev || netIncomeMap.get(year) || assetsMap.get(year);
    const samePeriod = (fact?: XbrlUnitFact) => fact?.end === anchor?.end ? fact : undefined;
    const cor = samePeriod(costOfRevenueMap.get(year));
    const gp = samePeriod(grossProfitMap.get(year));
    const op = samePeriod(operatingIncomeMap.get(year));
    const ni = samePeriod(netIncomeMap.get(year));
    const ocf = samePeriod(ocfMap.get(year));
    const capex = samePeriod(capexMap.get(year));
    const assets = samePeriod(assetsMap.get(year));
    const liab = samePeriod(liabilitiesMap.get(year));
    const eq = samePeriod(equityMap.get(year));
    const cash = samePeriod(cashMap.get(year));
    const debt = samePeriod(debtMap.get(year));

    // Calculate gross profit if not directly reported
    let grossProfitVal: number | undefined = gp?.val;
    if (grossProfitVal === undefined && rev?.val !== undefined && cor?.val !== undefined) {
      grossProfitVal = rev.val - cor.val;
    }

    // Calculate Free Cash Flow: Operating Cash Flow - CapEx
    let fcfVal: number | undefined;
    if (ocf?.val !== undefined && capex?.val !== undefined) {
      fcfVal = ocf.val - Math.abs(capex.val);
    }

    // Fallback for liabilities if Assets and Equity are reported
    let totalLiabilitiesVal = liab?.val;
    if (totalLiabilitiesVal === undefined && assets?.val !== undefined && eq?.val !== undefined) {
      totalLiabilitiesVal = Math.max(0, assets.val - eq.val);
    }

    const periodEnd = rev?.end || ni?.end || assets?.end || `${year}-12-31`;
    const form = rev?.form || ni?.form || assets?.form || '10-K';
    const filed = rev?.filed || ni?.filed || assets?.filed || `${year}-01-01`;

    return {
      fiscalYear: year,
      periodEnd,
      form,
      filed,
      revenue: rev?.val,
      costOfRevenue: cor?.val,
      grossProfit: grossProfitVal,
      operatingIncome: op?.val,
      netIncome: ni?.val,
      operatingCashFlow: ocf?.val,
      capitalExpenditure: capex?.val ? Math.abs(capex.val) : undefined,
      freeCashFlow: fcfVal,
      totalAssets: assets?.val,
      totalLiabilities: totalLiabilitiesVal,
      stockholdersEquity: eq?.val,
      cashAndEquivalents: cash?.val,
      longTermDebt: debt?.val,
    };
  });
}

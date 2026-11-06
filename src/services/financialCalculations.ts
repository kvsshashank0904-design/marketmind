import { AnnualRecord, FinancialRatio, HealthScore } from '../types';

export function formatCurrency(val?: number | null, compact: boolean = true): string {
  if (val === undefined || val === null || isNaN(val)) return 'N/A';
  if (!compact) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(val);
}

export function formatPercent(val?: number | null): string {
  if (val === undefined || val === null || isNaN(val)) return 'N/A';
  return `${val >= 0 ? '+' : ''}${val.toFixed(1)}%`;
}

export function formatMultiple(val?: number | null): string {
  if (val === undefined || val === null || isNaN(val)) return 'N/A';
  return `${val.toFixed(2)}x`;
}

/**
 * Calculates 10 core financial ratios from the latest annual record.
 */
export function calculateFinancialRatios(record?: AnnualRecord, priorRecord?: AnnualRecord): FinancialRatio[] {
  if (!record) return [];

  const {
    revenue,
    grossProfit,
    operatingIncome,
    netIncome,
    operatingCashFlow,
    freeCashFlow,
    totalAssets,
    totalLiabilities,
    stockholdersEquity,
    cashAndEquivalents,
    longTermDebt,
  } = record;

  const ratios: FinancialRatio[] = [];
  const averageBalance = (current?: number, prior?: number) =>
    current !== undefined && prior !== undefined ? (current + prior) / 2 : current;
  const averageAssets = averageBalance(totalAssets, priorRecord?.totalAssets);
  const averageEquity = averageBalance(stockholdersEquity, priorRecord?.stockholdersEquity);

  // 1. Gross Profit Margin
  if (grossProfit !== undefined && revenue && revenue > 0) {
    const val = (grossProfit / revenue) * 100;
    ratios.push({
      id: 'gross-margin',
      name: 'Gross Profit Margin',
      category: 'Profitability',
      value: val,
      formatted: `${val.toFixed(1)}%`,
      formula: '(Gross Profit / Total Revenue) × 100',
      sourceInputs: `Gross Profit: ${formatCurrency(grossProfit)} | Revenue: ${formatCurrency(revenue)}`,
      benchmark: '> 40% typical for high-moat tech / IP businesses',
      interpretation: 'Measures what percentage of revenue remains after subtracting the direct costs of producing goods or services.',
      status: val > 40 ? 'good' : val > 20 ? 'neutral' : 'caution',
    });
  }

  // 2. Operating Profit Margin
  if (operatingIncome !== undefined && revenue && revenue > 0) {
    const val = (operatingIncome / revenue) * 100;
    ratios.push({
      id: 'operating-margin',
      name: 'Operating Profit Margin',
      category: 'Profitability',
      value: val,
      formatted: `${val.toFixed(1)}%`,
      formula: '(Operating Income / Total Revenue) × 100',
      sourceInputs: `Operating Income: ${formatCurrency(operatingIncome)} | Revenue: ${formatCurrency(revenue)}`,
      benchmark: '> 15% indicates strong operational efficiency',
      interpretation: 'Measures the proportion of revenue left over after paying for variable costs of production like wages and raw materials, before taxes and interest.',
      status: val > 15 ? 'good' : val > 5 ? 'neutral' : 'caution',
    });
  }

  // 3. Net Profit Margin
  if (netIncome !== undefined && revenue && revenue > 0) {
    const val = (netIncome / revenue) * 100;
    ratios.push({
      id: 'net-margin',
      name: 'Net Profit Margin',
      category: 'Profitability',
      value: val,
      formatted: `${val.toFixed(1)}%`,
      formula: '(Net Income / Total Revenue) × 100',
      sourceInputs: `Net Income: ${formatCurrency(netIncome)} | Revenue: ${formatCurrency(revenue)}`,
      benchmark: '> 10% indicates healthy bottom-line profitability',
      interpretation: 'The ultimate bottom-line measure showing how many cents of every dollar earned convert into actual profit for shareholders.',
      status: val > 12 ? 'good' : val > 0 ? 'neutral' : 'caution',
    });
  }

  // 4. Return on Assets (ROA)
  if (netIncome !== undefined && averageAssets !== undefined && averageAssets > 0) {
    const val = (netIncome / averageAssets) * 100;
    ratios.push({
      id: 'roa',
      name: 'Return on Assets (ROA)',
      category: 'Efficiency',
      value: val,
      formatted: `${val.toFixed(1)}%`,
      formula: '(Net Income / Average Total Assets) × 100',
      sourceInputs: `Net Income: ${formatCurrency(netIncome)} | Average Assets: ${formatCurrency(averageAssets)}`,
      benchmark: '> 5% is good, > 10% is exceptional',
      interpretation: 'Indicates how efficiently management is using its asset base to generate profit.',
      status: val > 8 ? 'good' : val > 3 ? 'neutral' : 'caution',
    });
  }

  // 5. Return on Equity (ROE)
  if (netIncome !== undefined && averageEquity !== undefined && averageEquity > 0) {
    const val = (netIncome / averageEquity) * 100;
    ratios.push({
      id: 'roe',
      name: 'Return on Equity (ROE)',
      category: 'Efficiency',
      value: val,
      formatted: `${val.toFixed(1)}%`,
      formula: '(Net Income / Average Stockholders’ Equity) × 100',
      sourceInputs: `Net Income: ${formatCurrency(netIncome)} | Average Equity: ${formatCurrency(averageEquity)}`,
      benchmark: '> 15% indicates superior capital compounder',
      interpretation: 'Measures profitability relative to shareholder investment capital.',
      status: val > 15 ? 'good' : val > 8 ? 'neutral' : 'caution',
    });
  }

  // 6. Asset Turnover
  if (revenue !== undefined && averageAssets !== undefined && averageAssets > 0) {
    const val = revenue / averageAssets;
    ratios.push({
      id: 'asset-turnover',
      name: 'Asset Turnover',
      category: 'Efficiency',
      value: val,
      formatted: `${val.toFixed(2)}x`,
      formula: 'Total Revenue / Average Total Assets',
      sourceInputs: `Revenue: ${formatCurrency(revenue)} | Average Assets: ${formatCurrency(averageAssets)}`,
      benchmark: '> 0.75x reflects high business velocity',
      interpretation: 'Measures the amount of revenue generated for every dollar of company assets owned.',
      status: val > 0.8 ? 'good' : val > 0.4 ? 'neutral' : 'caution',
    });
  }

  // 7. Debt-to-Equity
  if (totalLiabilities !== undefined && stockholdersEquity && stockholdersEquity > 0) {
    const val = totalLiabilities / stockholdersEquity;
    ratios.push({
      id: 'debt-to-equity',
      name: 'Total Liabilities to Equity',
      category: 'Solvency',
      value: val,
      formatted: `${val.toFixed(2)}x`,
      formula: 'Total Liabilities / Stockholders’ Equity',
      sourceInputs: `Liabilities: ${formatCurrency(totalLiabilities)} | Equity: ${formatCurrency(stockholdersEquity)}`,
      benchmark: '< 2.0x is generally conservative and manageable',
      interpretation: 'Compares total debt obligations against shareholders equity to evaluate financial leverage.',
      status: val < 1.5 ? 'good' : val < 2.5 ? 'neutral' : 'caution',
    });
  }

  // 8. Cash Flow Quality Ratio
  if (operatingCashFlow !== undefined && netIncome !== undefined && netIncome !== 0) {
    const val = operatingCashFlow / netIncome;
    ratios.push({
      id: 'cash-quality',
      name: 'Operating Cash Flow to Net Income',
      category: 'Cash Flow',
      value: val,
      formatted: `${val.toFixed(2)}x`,
      formula: 'Operating Cash Flow / Net Income',
      sourceInputs: `OCF: ${formatCurrency(operatingCashFlow)} | Net Income: ${formatCurrency(netIncome)}`,
      benchmark: '> 1.0x demonstrates high-quality earnings backed by actual cash',
      interpretation: 'A critical sanity check: checks if reported paper profits are converting into real bank cash.',
      status: netIncome > 0 && val >= 1.0 ? 'good' : netIncome > 0 && val > 0.7 ? 'neutral' : 'caution',
    });
  }

  // 9. Free Cash Flow Margin
  if (freeCashFlow !== undefined && revenue && revenue > 0) {
    const val = (freeCashFlow / revenue) * 100;
    ratios.push({
      id: 'fcf-margin',
      name: 'Free Cash Flow Margin',
      category: 'Cash Flow',
      value: val,
      formatted: `${val.toFixed(1)}%`,
      formula: '(Free Cash Flow / Total Revenue) × 100',
      sourceInputs: `Free Cash Flow: ${formatCurrency(freeCashFlow)} | Revenue: ${formatCurrency(revenue)}`,
      benchmark: '> 15% signals surplus cash generation for reinvestment or buybacks',
      interpretation: 'Shows what percentage of revenue becomes discretionary cash after capital expenditures are paid.',
      status: val > 15 ? 'good' : val > 5 ? 'neutral' : 'caution',
    });
  }

  // 10. Cash Buffer to Long-Term Debt
  if (cashAndEquivalents !== undefined && longTermDebt !== undefined && longTermDebt > 0) {
    const val = cashAndEquivalents / longTermDebt;
    ratios.push({
      id: 'cash-to-debt',
      name: 'Cash to Long-Term Debt Coverage',
      category: 'Liquidity',
      value: val,
      formatted: `${val.toFixed(2)}x`,
      formula: 'Cash & Equivalents / Long-Term Debt',
      sourceInputs: `Cash: ${formatCurrency(cashAndEquivalents)} | Long-Term Debt: ${formatCurrency(longTermDebt)}`,
      benchmark: '> 1.0x means company could instantly repay all long-term debt with cash on hand',
      interpretation: 'Evaluates balance sheet defense against debt obligations during economic downturns.',
      status: val >= 1.0 ? 'good' : val > 0.5 ? 'neutral' : 'caution',
    });
  }

  return ratios;
}

/**
 * Evaluates company financial health across 5 core pillars.
 */
export function evaluateFinancialHealth(history: AnnualRecord[]): HealthScore {
  if (!history || history.length === 0) {
    return {
      overall: 50,
      rating: 'Moderate',
      summary: 'Insufficient multi-year filing history available to generate a definitive evaluation.',
      strengths: ['Company files regular disclosures with the SEC.'],
      cautions: ['Additional fiscal periods required for trend analysis.'],
      pillars: {
        growth: { score: 50, label: 'Adequate', text: 'Limited growth baseline.' },
        profitability: { score: 50, label: 'Adequate', text: 'Historical margin trend pending.' },
        cashFlow: { score: 50, label: 'Adequate', text: 'Cash conversion pending.' },
        solvency: { score: 50, label: 'Adequate', text: 'Leverage profile pending.' },
        consistency: { score: 50, label: 'Adequate', text: 'Multi-year data pending.' },
      },
    };
  }

  const latest = history[0];
  const oldest = history[history.length - 1];
  const strengths: string[] = [];
  const cautions: string[] = [];

  // Pillar 1: Growth
  let growthScore = 50;
  if (latest.revenue && oldest.revenue && history.length > 1) {
    const totalGrowth = ((latest.revenue - oldest.revenue) / oldest.revenue) * 100;
    if (totalGrowth > 50) {
      growthScore = 95;
      strengths.push(`Impressive top-line expansion: revenue expanded ${totalGrowth.toFixed(0)}% over reporting period.`);
    } else if (totalGrowth > 15) {
      growthScore = 75;
      strengths.push(`Steady revenue expansion of ${totalGrowth.toFixed(0)}% over the analyzed periods.`);
    } else if (totalGrowth >= 0) {
      growthScore = 55;
    } else {
      growthScore = 30;
      cautions.push(`Top-line contraction: revenue declined ${Math.abs(totalGrowth).toFixed(0)}% over the historical window.`);
    }
  }

  // Pillar 2: Profitability
  let profitScore = 50;
  if (latest.revenue && latest.netIncome !== undefined) {
    const netMargin = (latest.netIncome / latest.revenue) * 100;
    if (netMargin > 20) {
      profitScore = 95;
      strengths.push(`Elite profit margin of ${netMargin.toFixed(1)}%, reflecting strong pricing power.`);
    } else if (netMargin > 10) {
      profitScore = 80;
      strengths.push(`Solid bottom-line net profit margin of ${netMargin.toFixed(1)}%.`);
    } else if (netMargin > 0) {
      profitScore = 55;
    } else {
      profitScore = 25;
      cautions.push(`Unprofitable in the latest fiscal period with a negative net margin.`);
    }
  }

  // Pillar 3: Cash Flow Quality
  let cashScore = 50;
  if (latest.operatingCashFlow !== undefined && latest.netIncome !== undefined && latest.netIncome > 0) {
    const ratio = latest.operatingCashFlow / latest.netIncome;
    if (ratio >= 1.0) {
      cashScore = 90;
      strengths.push(`High earnings quality: cash flow matches or exceeds net income (${ratio.toFixed(2)}x conversion).`);
    } else if (ratio >= 0.7) {
      cashScore = 70;
    } else {
      cashScore = 40;
      cautions.push(`Operating cash flow lags reported net income (${ratio.toFixed(2)}x conversion), warranting scrutiny of working capital.`);
    }
  }

  // Pillar 4: Solvency & Balance Sheet
  let solvencyScore = 60;
  if (latest.stockholdersEquity !== undefined && latest.stockholdersEquity > 0 &&
      latest.totalLiabilities !== undefined && latest.totalLiabilities >= 0) {
    const deRatio = latest.totalLiabilities / latest.stockholdersEquity;
    if (deRatio < 1.0) {
      solvencyScore = 90;
      strengths.push(`Fortress balance sheet: conservative leverage with total liabilities below shareholders' equity (${deRatio.toFixed(2)}x).`);
    } else if (deRatio < 2.5) {
      solvencyScore = 70;
    } else {
      solvencyScore = 35;
      cautions.push(`Elevated financial leverage with liabilities at ${deRatio.toFixed(2)}x shareholders' equity.`);
    }
  }

  // Pillar 5: Consistency
  let consistencyScore = 60;
  const positiveNetIncomeYears = history.filter((h) => h.netIncome !== undefined && h.netIncome > 0).length;
  if (positiveNetIncomeYears === history.length) {
    consistencyScore = 90;
    strengths.push(`Unbroken record of positive net income across all ${history.length} documented fiscal years.`);
  } else if (positiveNetIncomeYears >= history.length - 1) {
    consistencyScore = 70;
  } else {
    consistencyScore = 35;
    cautions.push(`Inconsistent profitability with multiple loss-making fiscal years.`);
  }

  const overall = Math.round(
    growthScore * 0.25 +
      profitScore * 0.25 +
      cashScore * 0.2 +
      solvencyScore * 0.15 +
      consistencyScore * 0.15
  );

  let rating: HealthScore['rating'] = 'Moderate';
  if (overall >= 85) rating = 'Exceptional';
  else if (overall >= 70) rating = 'Strong';
  else if (overall >= 50) rating = 'Moderate';
  else if (overall >= 35) rating = 'Vulnerable';
  else rating = 'Distressed';

  const summary =
    overall >= 70
      ? 'The business demonstrates robust financial foundations with favorable cash generation, healthy margins, and resilient balance-sheet fundamentals.'
      : overall >= 50
      ? 'The company maintains a balanced financial profile with operational strengths, though certain areas like leverage or growth warrant close monitoring.'
      : 'The financial filings indicate notable pressure points, such as margin compression, negative cash flow, or elevated balance-sheet obligations.';

  return {
    overall,
    rating,
    summary,
    strengths,
    cautions,
    pillars: {
      growth: {
        score: growthScore,
        label: growthScore >= 75 ? 'Strong' : growthScore >= 50 ? 'Moderate' : 'Muted',
        text: 'Top-line sales progression across multi-year reporting periods.',
      },
      profitability: {
        score: profitScore,
        label: profitScore >= 75 ? 'Strong' : profitScore >= 50 ? 'Moderate' : 'Compressed',
        text: 'Operating efficiency and bottom-line margin retention.',
      },
      cashFlow: {
        score: cashScore,
        label: cashScore >= 75 ? 'Healthy' : cashScore >= 50 ? 'Adequate' : 'Weak',
        text: 'Real cash generated from core operating activities versus paper accruals.',
      },
      solvency: {
        score: solvencyScore,
        label: solvencyScore >= 75 ? 'Conservative' : solvencyScore >= 50 ? 'Moderate' : 'Leveraged',
        text: 'Balance sheet protection, asset backing, and debt coverage.',
      },
      consistency: {
        score: consistencyScore,
        label: consistencyScore >= 75 ? 'Reliable' : consistencyScore >= 50 ? 'Variable' : 'Volatile',
        text: 'Multi-year stability and resilience through market cycles.',
      },
    },
  };
}

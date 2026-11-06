import { Company, CompanyFinancials } from '../types';
import { parseSecCompanyFacts } from './financialParser';
import { calculateFinancialRatios, evaluateFinancialHealth } from './financialCalculations';

const cache = new Map<string, { data: CompanyFinancials; timestamp: number }>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour memory cache

export async function fetchCompanyFinancials(company: Company): Promise<CompanyFinancials> {
  const cached = cache.get(company.cik);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  const endpoint = `/api/company-facts?cik=${company.cik}`;
  let response: Response;

  try {
    response = await fetch(endpoint);
  } catch (err) {
    throw new Error('Network error: Unable to reach SEC proxy. Please check your internet connection.');
  }

  if (response.status === 400) {
    throw new Error('Invalid SEC CIK identifier provided.');
  }

  if (response.status === 429) {
    throw new Error('SEC rate limit reached. Please wait a few seconds and try again.');
  }

  if (!response.ok) {
    throw new Error(`SEC EDGAR service responded with status ${response.status}. Please try again later.`);
  }

  let rawJson: any;
  try {
    rawJson = await response.json();
  } catch (err) {
    throw new Error('Failed to parse SEC XBRL filing response.');
  }

  const history = parseSecCompanyFacts(rawJson);
  if (history.length === 0) {
    throw new Error(`No standardized annual 10-K financial facts were found for ${company.name} (${company.ticker}).`);
  }

  const latestRecord = history[0];
  const ratios = calculateFinancialRatios(latestRecord, history[1]);
  const health = evaluateFinancialHealth(history);

  const result: CompanyFinancials = {
    company,
    entityName: rawJson.entityName || company.name,
    cik: company.cik,
    latestYear: latestRecord.fiscalYear,
    history,
    ratios,
    health,
    retrievedAt: new Date().toISOString(),
    disclaimer: 'Official historical facts sourced from SEC EDGAR 10-K filings. Not live market prices. Values in USD.',
    source: 'SEC EDGAR Company Facts API',
  };

  cache.set(company.cik, { data: result, timestamp: Date.now() });
  return result;
}

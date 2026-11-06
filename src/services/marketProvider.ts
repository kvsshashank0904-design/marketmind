import { CompanyFinancials, Company } from '../types';
import { fetchCompanyFinancials } from './secApi';

export interface MarketProviderDescriptor {
  id: string;
  name: string;
  region: string;
  regulatoryBody: string;
  status: 'active' | 'development' | 'licensing-review';
  licenseType: 'Public Domain / Free Open Data' | 'Commercial API Required';
  notes: string;
}

export const SUPPORTED_PROVIDERS: MarketProviderDescriptor[] = [
  {
    id: 'sec-edgar',
    name: 'SEC EDGAR XBRL Data Service',
    region: 'United States',
    regulatoryBody: 'U.S. Securities and Exchange Commission',
    status: 'active',
    licenseType: 'Public Domain / Free Open Data',
    notes: 'Public domain filing data for U.S. registrants. Accessible with educational User-Agent header.',
  },
  {
    id: 'companies-house-uk',
    name: 'UK Companies House Public Registry',
    region: 'United Kingdom',
    regulatoryBody: 'Companies House / Financial Conduct Authority',
    status: 'licensing-review',
    licenseType: 'Public Domain / Free Open Data',
    notes: 'UK statutory filings. Free public register API requiring direct API credentials for high-volume lookup.',
  },
  {
    id: 'esma-eefm',
    name: 'European Single Electronic Format (ESEF)',
    region: 'European Union',
    regulatoryBody: 'European Securities and Markets Authority (ESMA)',
    status: 'licensing-review',
    licenseType: 'Public Domain / Free Open Data',
    notes: 'EU mandatory XBRL/iXBRL reports across member states. Aggregator endpoint under evaluation.',
  },
  {
    id: 'mca-india',
    name: 'Ministry of Corporate Affairs / SEBI',
    region: 'India',
    regulatoryBody: 'Securities and Exchange Board of India (SEBI)',
    status: 'licensing-review',
    licenseType: 'Commercial API Required',
    notes: 'BSE/NSE filings require verified commercial redistribution data feed licenses.',
  },
];

export interface MarketDataProvider {
  getCompanyFinancials(company: Company): Promise<CompanyFinancials>;
  getProviderMetadata(): MarketProviderDescriptor;
}

export class SecEdgarProvider implements MarketDataProvider {
  async getCompanyFinancials(company: Company): Promise<CompanyFinancials> {
    return fetchCompanyFinancials(company);
  }

  getProviderMetadata(): MarketProviderDescriptor {
    return SUPPORTED_PROVIDERS[0];
  }
}

export const defaultMarketProvider: MarketDataProvider = new SecEdgarProvider();

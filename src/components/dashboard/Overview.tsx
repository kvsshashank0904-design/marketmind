import React, { useState } from 'react';
import {
  Search,
  ArrowRight,
  ArrowUpRight,
  ShieldCheck,
  Globe2,
  Building2,
  BookOpen,
  Sparkles,
  Layers3,
  Wallet,
  GraduationCap,
  BrainCircuit,
  ChartNoAxesCombined,
  TrendingUp,
} from 'lucide-react';
import { companies } from '../../data/companies';
import { Company } from '../../types';

interface OverviewProps {
  onNavigate: (page: string, selectedTicker?: string) => void;
  academyProgressCount: number;
}

export const Overview: React.FC<OverviewProps> = ({ onNavigate, academyProgressCount }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCompanies = companies.filter((c) =>
    (c.name + c.ticker + c.sector).toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 6);

  const featuredCompanies = companies.slice(0, 4);

  return (
    <div className="overview-container">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <Sparkles size={13} /> EVIDENCE-BASED FINANCIAL INTELLIGENCE
          </div>
          <h1>
            Research smarter.<br />
            <i>Understand deeper.</i>
          </h1>
          <p className="hero-lead">
            Explore public companies, decode audited financial statements from primary SEC filings,
            and master fundamental investing concepts. Engineered for curious investors, not Wall Street insiders.
          </p>

          <div className="hero-search-box">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search by company name, ticker (e.g. NVDA, AAPL, MSFT), or sector..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search company directory"
            />
          </div>

          {searchQuery && (
            <div className="hero-search-results">
              {filteredCompanies.length > 0 ? (
                filteredCompanies.map((c) => (
                  <button
                    key={c.ticker}
                    className="search-result-pill"
                    onClick={() => onNavigate('Research Lab', c.ticker)}
                  >
                    <b>{c.ticker}</b>
                    <span>{c.name}</span>
                    <small>{c.sector}</small>
                  </button>
                ))
              ) : (
                <div className="no-search-results">No verified companies match &quot;{searchQuery}&quot;</div>
              )}
            </div>
          )}

          <div className="hero-actions">
            <button className="primary" onClick={() => onNavigate('Research Lab', 'NVDA')}>
              Open Research Lab <ArrowUpRight size={16} />
            </button>
            <button className="secondary" onClick={() => onNavigate('Academy')}>
              Start Academy Lessons <BookOpen size={16} />
            </button>
          </div>

          <div className="trust-strip">
            <ShieldCheck size={16} />
            <span>Verified SEC EDGAR Data · 100% Educational · Zero Fabricated Numbers</span>
          </div>
        </div>

        {/* Visual Terminal Orbit */}
        <div className="hero-visual">
          <div className="visual-top">
            <span>THE MARKETMIND METHOD</span>
            <span className="dot" />
            <small>PRIMARY RESEARCH FRAMEWORK</small>
          </div>

          <div className="orbit">
            <div className="orbit-ring" />
            <div className="orbit-core">
              <ChartNoAxesCombined size={36} />
              <b>Think<br />Clearly</b>
            </div>
            <div className="orbit-node node1">01 / BUSINESS</div>
            <div className="orbit-node node2">02 / NUMBERS</div>
            <div className="orbit-node node3">03 / CASH FLOW</div>
            <div className="orbit-node node4">04 / VALUATION</div>
          </div>

          <div className="visual-foot">
            <span>Audit 10-K Filings</span>
            <span>Verify Cash Quality</span>
            <span>Decide for Yourself</span>
          </div>
        </div>
      </section>

      {/* Feature Strip */}
      <section className="strip">
        <div>
          <span className="strip-icon"><Globe2 /></span>
          <b>Primary Source Data</b>
          <small>Audited SEC XBRL filings with multi-tag recency resolution</small>
        </div>
        <div>
          <span className="strip-icon"><Building2 /></span>
          <b>Business-First Focus</b>
          <small>Unit economics and cash generation, not short-term price noise</small>
        </div>
        <div>
          <span className="strip-icon"><BookOpen /></span>
          <b>Learn as You Explore</b>
          <small>Institutional concepts decoded into plain English</small>
        </div>
      </section>

      {/* Flagship Feature Grid */}
      <section className="section">
        <div className="section-head">
          <div>
            <div className="eyebrow">INTELLIGENCE SUITE</div>
            <h2>Tools for independent financial research.</h2>
            <p>Built from first principles to give you clarity into how corporate enterprises generate cash.</p>
          </div>
          <button className="link" onClick={() => onNavigate('Research Lab')}>
            All Research Tools <ArrowRight size={15} />
          </button>
        </div>

        <div className="feature-grid">
          <button className="feature featured" onClick={() => onNavigate('Research Lab', 'NVDA')}>
            <span className="feature-icon"><Search /></span>
            <span className="eyebrow">FLAGSHIP · 01</span>
            <h3>AI Stock Research Lab</h3>
            <p>
              Inspect 5 years of audited 10-K statements, evaluate multi-year operating cash flow,
              and examine financial health ratios with transparent accounting formulas.
            </p>
            <b>Research NVIDIA, Apple, Microsoft & More <ArrowUpRight size={15} /></b>
            <div className="feature-art">
              <div className="mini-chart">
                <span /><span /><span /><span /><span /><span /><span /><span />
              </div>
            </div>
          </button>

          <button className="feature" onClick={() => onNavigate('Compare')}>
            <span className="feature-icon"><Layers3 /></span>
            <span className="eyebrow">ANALYSIS · 02</span>
            <h3>Comparison Studio</h3>
            <p>
              Conduct side-by-side fundamental audits of competing firms with period-aligned reporting dates and margin benchmarks.
            </p>
            <b>Compare Peer Companies <ArrowUpRight size={15} /></b>
          </button>

          <button className="feature" onClick={() => onNavigate('Portfolio Lab')}>
            <span className="feature-icon"><Wallet /></span>
            <span className="eyebrow">SIMULATION · 03</span>
            <h3>Portfolio Simulator</h3>
            <p>
              Model disciplined monthly contributions, compound interest, and inflation-adjusted purchasing power curves over 1 to 40 years.
            </p>
            <b>Run Compounding Model <ArrowUpRight size={15} /></b>
          </button>
        </div>
      </section>

      {/* Featured Companies Quick Selector */}
      <section className="section">
        <div className="section-head">
          <div>
            <div className="eyebrow">VERIFIED ISSUERS</div>
            <h2>Quick Research Profiles</h2>
            <p>Select any company to load its latest audited SEC annual filings.</p>
          </div>
        </div>

        <div className="featured-companies-grid">
          {featuredCompanies.map((c) => (
            <div
              key={c.ticker}
              className="featured-company-card"
              onClick={() => onNavigate('Research Lab', c.ticker)}
            >
              <div className="company-card-top">
                <span className="ticker-badge">{c.ticker}</span>
                <span className="exchange-pill">{c.exchange}</span>
              </div>
              <h4>{c.name}</h4>
              <p>{c.description}</p>
              <div className="card-footer-meta">
                <small>{c.sector}</small>
                <span className="view-link">Audit Filings <ArrowUpRight size={13} /></span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Learning Highlight & Progress Banner */}
      <section className="academy-teaser-strip">
        <div className="teaser-content">
          <div className="eyebrow">MARKETMIND ACADEMY</div>
          <h3>Build genuine financial fluency from first principles.</h3>
          <p>
            Six structured, comprehensive modules covering everything from stock mechanics and financial statement analysis
            to macroeconomic cycles and index fund investing. Complete with interactive quizzes.
          </p>
          <div className="progress-indicator-pill">
            <GraduationCap size={16} />
            <span>{academyProgressCount} of 6 Modules Completed</span>
          </div>
        </div>
        <button className="primary" onClick={() => onNavigate('Academy')}>
          Go to Academy <ArrowRight size={16} />
        </button>
      </section>
    </div>
  );
};

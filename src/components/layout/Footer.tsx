import React from 'react';
import { ShieldCheck, Info, Scale, FileText, Database } from 'lucide-react';
import { LegalModalType } from './LegalModal';

interface FooterProps {
  onOpenLegal: (type: LegalModalType) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenLegal }) => {
  return (
    <footer className="site-footer">
      <div className="wrap footer-grid">
        <div className="footer-brand-col">
          <div className="brand">
            <span className="mark">M</span>
            <span className="brand-text">
              Market<span className="brand-accent">Mind</span>
              <small>RESEARCH BEYOND THE TICKER</small>
            </span>
          </div>
          <p className="footer-tagline">
            An open, evidence-first financial research and market intelligence platform designed for curious minds, students, and disciplined long-term investors.
          </p>
          <div className="footer-links">
            <button className="link-button" onClick={() => onOpenLegal('about')}>
              <Info size={13} /> About Us
            </button>
            <button className="link-button" onClick={() => onOpenLegal('methodology')}>
              <Database size={13} /> Data Sources & Methodology
            </button>
            <button className="link-button" onClick={() => onOpenLegal('disclaimer')}>
              <ShieldCheck size={13} /> Financial Disclaimer
            </button>
            <button className="link-button" onClick={() => onOpenLegal('privacy')}>
              <Scale size={13} /> Privacy Policy
            </button>
            <button className="link-button" onClick={() => onOpenLegal('terms')}>
              <FileText size={13} /> Terms of Use
            </button>
          </div>
        </div>

        <div className="footer-disclosure-col">
          <div className="disclosure-card">
            <div className="disclosure-head">
              <ShieldCheck size={16} />
              <b>Regulatory & Legal Disclosure</b>
            </div>
            <p>
              MarketMind is an educational and analytical research platform, not a registered investment adviser, broker-dealer, or financial planner.
              Nothing on this platform should be construed as an offer, solicitation, or recommendation to buy, sell, or hold any security.
            </p>
            <p>
              Financial statement data is retrieved directly from official U.S. Securities and Exchange Commission (SEC) EDGAR annual filings (Form 10-K).
              MarketMind does not fabricate stock quotes or guarantee financial outcomes. Historical performance does not guarantee future results.
            </p>
            <div className="copyright-line">
              <small>© 2026 MarketMind. Built for independent, evidence-first financial education.</small>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

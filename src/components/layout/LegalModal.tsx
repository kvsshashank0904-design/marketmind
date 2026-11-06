import React, { useEffect, useRef } from 'react';
import { X, ShieldCheck, Scale, FileText, Mail, Info, Database } from 'lucide-react';

export type LegalModalType = 'about' | 'disclaimer' | 'privacy' | 'terms' | 'methodology' | null;

interface LegalModalProps {
  type: LegalModalType;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ type, onClose }) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!type) return;
    closeButtonRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [type, onClose]);

  if (!type) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="legal-modal-title">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            {type === 'about' && <Info className="modal-icon" />}
            {type === 'disclaimer' && <ShieldCheck className="modal-icon caution" />}
            {type === 'privacy' && <Scale className="modal-icon" />}
            {type === 'terms' && <FileText className="modal-icon" />}
            {type === 'methodology' && <Database className="modal-icon" />}
            <h3 id="legal-modal-title">
              {type === 'about' && 'About MarketMind'}
              {type === 'disclaimer' && 'Financial Disclaimer & Compliance'}
              {type === 'privacy' && 'Privacy Policy'}
              {type === 'terms' && 'Terms of Use'}
              {type === 'methodology' && 'Data Sources & Methodology'}
            </h3>
          </div>
          <button ref={closeButtonRef} className="modal-close" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {type === 'about' && (
            <div className="legal-prose">
              <h4>Mission: Democratizing Institutional-Grade Financial Research</h4>
              <p>
                MarketMind was founded on a simple conviction: financial literacy and fundamental company analysis
                should not be locked behind multi-thousand-dollar institutional terminals or obscured by Wall Street jargon.
              </p>
              <p>
                We provide beginners, students, and curious investors with a structured, transparent, and evidence-first
                framework to research public companies directly from their official regulatory filings.
              </p>
              <h4>Core Engineering Principles</h4>
              <ul>
                <li><strong>No Fabricated Data:</strong> We never synthesize financial numbers, mock stock prices, or present hypothetical models as historical facts.</li>
                <li><strong>Primary Sources First:</strong> All US corporate financial statements are pulled directly from audited SEC EDGAR XBRL filings.</li>
                <li><strong>Radical Transparency:</strong> Every ratio shows its exact accounting formula, source metrics, and reporting period.</li>
              </ul>
              <h4>Contact & Inquiries</h4>
              <p>
                MarketMind is an independent educational engineering project. For technical inquiries, bug reports, or feedback:
                <br />
                <strong>Email:</strong> k.v.s.shashank0904@gmail.com
              </p>
            </div>
          )}

          {type === 'disclaimer' && (
            <div className="legal-prose">
              <div className="notice-banner warning">
                <ShieldCheck size={20} />
                <span>
                  <strong>CRITICAL NOTICE:</strong> MarketMind is strictly an educational research and financial literacy platform.
                  It is NOT an investment adviser, registered broker-dealer, or financial analyst.
                </span>
              </div>
              <h4>No Investment Advice</h4>
              <p>
                Nothing contained on MarketMind constitutes investment, financial, legal, tax, or accounting advice.
                No content, calculation, score, or model should be construed as a recommendation to buy, sell, or hold any security,
                derivative, cryptocurrency, or financial instrument.
              </p>
              <h4>Accuracy and Data Boundaries</h4>
              <p>
                Financial statement data is sourced from public SEC EDGAR filings. While we implement multi-layer validation
                to standardize XBRL tags across fiscal periods, filings may be subject to subsequent amendments, restatements, or accounting variances.
                Users must verify all figures against primary company 10-K filings before making any financial commitments.
              </p>
              <h4>Simulations and Hypothetical Projections</h4>
              <p>
                The Portfolio Simulator uses simplified mathematical compounding models assuming constant return rates.
                Actual market returns are volatile, fluctuate unpredictably, and can result in significant or total loss of capital.
                Past performance is no guarantee of future results.
              </p>
            </div>
          )}

          {type === 'privacy' && (
            <div className="legal-prose">
              <h4>Commitment to User Privacy</h4>
              <p>
                MarketMind operates on a privacy-first model. We believe you should be able to research companies
                and learn finance without having your personal data harvested or monetized.
              </p>
              <h4>Information Collection and Storage</h4>
              <ul>
                <li><strong>No Personal Tracking:</strong> We do not require account registration, email signups, or phone numbers to use our core platform.</li>
                <li><strong>Local Progress:</strong> Your Academy quiz scores and module progress are stored exclusively on your own device using browser <code>localStorage</code>. They are never transmitted to our servers.</li>
                <li><strong>Edge Logging:</strong> Standard anonymized server access logs (IP address, user-agent, request timestamp) are processed by Cloudflare at the edge solely for DDoS prevention, rate limiting, and security compliance.</li>
              </ul>
              <h4>Cookies and Advertising</h4>
              <p>
                MarketMind does not deploy third-party advertising cookies or cross-site tracking pixels.
              </p>
            </div>
          )}

          {type === 'terms' && (
            <div className="legal-prose">
              <h4>Terms of Service</h4>
              <p>By accessing or utilizing MarketMind, you agree to be bound by these Terms of Use.</p>
              <h4>Permitted Use</h4>
              <p>
                You may use MarketMind solely for non-commercial educational and personal research purposes.
                Automated scraping, Denial-of-Service attacks, or attempting to circumvent edge caching is strictly prohibited.
              </p>
              <h4>Limitation of Liability</h4>
              <p>
                In no event shall MarketMind, its developers, or contributors be held liable for any direct, indirect,
                incidental, or consequential financial losses or damages arising from reliance on information presented on this platform.
              </p>
            </div>
          )}

          {type === 'methodology' && (
            <div className="legal-prose">
              <h4>Data Architecture & Ingestion Pipeline</h4>
              <p>
                MarketMind retrieves standardized financial facts from the U.S. Securities and Exchange Commission (SEC)
                EDGAR Company Facts API (<code>data.sec.gov</code>).
              </p>
              <h4>XBRL Extraction Rules</h4>
              <ul>
                <li><strong>Multi-Tag Recency Resolution:</strong> To prevent concept deprecation mismatches (such as NVIDIA transitioning from <code>RevenueFromContractWithCustomerExcludingAssessedTax</code> to <code>Revenues</code>), our parser evaluates all GAAP candidate tags and selects the most recent verified observation.</li>
                <li><strong>Duration vs Instant Validation:</strong> Income statement and Cash flow metrics require verified 52/53-week duration facts (330 to 385 days) from Form 10-K filings, explicitly preventing quarterly dilution. Balance sheet items are extracted as instant point-in-time facts.</li>
                <li><strong>Restatements & Amendments:</strong> Where multiple observations exist for the same fiscal period, the fact with the most recent filing date (e.g. Form 10-K/A) takes precedence.</li>
              </ul>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="primary small" onClick={onClose}>
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};

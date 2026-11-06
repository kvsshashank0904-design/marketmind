import React, { useState } from 'react';
import {
  Compass,
  Search,
  Layers3,
  Wallet,
  GraduationCap,
  BrainCircuit,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';

interface NavbarProps {
  currentPage: string;
  onSelectPage: (page: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onSelectPage }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Overview', icon: Compass },
    { name: 'Research Lab', icon: Search },
    { name: 'Compare', icon: Layers3 },
    { name: 'Portfolio Lab', icon: Wallet },
    { name: 'Academy', icon: GraduationCap },
    { name: 'AI Tutor', icon: BrainCircuit },
  ];

  const handleNavClick = (name: string) => {
    onSelectPage(name);
    setMobileMenuOpen(false);
  };

  return (
    <header className="site-header">
      <div className="header-inner wrap">
        <a className="brand" href="#marketmind-main" onClick={() => handleNavClick('Overview')} aria-label="MarketMind home">
          <span className="mark">M</span>
          <span className="brand-text">
            Market<span className="brand-accent">Mind</span>
            <small>RESEARCH BEYOND THE TICKER</small>
          </span>
        </a>

        <nav className="desktop-nav" aria-label="Main Navigation">
          {navItems.map(({ name, icon: Icon }) => (
            <button
              key={name}
              className={`nav-btn ${currentPage === name ? 'active' : ''}`}
              onClick={() => handleNavClick(name)}
            >
              <Icon size={15} />
              <span>{name}</span>
            </button>
          ))}
        </nav>

        <div className="header-meta">
          <div className="live-status-pill">
            <span className="pulsing-dot" />
            <span>SEC EDGAR VERIFIED</span>
          </div>

          <button
            className="mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="mobile-drawer" role="menu">
          {navItems.map(({ name, icon: Icon }) => (
            <button
              key={name}
              role="menuitem"
              className={`mobile-nav-btn ${currentPage === name ? 'active' : ''}`}
              onClick={() => handleNavClick(name)}
            >
              <Icon size={18} />
              <span>{name}</span>
            </button>
          ))}
        </div>
      )}
    </header>
  );
};

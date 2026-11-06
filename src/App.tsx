import React, { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { LegalModal, LegalModalType } from './components/layout/LegalModal';
import { Overview } from './components/dashboard/Overview';
import { ResearchLab } from './components/research/ResearchLab';
import { ComparisonStudio } from './components/compare/ComparisonStudio';
import { PortfolioSimulator } from './components/portfolio/PortfolioSimulator';
import { AcademyView } from './components/academy/AcademyView';
import { AITutor } from './components/tutor/AITutor';
import './style.css';

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>('Overview');
  const [researchTicker, setResearchTicker] = useState<string>('NVDA');
  const [legalModalType, setLegalModalType] = useState<LegalModalType>(null);
  const [academyProgressCount, setAcademyProgressCount] = useState<number>(0);

  // Initialize progress from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('marketmind_completed_modules');
      if (saved) {
        const parsed = JSON.parse(saved);
        setAcademyProgressCount(Object.values(parsed).filter(Boolean).length);
      }
    } catch (e) {
      // Ignore localStorage read errors
    }
  }, []);

  const handleNavigate = (page: string, ticker?: string) => {
    if (ticker) {
      setResearchTicker(ticker);
    }
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="app-root">
      <Navbar currentPage={currentPage} onSelectPage={handleNavigate} />

      <main id="marketmind-main" className="main-content wrap">
        {currentPage === 'Overview' && (
          <Overview
            onNavigate={handleNavigate}
            academyProgressCount={academyProgressCount}
          />
        )}

        {currentPage === 'Research Lab' && (
          <ResearchLab initialTicker={researchTicker} />
        )}

        {currentPage === 'Compare' && <ComparisonStudio />}

        {currentPage === 'Portfolio Lab' && <PortfolioSimulator />}

        {currentPage === 'Academy' && (
          <AcademyView onProgressUpdate={(count) => setAcademyProgressCount(count)} />
        )}

        {currentPage === 'AI Tutor' && <AITutor />}
      </main>

      <Footer onOpenLegal={(type) => setLegalModalType(type)} />

      <LegalModal type={legalModalType} onClose={() => setLegalModalType(null)} />
    </div>
  );
}

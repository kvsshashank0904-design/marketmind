import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Navbar } from '../src/components/layout/Navbar';
import { Footer } from '../src/components/layout/Footer';
import { LegalModal } from '../src/components/layout/LegalModal';
import { Overview } from '../src/components/dashboard/Overview';
import { PortfolioSimulator } from '../src/components/portfolio/PortfolioSimulator';
import { AcademyView } from '../src/components/academy/AcademyView';
import { AITutor } from '../src/components/tutor/AITutor';

describe('UI Component Integration & Accessibility Tests', () => {
  it('renders Navbar with brand identity and handles navigation', () => {
    const handleSelectPage = vi.fn();
    render(<Navbar currentPage="Overview" onSelectPage={handleSelectPage} />);

    expect(screen.getByText('Market')).toBeDefined();
    expect(screen.getByText('Mind')).toBeDefined();
    expect(screen.getByText('RESEARCH BEYOND THE TICKER')).toBeDefined();
    expect(screen.getByText('SEC EDGAR VERIFIED')).toBeDefined();

    const researchLabBtn = screen.getByRole('button', { name: /Research Lab/i });
    fireEvent.click(researchLabBtn);
    expect(handleSelectPage).toHaveBeenCalledWith('Research Lab');
  });

  it('renders Footer with regulatory disclaimers and modal triggers', () => {
    const handleOpenLegal = vi.fn();
    render(<Footer onOpenLegal={handleOpenLegal} />);

    expect(screen.getByText(/Regulatory & Legal Disclosure/i)).toBeDefined();
    const disclaimerBtn = screen.getByRole('button', { name: /Financial Disclaimer/i });
    fireEvent.click(disclaimerBtn);
    expect(handleOpenLegal).toHaveBeenCalledWith('disclaimer');
  });

  it('renders LegalModal with proper content for disclaimer', () => {
    const handleClose = vi.fn();
    render(<LegalModal type="disclaimer" onClose={handleClose} />);

    expect(screen.getByText(/Financial Disclaimer & Compliance/i)).toBeDefined();
    expect(screen.getByText(/CRITICAL NOTICE/i)).toBeDefined();

    const closeBtn = screen.getByLabelText('Close modal');
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalled();
  });

  it('renders Overview dashboard with search and flagship teasers', () => {
    const handleNavigate = vi.fn();
    render(<Overview onNavigate={handleNavigate} academyProgressCount={2} />);

    expect(screen.getByText(/Research smarter/i)).toBeDefined();
    expect(screen.getByText('2 of 6 Modules Completed')).toBeDefined();

    const searchInput = screen.getByPlaceholderText(/Search by company name/i);
    fireEvent.change(searchInput, { target: { value: 'NVDA' } });
    const nvdaElements = screen.getAllByText(/NVIDIA/i);
    expect(nvdaElements.length).toBeGreaterThan(0);
  });

  it('renders PortfolioSimulator and adjusts calculations on preset clicks', () => {
    render(<PortfolioSimulator />);

    expect(screen.getByText(/Simulation Parameters/i)).toBeDefined();
    expect(screen.getByText('Moderate (7%)')).toBeDefined();

    const optimisticBtn = screen.getByRole('button', { name: /Optimistic \(10%\)/i });
    fireEvent.click(optimisticBtn);
    expect(screen.getByText(/Expected Annual Return: 10.0%/i)).toBeDefined();
  });

  it('renders AcademyView and displays module cards', () => {
    render(<AcademyView />);

    expect(screen.getByText(/Stock Market Fundamentals/i)).toBeDefined();
    expect(screen.getByText(/Understanding Financial Statements/i)).toBeDefined();
    expect(screen.getByText(/Company Valuation Fundamentals/i)).toBeDefined();

    // Click into first module
    const firstModule = screen.getByText('Stock Market Fundamentals');
    fireEvent.click(firstModule);
    const sectionHeaders = screen.getAllByText(/What is a Share of Stock/i);
    expect(sectionHeaders.length).toBeGreaterThan(0);
    expect(screen.getByText(/Back to All Modules/i)).toBeDefined();
  });

  it('renders AITutor and allows searching concepts', () => {
    render(<AITutor />);

    expect(screen.getByText(/Financial Intelligence Tutor/i)).toBeDefined();
    const searchInput = screen.getByPlaceholderText(/Search concepts or formulas/i);
    fireEvent.change(searchInput, { target: { value: 'Free Cash Flow' } });

    expect(screen.getByText(/Free Cash Flow \(FCF\)/i)).toBeDefined();
  });
});

import { describe, it, expect } from 'vitest';
import { companies } from '../src/data/companies';
import { lessonModules } from '../src/data/lessons';
import { glossaryConcepts } from '../src/data/glossary';

describe('Data Integrity & Curriculum Verification', () => {
  it('verifies all 24 companies have valid 10-digit CIKs and required fields', () => {
    expect(companies.length).toBeGreaterThanOrEqual(20);

    const tickers = new Set<string>();
    for (const c of companies) {
      expect(c.ticker).toBeTruthy();
      expect(tickers.has(c.ticker)).toBe(false); // No duplicate tickers
      tickers.add(c.ticker);

      expect(c.name).toBeTruthy();
      expect(c.sector).toBeTruthy();
      expect(c.description).toBeTruthy();
      // SEC CIK must be exactly 10 digits
      expect(c.cik).toMatch(/^\d{10}$/);
    }
  });

  it('verifies all 6 Academy lesson modules have comprehensive content and valid quizzes', () => {
    expect(lessonModules.length).toBe(6);

    for (const mod of lessonModules) {
      expect(mod.title).toBeTruthy();
      expect(mod.subtitle).toBeTruthy();
      expect(mod.learningObjectives.length).toBeGreaterThan(0);
      expect(mod.sections.length).toBeGreaterThanOrEqual(3);
      expect(mod.keyTerms.length).toBeGreaterThanOrEqual(4);
      expect(mod.quiz.length).toBeGreaterThanOrEqual(3);

      for (const q of mod.quiz) {
        expect(q.question).toBeTruthy();
        expect(q.options.length).toBeGreaterThanOrEqual(3);
        expect(q.correctIndex).toBeGreaterThanOrEqual(0);
        expect(q.correctIndex).toBeLessThan(q.options.length);
        expect(q.explanation).toBeTruthy();
      }
    }
  });

  it('verifies glossary contains 50+ comprehensive financial concepts with examples', () => {
    expect(glossaryConcepts.length).toBeGreaterThanOrEqual(50);

    const ids = new Set<string>();
    for (const item of glossaryConcepts) {
      expect(ids.has(item.id)).toBe(false);
      ids.add(item.id);

      expect(item.term).toBeTruthy();
      expect(item.category).toBeTruthy();
      expect(item.shortDefinition).toBeTruthy();
      expect(item.detailedExplanation).toBeTruthy();
      expect(item.example).toBeTruthy();
      expect(item.whyItMatters).toBeTruthy();
      expect(item.beginnerTip).toBeTruthy();
    }
  });
});

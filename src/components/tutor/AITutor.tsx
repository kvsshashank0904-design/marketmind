import React, { useState } from 'react';
import { BrainCircuit, Search, ArrowRight, Sparkles, BookOpen, Calculator, HelpCircle, CheckCircle2 } from 'lucide-react';
import { glossaryConcepts } from '../../data/glossary';
import { GlossaryConcept } from '../../types';

export const AITutor: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeConcept, setActiveConcept] = useState<GlossaryConcept | null>(glossaryConcepts[0]);
  const [customQuestion, setCustomQuestion] = useState('');
  const [tutorResponse, setTutorResponse] = useState<GlossaryConcept | null>(null);

  const categories = [
    'All',
    'Fundamentals',
    'Financial Statements',
    'Valuation',
    'Risk & Macro',
    'Portfolio',
  ];

  const filteredConcepts = glossaryConcepts.filter((c) => {
    const matchesSearch = (c.term + c.shortDefinition + c.detailedExplanation).toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'All' || c.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleAsk = () => {
    if (!customQuestion.trim()) return;
    const q = customQuestion.toLowerCase();

    // Find best match in glossary
    let bestMatch: GlossaryConcept | null = null;
    let highestScore = 0;

    glossaryConcepts.forEach((c) => {
      let score = 0;
      const termLower = c.term.toLowerCase();
      if (q.includes(termLower)) score += 10;
      const words = termLower.split(/[\s\-/]+/);
      words.forEach((w) => {
        if (w.length > 2 && q.includes(w)) score += 3;
      });
      if (score > highestScore) {
        highestScore = score;
        bestMatch = c;
      }
    });

    if (bestMatch && highestScore > 0) {
      setTutorResponse(bestMatch);
      setActiveConcept(bestMatch);
    } else {
      // Default to general framework
      setTutorResponse(glossaryConcepts[0]);
    }
  };

  const sampleQuestions = [
    'Explain P/E Ratio with an example',
    'What is Free Cash Flow and why does it matter?',
    'Difference between Revenue and Net Income',
    'How does Return on Equity (ROE) work?',
    'What is an Inverted Yield Curve?',
    'How do Index Funds differ from ETFs?',
  ];

  return (
    <div className="page-workspace">
      <div className="workspace-header">
        <div className="eyebrow">FINANCIAL INTELLIGENCE ENGINE · 50+ VETTED CONCEPTS</div>
        <h1>Financial Intelligence Tutor</h1>
        <p className="intro">
          Explore essential financial concepts, valuation models, accounting metrics, and portfolio principles.
          Ask questions or browse the complete financial knowledge repository.
        </p>
      </div>

      <div className="tutor-workspace-layout">
        {/* Left Column: Interactive Q&A Assistant */}
        <div className="tutor-qa-column">
          <div className="tutor-card">
            <div className="tutor-card-head">
              <BrainCircuit className="tutor-icon" />
              <div>
                <b>MarketMind Intelligence Assistant</b>
                <small>Transparent Educational Concept Engine</small>
              </div>
            </div>

            <p className="tutor-assistant-desc">
              Ask about any financial ratio, financial statement item, valuation model, or economic principle:
            </p>

            <div className="suggestions-group">
              {sampleQuestions.map((sq, i) => (
                <button
                  key={i}
                  className="suggestion-chip"
                  onClick={() => {
                    setCustomQuestion(sq);
                    // Trigger search immediately
                    const matched = glossaryConcepts.find((c) =>
                      sq.toLowerCase().includes(c.term.toLowerCase().slice(0, 5))
                    );
                    if (matched) {
                      setTutorResponse(matched);
                      setActiveConcept(matched);
                    }
                  }}
                >
                  {sq}
                </button>
              ))}
            </div>

            <div className="question-input-box">
              <textarea
                placeholder="Ask about a financial concept (e.g. 'What is EBITDA?', 'How to read a Balance Sheet')..."
                value={customQuestion}
                onChange={(e) => setCustomQuestion(e.target.value)}
                rows={3}
              />
              <button
                className="primary"
                onClick={handleAsk}
                disabled={!customQuestion.trim()}
              >
                Explain Concept <ArrowRight size={15} />
              </button>
            </div>

            {/* Answer Display */}
            {(tutorResponse || activeConcept) && (
              <div className="tutor-answer-display">
                <div className="answer-header">
                  <span className="eyebrow">{(tutorResponse || activeConcept)!.category.toUpperCase()}</span>
                  <h3>{(tutorResponse || activeConcept)!.term}</h3>
                  <p className="answer-short">{(tutorResponse || activeConcept)!.shortDefinition}</p>
                </div>

                <div className="answer-body-block">
                  <h4>Detailed Explanation</h4>
                  <p>{(tutorResponse || activeConcept)!.detailedExplanation}</p>
                </div>

                {(tutorResponse || activeConcept)!.formula && (
                  <div className="answer-formula-box">
                    <b><Calculator size={14} /> Mathematical Formula</b>
                    <code>{(tutorResponse || activeConcept)!.formula}</code>
                  </div>
                )}

                <div className="answer-example-box">
                  <b>Practical Example:</b>
                  <p>{(tutorResponse || activeConcept)!.example}</p>
                </div>

                <div className="answer-meta-grid">
                  <div className="meta-box why-matters">
                    <b>Why It Matters for Investors:</b>
                    <p>{(tutorResponse || activeConcept)!.whyItMatters}</p>
                  </div>
                  <div className="meta-box beginner-tip">
                    <b>Beginner Tip:</b>
                    <p>{(tutorResponse || activeConcept)!.beginnerTip}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Searchable Glossary Directory */}
        <div className="glossary-directory-column">
          <div className="glossary-header">
            <h3>Financial Knowledge Base</h3>
            <span className="count-pill">{filteredConcepts.length} Concepts</span>
          </div>

          <div className="searchbox">
            <Search size={15} />
            <input
              type="text"
              placeholder="Search concepts or formulas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Category Chips */}
          <div className="category-pills">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="concepts-list">
            {filteredConcepts.map((concept) => (
              <div
                key={concept.id}
                className={`concept-list-card ${activeConcept?.id === concept.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveConcept(concept);
                  setTutorResponse(concept);
                }}
              >
                <div className="concept-card-top">
                  <b>{concept.term}</b>
                  <small className="cat-badge">{concept.category}</small>
                </div>
                <p>{concept.shortDefinition}</p>
              </div>
            ))}
            {filteredConcepts.length === 0 && (
              <div className="no-concepts">No concepts found matching your search.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  BookOpen,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Award,
  ChevronRight,
} from 'lucide-react';
import { lessonModules } from '../../data/lessons';
import { LessonModule, QuizQuestion } from '../../types';

interface AcademyViewProps {
  onProgressUpdate?: (completedCount: number) => void;
}

export const AcademyView: React.FC<AcademyViewProps> = ({ onProgressUpdate }) => {
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [activeSectionIdx, setActiveSectionIdx] = useState<number>(0);
  const [quizState, setQuizState] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<Record<string, boolean>>({});
  const [completedModules, setCompletedModules] = useState<Record<string, boolean>>({});

  // Load progress from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('marketmind_completed_modules');
      if (saved) {
        const parsed = JSON.parse(saved);
        setCompletedModules(parsed);
        const count = Object.values(parsed).filter(Boolean).length;
        if (onProgressUpdate) onProgressUpdate(count);
      }
    } catch (e) {
      // Ignore local storage error
    }
  }, []);

  const markModuleComplete = (moduleId: string) => {
    const updated = { ...completedModules, [moduleId]: true };
    setCompletedModules(updated);
    try {
      localStorage.setItem('marketmind_completed_modules', JSON.stringify(updated));
    } catch (e) {}
    const count = Object.values(updated).filter(Boolean).length;
    if (onProgressUpdate) onProgressUpdate(count);
  };

  const activeModule = lessonModules.find((m) => m.id === selectedModuleId);

  const handleOptionSelect = (questionId: string, optionIdx: number) => {
    if (quizSubmitted[questionId]) return; // Don't allow changing after submit
    setQuizState({ ...quizState, [questionId]: optionIdx });
  };

  const handleQuizSubmit = (module: LessonModule) => {
    const updatedSubmitted = { ...quizSubmitted };
    module.quiz.forEach((q) => {
      updatedSubmitted[q.id] = true;
    });
    setQuizSubmitted(updatedSubmitted);

    // Check if all correct
    const allCorrect = module.quiz.every((q) => quizState[q.id] === q.correctIndex);
    if (allCorrect) {
      markModuleComplete(module.id);
    }
  };

  const handleResetQuiz = (module: LessonModule) => {
    const updatedState = { ...quizState };
    const updatedSubmitted = { ...quizSubmitted };
    module.quiz.forEach((q) => {
      delete updatedState[q.id];
      delete updatedSubmitted[q.id];
    });
    setQuizState(updatedState);
    setQuizSubmitted(updatedSubmitted);
  };

  const completedCount = Object.values(completedModules).filter(Boolean).length;

  return (
    <div className="page-workspace">
      {/* Academy Header */}
      <div className="workspace-header">
        <div>
          <div className="eyebrow">BEGINNER TO INTERMEDIATE INVESTING CURRICULUM</div>
          <h1>MarketMind Academy</h1>
          <p className="intro">
            Build your market fluency through first-principles financial education.
            Study company analysis, financial statements, valuation, and macroeconomic cycles with interactive knowledge-checks.
          </p>
        </div>

        <div className="academy-overall-progress">
          <div className="progress-badge">
            <Award size={18} />
            <span>{completedCount} of {lessonModules.length} Modules Mastered</span>
          </div>
          <div className="progress-bar-overall">
            <div
              className="progress-fill-overall"
              style={{ width: `${(completedCount / lessonModules.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Module Overview Grid (when no module selected) */}
      {!activeModule && (
        <div className="academy-modules-grid">
          {lessonModules.map((module) => {
            const isCompleted = !!completedModules[module.id];
            return (
              <div
                key={module.id}
                className={`module-card ${isCompleted ? 'completed' : ''}`}
                onClick={() => {
                  setSelectedModuleId(module.id);
                  setActiveSectionIdx(0);
                }}
              >
                <div className="module-card-top">
                  <span className="module-num">MODULE {module.moduleNumber}</span>
                  <span className="diff-pill">{module.difficulty} · ~{module.estMinutes} mins</span>
                </div>
                <h3>{module.title}</h3>
                <p>{module.subtitle}</p>

                <div className="module-objectives-preview">
                  <b>Key Objectives:</b>
                  <ul>
                    {module.learningObjectives.slice(0, 2).map((obj, i) => (
                      <li key={i}>{obj}</li>
                    ))}
                  </ul>
                </div>

                <div className="module-card-footer">
                  {isCompleted ? (
                    <span className="completed-tag">
                      <CheckCircle2 size={15} /> Mastered & Verified
                    </span>
                  ) : (
                    <span className="start-btn-link">
                      Start Lesson <ChevronRight size={15} />
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Active Module Reader View */}
      {activeModule && (
        <div className="module-reader-view">
          <button className="back-to-modules" onClick={() => setSelectedModuleId(null)}>
            <ArrowLeft size={16} /> Back to All Modules
          </button>

          <div className="reader-hero">
            <div className="module-eyebrow">
              MODULE {activeModule.moduleNumber} · {activeModule.difficulty.toUpperCase()} · ~{activeModule.estMinutes} MIN READ
            </div>
            <h2>{activeModule.title}</h2>
            <p className="reader-subtitle">{activeModule.subtitle}</p>

            <div className="objectives-box">
              <b><Sparkles size={15} /> Learning Objectives</b>
              <ul>
                {activeModule.learningObjectives.map((obj, idx) => (
                  <li key={idx}>{obj}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Section Navigation Tabs */}
          <div className="section-tabs-bar" role="tablist">
            {activeModule.sections.map((sec, idx) => (
              <button
                key={idx}
                className={`section-tab ${activeSectionIdx === idx ? 'active' : ''}`}
                onClick={() => setActiveSectionIdx(idx)}
              >
                {sec.title}
              </button>
            ))}
            <button
              className={`section-tab quiz-tab ${activeSectionIdx === activeModule.sections.length ? 'active' : ''}`}
              onClick={() => setActiveSectionIdx(activeModule.sections.length)}
            >
              Knowledge Check Quiz ({activeModule.quiz.length} Questions)
            </button>
          </div>

          {/* Content Pane: Lesson Text */}
          {activeSectionIdx < activeModule.sections.length && (
            <div className="lesson-section-content">
              <h3>{activeModule.sections[activeSectionIdx].title}</h3>
              <div className="prose-content">
                {activeModule.sections[activeSectionIdx].content.map((paragraph, pIdx) => (
                  <p key={pIdx}>{paragraph}</p>
                ))}
              </div>

              {activeModule.sections[activeSectionIdx].example && (
                <div className="example-box">
                  <b>Practical Real-World Example:</b>
                  <p>{activeModule.sections[activeSectionIdx].example}</p>
                </div>
              )}

              {activeModule.sections[activeSectionIdx].takeaway && (
                <div className="takeaway-box">
                  <b>Core Principle:</b>
                  <p>{activeModule.sections[activeSectionIdx].takeaway}</p>
                </div>
              )}

              <div className="reader-actions">
                <button
                  className="secondary small"
                  disabled={activeSectionIdx === 0}
                  onClick={() => setActiveSectionIdx(activeSectionIdx - 1)}
                >
                  <ArrowLeft size={15} /> Previous Section
                </button>
                <button
                  className="primary small"
                  onClick={() => setActiveSectionIdx(activeSectionIdx + 1)}
                >
                  {activeSectionIdx + 1 === activeModule.sections.length
                    ? 'Take Knowledge Check Quiz'
                    : 'Next Section'}{' '}
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          )}

          {/* Content Pane: Interactive Quiz */}
          {activeSectionIdx === activeModule.sections.length && (
            <div className="quiz-pane">
              <div className="quiz-head">
                <div className="eyebrow">MODULE {activeModule.moduleNumber} EVALUATION</div>
                <h3>Knowledge-Check Quiz</h3>
                <p>Test your understanding of the concepts covered in this module.</p>
              </div>

              <div className="quiz-questions-list">
                {activeModule.quiz.map((q, qIdx) => {
                  const selectedOpt = quizState[q.id];
                  const isSubmitted = !!quizSubmitted[q.id];
                  const isCorrect = selectedOpt === q.correctIndex;

                  return (
                    <div
                      key={q.id}
                      className={`quiz-card ${
                        isSubmitted ? (isCorrect ? 'card-correct' : 'card-incorrect') : ''
                      }`}
                    >
                      <h4>
                        {qIdx + 1}. {q.question}
                      </h4>
                      <div className="options-list">
                        {q.options.map((opt, optIdx) => {
                          const isSelected = selectedOpt === optIdx;
                          let optionClass = '';
                          if (isSubmitted) {
                            if (optIdx === q.correctIndex) optionClass = 'correct-opt';
                            else if (isSelected) optionClass = 'wrong-opt';
                          } else if (isSelected) {
                            optionClass = 'selected-opt';
                          }

                          return (
                            <button
                              key={optIdx}
                              className={`quiz-option ${optionClass}`}
                              onClick={() => handleOptionSelect(q.id, optIdx)}
                              disabled={isSubmitted}
                            >
                              <span className="opt-letter">
                                {String.fromCharCode(65 + optIdx)}
                              </span>
                              <span className="opt-text">{opt}</span>
                            </button>
                          );
                        })}
                      </div>

                      {isSubmitted && (
                        <div className={`explanation-box ${isCorrect ? 'correct' : 'incorrect'}`}>
                          <b>{isCorrect ? '✓ Correct!' : '✗ Not Quite.'}</b>
                          <p>{q.explanation}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="quiz-submit-bar">
                {!activeModule.quiz.every((q) => quizSubmitted[q.id]) ? (
                  <button
                    className="primary"
                    disabled={activeModule.quiz.some((q) => quizState[q.id] === undefined)}
                    onClick={() => handleQuizSubmit(activeModule)}
                  >
                    Submit Answers & Check Score <CheckCircle2 size={16} />
                  </button>
                ) : (
                  <div className="quiz-completed-banner">
                    <div className="score-summary">
                      <b>
                        Score:{' '}
                        {
                          activeModule.quiz.filter((q) => quizState[q.id] === q.correctIndex)
                            .length
                        }{' '}
                        / {activeModule.quiz.length} Correct
                      </b>
                      {activeModule.quiz.every((q) => quizState[q.id] === q.correctIndex) ? (
                        <span className="mastery-text">
                          <CheckCircle2 size={16} /> Module {activeModule.moduleNumber} Mastered!
                        </span>
                      ) : (
                        <span>Review the explanations above and retry to achieve 100% mastery.</span>
                      )}
                    </div>
                    <button className="secondary small" onClick={() => handleResetQuiz(activeModule)}>
                      <RotateCcw size={14} /> Retake Quiz
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Key Terminology Bar */}
          <div className="module-key-terms-card">
            <h4>Key Terminology in this Module</h4>
            <div className="key-terms-grid">
              {activeModule.keyTerms.map((t, idx) => (
                <div key={idx} className="term-item">
                  <b>{t.term}</b>
                  <p>{t.definition}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

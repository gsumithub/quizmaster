import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../context/AuthContext';
import Loader from '../components/Loader';
import Timer from '../components/Timer';
import { AlertCircle, ChevronLeft, ChevronRight, Bookmark, CheckSquare, Save } from 'lucide-react';

const QuizAttempt = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Attempt states
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState({}); // questionId -> selectedOptionIndex
  const [flagged, setFlagged] = useState({}); // questionId -> boolean
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Load quiz and secure questions
  useEffect(() => {
    const fetchQuizAndQuestions = async () => {
      try {
        const [quizRes, questionsRes] = await Promise.all([
          api.get(`/quizzes/${id}`),
          api.get(`/quizzes/${id}/questions`)
        ]);
        setQuiz(quizRes.data);
        setQuestions(questionsRes.data);
      } catch (err) {
        setError('Failed to initialize quiz attempt.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuizAndQuestions();
  }, [id]);

  // Prevent accidental exits
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = 'Are you sure you want to leave? Your progress will be lost.';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const handleSelectOption = (questionId, optionIdx) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: optionIdx
    }));
  };

  const toggleFlag = (questionId) => {
    setFlagged((prev) => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  const handleTimeUp = () => {
    // Force submit automatically
    console.log('Timer expired. Auto-submitting answers.');
    submitAnswers(true);
  };

  const submitAnswers = async (isAuto = false) => {
    setSubmitting(true);
    setShowSubmitModal(false);

    try {
      // Map answers to backend format: [{ questionId, selectedOptionIndex }]
      const answersArray = questions.map((q) => ({
        questionId: q._id,
        selectedOptionIndex: userAnswers[q._id] !== undefined ? userAnswers[q._id] : -1
      }));

      const res = await api.post('/attempts', {
        quizId: id,
        answers: answersArray
      });

      // Navigate to results page
      navigate(`/attempts/${res.data._id}`, { replace: true });
    } catch (err) {
      console.error(err);
      alert('An error occurred while submitting your answers. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex-1 flex items-center justify-center bg-dark-950"><Loader message="Loading quiz questions securely..." /></div>;

  if (error || questions.length === 0) {
    return (
      <div className="flex-1 max-w-xl mx-auto flex flex-col justify-center items-center p-8 text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <h3 className="text-xl font-bold text-white">Cannot Start Quiz</h3>
        <p className="text-dark-300 text-sm">{error || 'This quiz does not have any questions.'}</p>
        <button onClick={() => navigate(-1)} className="bg-dark-900 border border-dark-800 text-white px-5 py-2.5 rounded-xl text-sm font-semibold">
          Go Back
        </button>
      </div>
    );
  }

  const activeQuestion = questions[currentIdx];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(userAnswers).length;

  return (
    <div className="flex-1 bg-dark-950 flex flex-col h-[calc(100vh-69px)] overflow-hidden">
      {/* Top Banner Bar */}
      <div className="bg-dark-900/60 border-b border-dark-850 px-4 sm:px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-lg font-bold text-white leading-tight">{quiz?.title}</h1>
          <div className="text-xs text-dark-400 mt-0.5">
            Category: <span className="font-semibold text-primary-400">{quiz?.category?.name}</span>
          </div>
        </div>

        {/* Timer */}
        {quiz && (
          <Timer initialSeconds={quiz.timeLimit} onTimeUp={handleTimeUp} />
        )}
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Side: Question Pane (2/3 width) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Header info */}
            <div className="flex justify-between items-center text-xs font-semibold text-dark-400 uppercase tracking-wider">
              <span>Question {currentIdx + 1} of {totalQuestions}</span>
              <span className="text-primary-400">{Math.round((answeredCount / totalQuestions) * 100)}% Answered</span>
            </div>

            {/* Question Card */}
            <div className="glass-panel p-8 rounded-3xl space-y-8 shadow-xl">
              <h2 className="text-xl font-bold text-white leading-relaxed">
                {activeQuestion.text}
              </h2>

              {/* Options */}
              <div className="space-y-3">
                {activeQuestion.options.map((option, idx) => {
                  const isSelected = userAnswers[activeQuestion._id] === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(activeQuestion._id, idx)}
                      className={`w-full text-left p-4.5 rounded-2xl border text-sm font-semibold flex items-center space-x-4 transition-all duration-150 ${
                        isSelected
                          ? 'bg-primary-600/10 border-primary-500 text-white shadow-lg shadow-primary-500/5'
                          : 'bg-dark-900 border-dark-850 hover:border-dark-750 text-dark-200 hover:text-white'
                      }`}
                    >
                      <span className={`h-6 w-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                        isSelected ? 'bg-primary-600 text-white' : 'bg-dark-950 border border-dark-800 text-dark-450'
                      }`}>
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span>{option}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Question Actions */}
            <div className="flex justify-between items-center gap-3">
              <button
                onClick={() => setCurrentIdx((prev) => Math.max(prev - 1, 0))}
                disabled={currentIdx === 0}
                className="bg-dark-900 border border-dark-850 hover:border-dark-750 hover:text-white px-5 py-3 rounded-2xl text-sm font-bold flex items-center space-x-2 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                <ChevronLeft className="h-4.5 w-4.5" />
                <span>Previous</span>
              </button>

              <button
                onClick={() => toggleFlag(activeQuestion._id)}
                className={`px-5 py-3 rounded-2xl text-sm font-bold flex items-center space-x-2 border transition-all duration-200 ${
                  flagged[activeQuestion._id]
                    ? 'bg-purple-600/15 border-purple-500/40 text-purple-400'
                    : 'bg-dark-900 border-dark-850 hover:border-dark-750 text-dark-300 hover:text-white'
                }`}
              >
                <Bookmark className="h-4.5 w-4.5" />
                <span>{flagged[activeQuestion._id] ? 'Flagged' : 'Flag for Review'}</span>
              </button>

              {currentIdx < totalQuestions - 1 ? (
                <button
                  onClick={() => setCurrentIdx((prev) => Math.min(prev + 1, totalQuestions - 1))}
                  className="bg-primary-600 hover:bg-primary-500 text-white px-5 py-3 rounded-2xl text-sm font-bold flex items-center space-x-2 shadow-lg shadow-primary-600/10 hover:scale-[1.01] active:scale-100 transition-all duration-200"
                >
                  <span>Next</span>
                  <ChevronRight className="h-4.5 w-4.5" />
                </button>
              ) : (
                <button
                  onClick={() => setShowSubmitModal(true)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-2xl text-sm font-extrabold flex items-center space-x-2 shadow-lg shadow-emerald-600/10 hover:scale-[1.02] active:scale-100 transition-all duration-200"
                >
                  <Save className="h-4.5 w-4.5" />
                  <span>Submit Quiz</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Navigation Panel (1/3 width) */}
        <div className="w-full md:w-80 bg-dark-900/40 border-t md:border-t-0 md:border-l border-dark-850 flex flex-col p-6 space-y-6 overflow-y-auto">
          <div>
            <h3 className="font-bold text-white text-sm uppercase tracking-wider">Question Status</h3>
            <p className="text-xs text-dark-400 mt-1">Jump to any question instantly.</p>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-4 gap-2.5">
            {questions.map((q, idx) => {
              const isCurrent = idx === currentIdx;
              const isAnswered = userAnswers[q._id] !== undefined;
              const isFlagged = flagged[q._id];

              let borderClass = 'border-transparent';
              if (isCurrent) borderClass = 'ring-2 ring-primary-500 ring-offset-2 ring-offset-dark-950';

              let bgClass = 'bg-dark-900 text-dark-400 border border-dark-850 hover:border-dark-750';
              if (isAnswered) bgClass = 'bg-primary-600 text-white';
              if (isFlagged) bgClass = 'bg-purple-600 text-white';

              return (
                <button
                  key={q._id}
                  onClick={() => setCurrentIdx(idx)}
                  className={`aspect-square rounded-xl font-bold text-sm flex items-center justify-center transition-all ${borderClass} ${bgClass}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Color Legend */}
          <div className="border-t border-dark-850 pt-4 space-y-2">
            <div className="flex items-center space-x-2 text-xs font-semibold text-dark-300">
              <div className="h-3 w-3 rounded bg-dark-900 border border-dark-800"></div>
              <span>Unanswered / Unvisited</span>
            </div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-dark-300">
              <div className="h-3 w-3 rounded bg-primary-600"></div>
              <span>Answered</span>
            </div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-dark-300">
              <div className="h-3 w-3 rounded bg-purple-600"></div>
              <span>Flagged for Review</span>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-55 flex items-center justify-center bg-dark-950/80 backdrop-blur-sm px-4">
          <div className="glass-panel p-8 rounded-3xl w-full max-w-md border border-dark-800 space-y-6 shadow-2xl animate-fade-in">
            <div className="text-center space-y-2">
              <CheckSquare className="h-12 w-12 text-primary-500 mx-auto" />
              <h3 className="text-xl font-bold text-white">Ready to submit?</h3>
              <p className="text-dark-300 text-sm">
                You have answered <span className="font-bold text-white">{answeredCount}</span> out of{' '}
                <span className="font-bold text-white">{totalQuestions}</span> questions.
              </p>
            </div>

            {answeredCount < totalQuestions && (
              <div className="flex items-center space-x-2 bg-amber-950/40 border border-amber-900/30 text-amber-400 p-4.5 rounded-2xl text-xs">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span>
                  You have left <span className="font-bold">{totalQuestions - answeredCount}</span> questions unanswered. You can still submit, but unanswered questions are graded incorrect.
                </span>
              </div>
            )}

            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 bg-dark-900 border border-dark-850 hover:border-dark-750 text-white font-semibold py-3 rounded-2xl text-sm transition-colors"
              >
                Back to Quiz
              </button>
              <button
                onClick={() => submitAnswers(false)}
                disabled={submitting}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-2xl text-sm shadow-lg shadow-emerald-600/10 transition-colors"
              >
                {submitting ? 'Grading...' : 'Yes, Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizAttempt;

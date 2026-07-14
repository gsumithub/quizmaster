import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../context/AuthContext';
import Loader from '../components/Loader';
import { Trophy, XCircle, AlertCircle, LayoutDashboard, RefreshCw, Check, X, AlertOctagon } from 'lucide-react';

const QuizResult = () => {
  const { id } = useParams();
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAttemptDetails = async () => {
      try {
        const res = await api.get(`/attempts/${id}`);
        setAttempt(res.data);
      } catch (err) {
        setError('Failed to fetch quiz result.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAttemptDetails();
  }, [id]);

  if (loading) return <div className="flex-1 flex items-center justify-center"><Loader message="Loading graded attempt report card..." /></div>;

  if (error || !attempt) {
    return (
      <div className="flex-1 max-w-xl mx-auto flex flex-col justify-center items-center p-8 text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <h3 className="text-xl font-bold text-white">Result Not Found</h3>
        <p className="text-dark-300 text-sm">{error || 'This attempt record could not be retrieved.'}</p>
        <Link to="/dashboard" className="bg-dark-900 border border-dark-800 text-white px-5 py-2.5 rounded-xl text-sm font-semibold">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const { quiz, score, correctAnswersCount, totalQuestionsCount, passed, answers } = attempt;

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className={`glass-panel border p-8 rounded-3xl text-center space-y-4 shadow-2xl relative overflow-hidden`}>
        {/* Glow behind banner */}
        <div className={`absolute -top-24 -left-24 w-48 h-48 rounded-full blur-3xl -z-10 ${
          passed ? 'bg-emerald-500/10' : 'bg-red-500/10'
        }`}></div>

        {passed ? (
          <div className="inline-flex items-center justify-center bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4.5 rounded-full animate-bounce">
            <Trophy className="h-10 w-10" />
          </div>
        ) : (
          <div className="inline-flex items-center justify-center bg-red-500/10 border border-red-500/20 text-red-400 p-4.5 rounded-full">
            <XCircle className="h-10 w-10" />
          </div>
        )}

        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-white">Quiz Graded!</h1>
          <p className="text-sm text-dark-300">
            Performance report for <span className="font-semibold text-white">{quiz?.title}</span>
          </p>
        </div>

        {/* Grade Display */}
        <div className="max-w-xs mx-auto py-4">
          <div className="text-5xl font-extrabold tracking-tight text-white mb-2">
            {score}%
          </div>
          <span
            className={`inline-block font-extrabold text-xs tracking-widest px-4 py-1.5 rounded-full border shadow-sm ${
              passed
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-red-500/10 text-red-400 border-red-500/30'
            }`}
          >
            {passed ? 'PASSED ATTEMPT' : 'FAILED ATTEMPT'}
          </span>
        </div>

        {/* Score comparison metrics bar */}
        <div className="max-w-md mx-auto space-y-2">
          <div className="flex justify-between text-xs text-dark-400 font-semibold">
            <span>Pass Threshold: {quiz?.passPercentage}%</span>
            <span>Your Score: {score}%</span>
          </div>
          <div className="w-full bg-dark-900 h-2.5 rounded-full overflow-hidden border border-dark-850 relative">
            {/* Cutoff line marker */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-dark-500 z-10"
              style={{ left: `${quiz?.passPercentage}%` }}
              title="Pass cut-off"
            ></div>
            <div
              className={`h-full rounded-full ${passed ? 'bg-emerald-500' : 'bg-red-500'}`}
              style={{ width: `${score}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-dark-300 font-medium">
            <span>Correct MCQs: <span className="text-white font-semibold">{correctAnswersCount}</span> / {totalQuestionsCount}</span>
            <span>Time Limit: {Math.round((quiz?.timeLimit || 0) / 60)} min</span>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4">
          <Link
            to="/dashboard"
            className="bg-dark-900 hover:bg-dark-800 text-white px-5 py-3 rounded-2xl text-sm font-bold border border-dark-800 flex items-center justify-center space-x-2 transition-colors"
          >
            <LayoutDashboard className="h-4.5 w-4.5" />
            <span>Dashboard</span>
          </Link>
          <Link
            to={`/quizzes/${quiz?._id}`}
            className="bg-primary-600 hover:bg-primary-500 text-white px-5 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-primary-600/10 flex items-center justify-center space-x-2 transition-colors"
          >
            <RefreshCw className="h-4.5 w-4.5" />
            <span>Retake Quiz</span>
          </Link>
        </div>
      </div>

      {/* Review details */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <span>Question Review</span>
        </h2>

        <div className="space-y-4">
          {answers.map((ans, idx) => {
            const question = ans.questionId;
            if (!question) return null;

            return (
              <div key={ans._id} className="glass-panel p-6 rounded-3xl space-y-4 border border-dark-850">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-dark-400">QUESTION {idx + 1}</span>
                    <h3 className="font-bold text-white text-base leading-relaxed">{question.text}</h3>
                  </div>
                  <span
                    className={`p-1.5 rounded-lg border flex-shrink-0 ${
                      ans.isCorrect
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}
                  >
                    {ans.isCorrect ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
                  </span>
                </div>

                {/* Options grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {question.options.map((option, optIdx) => {
                    const isSelected = ans.selectedOptionIndex === optIdx;
                    const isCorrectOption = question.correctOptionIndex === optIdx;

                    let cardClass = 'bg-dark-900 border-dark-850 text-dark-300';
                    if (isCorrectOption) {
                      cardClass = 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
                    } else if (isSelected && !ans.isCorrect) {
                      cardClass = 'bg-red-500/10 border-red-500/30 text-red-400';
                    }

                    return (
                      <div
                        key={optIdx}
                        className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center space-x-3 ${cardClass}`}
                      >
                        <span className={`h-5 w-5 rounded flex items-center justify-center text-[10px] font-bold ${
                          isCorrectOption
                            ? 'bg-emerald-500 text-white'
                            : isSelected
                            ? 'bg-red-500 text-white'
                            : 'bg-dark-950 border border-dark-800 text-dark-450'
                        }`}>
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span>{option}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Question explanation block */}
                {question.explanation && (
                  <div className="bg-dark-900 border border-dark-850 p-4.5 rounded-2xl space-y-1 text-xs">
                    <div className="font-bold text-white flex items-center space-x-1.5">
                      <AlertOctagon className="h-4 w-4 text-primary-400" />
                      <span>Explanation:</span>
                    </div>
                    <p className="text-dark-300 leading-relaxed font-medium">{question.explanation}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default QuizResult;

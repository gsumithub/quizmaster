import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../context/AuthContext';
import Loader from '../components/Loader';
import { ArrowLeft, Clock, HelpCircle, Award, Play, AlertCircle } from 'lucide-react';

const QuizDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchQuizDetails = async () => {
      try {
        const res = await api.get(`/quizzes/${id}`);
        setQuiz(res.data);
      } catch (err) {
        setError('Failed to fetch quiz details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuizDetails();
  }, [id]);

  const handleStartQuiz = () => {
    navigate(`/quizzes/${id}/attempt`);
  };

  if (loading) return <div className="flex-1 flex items-center justify-center"><Loader message="Loading quiz details..." /></div>;

  if (error || !quiz) {
    return (
      <div className="flex-1 max-w-xl mx-auto flex flex-col justify-center items-center p-8 text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <h3 className="text-xl font-bold text-white">Quiz not found</h3>
        <p className="text-dark-300 text-sm">{error || 'This quiz might have been deleted or disabled.'}</p>
        <Link to="/quizzes" className="bg-dark-900 border border-dark-800 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors">
          Back to Catalog
        </Link>
      </div>
    );
  }

  const formatDifficulty = (diff) => {
    const colors = {
      easy: 'text-green-400 bg-green-500/10 border-green-500/20',
      medium: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      hard: 'text-red-400 bg-red-500/10 border-red-500/20'
    };
    return (
      <span className={`capitalize text-xs font-bold px-3 py-1 rounded-lg border ${colors[diff] || 'text-dark-300 bg-dark-800'}`}>
        {diff} Difficulty
      </span>
    );
  };

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 space-y-8 animate-fade-in">
      {/* Back button */}
      <Link
        to="/quizzes"
        className="inline-flex items-center space-x-2 text-dark-300 hover:text-white transition-colors group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium">Back to Catalog</span>
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left column - details & stats (1/3 width) */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold text-primary-400 bg-primary-500/10 px-2.5 py-1 rounded-lg border border-primary-500/20">
                {quiz.category?.name || 'Uncategorized'}
              </span>
              <h1 className="text-2xl font-extrabold text-white pt-2">{quiz.title}</h1>
            </div>

            <div className="space-y-4 pt-4 border-t border-dark-850">
              <div className="flex items-center space-x-3">
                <div className="bg-dark-900 border border-dark-800 p-2.5 rounded-xl text-dark-300">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs text-dark-400 font-semibold">TIME LIMIT</div>
                  <div className="text-sm font-bold text-white">{Math.round(quiz.timeLimit / 60)} minutes</div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="bg-dark-900 border border-dark-800 p-2.5 rounded-xl text-dark-300">
                  <HelpCircle className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs text-dark-400 font-semibold">TOTAL QUESTIONS</div>
                  <div className="text-sm font-bold text-white">{quiz.questionCount} MCQs</div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="bg-dark-900 border border-dark-800 p-2.5 rounded-xl text-dark-300">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs text-dark-400 font-semibold">PASS CUTOFF</div>
                  <div className="text-sm font-bold text-white">{quiz.passPercentage}% Score</div>
                </div>
              </div>
            </div>

            <div className="pt-2">
              {formatDifficulty(quiz.difficulty)}
            </div>
          </div>
        </div>

        {/* Right column - Instructions & Start (2/3 width) */}
        <div className="md:col-span-2 space-y-6">
          <div className="glass-panel p-8 rounded-3xl space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white">Quiz Overview</h2>
              <p className="text-dark-300 text-sm leading-relaxed">{quiz.description}</p>
            </div>

            <div className="space-y-4 pt-6 border-t border-dark-850">
              <h3 className="font-bold text-white flex items-center space-x-2">
                <AlertCircle className="h-4.5 w-4.5 text-primary-400" />
                <span>Important Instructions</span>
              </h3>
              <ul className="space-y-3 text-sm text-dark-300 list-disc list-inside pl-1">
                <li>
                  Once started, the countdown timer <span className="font-semibold text-white">cannot be paused</span>.
                </li>
                <li>
                  The quiz will <span className="font-semibold text-white">auto-submit</span> immediately if the timer expires.
                </li>
                <li>
                  Do not refresh the page or navigate away. Doing so will reset your answers.
                </li>
                <li>
                  Make sure you have a stable internet connection before beginning.
                </li>
                <li>
                  Review your answers using the sidebar question navigation panel during the quiz.
                </li>
              </ul>
            </div>

            {quiz.questionCount === 0 ? (
              <div className="bg-amber-950/40 border border-amber-900/30 text-amber-400 p-4 rounded-2xl text-sm">
                This quiz does not contain any questions yet. Administrators will update it shortly.
              </div>
            ) : (
              <button
                onClick={handleStartQuiz}
                className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center space-x-2 shadow-xl shadow-primary-600/20 hover:scale-[1.01] active:scale-100 transition-all duration-200"
              >
                <Play className="h-5 w-5 fill-current" />
                <span>Start Quiz Attempt</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizDetail;

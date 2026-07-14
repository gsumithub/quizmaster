import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Trophy, ShieldCheck, Zap, BookOpen, BarChart3, Users } from 'lucide-react';

const Landing = () => {
  const { user } = useAuth();

  return (
    <div className="flex-1 flex flex-col justify-center items-center px-4 py-16 sm:px-6 lg:px-8 max-w-7xl mx-auto relative overflow-hidden">
      {/* Decorative Blur Spheres */}
      <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/10 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl -z-10 animate-pulse delay-1000"></div>

      {/* Hero Section */}
      <div className="text-center max-w-3xl space-y-6 animate-fade-in">
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-accent-500/10 border border-accent-500/20 text-accent-400 text-xs font-semibold uppercase tracking-wider">
          <Zap className="h-3.5 w-3.5" />
          <span>Interactive Learning System</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-dark-50 leading-none">
          Master Any Subject with{' '}
          <span className="bg-gradient-to-r from-primary-400 via-primary-300 to-accent-400 bg-clip-text text-transparent">
            QuizMaster
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-dark-300 max-w-2xl mx-auto font-medium">
          Create, attempt, and analyze smart online quizzes in real-time. Boost your retention with progress analytics and instant feedback.
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
          {user ? (
            <Link
              to="/dashboard"
              className="w-full sm:w-auto bg-primary-600 hover:bg-primary-500 text-white px-8 py-4 rounded-2xl text-base font-bold shadow-xl shadow-primary-600/30 hover:scale-[1.02] active:scale-100 transition-all duration-200"
            >
              Go to Your Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="w-full sm:w-auto bg-primary-600 hover:bg-primary-500 text-white px-8 py-4 rounded-2xl text-base font-bold shadow-xl shadow-primary-600/30 hover:scale-[1.02] active:scale-100 transition-all duration-200"
              >
                Get Started (Solo)
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto glass-panel hover:bg-dark-800 text-dark-50 px-8 py-4 rounded-2xl text-base font-semibold hover:border-primary-500/30 hover:scale-[1.02] active:scale-100 transition-all duration-200"
              >
                Sign In
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-24 w-full">
        {/* Feature 1 */}
        <div className="glass-panel glass-panel-hover p-8 rounded-3xl animate-fade-in delay-100">
          <div className="bg-primary-500/10 border border-primary-500/20 text-primary-400 p-4 rounded-2xl w-fit mb-6">
            <BookOpen className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold text-dark-100 mb-2">Diverse Categories</h3>
          <p className="text-dark-300">
            Browse multiple subjects. Filter quizzes by easy, medium, or hard difficulties matching your exact learning path.
          </p>
        </div>

        {/* Feature 2 */}
        <div className="glass-panel glass-panel-hover p-8 rounded-3xl animate-fade-in delay-200">
          <div className="bg-accent-500/10 border border-accent-500/20 text-accent-400 p-4 rounded-2xl w-fit mb-6">
            <BarChart3 className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold text-dark-100 mb-2">Detailed Reports</h3>
          <p className="text-dark-300">
            Receive score breakdown percentage, time-based analytics, and explanations for correct answers instantly upon completion.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Landing;

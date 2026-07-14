import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../context/AuthContext';
import Loader from '../components/Loader';
import { Trophy, HelpCircle, Activity, Award, Calendar, ChevronRight, Zap } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/attempts/dashboard-stats');
        setStats(res.data);
      } catch (err) {
        setError('Failed to fetch dashboard stats.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="flex-1 flex items-center justify-center"><Loader message="Loading dashboard statistics..." /></div>;

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-dark-900 via-dark-900/40 to-transparent p-6 sm:p-8 rounded-3xl border border-dark-850">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Your Dashboard</h1>
          <p className="text-dark-300 text-sm mt-1">
            Track your performance, browse active quizzes, and master new skills.
          </p>
        </div>
        <Link
          to="/quizzes"
          className="bg-primary-600 hover:bg-primary-500 text-white px-5 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-primary-600/20 hover:scale-[1.02] active:scale-100 transition-all duration-200"
        >
          Explore Available Quizzes
        </Link>
      </div>

      {error && (
        <div className="bg-red-950/40 border border-red-900/30 text-red-400 p-4 rounded-2xl text-sm">
          {error}
        </div>
      )}

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Total Played */}
        <div className="glass-panel p-6 rounded-3xl flex items-center space-x-4">
          <div className="bg-primary-500/10 border border-primary-500/20 text-primary-400 p-4 rounded-2xl">
            <Trophy className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs text-dark-400 font-semibold uppercase tracking-wider">Quizzes Attempted</div>
            <div className="text-3xl font-extrabold text-white">{stats?.totalQuizzesPlayed || 0}</div>
          </div>
        </div>

        {/* Avg Score */}
        <div className="glass-panel p-6 rounded-3xl flex items-center space-x-4">
          <div className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 p-4 rounded-2xl">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs text-dark-400 font-semibold uppercase tracking-wider">Average Score</div>
            <div className="text-3xl font-extrabold text-white">{stats?.averageScore || 0}%</div>
          </div>
        </div>

        {/* Pass rate */}
        <div className="glass-panel p-6 rounded-3xl flex items-center space-x-4">
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-2xl">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs text-dark-400 font-semibold uppercase tracking-wider">Passing Rate</div>
            <div className="text-3xl font-extrabold text-white">{stats?.passRate || 0}%</div>
          </div>
        </div>
      </div>

      {stats?.totalQuizzesPlayed === 0 ? (
        <div className="glass-panel p-12 rounded-3xl text-center flex flex-col items-center justify-center space-y-4 max-w-xl mx-auto">
          <HelpCircle className="h-16 w-16 text-dark-500" />
          <h3 className="text-xl font-bold text-white">No quiz history yet</h3>
          <p className="text-dark-300 text-sm max-w-sm">
            It looks like you haven't taken any quizzes yet. Head over to the catalog to choose a topic and check your knowledge!
          </p>
          <Link
            to="/quizzes"
            className="bg-primary-600 hover:bg-primary-500 text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-primary-600/20 transition-all duration-200"
          >
            Start Your First Quiz
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Attempts (2/3 width on desktop) */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-primary-400" />
              <span>Recent Attempts</span>
            </h2>

            <div className="space-y-3">
              {stats?.recentAttempts?.map((attempt) => (
                <Link
                  key={attempt._id}
                  to={`/attempts/${attempt._id}`}
                  className="glass-panel glass-panel-hover p-5 rounded-2xl flex justify-between items-center group"
                >
                  <div className="space-y-1">
                    <h3 className="font-bold text-white group-hover:text-primary-300 transition-colors">
                      {attempt.quizTitle}
                    </h3>
                    <div className="text-xs text-dark-400">
                      Completed: {new Date(attempt.completedAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-lg font-bold text-white">{attempt.score}%</div>
                      <span
                        className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          attempt.passed
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}
                      >
                        {attempt.passed ? 'PASSED' : 'FAILED'}
                      </span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-dark-500 group-hover:text-white transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Performance by Category (1/3 width) */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <Zap className="h-5 w-5 text-indigo-400" />
              <span>Category Accuracy</span>
            </h2>

            <div className="glass-panel p-6 rounded-3xl space-y-4">
              {stats?.categoryPerformance?.map((cat) => (
                <div key={cat.name} className="space-y-2">
                  <div className="flex justify-between text-sm font-semibold">
                    <span className="text-dark-200">{cat.name}</span>
                    <span className="text-white">{cat.avgScore}%</span>
                  </div>
                  <div className="w-full bg-dark-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-primary-500 to-indigo-500 h-full rounded-full"
                      style={{ width: `${cat.avgScore}%` }}
                    ></div>
                  </div>
                  <div className="text-[10px] text-dark-400 font-medium">
                    {cat.count} {cat.count === 1 ? 'attempt' : 'attempts'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

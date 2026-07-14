import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../context/AuthContext';
import Loader from '../components/Loader';
import { BookOpen, Search, Filter, Clock, HelpCircle, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

const QuizList = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtering states
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Debounced search trigger
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to first page on search
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        setCategories(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch quizzes on filter change
  useEffect(() => {
    const fetchQuizzes = async () => {
      setLoading(true);
      try {
        const params = {
          page,
          limit: 6,
          search: debouncedSearch,
          category: selectedCategory,
          difficulty: selectedDifficulty
        };
        const res = await api.get('/quizzes', { params });
        setQuizzes(res.data.quizzes);
        setTotalPages(res.data.pages);
      } catch (err) {
        setError('Failed to load quizzes.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, [page, debouncedSearch, selectedCategory, selectedDifficulty]);

  const handleClearFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSelectedDifficulty('');
    setPage(1);
  };

  const getDifficultyBadge = (difficulty) => {
    let classes = 'bg-green-500/10 text-green-400 border border-green-500/20';
    if (difficulty === 'medium') {
      classes = 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
    } else if (difficulty === 'hard') {
      classes = 'bg-red-500/10 text-red-400 border border-red-500/20';
    }
    return (
      <span className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full ${classes}`}>
        {difficulty}
      </span>
    );
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white flex items-center space-x-3">
          <BookOpen className="h-8 w-8 text-primary-500" />
          <span>Browse Quizzes</span>
        </h1>
        <p className="text-dark-300 text-sm mt-1">
          Pick a subject, gauge your expertise, and test your knowledge against the clock.
        </p>
      </div>

      {/* Search & Filters */}
      <div className="glass-panel p-5 rounded-3xl grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
        {/* Search */}
        <div className="relative sm:col-span-2">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="h-4.5 w-4.5 text-dark-400" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search quizzes by title..."
            className="bg-dark-950/60 border border-dark-850 hover:border-dark-750 focus:border-primary-500 text-dark-50 w-full pl-10 pr-4 py-2.5 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all duration-200"
          />
        </div>

        {/* Category Filter */}
        <div>
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1);
            }}
            className="bg-dark-950/60 border border-dark-850 hover:border-dark-750 focus:border-primary-500 text-dark-50 w-full px-4 py-2.5 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all duration-200 cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Difficulty Filter */}
        <div>
          <select
            value={selectedDifficulty}
            onChange={(e) => {
              setSelectedDifficulty(e.target.value);
              setPage(1);
            }}
            className="bg-dark-950/60 border border-dark-850 hover:border-dark-750 focus:border-primary-500 text-dark-50 w-full px-4 py-2.5 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all duration-200 cursor-pointer"
          >
            <option value="">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-950/40 border border-red-900/30 text-red-400 p-4 rounded-2xl text-sm">
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <Loader message="Loading quiz catalog..." />
      ) : quizzes.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl text-center space-y-4 max-w-md mx-auto">
          <HelpCircle className="h-12 w-12 text-dark-500 mx-auto" />
          <h3 className="text-lg font-bold text-white">No quizzes found</h3>
          <p className="text-dark-300 text-sm">
            We couldn't find any quizzes matching your search or filters. Try adjusting your query or resetting filters.
          </p>
          <button
            onClick={handleClearFilters}
            className="bg-dark-800 hover:bg-dark-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold border border-dark-700 transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Quiz Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <div key={quiz._id} className="glass-panel glass-panel-hover p-6 rounded-3xl flex flex-col justify-between h-full group">
                <div className="space-y-4">
                  {/* Category & Difficulty */}
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-primary-400 bg-primary-500/10 px-2.5 py-1 rounded-lg border border-primary-500/20">
                      {quiz.category?.name || 'Uncategorized'}
                    </span>
                    {getDifficultyBadge(quiz.difficulty)}
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-white group-hover:text-primary-300 transition-colors">
                      {quiz.title}
                    </h3>
                    <p className="text-dark-300 text-sm line-clamp-3">
                      {quiz.description}
                    </p>
                  </div>
                </div>

                {/* Footer Details */}
                <div className="border-t border-dark-850 mt-6 pt-4 flex flex-col space-y-4">
                  <div className="flex justify-between text-xs text-dark-400">
                    <span className="flex items-center space-x-1">
                      <HelpCircle className="h-4 w-4" />
                      <span>{quiz.questionCount} Questions</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{Math.round(quiz.timeLimit / 60)} min</span>
                    </span>
                  </div>

                  <Link
                    to={`/quizzes/${quiz._id}`}
                    className="w-full bg-dark-900 hover:bg-primary-600 text-white font-bold text-sm py-3 px-4 rounded-2xl flex items-center justify-center space-x-2 border border-dark-800 hover:border-primary-500 shadow-sm group-hover:shadow-primary-500/5 transition-all duration-350"
                  >
                    <span>View Details</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-4 pt-4">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="p-2.5 bg-dark-900 border border-dark-800 hover:border-dark-750 text-dark-300 hover:text-white rounded-xl disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="text-sm font-semibold text-dark-300">
                Page <span className="text-white">{page}</span> of <span className="text-white">{totalPages}</span>
              </span>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="p-2.5 bg-dark-900 border border-dark-800 hover:border-dark-750 text-dark-300 hover:text-white rounded-xl disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuizList;

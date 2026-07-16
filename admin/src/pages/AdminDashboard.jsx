import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../context/AuthContext';
import Loader from '../components/Loader';
import { Users, BookOpen, Trophy, Award, Calendar, Folder, Plus, Edit, Trash2, ArrowRight } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('quizzes');
  const [error, setError] = useState('');

  // Modals state
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [quizForm, setQuizForm] = useState({
    title: '', description: '', category: '', difficulty: 'medium', timeLimit: 600, passPercentage: 50, isActive: true
  });

  const [showCatModal, setShowCatModal] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [catForm, setCatForm] = useState({ name: '', description: '' });

  const fetchData = async () => {
    try {
      const [statsRes, categoriesRes] = await Promise.all([
        api.get('/attempts/admin-stats'),
        api.get('/categories')
      ]);
      setStats(statsRes.data);
      setCategories(categoriesRes.data);

      const quizzesRes = await api.get('/quizzes?limit=100&showAll=true'); // Get all quizzes for admin
      setQuizzes(quizzesRes.data.quizzes);
    } catch (err) {
      setError('Failed to fetch administration data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenQuizModal = (quiz = null) => {
    if (quiz) {
      setEditingQuiz(quiz);
      setQuizForm({
        title: quiz.title,
        description: quiz.description,
        category: quiz.category?._id || '',
        difficulty: quiz.difficulty,
        timeLimit: quiz.timeLimit,
        passPercentage: quiz.passPercentage,
        isActive: quiz.isActive !== undefined ? quiz.isActive : true
      });
    } else {
      setEditingQuiz(null);
      setQuizForm({
        title: '',
        description: '',
        category: categories[0]?._id || '',
        difficulty: 'medium',
        timeLimit: 600,
        passPercentage: 50,
        isActive: true
      });
    }
    setShowQuizModal(true);
  };

  const handleQuizSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingQuiz) {
        await api.put(`/quizzes/${editingQuiz._id}`, quizForm);
      } else {
        await api.post('/quizzes', quizForm);
      }
      setShowQuizModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving quiz');
    }
  };

  const handleQuizDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this quiz? All questions will be permanently deleted.')) return;
    try {
      await api.delete(`/quizzes/${id}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting quiz');
    }
  };

  const handleToggleActive = async (quiz) => {
    try {
      await api.put(`/quizzes/${quiz._id}`, {
        isActive: !quiz.isActive
      });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error toggling quiz status');
    }
  };

  const handleOpenCatModal = (cat = null) => {
    if (cat) {
      setEditingCat(cat);
      setCatForm({ name: cat.name, description: cat.description });
    } else {
      setEditingCat(null);
      setCatForm({ name: '', description: '' });
    }
    setShowCatModal(true);
  };

  const handleCatSubmit = async (e) => {
    e.preventDefault();
    try {
      let savedCat;
      if (editingCat) {
        const res = await api.put(`/categories/${editingCat._id}`, catForm);
        savedCat = res.data;
      } else {
        const res = await api.post('/categories', catForm);
        savedCat = res.data;
      }

      // Update categories list immediately so it's available in the select dropdown
      const categoriesRes = await api.get('/categories');
      setCategories(categoriesRes.data);

      // Auto-select in the quiz form if it's currently open
      if (showQuizModal && savedCat?._id) {
        setQuizForm(prev => ({ ...prev, category: savedCat._id }));
      }

      setShowCatModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving category');
    }
  };

  const handleCatDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await api.delete(`/categories/${id}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting category');
    }
  };

  if (loading) return <div className="flex-1 flex items-center justify-center"><Loader message="Loading administrator workspace..." /></div>;

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-dark-900 via-dark-900/40 to-transparent p-6 sm:p-8 rounded-3xl border border-dark-850 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Administrator Panel</h1>
          <p className="text-dark-300 text-sm mt-1">Manage categories, quizzes, questions and review user results.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-950/40 border border-red-900/30 text-red-400 p-4 rounded-2xl text-sm">
          {error}
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="glass-panel p-5 rounded-2xl flex items-center space-x-3.5">
          <div className="bg-blue-500/10 border border-blue-500/20 text-blue-400 p-3.5 rounded-xl"><Users className="h-5 w-5" /></div>
          <div><div className="text-[10px] text-dark-400 font-semibold uppercase">Total Users</div><div className="text-2xl font-bold text-white">{stats?.totalUsers || 0}</div></div>
        </div>
        <div className="glass-panel p-5 rounded-2xl flex items-center space-x-3.5">
          <div className="bg-primary-500/10 border border-primary-500/20 text-primary-400 p-3.5 rounded-xl"><BookOpen className="h-5 w-5" /></div>
          <div><div className="text-[10px] text-dark-400 font-semibold uppercase">Quizzes</div><div className="text-2xl font-bold text-white">{stats?.totalQuizzes || 0}</div></div>
        </div>
        <div className="glass-panel p-5 rounded-2xl flex items-center space-x-3.5">
          <div className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 p-3.5 rounded-xl"><Trophy className="h-5 w-5" /></div>
          <div><div className="text-[10px] text-dark-400 font-semibold uppercase">Attempts</div><div className="text-2xl font-bold text-white">{stats?.totalAttempts || 0}</div></div>
        </div>
        <div className="glass-panel p-5 rounded-2xl flex items-center space-x-3.5">
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3.5 rounded-xl"><Award className="h-5 w-5" /></div>
          <div><div className="text-[10px] text-dark-400 font-semibold uppercase">Pass Rate</div><div className="text-2xl font-bold text-white">{stats?.passRate || 0}%</div></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-dark-850 space-x-6 text-sm font-bold">
        <button
          onClick={() => setActiveTab('quizzes')}
          className={`pb-4 border-b-2 transition-colors ${
            activeTab === 'quizzes' ? 'border-primary-500 text-white' : 'border-transparent text-dark-400 hover:text-white'
          }`}
        >
          Manage Quizzes
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`pb-4 border-b-2 transition-colors ${
            activeTab === 'categories' ? 'border-primary-500 text-white' : 'border-transparent text-dark-400 hover:text-white'
          }`}
        >
          Manage Categories
        </button>
        <button
          onClick={() => setActiveTab('attempts')}
          className={`pb-4 border-b-2 transition-colors ${
            activeTab === 'attempts' ? 'border-primary-500 text-white' : 'border-transparent text-dark-400 hover:text-white'
          }`}
        >
          User Quiz Logs
        </button>
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === 'quizzes' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-primary-400" />
                <span>Quizzes</span>
              </h2>
              <button
                onClick={() => handleOpenQuizModal()}
                className="bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center space-x-1.5 shadow-lg shadow-primary-600/10 hover:scale-[1.02] transition-all"
              >
                <Plus className="h-4 w-4" />
                <span>Create Quiz</span>
              </button>
            </div>

            {quizzes.length === 0 ? (
              <div className="glass-panel p-8 rounded-2xl text-center text-dark-400 text-sm">No quizzes configured yet.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {quizzes.map((q) => (
                  <div key={q._id} className="glass-panel p-6 rounded-2xl flex flex-col justify-between h-full">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-primary-400 bg-primary-500/10 px-2 py-0.5 rounded border border-primary-500/20">
                          {q.category?.name}
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] uppercase font-bold text-dark-350">{q.difficulty}</span>
                          <button
                            onClick={() => handleToggleActive(q)}
                            className={`text-[9px] font-bold px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                              q.isActive
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                : 'bg-red-500/10 border-red-500/20 text-red-400'
                            }`}
                            title="Click to toggle active status"
                          >
                            {q.isActive ? 'Active' : 'Inactive'}
                          </button>
                        </div>
                      </div>
                      <h3 className="font-bold text-white text-lg">{q.title}</h3>
                      <p className="text-xs text-dark-300 line-clamp-3">{q.description}</p>
                    </div>

                    <div className="border-t border-dark-850 mt-5 pt-4 flex flex-col space-y-3.5">
                      <div className="flex justify-between text-[11px] text-dark-450 font-bold">
                        <span>{q.questionCount || 0} Questions</span>
                        <span>{Math.round(q.timeLimit / 60)} min</span>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={() => handleOpenQuizModal(q)}
                          className="p-2.5 bg-dark-900 border border-dark-800 text-dark-300 hover:text-white rounded-xl flex justify-center items-center"
                          title="Edit Info"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleQuizDelete(q._id)}
                          className="p-2.5 bg-dark-900 border border-dark-800 text-dark-300 hover:text-red-400 rounded-xl flex justify-center items-center"
                          title="Delete Quiz"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <Link
                          to={`/quiz/${q._id}/questions`}
                          className="p-2.5 bg-primary-600 text-white rounded-xl flex justify-center items-center font-bold text-xs hover:bg-primary-500"
                          title="Manage Questions"
                        >
                          <span>MCQs</span>
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <Folder className="h-5 w-5 text-indigo-400" />
                <span>Categories</span>
              </h2>
              <button
                onClick={() => handleOpenCatModal()}
                className="bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center space-x-1.5 shadow-lg shadow-primary-600/10 hover:scale-[1.02] transition-all"
              >
                <Plus className="h-4 w-4" />
                <span>Create Category</span>
              </button>
            </div>

            {categories.length === 0 ? (
              <div className="glass-panel p-8 rounded-2xl text-center text-dark-400 text-sm">No categories configured yet.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((c) => (
                  <div key={c._id} className="glass-panel p-6 rounded-2xl flex flex-col justify-between h-full">
                    <div className="space-y-2">
                      <h3 className="font-bold text-white text-lg">{c.name}</h3>
                      <p className="text-xs text-dark-300">{c.description}</p>
                    </div>

                    <div className="flex space-x-2 mt-5 pt-4 border-t border-dark-850">
                      <button
                        onClick={() => handleOpenCatModal(c)}
                        className="flex-1 py-2.5 bg-dark-900 border border-dark-800 text-dark-300 hover:text-white rounded-xl flex justify-center items-center space-x-1.5 text-xs font-semibold"
                      >
                        <Edit className="h-4 w-4" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleCatDelete(c._id)}
                        className="flex-1 py-2.5 bg-dark-900 border border-dark-800 text-dark-300 hover:text-red-400 rounded-xl flex justify-center items-center space-x-1.5 text-xs font-semibold"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'attempts' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-indigo-400" />
              <span>User Quiz Attempt Logs</span>
            </h2>

            {stats?.recentAttempts?.length === 0 ? (
              <div className="glass-panel p-8 rounded-2xl text-center text-dark-400 text-sm">No user attempts logged yet.</div>
            ) : (
              <div className="glass-panel rounded-2xl overflow-hidden border border-dark-850">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-dark-900 text-dark-400 border-b border-dark-850 uppercase font-bold tracking-wider">
                        <th className="p-4">User</th>
                        <th className="p-4">Quiz</th>
                        <th className="p-4">Date</th>
                        <th className="p-4">Score</th>
                        <th className="p-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-850 font-medium">
                      {stats?.recentAttempts?.map((a) => (
                        <tr key={a._id} className="hover:bg-dark-900/30 transition-colors">
                          <td className="p-4">
                            <div className="font-bold text-white">{a.user?.username || 'Guest'}</div>
                            <div className="text-[10px] text-dark-400 mt-0.5">{a.user?.email || 'N/A'}</div>
                          </td>
                          <td className="p-4 font-bold text-white">{a.quiz?.title || 'Deleted Quiz'}</td>
                          <td className="p-4 text-dark-300">{new Date(a.completedAt).toLocaleDateString()}</td>
                          <td className="p-4 font-bold text-white">{a.score}%</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              a.passed ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}>
                              {a.passed ? 'PASSED' : 'FAILED'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quiz Modal Form */}
      {showQuizModal && (
        <div className="fixed inset-0 z-55 flex items-center justify-center bg-dark-950/80 backdrop-blur-sm px-4">
          <form onSubmit={handleQuizSubmit} className="glass-panel p-8 rounded-3xl w-full max-w-lg border border-dark-800 space-y-5 shadow-2xl animate-fade-in">
            <h3 className="text-xl font-bold text-white">{editingQuiz ? 'Update Quiz Info' : 'Create New Quiz'}</h3>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-dark-200">Quiz Title</label>
                <input
                  type="text"
                  required
                  value={quizForm.title}
                  onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                  placeholder="e.g. JavaScript Fundamentals"
                  className="bg-dark-900 border border-dark-850 text-white w-full px-4 py-3 rounded-2xl text-xs focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-dark-200">Description</label>
                <textarea
                  required
                  value={quizForm.description}
                  onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })}
                  placeholder="Summarize the core topics covered..."
                  rows="3"
                  className="bg-dark-900 border border-dark-850 text-white w-full px-4 py-3 rounded-2xl text-xs focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-dark-200">Category</label>
                    <button
                      type="button"
                      onClick={() => handleOpenCatModal()}
                      className="text-[10px] font-bold text-primary-400 hover:text-primary-300 flex items-center space-x-1 cursor-pointer transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>+ Add Category</span>
                    </button>
                  </div>
                  <select
                    required
                    value={quizForm.category}
                    onChange={(e) => setQuizForm({ ...quizForm, category: e.target.value })}
                    className="bg-dark-900 border border-dark-850 text-white w-full px-4 py-3 rounded-2xl text-xs focus:outline-none focus:ring-1"
                  >
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-dark-200">Difficulty</label>
                  <select
                    value={quizForm.difficulty}
                    onChange={(e) => setQuizForm({ ...quizForm, difficulty: e.target.value })}
                    className="bg-dark-900 border border-dark-850 text-white w-full px-4 py-3 rounded-2xl text-xs focus:outline-none"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-dark-200">Time Limit (in seconds)</label>
                  <input
                    type="number"
                    required
                    min="10"
                    value={quizForm.timeLimit}
                    onChange={(e) => setQuizForm({ ...quizForm, timeLimit: parseInt(e.target.value) })}
                    className="bg-dark-900 border border-dark-850 text-white w-full px-4 py-3 rounded-2xl text-xs focus:outline-none focus:ring-1"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-dark-200">Pass Cut-off Percentage</label>
                  <input
                    type="number"
                    required
                    min="0"
                    max="100"
                    value={quizForm.passPercentage}
                    onChange={(e) => setQuizForm({ ...quizForm, passPercentage: parseInt(e.target.value) })}
                    className="bg-dark-900 border border-dark-850 text-white w-full px-4 py-3 rounded-2xl text-xs focus:outline-none focus:ring-1"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2 pt-1.5">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={quizForm.isActive}
                  onChange={(e) => setQuizForm({ ...quizForm, isActive: e.target.checked })}
                  className="h-4.5 w-4.5 rounded border-dark-850 text-primary-600 focus:ring-primary-500 bg-dark-900 cursor-pointer"
                />
                <label htmlFor="isActive" className="text-xs font-semibold text-dark-250 cursor-pointer">
                  Active (visible to candidates)
                </label>
              </div>
            </div>

            <div className="flex space-x-3 pt-4 border-t border-dark-850">
              <button
                type="button"
                onClick={() => setShowQuizModal(false)}
                className="flex-1 py-3 bg-dark-900 border border-dark-850 text-white rounded-2xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-primary-600 text-white rounded-2xl text-xs font-bold shadow-lg hover:bg-primary-500"
              >
                Save Quiz
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Category Modal Form */}
      {showCatModal && (
        <div className="fixed inset-0 z-55 flex items-center justify-center bg-dark-950/80 backdrop-blur-sm px-4">
          <form onSubmit={handleCatSubmit} className="glass-panel p-8 rounded-3xl w-full max-w-md border border-dark-800 space-y-5 shadow-2xl animate-fade-in">
            <h3 className="text-xl font-bold text-white">{editingCat ? 'Update Category' : 'Create Category'}</h3>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-dark-200">Category Name</label>
                <input
                  type="text"
                  required
                  value={catForm.name}
                  onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                  placeholder="e.g. Technology"
                  className="bg-dark-900 border border-dark-850 text-white w-full px-4 py-3 rounded-2xl text-xs focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-dark-200">Description</label>
                <textarea
                  required
                  value={catForm.description}
                  onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
                  placeholder="Briefly describe topics related to this category..."
                  rows="3"
                  className="bg-dark-900 border border-dark-850 text-white w-full px-4 py-3 rounded-2xl text-xs focus:outline-none"
                />
              </div>
            </div>

            <div className="flex space-x-3 pt-4 border-t border-dark-850">
              <button
                type="button"
                onClick={() => setShowCatModal(false)}
                className="flex-1 py-3 bg-dark-900 border border-dark-850 text-white rounded-2xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-primary-600 text-white rounded-2xl text-xs font-bold shadow-lg hover:bg-primary-500"
              >
                Save Category
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

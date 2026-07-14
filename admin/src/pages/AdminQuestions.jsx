import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../context/AuthContext';
import Loader from '../components/Loader';
import { ArrowLeft, Plus, Edit, Trash2, HelpCircle, Check, AlertCircle } from 'lucide-react';

const AdminQuestions = () => {
  const { id } = useParams(); // Quiz ID

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals state
  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [form, setForm] = useState({
    text: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctOptionIndex: 0,
    explanation: ''
  });

  const fetchData = async () => {
    try {
      const [quizRes, questionsRes] = await Promise.all([
        api.get(`/quizzes/${id}`),
        api.get(`/questions/quiz/${id}`)
      ]);
      setQuiz(quizRes.data);
      setQuestions(questionsRes.data);
    } catch (err) {
      setError('Failed to fetch quiz questions details.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleOpenModal = (q = null) => {
    if (q) {
      setEditingQuestion(q);
      setForm({
        text: q.text,
        optionA: q.options[0] || '',
        optionB: q.options[1] || '',
        optionC: q.options[2] || '',
        optionD: q.options[3] || '',
        correctOptionIndex: q.correctOptionIndex,
        explanation: q.explanation || ''
      });
    } else {
      setEditingQuestion(null);
      setForm({
        text: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        correctOptionIndex: 0,
        explanation: ''
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const options = [form.optionA, form.optionB, form.optionC, form.optionD].filter(o => o.trim() !== '');
    if (options.length < 2) {
      alert('A question must have at least 2 options.');
      return;
    }

    if (form.correctOptionIndex >= options.length) {
      alert('Correct option index is out of bounds for the number of options entered.');
      return;
    }

    const payload = {
      text: form.text,
      options,
      correctOptionIndex: parseInt(form.correctOptionIndex),
      explanation: form.explanation,
      quizId: id
    };

    try {
      if (editingQuestion) {
        await api.put(`/questions/${editingQuestion._id}`, payload);
      } else {
        await api.post('/questions', payload);
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving question');
    }
  };

  const handleDelete = async (questionId) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    try {
      await api.delete(`/questions/${questionId}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting question');
    }
  };

  if (loading) return <div className="flex-1 flex items-center justify-center"><Loader message="Loading quiz MCQs list..." /></div>;

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 space-y-8 animate-fade-in">
      {/* Back button to Admin Panel dashboard (which is / in this admin-specific app) */}
      <Link
        to="/"
        className="inline-flex items-center space-x-2 text-dark-300 hover:text-white transition-colors group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium">Back to Admin Dashboard</span>
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-dark-900 via-dark-900/40 to-transparent p-6 rounded-2xl border border-dark-850">
        <div>
          <span className="text-[10px] font-bold text-primary-400 bg-primary-500/10 px-2 py-0.5 rounded border border-primary-500/20">
            {quiz?.category?.name}
          </span>
          <h1 className="text-2xl font-extrabold text-white mt-2">Manage Questions</h1>
          <p className="text-xs text-dark-300 mt-1">Quiz: <span className="font-semibold text-white">{quiz?.title}</span></p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center space-x-1.5 shadow-lg shadow-primary-600/10 hover:scale-[1.02] transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Add Question</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-950/40 border border-red-900/30 text-red-400 p-4 rounded-2xl text-xs">
          {error}
        </div>
      )}

      {/* Questions list */}
      <div className="space-y-4">
        {questions.length === 0 ? (
          <div className="glass-panel p-12 rounded-3xl text-center space-y-3 max-w-md mx-auto">
            <HelpCircle className="h-10 w-10 text-dark-500 mx-auto" />
            <h3 className="text-base font-bold text-white">No questions yet</h3>
            <p className="text-xs text-dark-300">This quiz doesn't have any MCQs yet. Click "Add Question" to start building it.</p>
          </div>
        ) : (
          questions.map((q, idx) => (
            <div key={q._id} className="glass-panel p-6 rounded-3xl space-y-4 border border-dark-850">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-dark-400 uppercase">MCQ {idx + 1}</span>
                  <h3 className="font-bold text-white text-base leading-relaxed">{q.text}</h3>
                </div>
                <div className="flex space-x-2 flex-shrink-0">
                  <button
                    onClick={() => handleOpenModal(q)}
                    className="p-2 bg-dark-900 border border-dark-800 text-dark-300 hover:text-white rounded-lg"
                    title="Edit MCQ"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(q._id)}
                    className="p-2 bg-dark-900 border border-dark-800 text-dark-300 hover:text-red-400 rounded-lg"
                    title="Delete MCQ"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                {q.options.map((opt, optIdx) => {
                  const isCorrect = q.correctOptionIndex === optIdx;
                  return (
                    <div
                      key={optIdx}
                      className={`p-3 rounded-xl border text-xs font-semibold flex items-center space-x-2.5 ${
                        isCorrect
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : 'bg-dark-900 border-dark-850 text-dark-300'
                      }`}
                    >
                      <span className={`h-4.5 w-4.5 rounded flex items-center justify-center text-[9px] font-bold ${
                        isCorrect ? 'bg-emerald-500 text-white' : 'bg-dark-950 border border-dark-800 text-dark-450'
                      }`}>
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span className="flex-1">{opt}</span>
                      {isCorrect && <Check className="h-4 w-4 flex-shrink-0" />}
                    </div>
                  );
                })}
              </div>

              {/* Explanation */}
              {q.explanation && (
                <div className="bg-dark-900/60 border border-dark-850 p-4 rounded-xl text-xs text-dark-350">
                  <span className="font-bold text-white block mb-0.5">Explanation:</span>
                  <p className="leading-relaxed font-medium">{q.explanation}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Question Modal */}
      {showModal && (
        <div className="fixed inset-0 z-55 flex items-center justify-center bg-dark-950/80 backdrop-blur-sm px-4">
          <form onSubmit={handleSubmit} className="glass-panel p-8 rounded-3xl w-full max-w-lg border border-dark-800 space-y-4 shadow-2xl animate-fade-in">
            <h3 className="text-xl font-bold text-white">{editingQuestion ? 'Update Question' : 'Add Question'}</h3>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-dark-200">Question Text</label>
                <textarea
                  required
                  value={form.text}
                  onChange={(e) => setForm({ ...form, text: e.target.value })}
                  placeholder="e.g. Which of the following is NOT a JavaScript framework?"
                  rows="2"
                  className="bg-dark-900 border border-dark-850 text-white w-full px-4 py-3 rounded-2xl text-xs focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-dark-200 font-mono">Option A</label>
                  <input
                    type="text"
                    required
                    value={form.optionA}
                    onChange={(e) => setForm({ ...form, optionA: e.target.value })}
                    placeholder="e.g. React"
                    className="bg-dark-900 border border-dark-850 text-white w-full px-4 py-2.5 rounded-2xl text-xs focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-dark-200 font-mono">Option B</label>
                  <input
                    type="text"
                    required
                    value={form.optionB}
                    onChange={(e) => setForm({ ...form, optionB: e.target.value })}
                    placeholder="e.g. Angular"
                    className="bg-dark-900 border border-dark-850 text-white w-full px-4 py-2.5 rounded-2xl text-xs focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-dark-200 font-mono">Option C</label>
                  <input
                    type="text"
                    value={form.optionC}
                    onChange={(e) => setForm({ ...form, optionC: e.target.value })}
                    placeholder="e.g. Vue (Optional)"
                    className="bg-dark-900 border border-dark-850 text-white w-full px-4 py-2.5 rounded-2xl text-xs focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-dark-200 font-mono">Option D</label>
                  <input
                    type="text"
                    value={form.optionD}
                    onChange={(e) => setForm({ ...form, optionD: e.target.value })}
                    placeholder="e.g. MongoDB (Optional)"
                    className="bg-dark-900 border border-dark-850 text-white w-full px-4 py-2.5 rounded-2xl text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-dark-200">Correct Option</label>
                  <select
                    value={form.correctOptionIndex}
                    onChange={(e) => setForm({ ...form, correctOptionIndex: parseInt(e.target.value) })}
                    className="bg-dark-900 border border-dark-850 text-white w-full px-4 py-2.5 rounded-2xl text-xs focus:outline-none"
                  >
                    <option value="0">Option A</option>
                    <option value="1">Option B</option>
                    <option value="2">Option C</option>
                    <option value="3">Option D</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-dark-200">Explanation (Optional)</label>
                <textarea
                  value={form.explanation}
                  onChange={(e) => setForm({ ...form, explanation: e.target.value })}
                  placeholder="Explain why this option is correct..."
                  rows="2"
                  className="bg-dark-900 border border-dark-850 text-white w-full px-4 py-3 rounded-2xl text-xs focus:outline-none"
                />
              </div>
            </div>

            <div className="flex space-x-3 pt-3 border-t border-dark-850">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 bg-dark-900 border border-dark-850 text-white rounded-2xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-primary-600 text-white rounded-2xl text-xs font-bold shadow-lg hover:bg-primary-500"
              >
                Save MCQ
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminQuestions;

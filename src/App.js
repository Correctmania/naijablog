import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://szzflseeqnhjphmooqfp.supabase.co';
const supabaseKey = 'sb_publishable_KB4PTa3Zl6TNXcVL0jOL3g_ovbXv4Dd';
const supabase = createClient(supabaseUrl, supabaseKey);

function calculateReadTime(content) {
  if (!content) return '3 min';
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / 200);
  return `${minutes} min`;
}

function formatForDatetimeLocal(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  const pad = (n) => String(n).padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function App() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentArticle, setCurrentArticle] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Theme State
  const [darkMode, setDarkMode] = useState(false);
  
  // Reading Progress State
  const [scrollProgress, setScrollProgress] = useState(0);

  // Navigation & Admin State
  const [currentView, setCurrentView] = useState('home');
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminAuthenticated, setAdminAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const ADMIN_SECRET = 'admin123';

  // Form State
  const [editingId, setEditingId] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Economy');
  const [newAuthor, setNewAuthor] = useState('Idongesit');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [newExcerpt, setNewExcerpt] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newFeatured, setNewFeatured] = useState(false);
  const [newCustomDate, setNewCustomDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const articlesPerPage = 9;

  useEffect(() => {
    fetchArticles();

    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(progress);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  async function fetchArticles() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) console.error('Error fetching articles:', error.message);
      else setArticles(data || []);
    } catch (err) {
      console.error('Unexpected error:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (passwordInput === ADMIN_SECRET) {
      setAdminAuthenticated(true);
      setPasswordInput('');
    } else {
      alert('Incorrect admin password!');
      setPasswordInput('');
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Please choose an image smaller than 2MB.');
      return;
    }

    setUploadingImage(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewImageUrl(reader.result);
      setUploadingImage(false);
    };
    reader.onerror = () => {
      alert('Failed to read image file.');
      setUploadingImage(false);
    };
    reader.readAsDataURL(file);
  };

  const handleLike = async (art, e) => {
    e.stopPropagation();
    const currentLikes = art.likes || 0;
    const updatedLikes = currentLikes + 1;

    // Optimistic UI update
    setArticles(articles.map(a => a.id === art.id ? { ...a, likes: updatedLikes } : a));
    if (currentArticle && currentArticle.id === art.id) {
      setCurrentArticle({ ...currentArticle, likes: updatedLikes });
    }

    await supabase
      .from('articles')
      .update({ likes: updatedLikes })
      .eq('id', art.id);
  };

  const handleArticleClick = async (art) => {
    setCurrentArticle(art);
    window.scrollTo(0, 0);

    // Increment views counter
    const currentViews = art.views || 0;
    const updatedViews = currentViews + 1;
    
    setArticles(articles.map(a => a.id === art.id ? { ...a, views: updatedViews } : a));
    setCurrentArticle(prev => prev ? { ...prev, views: updatedViews } : prev);

    await supabase
      .from('articles')
      .update({ views: updatedViews })
      .eq('id', art.id);
  };

  const handleSaveArticle = async (e) => {
    e.preventDefault();
    if (!newTitle || !newContent) {
      alert('Please fill in at least the title and content.');
      return;
    }

    try {
      setSubmitting(true);
      const finalTimestamp = newCustomDate ? new Date(newCustomDate).toISOString() : new Date().toISOString();

      if (editingId) {
        const { error } = await supabase
          .from('articles')
          .update({
            title: newTitle,
            category: newCategory,
            author: newAuthor,
            image_url: newImageUrl,
            excerpt: newExcerpt,
            content: newContent,
            featured: newFeatured,
            created_at: finalTimestamp
          })
          .eq('id', editingId);

        if (error) alert('Error updating: ' + error.message);
        else {
          alert('Article updated successfully!');
          resetForm();
          fetchArticles();
        }
      } else {
        const { error } = await supabase.from('articles').insert([
          {
            title: newTitle,
            category: newCategory,
            author: newAuthor,
            image_url: newImageUrl,
            excerpt: newExcerpt,
            content: newContent,
            featured: newFeatured,
            created_at: finalTimestamp,
            likes: 0,
            views: 0
          }
        ]);

        if (error) alert('Error creating: ' + error.message);
        else {
          alert('Article published successfully!');
          resetForm();
          fetchArticles();
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (art) => {
    setEditingId(art.id);
    setNewTitle(art.title || '');
    setNewCategory(art.category || 'Economy');
    setNewAuthor(art.author || 'Idongesit');
    setNewImageUrl(art.image_url || '');
    setNewExcerpt(art.excerpt || '');
    setNewContent(art.content || '');
    setNewFeatured(art.featured || false);
    setNewCustomDate(formatForDatetimeLocal(art.created_at));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingId(null);
    setNewTitle('');
    setNewExcerpt('');
    setNewContent('');
    setNewImageUrl('');
    setNewFeatured(false);
    setNewCustomDate('');
  };

  const handleDeleteArticle = async (id) => {
    if (!window.confirm('Are you sure you want to delete this article?')) return;
    try {
      const { error } = await supabase.from('articles').delete().eq('id', id);
      if (error) alert('Error deleting: ' + error.message);
      else {
        if (editingId === id) resetForm();
        fetchArticles();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const categories = ['All', ...new Set(articles.map((item) => item.category).filter(Boolean))];

  const filteredArticles = articles.filter((article) => {
    const matchesCategory = selectedCategory === 'All' || article.category === selectedCategory;
    const matchesSearch = (article.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                          (article.content?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const indexOfLastArticle = currentPage * articlesPerPage;
  const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
  const currentArticles = filteredArticles.slice(indexOfFirstArticle, indexOfLastArticle);
  const totalPages = Math.ceil(filteredArticles.length / articlesPerPage);

  const featuredArticle = articles.find((art) => art.featured) || articles[0];
  const breakingNews = articles.slice(0, 10);

  const totalViewsAll = articles.reduce((acc, curr) => acc + (curr.views || 0), 0);
  const totalLikesAll = articles.reduce((acc, curr) => acc + (curr.likes || 0), 0);

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 flex flex-col justify-between ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900'}`}>
      
      {/* Reading Progress Bar */}
      {currentArticle && (
        <div className="fixed top-0 left-0 h-1 bg-blue-600 z-[100] transition-all duration-150" style={{ width: `${scrollProgress}%` }} />
      )}

      <style>{`
        @keyframes ticker {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
        .animate-ticker {
          display: flex;
          width: max-content;
          animation: ticker 60s linear infinite;
        }
        .animate-ticker:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div>
        {/* Ticker Bar */}
        <div className="bg-slate-900 text-slate-300 text-xs py-2.5 px-4 border-b border-slate-800 overflow-hidden flex items-center">
          <div className="bg-blue-600 text-white px-2.5 py-1 rounded font-bold uppercase tracking-wider text-[10px] shrink-0 z-10 mr-4 shadow-sm">
            LIVE FEED
          </div>
          <div className="overflow-hidden w-full relative">
            <div className="animate-ticker flex space-x-12 cursor-pointer items-center">
              {[...breakingNews, ...breakingNews].map((art, idx) => (
                <span 
                  key={idx} 
                  onClick={() => { setCurrentView('home'); setIsAdmin(false); handleArticleClick(art); }}
                  className="hover:text-blue-400 transition-colors flex items-center gap-2 whitespace-nowrap"
                >
                  <span className="text-blue-500 font-bold">&bull;</span> {art.title}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Header */}
        <header className={`border-b sticky top-0 z-50 backdrop-blur-md transition-colors ${darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200'}`}>
          <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="cursor-pointer text-center md:text-left flex items-center justify-between w-full md:w-auto" onClick={() => { setCurrentView('home'); setIsAdmin(false); setAdminAuthenticated(false); setCurrentArticle(null); setSelectedCategory('All'); window.scrollTo(0,0); }}>
              <div>
                <h1 className={`text-3xl md:text-4xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  Naijablog<span className="text-blue-600">.</span>
                </h1>
                <p className="text-slate-400 text-xs tracking-wider uppercase font-semibold mt-0.5">Journalism & Perspectives</p>
              </div>
              
              <button 
                onClick={() => setDarkMode(!darkMode)}
                className={`md:hidden p-2 rounded-full border text-xs font-bold ${darkMode ? 'bg-slate-800 border-slate-700 text-yellow-400' : 'bg-slate-100 border-slate-200 text-slate-700'}`}
              >
                {darkMode ? '☀️ Light' : '🌙 Dark'}
              </button>
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto justify-between">
              {currentView === 'home' && !isAdmin && (
                <div className="w-full md:w-80 relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">🔍</span>
                  <input
                    type="text"
                    placeholder="Search stories..."
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-full border text-sm transition-all focus:outline-none ${darkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-400 focus:border-blue-500' : 'bg-slate-100 border-transparent text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:bg-white shadow-inner'}`}
                  />
                </div>
              )}

              <button 
                onClick={() => setDarkMode(!darkMode)}
                className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold transition-all shadow-sm ${darkMode ? 'bg-slate-800 border-slate-700 text-yellow-400 hover:bg-slate-700' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'}`}
              >
                {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
              </button>
            </div>
          </div>

          {currentView === 'home' && !isAdmin && (
            <div className={`border-t px-6 py-2 transition-colors ${darkMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-100 bg-slate-50/50'}`}>
              <div className="max-w-7xl mx-auto flex flex-wrap gap-2 justify-center md:justify-start items-center">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => { setSelectedCategory(cat); setCurrentPage(1); setCurrentArticle(null); window.scrollTo(0,0); }}
                    className={`px-4 py-2 rounded-lg text-xs font-bold tracking-wide transition-all ${
                      selectedCategory === cat
                        ? 'bg-blue-600 text-white shadow-sm'
                        : darkMode 
                          ? 'text-slate-300 hover:bg-slate-800 hover:text-white' 
                          : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'
                    }`}
                  >
                    {cat.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          )}
        </header>

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-6 py-10">
          {loading ? (
            <div className="text-center py-32">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-3 border-blue-600 border-t-transparent mb-4"></div>
              <p className="text-slate-500 font-medium text-sm">Loading stories...</p>
            </div>
          ) : currentView === 'privacy' ? (
            <div className="max-w-3xl mx-auto py-6 space-y-6">
              <button onClick={() => { setCurrentView('home'); window.scrollTo(0,0); }} className="text-xs font-bold text-blue-500 hover:underline">&larr; Back to Home</button>
              <h2 className={`text-3xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>Privacy Policy for Naijablog</h2>
              <p className="text-sm text-slate-400">Last updated: September 2026</p>
              <div className={`prose max-w-none text-sm leading-relaxed space-y-4 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                <p>At Naijablog, accessible from naijablog.vercel.app, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by Naijablog and how we use it.</p>
              </div>
            </div>
          ) : currentView === 'terms' ? (
            <div className="max-w-3xl mx-auto py-6 space-y-6">
              <button onClick={() => { setCurrentView('home'); window.scrollTo(0,0); }} className="text-xs font-bold text-blue-500 hover:underline">&larr; Back to Home</button>
              <h2 className={`text-3xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>Terms of Service</h2>
              <p className="text-sm text-slate-400">Last updated: September 2026</p>
              <div className={`prose max-w-none text-sm leading-relaxed space-y-4 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                <p>Welcome to Naijablog! These terms and conditions outline the rules and regulations for the use of Naijablog's Website.</p>
              </div>
            </div>
          ) : currentView === 'contact' ? (
            <div className="max-w-3xl mx-auto py-6 space-y-6">
              <button onClick={() => { setCurrentView('home'); window.scrollTo(0,0); }} className="text-xs font-bold text-blue-500 hover:underline">&larr; Back to Home</button>
              <h2 className={`text-3xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>Contact Us</h2>
              <p className="text-sm text-slate-400">Get in touch with our team</p>
              <div className={`prose max-w-none text-sm leading-relaxed space-y-4 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                <p>We would love to hear from you! Reach out to our editorial team at <strong className={darkMode ? 'text-white' : 'text-slate-900'}>support@naijablog.vercel.app</strong>.</p>
              </div>
            </div>
          ) : isAdmin && !adminAuthenticated ? (
            <div className="max-w-md mx-auto py-16">
              <div className={`p-8 rounded-2xl border shadow-sm text-center ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  🔒
                </div>
                <h2 className={`text-xl font-black mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Admin Portal Login</h2>
                <p className="text-xs text-slate-400 mb-6">Enter your administrator passcode to access the dashboard.</p>
                
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <input
                    type="password"
                    required
                    placeholder="Enter administrator passcode"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border text-sm focus:outline-none focus:border-blue-500 text-center ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                  />
                  <button
                    type="submit"
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs uppercase tracking-wider transition-all"
                  >
                    Authenticate
                  </button>
                </form>

                <button
                  onClick={() => { setIsAdmin(false); setCurrentView('home'); }}
                  className="mt-6 text-xs text-slate-400 hover:text-white font-medium"
                >
                  &larr; Return to Homepage
                </button>
              </div>
            </div>
          ) : isAdmin && adminAuthenticated ? (
            <div className="max-w-4xl mx-auto">
              <div className={`flex justify-between items-center mb-8 pb-4 border-b ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                <div>
                  <h2 className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>Admin Dashboard</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Publish new stories, edit existing records, and manage content.</p>
                </div>
                <button 
                  onClick={() => { setIsAdmin(false); setAdminAuthenticated(false); setCurrentView('home'); }}
                  className="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-bold hover:bg-slate-700 transition-all border border-slate-700"
                >
                  &larr; Log Out & Exit
                </button>
              </div>

              {/* Analytics Quick Stats */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className={`p-4 rounded-xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <p className="text-xs text-slate-400 uppercase font-bold">Total Articles</p>
                  <p className="text-2xl font-black mt-1 text-blue-500">{articles.length}</p>
                </div>
                <div className={`p-4 rounded-xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <p className="text-xs text-slate-400 uppercase font-bold">Total Views</p>
                  <p className="text-2xl font-black mt-1 text-green-500">{totalViewsAll}</p>
                </div>
                <div className={`p-4 rounded-xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <p className="text-xs text-slate-400 uppercase font-bold">Total Likes</p>
                  <p className="text-2xl font-black mt-1 text-red-500">{totalLikesAll}</p>
                </div>
              </div>

              <form onSubmit={handleSaveArticle} className={`p-6 md:p-8 rounded-2xl border mb-12 shadow-sm space-y-6 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex justify-between items-center">
                  <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    {editingId ? '✏️ Edit Article' : '✨ Publish New Article'}
                  </h3>
                  {editingId && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="text-xs text-red-500 hover:underline font-semibold"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className={`block text-xs font-bold uppercase mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Article Title</label>
                    <input
                      type="text"
                      required
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="Enter headline..."
                      className={`w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:border-blue-500 ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-bold uppercase mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Category</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:border-blue-500 ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                    >
                      <option value="Economy">Economy</option>
                      <option value="Entertainment">Entertainment</option>
                      <option value="Politics">Politics</option>
                      <option value="Health">Health</option>
                      <option value="Technology">Technology</option>
                      <option value="Jobs">Jobs</option>
                      <option value="Tribe">Tribe</option>
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className={`block text-xs font-bold uppercase mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Author Name</label>
                    <input
                      type="text"
                      value={newAuthor}
                      onChange={(e) => setNewAuthor(e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:border-blue-500 ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-bold uppercase mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Upload Image File</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className={`w-full text-xs file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700 border rounded-lg cursor-pointer ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-white border-slate-300 text-slate-500'}`}
                    />
                    {uploadingImage && <p className="text-[11px] text-blue-400 mt-1 font-medium">Processing image...</p>}
                    {newImageUrl && (
                      <div className="mt-2 flex items-center gap-3">
                        <img src={newImageUrl} alt="Preview" className="w-12 h-12 object-cover rounded border border-slate-700" />
                        <span className="text-[11px] text-green-400 font-semibold">✓ Image loaded successfully</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className={`block text-xs font-bold uppercase mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Short Excerpt</label>
                    <input
                      type="text"
                      value={newExcerpt}
                      onChange={(e) => setNewExcerpt(e.target.value)}
                      placeholder="Brief summary..."
                      className={`w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:border-blue-500 ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-bold uppercase mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Custom Published Date & Time</label>
                    <input
                      type="datetime-local"
                      value={newCustomDate}
                      onChange={(e) => setNewCustomDate(e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:border-blue-500 ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-700'}`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-xs font-bold uppercase mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Full Content</label>
                  <textarea
                    required
                    rows="6"
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder="Write full article here..."
                    className={`w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:border-blue-500 ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                  ></textarea>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={newFeatured}
                    onChange={(e) => setNewFeatured(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-slate-700 focus:ring-blue-500"
                  />
                  <label htmlFor="featured" className={`text-xs font-bold uppercase ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Set as Featured Hero Story</label>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs uppercase tracking-wider transition-all shadow-sm"
                >
                  {submitting ? 'Saving...' : editingId ? 'Update Article' : 'Publish Article'}
                </button>
              </form>

              <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Manage Stories ({articles.length})</h3>
              <div className={`rounded-2xl border overflow-hidden shadow-sm ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className={`divide-y max-h-96 overflow-y-auto ${darkMode ? 'divide-slate-800' : 'divide-slate-100'}`}>
                  {articles.map((art) => (
                    <div key={art.id} className={`p-4 flex items-center justify-between gap-4 transition-colors ${darkMode ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}`}>
                      <div className="min-w-0 flex items-center gap-3">
                        {art.image_url && <img src={art.image_url} alt="" className="w-10 h-10 object-cover rounded shrink-0" />}
                        <div className="min-w-0">
                          <h4 className={`font-bold text-sm truncate ${darkMode ? 'text-white' : 'text-slate-900'}`}>{art.title}</h4>
                          <p className="text-xs text-slate-400">{art.category} &bull; 👁️ {art.views || 0} views &bull; ❤️ {art.likes || 0} likes</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleEditClick(art)}
                          className="px-3 py-1.5 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 rounded text-xs font-bold transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteArticle(art.id)}
                          className="px-3 py-1.5 bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded text-xs font-bold transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : currentArticle ? (
            <article className="max-w-3xl mx-auto py-4">
              <button 
                onClick={() => { setCurrentArticle(null); window.scrollTo(0,0); }}
                className="mb-8 text-blue-500 hover:text-blue-400 text-xs font-bold tracking-wider uppercase transition-colors flex items-center gap-2"
              >
                &larr; Back to all stories
              </button>

              <div className="flex items-center justify-between mb-4">
                <span className="inline-block text-xs font-bold text-blue-400 bg-blue-600/10 px-3 py-1 rounded-md uppercase tracking-widest border border-blue-500/20">
                  {currentArticle.category}
                </span>
                <div className="flex items-center gap-4 text-xs text-slate-400 font-semibold">
                  <span>👁️ {currentArticle.views || 1} views</span>
                  <button 
                    onClick={(e) => handleLike(currentArticle, e)}
                    className="flex items-center gap-1.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 px-3 py-1 rounded-full transition-colors border border-red-500/20"
                  >
                    ❤️ {currentArticle.likes || 0} Likes
                  </button>
                </div>
              </div>

              <h2 className={`text-3xl md:text-5xl font-extrabold mb-6 leading-tight tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                {currentArticle.title}
              </h2>

              <div className={`flex items-center justify-between text-xs text-slate-400 border-y py-4 mb-8 ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                <span>By <strong className={darkMode ? 'text-slate-200' : 'text-slate-800'}>{currentArticle.author || 'Editorial Team'}</strong></span>
                <span>{currentArticle.created_at ? new Date(currentArticle.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : ''} &bull; {calculateReadTime(currentArticle.content)}</span>
              </div>

              {currentArticle.image_url && (
                <div className={`mb-10 rounded-2xl overflow-hidden border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
                  <img src={currentArticle.image_url} alt={currentArticle.title} className="w-full object-cover max-h-[480px]" />
                </div>
              )}

              <div className={`prose max-w-none text-lg leading-relaxed space-y-6 whitespace-pre-line font-normal ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                {currentArticle.content}
              </div>

              {/* Social Share & Like Footer */}
              <div className={`mt-12 pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4 ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold uppercase text-slate-400">Enjoyed this story?</span>
                  <button 
                    onClick={(e) => handleLike(currentArticle, e)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition-all flex items-center gap-2 shadow-sm"
                  >
                    ❤️ Like Article ({currentArticle.likes || 0})
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase text-slate-400 mr-2">Share:</span>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      alert('Link copied to clipboard!');
                    }}
                    className={`px-3 py-1.5 rounded text-xs font-bold border transition-colors ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'}`}
                  >
                    🔗 Copy Link
                  </button>
                  <a 
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(currentArticle.title + ' - Read on Naijablog')}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-green-600 text-white rounded text-xs font-bold hover:bg-green-700 transition-colors"
                  >
                    WhatsApp
                  </a>
                  <a 
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(currentArticle.title)}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-sky-500 text-white rounded text-xs font-bold hover:bg-sky-600 transition-colors"
                  >
                    Twitter / X
                  </a>
                </div>
              </div>
            </article>
          ) : (
            <>
              {selectedCategory === 'All' && !searchQuery && featuredArticle && (
                <div 
                  onClick={() => handleArticleClick(featuredArticle)}
                  className={`mb-16 rounded-3xl overflow-hidden shadow-2xl grid md:grid-cols-2 cursor-pointer group transition-transform duration-300 hover:scale-[1.01] border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-900 text-white border-transparent'}`}
                >
                  <div className="p-8 md:p-12 flex flex-col justify-between">
                    <div>
                      <span className="inline-block px-3 py-1 text-[10px] font-bold bg-blue-600 text-white rounded-md mb-6 uppercase tracking-widest">
                        Featured Story
                      </span>
                      <h2 className="text-2xl md:text-4xl font-bold mb-4 group-hover:text-blue-400 transition-colors leading-snug text-white">
                        {featuredArticle.title}
                      </h2>
                      <p className="text-slate-400 mb-8 line-clamp-3 text-sm leading-relaxed">{featuredArticle.excerpt || featuredArticle.content}</p>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-800 pt-5">
                      <span className="text-slate-300">{featuredArticle.author || 'Editorial'} &bull; 👁️ {featuredArticle.views || 0}</span>
                      <span className="font-bold text-white group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">Read article &rarr;</span>
                    </div>
                  </div>
                  {featuredArticle.image_url ? (
                    <div className="h-72 md:h-auto bg-slate-800 overflow-hidden">
                      <img src={featuredArticle.image_url} alt={featuredArticle.title} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ) : (
                    <div className="bg-slate-800 flex items-center justify-center p-8 text-slate-500 italic">
                      Naijablog
                    </div>
                  )}
                </div>
              )}

              <div className={`flex justify-between items-center mb-8 border-b pb-4 ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                <h3 className={`text-xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  {selectedCategory === 'All' ? 'Latest Stories' : `${selectedCategory}`}
                </h3>
                <span className="text-xs text-slate-400 font-medium">
                  {filteredArticles.length} stories available
                </span>
              </div>

              {filteredArticles.length === 0 ? (
                <div className={`text-center py-20 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <p className="text-slate-400 text-sm">No stories found.</p>
                </div>
              ) : (
                <>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {currentArticles.map((article) => (
                      <article 
                        key={article.id} 
                        onClick={() => handleArticleClick(article)}
                        className={`rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer group shadow-sm hover:shadow-md ${darkMode ? 'bg-slate-900 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200/80 hover:border-slate-300'}`}
                      >
                        {article.image_url ? (
                          <div className={`h-48 overflow-hidden relative ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                            <img src={article.image_url} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          </div>
                        ) : (
                          <div className={`h-48 flex items-center justify-center text-xs font-semibold ${darkMode ? 'bg-slate-800 text-slate-500' : 'bg-slate-100 text-slate-400'}`}>
                            Naijablog
                          </div>
                        )}
                        <div className="p-6 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-[10px] font-bold text-blue-400 bg-blue-600/10 border border-blue-500/20 px-2.5 py-0.5 rounded uppercase tracking-wider">
                                {article.category || 'General'}
                              </span>
                              <span className="text-xs text-slate-400 font-medium">{calculateReadTime(article.content)}</span>
                            </div>
                            <h4 className={`font-bold text-base transition-colors line-clamp-2 leading-snug mb-2 ${darkMode ? 'text-white group-hover:text-blue-400' : 'text-slate-900 group-hover:text-blue-600'}`}>
                              {article.title}
                            </h4>
                            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                              {article.excerpt || article.content}
                            </p>
                          </div>
                          <div className={`flex items-center justify-between text-xs text-slate-400 border-t pt-4 mt-auto ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                            <span>👁️ {article.views || 0} &bull; ❤️ {article.likes || 0}</span>
                            <span className={`font-semibold ${darkMode ? 'text-white group-hover:text-blue-400' : 'text-slate-900 group-hover:text-blue-600'}`}>Read &rarr;</span>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-12">
                      <button
                        onClick={() => { setCurrentPage(prev => Math.max(prev - 1, 1)); window.scrollTo(0,0); }}
                        disabled={currentPage === 1}
                        className={`px-4 py-2 disabled:opacity-50 rounded-lg text-xs font-bold transition-colors ${darkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-800 hover:bg-slate-200'}`}
                      >
                        Previous
                      </button>
                      <span className="text-xs font-medium text-slate-400 px-3">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        onClick={() => { setCurrentPage(prev => Math.min(prev + 1, totalPages)); window.scrollTo(0,0); }}
                        disabled={currentPage === totalPages}
                        className={`px-4 py-2 disabled:opacity-50 rounded-lg text-xs font-bold transition-colors ${darkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-800 hover:bg-slate-200'}`}
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className={`text-xs border-t mt-20 ${darkMode ? 'bg-slate-900 text-slate-400 border-slate-800' : 'bg-slate-900 text-slate-400 border-slate-800'}`}>
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h2 className="text-lg font-black text-white mb-1">Naijablog<span className="text-blue-600">.</span></h2>
            <p className="text-slate-500">Journalism & Perspectives across Nigeria.</p>
          </div>
          <div className="flex flex-wrap gap-6 text-slate-300 font-medium">
            <button onClick={() => { setCurrentView('home'); setIsAdmin(true); window.scrollTo(0,0); }} className="hover:text-blue-400 transition-colors">Admin Portal</button>
            <button onClick={() => { setCurrentView('privacy'); window.scrollTo(0,0); }} className="hover:text-blue-400 transition-colors">Privacy Policy</button>
            <button onClick={() => { setCurrentView('terms'); window.scrollTo(0,0); }} className="hover:text-blue-400 transition-colors">Terms of Service</button>
            <button onClick={() => { setCurrentView('contact'); window.scrollTo(0,0); }} className="hover:text-blue-400 transition-colors">Contact Us</button>
          </div>
        </div>
        <div className="border-t border-slate-800/80 py-6 text-center text-slate-500 text-[11px]">
          &copy; {new Date().getFullYear()} Naijablog. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default App;
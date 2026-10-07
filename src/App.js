import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import ContactForm from './ContactForm';

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
  const [copiedRef, setCopiedRef] = useState(false);

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

  // Handle URL parameters for direct unique article links & browser back/forward buttons
  useEffect(() => {
    const handleUrlRoute = () => {
      const params = new URLSearchParams(window.location.search);
      const articleId = params.get('id');
      const viewParam = params.get('view');

      if (articleId && articles.length > 0) {
        const found = articles.find(a => String(a.id) === String(articleId));
        if (found) {
          setCurrentArticle(found);
          incrementViewsSilently(found);
        } else {
          setCurrentArticle(null);
        }
      } else if (viewParam === 'admin') {
        setCurrentView('home');
        setIsAdmin(true);
        setCurrentArticle(null);
      } else if (viewParam === 'privacy' || viewParam === 'terms' || viewParam === 'contact') {
        setCurrentView(viewParam);
        setCurrentArticle(null);
      } else {
        setCurrentArticle(null);
        setIsAdmin(false);
      }
    };

    if (!loading) {
      handleUrlRoute();
    }

    const onPopState = () => {
      const params = new URLSearchParams(window.location.search);
      const articleId = params.get('id');
      if (articleId && articles.length > 0) {
        const found = articles.find(a => String(a.id) === String(articleId));
        if (found) setCurrentArticle(found);
      } else {
        setCurrentArticle(null);
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [loading, articles]);

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

  async function incrementViewsSilently(art) {
    const currentViews = art.views || 0;
    const updatedViews = currentViews + 1;
    
    setArticles(prev => prev.map(a => a.id === art.id ? { ...a, views: updatedViews } : a));
    
    await supabase
      .from('articles')
      .update({ views: updatedViews })
      .eq('id', art.id);
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

    setArticles(articles.map(a => a.id === art.id ? { ...a, likes: updatedLikes } : a));
    if (currentArticle && currentArticle.id === art.id) {
      setCurrentArticle({ ...currentArticle, likes: updatedLikes });
    }

    await supabase
      .from('articles')
      .update({ likes: updatedLikes })
      .eq('id', art.id);
  };

  const handleArticleClick = (art) => {
    setCurrentArticle(art);
    window.scrollTo(0, 0);

    const newUrl = `${window.location.pathname}?id=${art.id}`;
    window.history.pushState({ id: art.id }, '', newUrl);

    incrementViewsSilently(art);
  };

  const handleBackToHome = () => {
    setCurrentArticle(null);
    setIsAdmin(false);
    setCurrentView('home');
    window.history.pushState({}, '', window.location.pathname);
    window.scrollTo(0, 0);
  };

  const navigateToView = (viewName) => {
    setCurrentArticle(null);
    if (viewName === 'admin') {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
      setCurrentView(viewName);
    }
    window.history.pushState({}, '', `${window.location.pathname}?view=${viewName}`);
    window.scrollTo(0, 0);
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

  const getReferralLink = (artId) => {
    const refId = Math.random().toString(36).substring(2, 8);
    return `${window.location.origin}${window.location.pathname}?id=${artId}&ref=${refId}`;
  };

  const handleCopyReferral = (artId) => {
    const link = getReferralLink(artId);
    navigator.clipboard.writeText(link);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2500);
  };

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
                  onClick={() => handleArticleClick(art)}
                  className="hover:text-blue-400 transition-colors flex items-center gap-2 whitespace-nowrap"
                >
                  <span className="text-blue-500 font-bold">&bull;</span> {art.title}
                  <span className="text-slate-500 text-[10px] ml-1">({art.views || 0} views)</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Header */}
        <header className={`border-b sticky top-0 z-50 backdrop-blur-md transition-colors ${darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200'}`}>
          <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="cursor-pointer text-center md:text-left flex items-center justify-between w-full md:w-auto" onClick={handleBackToHome}>
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
              {currentView === 'home' && !isAdmin && !currentArticle && (
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

          {currentView === 'home' && !isAdmin && !currentArticle && (
            <div className={`border-t px-6 py-2 transition-colors ${darkMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-100 bg-slate-50/50'}`}>
              <div className="max-w-7xl mx-auto flex flex-wrap gap-2 justify-center md:justify-start items-center">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => { setSelectedCategory(cat); setCurrentPage(1); window.scrollTo(0,0); }}
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
              <button onClick={handleBackToHome} className="text-xs font-bold text-blue-500 hover:underline">&larr; Back to Home</button>
              <h2 className={`text-3xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>Privacy Policy for Naijablog</h2>
              <p className="text-sm text-slate-400">Last updated: September 2026</p>
              <div className={`prose max-w-none text-sm leading-relaxed space-y-4 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                <p>At Naijablog, accessible from naijablog.vercel.app, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by Naijablog and how we use it.</p>
                <p>Google, as a third-party vendor, uses cookies to serve ads on our site. Google's use of advertising cookies enables it and its partners to serve ads to our users based on their visit to our sites and/or other sites on the Internet.</p>
              </div>
            </div>
          ) : currentView === 'terms' ? (
            <div className="max-w-3xl mx-auto py-6 space-y-6">
              <button onClick={handleBackToHome} className="text-xs font-bold text-blue-500 hover:underline">&larr; Back to Home</button>
              <h2 className={`text-3xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>Terms of Service</h2>
              <p className="text-sm text-slate-400">Last updated: September 2026</p>
              <div className={`prose max-w-none text-sm leading-relaxed space-y-4 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                <p>Welcome to Naijablog! These terms and conditions outline the rules and regulations for using our website.</p>
              </div>
            </div>
          ) : currentView === 'contact' ? (
            <ContactForm darkMode={darkMode} handleBackToHome={handleBackToHome} />
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
                  onClick={handleBackToHome}
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
                  onClick={handleBackToHome}
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
                    {editingId ? '✏ Edit Article' : '✨ Publish New Article'}
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
                      <div className="min-w-0">
                        <p className={`text-sm font-bold truncate ${darkMode ? 'text-white' : 'text-slate-900'}`}>{art.title}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{art.category} • {new Date(art.created_at).toLocaleDateString()} • 👁️ {art.views || 0} views</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button onClick={() => handleEditClick(art)} className="px-3 py-1.5 bg-blue-600/10 text-blue-500 hover:bg-blue-600 hover:text-white rounded text-xs font-bold transition-all">Edit</button>
                        <button onClick={() => handleDeleteArticle(art.id)} className="px-3 py-1.5 bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white rounded text-xs font-bold transition-all">Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : currentArticle ? (
            /* Single Article Detailed View with Referral & AdSense slots */
            <div className="max-w-4xl mx-auto space-y-8">
              <button onClick={handleBackToHome} className="text-xs font-bold text-blue-500 hover:underline flex items-center gap-1">
                &larr; Back to all stories
              </button>

              <article className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-blue-600/10 text-blue-500 rounded-md text-xs font-bold uppercase tracking-wider">
                      {currentArticle.category}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(currentArticle.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-400">{calculateReadTime(currentArticle.content)} read</span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs font-bold text-green-500 flex items-center gap-1">
                      👁️ {currentArticle.views || 0} Visitors
                    </span>
                  </div>

                  <h1 className={`text-3xl md:text-5xl font-black leading-tight tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    {currentArticle.title}
                  </h1>

                  <div className="flex items-center justify-between border-y py-4 my-6 border-slate-800/10 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow">
                        {currentArticle.author ? currentArticle.author[0].toUpperCase() : 'I'}
                      </div>
                      <div>
                        <p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{currentArticle.author || 'Idongesit'}</p>
                        <p className="text-xs text-slate-400">Staff Writer & Editor</p>
                      </div>
                    </div>

                    <button 
                      onClick={(e) => handleLike(currentArticle, e)}
                      className={`px-4 py-2 rounded-full border text-xs font-bold flex items-center gap-2 transition-all ${darkMode ? 'bg-slate-900 border-slate-800 text-red-400 hover:bg-slate-800' : 'bg-slate-50 border-slate-200 text-red-600 hover:bg-slate-100'}`}
                    >
                      ❤️ {currentArticle.likes || 0} Likes
                    </button>
                  </div>
                </div>

                {currentArticle.image_url && (
                  <div className="rounded-2xl overflow-hidden shadow-md max-h-[500px] border border-slate-800/10 dark:border-slate-800">
                    <img src={currentArticle.image_url} alt={currentArticle.title} className="w-full h-full object-cover" />
                  </div>
                )}

                {/* Google AdSense In-Article Top Banner Slot */}
                <div className={`p-4 rounded-xl border text-center text-xs text-slate-400 border-dashed ${darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="block font-semibold uppercase tracking-wider text-[10px] text-blue-500 mb-1">Sponsored Advertisement</span>
                  <ins className="adsbygoogle" style={{display:'block'}} data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" data-ad-slot="XXXXXXXXXX" data-ad-format="auto" data-full-width-responsive="true"></ins>
                  <p className="italic">Advertisement Space (Google AdSense Responsive Unit)</p>
                </div>

                {/* Article Content */}
                <div className={`prose max-w-none text-base md:text-lg leading-relaxed space-y-6 whitespace-pre-line ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  {currentArticle.content}
                </div>

                {/* Referral Link Sharing Box */}
                <div className={`p-6 rounded-2xl border space-y-4 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-blue-50/50 border-blue-100'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className={`text-sm font-black uppercase tracking-wider ${darkMode ? 'text-white' : 'text-slate-900'}`}>🔗 Share & Earn Referral Link</h4>
                      <p className="text-xs text-slate-400 mt-0.5">Copy this unique article referral link to share with friends and track visits.</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      readOnly 
                      value={getReferralLink(currentArticle.id)} 
                      className={`w-full px-3 py-2 rounded-lg border text-xs font-mono select-all ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-white border-slate-300 text-slate-600'}`}
                    />
                    <button 
                      onClick={() => handleCopyReferral(currentArticle.id)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs shrink-0 transition-all shadow-sm"
                    >
                      {copiedRef ? '✓ Copied!' : 'Copy Link'}
                    </button>
                  </div>
                </div>

                {/* Google AdSense Footer Banner Slot */}
                <div className={`p-4 rounded-xl border text-center text-xs text-slate-400 border-dashed ${darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="block font-semibold uppercase tracking-wider text-[10px] text-blue-500 mb-1">Sponsored Advertisement</span>
                  <p className="italic">Advertisement Space (Google AdSense Multiplex Unit)</p>
                </div>
              </article>
            </div>
          ) : (
            /* Home Feed View */
            <div className="space-y-12">
              {/* Featured Hero Story */}
              {featuredArticle && selectedCategory === 'All' && searchQuery === '' && (
                <div 
                  onClick={() => handleArticleClick(featuredArticle)}
                  className={`group cursor-pointer rounded-3xl border overflow-hidden grid md:grid-cols-2 gap-0 transition-all shadow-sm hover:shadow-md ${darkMode ? 'bg-slate-900 border-slate-800 hover:border-slate-700' : 'bg-slate-50 border-slate-200 hover:border-slate-300'}`}
                >
                  {featuredArticle.image_url ? (
                    <div className="h-64 md:h-full min-h-[300px] overflow-hidden">
                      <img src={featuredArticle.image_url} alt={featuredArticle.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  ) : (
                    <div className="h-64 md:h-full bg-blue-600/10 flex items-center justify-center">
                      <span className="text-4xl">📰</span>
                    </div>
                  )}

                  <div className="p-8 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-3 py-1 bg-blue-600 text-white rounded-md text-[10px] font-bold uppercase tracking-wider">
                          ★ Featured Story
                        </span>
                        <span className="text-xs text-green-500 font-bold">👁️ {featuredArticle.views || 0} views</span>
                      </div>
                      <h2 className={`text-2xl md:text-3xl font-black tracking-tight group-hover:text-blue-500 transition-colors ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                        {featuredArticle.title}
                      </h2>
                      <p className={`text-sm leading-relaxed line-clamp-3 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        {featuredArticle.excerpt || featuredArticle.content}
                      </p>
                    </div>

                    <div className={`flex items-center justify-between pt-4 border-t text-xs ${darkMode ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                      <span>By {featuredArticle.author || 'Idongesit'}</span>
                      <span className="font-bold text-blue-500 group-hover:underline">Read Full Story &rarr;</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Article Grid */}
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className={`text-xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    {selectedCategory === 'All' ? 'Latest Stories' : `${selectedCategory} Articles`}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">Showing {filteredArticles.length} results</p>
                </div>

                {filteredArticles.length === 0 ? (
                  <div className="text-center py-20">
                    <p className="text-slate-400 text-sm">No stories found matching your criteria.</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-3 gap-6">
                    {currentArticles.map((art) => (
                      <div 
                        key={art.id}
                        onClick={() => handleArticleClick(art)}
                        className={`group cursor-pointer rounded-2xl border overflow-hidden flex flex-col justify-between transition-all hover:-translate-y-1 shadow-sm hover:shadow-md ${darkMode ? 'bg-slate-900 border-slate-800 hover:border-slate-700' : 'bg-slate-50 border-slate-200 hover:border-slate-300'}`}
                      >
                        <div>
                          {art.image_url ? (
                            <div className="h-48 overflow-hidden">
                              <img src={art.image_url} alt={art.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            </div>
                          ) : (
                            <div className="h-48 bg-slate-800/10 flex items-center justify-center">
                              <span className="text-2xl">📝</span>
                            </div>
                          )}

                          <div className="p-6 space-y-3">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-blue-500 uppercase tracking-wider">{art.category}</span>
                              <span className="text-green-500 font-bold">👁️ {art.views || 0} views</span>
                            </div>

                            <h4 className={`text-lg font-bold leading-snug group-hover:text-blue-500 transition-colors line-clamp-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                              {art.title}
                            </h4>

                            <p className={`text-xs leading-relaxed line-clamp-2 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                              {art.excerpt || art.content}
                            </p>
                          </div>
                        </div>

                        <div className={`p-6 pt-0 flex items-center justify-between text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                          <span>{new Date(art.created_at).toLocaleDateString()}</span>
                          <span className="font-bold text-blue-500 group-hover:underline">Read &rarr;</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-10">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                      <button
                        key={pageNumber}
                        onClick={() => { setCurrentPage(pageNumber); window.scrollTo({ top: 400, behavior: 'smooth' }); }}
                        className={`w-10 h-10 rounded-lg text-xs font-bold transition-all ${
                          currentPage === pageNumber
                            ? 'bg-blue-600 text-white shadow-sm'
                            : darkMode ? 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className={`border-t mt-20 transition-colors ${darkMode ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h2 className={`text-xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              Naijablog<span className="text-blue-600">.</span>
            </h2>
            <p className="text-xs mt-1">Independent Nigerian Journalism, Culture, and Perspectives.</p>
          </div>

          <div className="flex flex-wrap gap-6 text-xs font-bold uppercase tracking-wider">
            <button onClick={handleBackToHome} className="hover:text-blue-500 transition-colors">Home</button>
            <button onClick={() => navigateToView('contact')} className="hover:text-blue-500 transition-colors">Contact</button>
            <button onClick={() => navigateToView('privacy')} className="hover:text-blue-500 transition-colors">Privacy Policy</button>
            <button onClick={() => navigateToView('terms')} className="hover:text-blue-500 transition-colors">Terms</button>
            <button onClick={() => navigateToView('admin')} className="text-blue-500 hover:underline">Admin Portal</button>
          </div>
        </div>

        <div className={`border-t py-6 text-center text-xs ${darkMode ? 'border-slate-800/60 text-slate-500' : 'border-slate-200/60 text-slate-400'}`}>
          &copy; {new Date().getFullYear()} Naijablog. All rights reserved. Built with React & Supabase.
        </div>
      </footer>
    </div>
  );
}

export default App;
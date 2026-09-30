import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://szzflseeqnhjphmooqfp.supabase.co';
const supabaseKey = 'sb_publishable_KB4PTa3Zl6TNXcVL0jOL3g_ovbXv4Dd';
const supabase = createClient(supabaseUrl, supabaseKey);

function App() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentArticle, setCurrentArticle] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Page Navigation State ('home', 'admin', 'privacy', 'terms', 'contact')
  const [currentView, setCurrentView] = useState('home');

  // Admin & Security State
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminAuthenticated, setAdminAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const ADMIN_SECRET = 'admin123';

  // New/Edit Article Form State
  const [editingId, setEditingId] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Economy');
  const [newAuthor, setNewAuthor] = useState('Idongesit');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [newExcerpt, setNewExcerpt] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newFeatured, setNewFeatured] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const articlesPerPage = 9;

  useEffect(() => {
    fetchArticles();
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
      alert('Please choose an image smaller than 2MB for optimal performance.');
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

  const handleSaveArticle = async (e) => {
    e.preventDefault();
    if (!newTitle || !newContent) {
      alert('Please fill in at least the title and content.');
      return;
    }

    try {
      setSubmitting(true);

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
            featured: newFeatured
          })
          .eq('id', editingId);

        if (error) {
          alert('Error updating article: ' + error.message);
        } else {
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
            created_at: new Date().toISOString()
          }
        ]);

        if (error) {
          alert('Error creating article: ' + error.message);
        } else {
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingId(null);
    setNewTitle('');
    setNewExcerpt('');
    setNewContent('');
    setNewImageUrl('');
    setNewFeatured(false);
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

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-600 selection:text-white flex flex-col justify-between">
      
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
                  onClick={() => { setCurrentView('home'); setIsAdmin(false); setCurrentArticle(art); window.scrollTo(0,0); }}
                  className="hover:text-blue-400 transition-colors flex items-center gap-2 whitespace-nowrap"
                >
                  <span className="text-blue-500 font-bold">&bull;</span> {art.title}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50 backdrop-blur-md bg-white/90">
          <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="cursor-pointer text-center md:text-left" onClick={() => { setCurrentView('home'); setIsAdmin(false); setAdminAuthenticated(false); setCurrentArticle(null); setSelectedCategory('All'); window.scrollTo(0,0); }}>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">
                Naijablog<span className="text-blue-600">.</span>
              </h1>
              <p className="text-slate-500 text-xs tracking-wider uppercase font-semibold mt-0.5">Journalism & Perspectives</p>
            </div>

            {currentView === 'home' && !isAdmin && (
              <div className="w-full md:w-80 relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">🔍</span>
                <input
                  type="text"
                  placeholder="Search stories..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-10 pr-4 py-2.5 rounded-full bg-slate-100 text-slate-900 placeholder-slate-400 border border-transparent focus:border-blue-600 focus:bg-white focus:outline-none text-sm transition-all shadow-inner"
                />
              </div>
            )}
          </div>

          {currentView === 'home' && !isAdmin && (
            <div className="border-t border-slate-100 px-6 py-2 bg-slate-50/50">
              <div className="max-w-7xl mx-auto flex flex-wrap gap-2 justify-center md:justify-start items-center">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => { setSelectedCategory(cat); setCurrentPage(1); setCurrentArticle(null); window.scrollTo(0,0); }}
                    className={`px-4 py-2 rounded-lg text-xs font-bold tracking-wide transition-all ${
                      selectedCategory === cat
                        ? 'bg-slate-900 text-white shadow-sm'
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
              <button onClick={() => { setCurrentView('home'); window.scrollTo(0,0); }} className="text-xs font-bold text-blue-600 hover:underline">&larr; Back to Home</button>
              <h2 className="text-3xl font-black text-slate-900">Privacy Policy for Naijablog</h2>
              <p className="text-sm text-slate-500">Last updated: September 2026</p>
              <div className="prose max-w-none text-slate-700 text-sm leading-relaxed space-y-4">
                <p>At Naijablog, accessible from naijablog.vercel.app, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by Naijablog and how we use it.</p>
                <h3 className="text-lg font-bold text-slate-900 pt-2">Log Files</h3>
                <p>Naijablog follows a standard procedure of using log files. These files log visitors when they visit websites. The information collected includes internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks.</p>
                <h3 className="text-lg font-bold text-slate-900 pt-2">Google DoubleClick DART Cookie</h3>
                <p>Google is one of a third-party vendor on our site. It also uses cookies, known as DART cookies, to serve ads to our site visitors based upon their visit to our website and other sites on the internet.</p>
              </div>
            </div>
          ) : currentView === 'terms' ? (
            <div className="max-w-3xl mx-auto py-6 space-y-6">
              <button onClick={() => { setCurrentView('home'); window.scrollTo(0,0); }} className="text-xs font-bold text-blue-600 hover:underline">&larr; Back to Home</button>
              <h2 className="text-3xl font-black text-slate-900">Terms of Service</h2>
              <p className="text-sm text-slate-500">Last updated: September 2026</p>
              <div className="prose max-w-none text-slate-700 text-sm leading-relaxed space-y-4">
                <p>Welcome to Naijablog! These terms and conditions outline the rules and regulations for the use of Naijablog's Website.</p>
                <p>By accessing this website we assume you accept these terms and conditions. Do not continue to use Naijablog if you do not agree to all of the terms and conditions stated on this page.</p>
                <h3 className="text-lg font-bold text-slate-900 pt-2">License</h3>
                <p>Unless otherwise stated, Naijablog and/or its licensors own the intellectual property rights for all material on Naijablog. All intellectual property rights are reserved.</p>
              </div>
            </div>
          ) : currentView === 'contact' ? (
            <div className="max-w-3xl mx-auto py-6 space-y-6">
              <button onClick={() => { setCurrentView('home'); window.scrollTo(0,0); }} className="text-xs font-bold text-blue-600 hover:underline">&larr; Back to Home</button>
              <h2 className="text-3xl font-black text-slate-900">Contact Us</h2>
              <p className="text-sm text-slate-500">Get in touch with our team</p>
              <div className="prose max-w-none text-slate-700 text-sm leading-relaxed space-y-4">
                <p>We would love to hear from you! If you have any questions, feedback, content suggestions, or partnership inquiries regarding Naijablog, please reach out to our editorial team.</p>
                <p>You can send us an email directly at <strong className="text-slate-900">support@naijablog.vercel.app</strong> or reach out through our official social media channels. We strive to respond within 24 to 48 hours.</p>
              </div>
            </div>
          ) : isAdmin && !adminAuthenticated ? (
            <div className="max-w-md mx-auto py-16">
              <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 shadow-sm text-center">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  🔒
                </div>
                <h2 className="text-xl font-black text-slate-900 mb-2">Admin Portal Login</h2>
                <p className="text-xs text-slate-500 mb-6">Enter your administrator passcode to access the dashboard.</p>
                
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <input
                    type="password"
                    required
                    placeholder="Enter passcode (admin123)"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-white border border-slate-300 text-sm focus:outline-none focus:border-blue-600 text-center"
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
                  className="mt-6 text-xs text-slate-500 hover:text-slate-900 font-medium"
                >
                  &larr; Return to Homepage
                </button>
              </div>
            </div>
          ) : isAdmin && adminAuthenticated ? (
            <div className="max-w-4xl mx-auto">
              <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-200">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Admin Dashboard</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Publish new stories, edit existing records, and manage content.</p>
                </div>
                <button 
                  onClick={() => { setIsAdmin(false); setAdminAuthenticated(false); setCurrentView('home'); }}
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-all"
                >
                  &larr; Log Out & Exit
                </button>
              </div>

              <form onSubmit={handleSaveArticle} className="bg-slate-50 p-6 md:p-8 rounded-2xl border border-slate-200 mb-12 shadow-sm space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-slate-900">
                    {editingId ? '✏️ Edit Article' : '✨ Publish New Article'}
                  </h3>
                  {editingId && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="text-xs text-red-600 hover:underline font-semibold"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Article Title</label>
                    <input
                      type="text"
                      required
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="Enter headline..."
                      className="w-full px-4 py-2.5 rounded-lg bg-white border border-slate-300 text-sm focus:outline-none focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Category</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg bg-white border border-slate-300 text-sm focus:outline-none focus:border-blue-600"
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
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Author Name</label>
                    <input
                      type="text"
                      value={newAuthor}
                      onChange={(e) => setNewAuthor(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg bg-white border border-slate-300 text-sm focus:outline-none focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Upload Image File</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 bg-white border border-slate-300 rounded-lg cursor-pointer"
                    />
                    {uploadingImage && <p className="text-[11px] text-blue-600 mt-1 font-medium">Processing image...</p>}
                    {newImageUrl && (
                      <div className="mt-2 flex items-center gap-3">
                        <img src={newImageUrl} alt="Preview" className="w-12 h-12 object-cover rounded border border-slate-200" />
                        <span className="text-[11px] text-green-600 font-semibold">✓ Image loaded successfully</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Short Excerpt</label>
                  <input
                    type="text"
                    value={newExcerpt}
                    onChange={(e) => setNewExcerpt(e.target.value)}
                    placeholder="Brief summary..."
                    className="w-full px-4 py-2.5 rounded-lg bg-white border border-slate-300 text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Full Content</label>
                  <textarea
                    required
                    rows="6"
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder="Write full article here..."
                    className="w-full px-4 py-2.5 rounded-lg bg-white border border-slate-300 text-sm focus:outline-none focus:border-blue-600"
                  ></textarea>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={newFeatured}
                    onChange={(e) => setNewFeatured(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                  <label htmlFor="featured" className="text-xs font-bold text-slate-700 uppercase">Set as Featured Hero Story</label>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs uppercase tracking-wider transition-all shadow-sm"
                >
                  {submitting ? 'Saving...' : editingId ? 'Update Article' : 'Publish Article'}
                </button>
              </form>

              <h3 className="text-lg font-bold text-slate-900 mb-4">Manage Stories ({articles.length})</h3>
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                  {articles.map((art) => (
                    <div key={art.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                      <div className="min-w-0 flex items-center gap-3">
                        {art.image_url && <img src={art.image_url} alt="" className="w-10 h-10 object-cover rounded shrink-0" />}
                        <div className="min-w-0">
                          <h4 className="font-bold text-sm text-slate-900 truncate">{art.title}</h4>
                          <p className="text-xs text-slate-500">{art.category} &bull; {new Date(art.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleEditClick(art)}
                          className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded text-xs font-bold transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteArticle(art.id)}
                          className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded text-xs font-bold transition-colors"
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
                className="mb-8 text-slate-600 hover:text-blue-600 text-xs font-bold tracking-wider uppercase transition-colors flex items-center gap-2"
              >
                &larr; Back to all stories
              </button>

              <span className="inline-block text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-md mb-4 uppercase tracking-widest">
                {currentArticle.category}
              </span>

              <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight tracking-tight">
                {currentArticle.title}
              </h2>

              <div className="flex items-center justify-between text-xs text-slate-500 border-y border-slate-200 py-4 mb-8">
                <span>By <strong className="text-slate-800">{currentArticle.author || 'Editorial Team'}</strong></span>
                <span>{currentArticle.created_at ? new Date(currentArticle.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : ''} &bull; {currentArticle.read_time || '4 min read'}</span>
              </div>

              {currentArticle.image_url && (
                <div className="mb-10 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                  <img src={currentArticle.image_url} alt={currentArticle.title} className="w-full object-cover max-h-[480px]" />
                </div>
              )}

              <div className="prose max-w-none text-slate-700 text-lg leading-relaxed space-y-6 whitespace-pre-line font-normal">
                {currentArticle.content}
              </div>
            </article>
          ) : (
            <>
              {selectedCategory === 'All' && !searchQuery && featuredArticle && (
                <div 
                  onClick={() => { setCurrentArticle(featuredArticle); window.scrollTo(0,0); }}
                  className="mb-16 bg-slate-900 text-white rounded-3xl overflow-hidden shadow-2xl grid md:grid-cols-2 cursor-pointer group transition-transform duration-300 hover:scale-[1.01]"
                >
                  <div className="p-8 md:p-12 flex flex-col justify-between">
                    <div>
                      <span className="inline-block px-3 py-1 text-[10px] font-bold bg-blue-600 text-white rounded-md mb-6 uppercase tracking-widest">
                        Featured Story
                      </span>
                      <h2 className="text-2xl md:text-4xl font-bold mb-4 group-hover:text-blue-400 transition-colors leading-snug">
                        {featuredArticle.title}
                      </h2>
                      <p className="text-slate-400 mb-8 line-clamp-3 text-sm leading-relaxed">{featuredArticle.excerpt || featuredArticle.content}</p>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-800 pt-5">
                      <span>{featuredArticle.author || 'Editorial'}</span>
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

              <div className="flex justify-between items-center mb-8 border-b border-slate-200 pb-4">
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                  {selectedCategory === 'All' ? 'Latest Stories' : `${selectedCategory}`}
                </h3>
                <span className="text-xs text-slate-500 font-medium">
                  {filteredArticles.length} stories available
                </span>
              </div>

              {filteredArticles.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 rounded-2xl border border-slate-200">
                  <p className="text-slate-500 text-sm">No stories found.</p>
                </div>
              ) : (
                <>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {currentArticles.map((article) => (
                      <article 
                        key={article.id} 
                        onClick={() => { setCurrentArticle(article); window.scrollTo(0,0); }}
                        className="bg-white rounded-2xl border border-slate-200/80 hover:border-slate-300 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer group shadow-sm hover:shadow-md"
                      >
                        {article.image_url ? (
                          <div className="h-48 bg-slate-100 overflow-hidden relative">
                            <img src={article.image_url} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          </div>
                        ) : (
                          <div className="h-48 bg-slate-100 flex items-center justify-center text-slate-400 text-xs font-semibold">
                            Naijablog
                          </div>
                        )}
                        <div className="p-6 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded uppercase tracking-wider">
                                {article.category || 'General'}
                              </span>
                              <span className="text-[11px] text-slate-400">{article.read_time || '3 min'}</span>
                            </div>
                            <h4 className="font-bold text-base mb-2 text-slate-900 group-hover:text-blue-600 transition-colors leading-snug line-clamp-2">
                              {article.title}
                            </h4>
                            <p className="text-slate-500 text-xs mb-6 line-clamp-3 leading-relaxed">
                              {article.excerpt || article.content}
                            </p>
                          </div>
                          <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-[11px] text-slate-400">
                            <span>{article.author || 'Staff'}</span>
                            <span>{article.created_at ? new Date(article.created_at).toLocaleDateString() : ''}</span>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-3 mt-12">
                      <button
                        disabled={currentPage === 1}
                        onClick={() => { setCurrentPage(prev => Math.max(prev - 1, 1)); window.scrollTo(0,0); }}
                        className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 disabled:opacity-40 text-xs font-bold hover:bg-slate-50 transition-all"
                      >
                        Previous
                      </button>
                      <span className="text-xs text-slate-600 font-medium px-3">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        disabled={currentPage === totalPages}
                        onClick={() => { setCurrentPage(prev => Math.min(prev + 1, totalPages)); window.scrollTo(0,0); }}
                        className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 disabled:opacity-40 text-xs font-bold hover:bg-slate-50 transition-all"
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

      {/* Footer with Google AdSense Required Policy Links */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-12 text-xs">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <span className="text-white font-bold text-base">Naijablog<span className="text-blue-600">.</span></span>
            <p className="mt-1 text-slate-500">Clean, verified current affairs and news.</p>
          </div>
          <div className="flex flex-wrap gap-4 text-slate-400 font-medium items-center justify-center">
            <button onClick={() => { setCurrentView('home'); setIsAdmin(false); setSelectedCategory('All'); setCurrentArticle(null); window.scrollTo(0,0); }} className="hover:text-white transition-colors">Home</button>
            <span className="text-slate-700">&bull;</span>
            <button onClick={() => { setCurrentView('privacy'); window.scrollTo(0,0); }} className="hover:text-white transition-colors">Privacy Policy</button>
            <span className="text-slate-700">&bull;</span>
            <button onClick={() => { setCurrentView('terms'); window.scrollTo(0,0); }} className="hover:text-white transition-colors">Terms of Service</button>
            <span className="text-slate-700">&bull;</span>
            <button onClick={() => { setCurrentView('contact'); window.scrollTo(0,0); }} className="hover:text-white transition-colors">Contact Us</button>
            <span className="text-slate-700">&bull;</span>
            <button onClick={() => { setIsAdmin(true); setCurrentView('home'); window.scrollTo(0,0); }} className="text-blue-400 hover:text-blue-300 font-bold transition-colors">Admin Portal</button>
          </div>
          <div className="text-slate-500">
            &copy; {new Date().getFullYear()} Naijablog
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
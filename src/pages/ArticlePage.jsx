import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

export default function ArticlePage({ darkMode }) {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const articleId = slug?.split('-').pop();

  useEffect(() => {
    if (articleId) fetchArticle();
  }, [articleId]);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (totalHeight > 0) {
        setScrollProgress((window.scrollY / totalHeight) * 100);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  async function fetchArticle() {
    setLoading(true);
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('id', articleId)
      .single();

    if (error || !data) {
      navigate('/');
      return;
    }

    setArticle(data);
    incrementViews(data);
    setLoading(false);
    document.title = `${data.title} | Naijablog`;
  }

  async function incrementViews(art) {
    const updatedViews = (art.views || 0) + 1;
    await supabase
      .from('articles')
      .update({ views: updatedViews })
      .eq('id', art.id);
  }

  const handleLike = async () => {
    const updatedLikes = (article.likes || 0) + 1;
    setArticle({ ...article, likes: updatedLikes });
    await supabase
      .from('articles')
      .update({ likes: updatedLikes })
      .eq('id', article.id);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) return (
    <div className="text-center py-32">
      <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent mb-4"></div>
      <p className="text-slate-500 text-sm">Loading story...</p>
    </div>
  );

  if (!article) return null;

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900'}`}>
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 h-1 bg-blue-600 z-[100]" style={{ width: `${scrollProgress}%` }} />

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="text-xs font-bold text-blue-500 hover:underline flex items-center gap-1"
        >
          &larr; Back to all stories
        </button>

        <article className="space-y-6">
          {/* Category & Meta */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="px-3 py-1 bg-blue-600/10 text-blue-500 rounded-md text-xs font-bold uppercase">
              {article.category}
            </span>
            <span className="text-xs text-slate-400">
              {new Date(article.created_at).toLocaleDateString(undefined, {
                year: 'numeric', month: 'long', day: 'numeric'
              })}
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-400">{calculateReadTime(article.content)} read</span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-bold text-green-500">👁️ {article.views || 0} views</span>
          </div>

          {/* Title */}
          <h1 className={`text-3xl md:text-5xl font-black leading-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            {article.title}
          </h1>

          {/* Author & Like */}
          <div className={`flex items-center justify-between border-y py-4 ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm">
                {article.author ? article.author[0].toUpperCase() : 'N'}
              </div>
              <div>
                <p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  {article.author || 'Naijablog'}
                </p>
                <p className="text-xs text-slate-400">Staff Writer</p>
              </div>
            </div>
            <button
              onClick={handleLike}
              className={`px-4 py-2 rounded-full border text-xs font-bold ${darkMode ? 'bg-slate-900 border-slate-800 text-red-400' : 'bg-slate-50 border-slate-200 text-red-600'}`}
            >
              ❤️ {article.likes || 0} Likes
            </button>
          </div>

          {/* Featured Image */}
          {article.image_url && (
            <div className="rounded-2xl overflow-hidden max-h-[500px]">
              <img src={article.image_url} alt={article.title} className="w-full h-full object-cover" />
            </div>
          )}

          {/* AdSense Slot */}
          <div className={`p-4 rounded-xl border text-center text-xs text-slate-400 border-dashed ${darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <span className="block font-semibold uppercase text-[10px] text-blue-500 mb-1">Advertisement</span>
            <ins className="adsbygoogle"
              style={{ display: 'block' }}
              data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
              data-ad-slot="XXXXXXXXXX"
              data-ad-format="auto"
              data-full-width-responsive="true">
            </ins>
          </div>

          {/* Article Content */}
          <div className={`prose max-w-none text-base md:text-lg leading-relaxed whitespace-pre-line ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
            {article.content}
          </div>

          {/* Share Box */}
          <div className={`p-6 rounded-2xl border space-y-4 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-blue-50/50 border-blue-100'}`}>
            <h4 className={`text-sm font-black uppercase ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              🔗 Share this story
            </h4>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={window.location.href}
                className={`w-full px-3 py-2 rounded-lg border text-xs font-mono ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-white border-slate-300 text-slate-600'}`}
              />
              <button
                onClick={handleCopyLink}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs shrink-0"
              >
                {copied ? '✓ Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
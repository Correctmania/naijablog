import React from 'react';

export default function ArticlePage({ article, isAdmin }) {
  // Helper function to format the database timestamp into a readable date
  const formatDate = (isoString) => {
    if (!isoString) return '';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(isoString).toLocaleDateString('en-US', options);
  };

  return (
    <article className="max-w-4xl mx-auto px-4 py-8 bg-slate-900 text-slate-100 rounded-lg shadow-md my-6">
      {/* Category Tag */}
      <span className="text-xs uppercase tracking-wider text-blue-400 font-semibold bg-blue-950 px-2.5 py-1 rounded">
        {article.category}
      </span>
      
      {/* Article Title */}
      <h1 className="text-3xl md:text-4xl font-bold mt-3 mb-4">{article.title}</h1>

      {/* Metadata Bar (Byline, Date, and Conditional Admin Views) */}
      <div className="flex items-center flex-wrap gap-3 text-slate-400 text-sm mb-6 pb-4 border-b border-slate-800">
        <span>By {article.author || 'Naijablog Editorial'}</span>
        <span>•</span>
        <time dateTime={article.created_at}>
          {formatDate(article.created_at)}
        </time>

        {/* PRIVATE VIEW COUNT: Only shows if the user is in admin mode */}
        {isAdmin && (
          <>
            <span>•</span>
            <span className="bg-emerald-950 text-emerald-400 border border-emerald-800/50 px-2.5 py-0.5 rounded text-xs font-mono">
              Admin Views: {article.views ?? 0}
            </span>
          </>
        )}
      </div>

      {/* Article Body Content */}
      <div className="prose prose-invert max-w-none leading-relaxed text-slate-300">
        {article.content}
      </div>
    </article>
  );
}
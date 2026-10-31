import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client
const supabaseUrl = 'https://szzflseeqnhjphmooqfp.supabase.co';
const supabaseKey = 'sb_publishable_KB4PTa3Zl6TNXcVL0jOL3g_ovbXv4Dd';
const supabase = createClient(supabaseUrl, supabaseKey);

// Utility function to convert title to URL slug matching your App.js routing
function slugify(text) {
  if (!text) return 'story';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Replace spaces with -
    .replace(/[^\w\-]+/g, '')   // Remove all non-word chars
    .replace(/\-\-+/g, '-');     // Replace multiple - with single -
}

export default async function handler(req, res) {
  try {
    // Fetch the 20 latest published articles from Supabase
    const { data: articles, error } = await supabase
      .from('articles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      throw new Error(error.message);
    }

    // Build RSS XML items string
    const itemsXml = (articles || [])
      .map((art) => {
        const slug = slugify(art.title);
        const articleUrl = `https://naijablog.com.ng/article/${slug}-${art.id}`;
        const pubDate = new Date(art.created_at).toUTCString();
        const description = (art.excerpt || art.content || '').substring(0, 300);

        return `
    <item>
      <title><![CDATA[${art.title || 'Untitled'}]]></title>
      <link>${articleUrl}</link>
      <guid isPermaLink="true">${articleUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <category><![CDATA[${art.category || 'General'}]]></category>
      <description><![CDATA[${description}...]]></description>
      ${art.image_url ? `<enclosure url="${art.image_url}" type="image/jpeg" />` : ''}
    </item>`;
      })
      .join('');

    // Wrap in standard RSS 2.0 XML structure
    const rssXml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Naijablog</title>
    <link>https://naijablog.com.ng</link>
    <description>Independent Nigerian Journalism, Culture, and Perspectives</description>
    <language>en-ng</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="https://naijablog.com.ng/feed.xml" rel="self" type="application/rss+xml" />
    ${itemsXml}
  </channel>
</rss>`;

    // Return header with XML content type and cache for 1 hour
    res.setHeader('Content-Type', 'text/xml; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=1800');
    return res.status(200).send(rssXml);
  } catch (err) {
    console.error('RSS Feed Error:', err);
    return res.status(500).send('<error>Could not generate RSS feed</error>');
  }
}
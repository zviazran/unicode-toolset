import React, { useEffect, useState } from "react";

type Article = {
  title: string;
  link: string;
  pubDate?: string;
  description?: string;
  content?: string;
  thumbnail?: string | null;
};

async function parseRSSFromXML(xmlContent: string, maxArticles = 10): Promise<Article[]> {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlContent, "text/xml");
  const items = xmlDoc.querySelectorAll("item");
  const articles: Article[] = [];

  for (let i = 0; i < Math.min(items.length, maxArticles); i++) {
    const item = items[i];
    const title = item.querySelector("title")?.textContent || "";
    const link = item.querySelector("link")?.textContent || "#";
    const pubDate = item.querySelector("pubDate")?.textContent || "";

    const description = item.querySelector("description")?.textContent || "";
    const contentEncoded = item.querySelector("content\\:encoded")?.textContent || item.querySelector("content:encoded")?.textContent || "";
    const summary = item.querySelector("summary")?.textContent || "";

    // choose longest content field
    let content = "";
    [description, contentEncoded, summary, item.textContent || ""].forEach((f) => {
      if (f && f.length > content.length) content = f;
    });

    // Try to find image: media:thumbnail, media:content, or an <img> in the content
    const mediaThumb = item.querySelector("media\\:thumbnail") || item.querySelector("media:thumbnail");
    const mediaContent = item.querySelector("media\\:content") || item.querySelector("media:content");
    let directImage: string | null = null;
    if (mediaThumb && mediaThumb.getAttribute) directImage = mediaThumb.getAttribute("url");
    if (!directImage && mediaContent && mediaContent.getAttribute) directImage = mediaContent.getAttribute("url");

    if (!directImage) {
      const imgMatch = content.match(/<img[^>]+src=\"([^\">]+)\"/i);
      if (imgMatch && imgMatch[1]) directImage = imgMatch[1];
    }

    articles.push({
      title,
      link,
      pubDate,
      description: content,
      content,
      thumbnail: directImage || null,
    });
  }

  return articles;
}

const tryMethods = async (rssUrl: string, maxArticles = 5): Promise<Article[]> => {
  const methods: Array<() => Promise<Article[]>> = [
    // RSS2JSON public API
    async () => {
      const api = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;
      const res = await fetch(api);
      if (!res.ok) throw new Error(`rss2json failed: ${res.status}`);
      const json = await res.json();
      if (json.status !== "ok") throw new Error(json.message || "rss2json error");
      const items = json.items || [];
      return items.slice(0, maxArticles).map((it: any) => ({
        title: it.title,
        link: it.link,
        pubDate: it.pubDate,
        description: it.description || it.content || it.content_encoded || "",
        content: it.content || it.content_encoded || it.description || "",
        thumbnail: it.thumbnail || null,
      }));
    },
    // AllOrigins raw fetch
    async () => {
      const proxy = `https://api.allorigins.win/raw?url=${encodeURIComponent(rssUrl)}`;
      const res = await fetch(proxy);
      if (!res.ok) throw new Error(`allorigins failed: ${res.status}`);
      const text = await res.text();
      return parseRSSFromXML(text, maxArticles);
    },
    // CodeTabs proxy
    async () => {
      const proxy = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(rssUrl)}`;
      const res = await fetch(proxy);
      if (!res.ok) throw new Error(`codetabs failed: ${res.status}`);
      const text = await res.text();
      return parseRSSFromXML(text, maxArticles);
    },
    // r.jina.ai raw HTML proxy
    async () => {
      const proxied = `https://r.jina.ai/http://${rssUrl.replace(/^https?:\/\//, "")}`;
      const res = await fetch(proxied);
      if (!res.ok) throw new Error(`jina proxy failed: ${res.status}`);
      const text = await res.text();
      return parseRSSFromXML(text, maxArticles);
    },
  ];

  for (let i = 0; i < methods.length; i++) {
    try {
      const articles = await methods[i]();
      if (articles && articles.length > 0) return articles;
    } catch (err) {
      // try next
      // console.warn('method failed', i, err);
    }
  }
  throw new Error("All fetch methods failed");
};

const MediumFeed: React.FC<{ feedUrl?: string; username?: string; maxArticles?: number }> = ({ feedUrl, username, maxArticles = 5 }) => {
  const [articles, setArticles] = useState<Article[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const rss = feedUrl || (username ? `https://medium.com/feed/@${username}` : null);
    if (!rss) {
      setError("No feed URL provided");
      setLoading(false);
      return;
    }

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await tryMethods(rss, maxArticles);
        if (!cancelled) setArticles(data);
      } catch (err: any) {
        if (!cancelled) setError(err?.message || "Failed to load feed");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [feedUrl, username, maxArticles]);

  if (loading) return <div style={{ padding: 12 }}>Loading tips…</div>;
  if (error) return (
    <div style={{ padding: 12 }}>
      <div style={{ color: "#a00" }}>Could not load feed: {error}</div>
      <div style={{ marginTop: 8 }}><a href={feedUrl || `https://medium.com/@${username}`} target="_blank" rel="noreferrer">Open Medium profile</a></div>
    </div>
  );

  if (!articles || articles.length === 0) return <div style={{ padding: 12 }}>No tips found.</div>;

  return (
    <div style={{ display: "grid", gap: 16 }}>
      {articles.slice().reverse().map((a) => (
        <a key={a.link} href={a.link} target="_blank" rel="noreferrer" aria-label={`Open ${a.title} on Medium`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
          <article style={{ 
            display: "flex", 
            gap: 12, 
            border: hoveredLink === a.link ? "1px solid #0b66c3" : "1px solid #e6e6e6", 
            borderRadius: 8, 
            padding: 12, 
            alignItems: "flex-start",
            backgroundColor: "#f9f9f9",
            cursor: "pointer",
            transition: "all 0.2s ease",
            boxShadow: hoveredLink === a.link ? "0 4px 8px rgba(0,0,0,0.15)" : "0 1px 3px rgba(0,0,0,0.1)",
            transform: hoveredLink === a.link ? "translateY(-2px)" : "translateY(0)"
          }}
          onMouseEnter={() => setHoveredLink(a.link)}
          onMouseLeave={() => setHoveredLink(null)}>
            {a.thumbnail ? (
              <div style={{ width: 140, flex: "0 0 140px" }}>
                <img src={a.thumbnail} alt={a.title} style={{ width: "100%", height: "auto", borderRadius: 6 }} loading="lazy" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              </div>
            ) : null}
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: 0, fontSize: 18 }}>{a.title}</h3>
              {a.description ? <p style={{ marginTop: 8 }}>{stripHtml(a.description).slice(0, 240)}{a.description.length > 240 ? '…' : ''}</p> : null}
              <div style={{ marginTop: 8, fontSize: 13, color: '#0b66c3', fontWeight: 500 }}>
                Read More...
              </div>
            </div>
          </article>
        </a>
      ))}
    </div>
  );
};

function stripHtml(html: string) {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

export default MediumFeed;

import React, { useEffect, useState } from "react";

type Article = {
  title: string;
  link: string;
  pubDate?: string;
  description?: string;
  content?: string;
  thumbnail?: string | null;
};

async function parseRSSFromXML(xmlContent: string, maxArticles = 5): Promise<Article[]> {
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

async function fetchOgImage(articleUrl: string): Promise<string | null> {
  try {
    // Use r.jina.ai as a CORS-friendly raw HTML proxy
    const proxied = `https://r.jina.ai/http://${articleUrl.replace(/^https?:\/\//, "")}`;
    const res = await fetch(proxied);
    if (!res.ok) throw new Error(`proxy failed: ${res.status}`);
    const text = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, "text/html");
    const og = (doc.querySelector('meta[property="og:image"]') as HTMLMetaElement)?.content
      || (doc.querySelector('meta[name="twitter:image"]') as HTMLMetaElement)?.content
      || (doc.querySelector('link[rel="image_src"]') as HTMLLinkElement)?.href;
    if (og) return og;

    // fallback: first image in article content
    const img = doc.querySelector('img');
    if (img && (img as HTMLImageElement).src) return (img as HTMLImageElement).src;
    return null;
  } catch (err) {
    return null;
  }
}

const MediumFeed: React.FC<{ feedUrl?: string; username?: string; maxArticles?: number }> = ({ feedUrl, username, maxArticles = 5 }) => {
  const [articles, setArticles] = useState<Article[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageStates, setImageStates] = useState<Record<string, { loading: boolean; error?: string }>>({});

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
        // For articles missing thumbnails, try to fetch og:image from the article page via a CORS-friendly proxy
        const needFill = (data || []).map((a, idx) => ({ a, idx })).filter(x => !x.a.thumbnail);
        if (!cancelled && needFill.length > 0) {
          const updated = [...data];
          const concurrency = 3;
          for (let i = 0; i < needFill.length; i += concurrency) {
            const batch = needFill.slice(i, i + concurrency);
            await Promise.all(batch.map(async ({ a, idx }) => {
              try {
                console.log('[MediumFeed] fetching OG image for', a.link);
                setImageStates(prev => ({ ...prev, [a.link]: { loading: true } }));
                const og = await fetchOgImage(a.link);
                if (og && !cancelled) {
                  updated[idx] = { ...updated[idx], thumbnail: og };
                  setImageStates(prev => ({ ...prev, [a.link]: { loading: false } }));
                }
              } catch (e: any) {
                // record error so UI shows a hint
                console.warn('[MediumFeed] OG fetch failed for', a.link, e?.message || e);
                setImageStates(prev => ({ ...prev, [a.link]: { loading: false, error: e?.message || 'failed' } }));
              }
            }));
            if (!cancelled) setArticles([...updated]);
          }
        }
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

  if (loading) return <div style={{ padding: 12 }}>Loading articles…</div>;
  if (error) return (
    <div style={{ padding: 12 }}>
      <div style={{ color: "#a00" }}>Could not load feed: {error}</div>
      <div style={{ marginTop: 8 }}><a href={feedUrl || `https://medium.com/@${username}`} target="_blank" rel="noreferrer">Open Medium profile</a></div>
    </div>
  );

  if (!articles || articles.length === 0) return <div style={{ padding: 12 }}>No articles found.</div>;

  return (
    <div style={{ display: "grid", gap: 16 }}>
      {articles.map((a) => (
        <article key={a.link} style={{ display: "flex", gap: 12, border: "1px solid #e6e6e6", borderRadius: 8, padding: 12, alignItems: "flex-start" }}>
          {a.thumbnail ? (
            <div style={{ width: 140, flex: "0 0 140px" }}>
              <img src={a.thumbnail} alt={a.title} style={{ width: "100%", height: "auto", borderRadius: 6 }} loading="lazy" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            </div>
          ) : (
            <div style={{ width: 140, flex: "0 0 140px", display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f6f6f6', borderRadius: 6 }}>
              {imageStates[a.link]?.loading ? (
                <div style={{ fontSize: 12, color: '#666' }}>Loading image…</div>
              ) : imageStates[a.link]?.error ? (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 12, color: '#a00' }}>No image</div>
                  <div style={{ fontSize: 11, color: '#999' }}>{imageStates[a.link].error}</div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', fontSize: 12, color: '#666' }}>No image</div>
              )}
            </div>
          )}
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0, fontSize: 18 }}><a href={a.link} target="_blank" rel="noreferrer">{a.title}</a></h3>
            {a.description ? <p style={{ marginTop: 8 }}>{stripHtml(a.description).slice(0, 240)}{a.description.length > 240 ? '…' : ''}</p> : null}
          </div>
        </article>
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

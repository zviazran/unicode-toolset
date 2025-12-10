import React, { useEffect, useState } from "react";

type OEmbed = {
  author_name?: string;
  author_url?: string;
  provider_name?: string;
  provider_url?: string;
  title?: string;
  thumbnail_url?: string;
  html?: string;
  type?: string;
  version?: string;
};

const MediumPreview: React.FC<{ url: string }> = ({ url }) => {
  const [data, setData] = useState<OEmbed | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setData(null);

    const fetchPreview = async () => {
      // Try noembed first
      const tryNoembed = async () => {
        const endpoint = `https://noembed.com/embed?url=${encodeURIComponent(url)}`;
        const res = await fetch(endpoint);
        if (!res.ok) throw new Error(`noembed failed: ${res.status}`);
        const json = (await res.json()) as OEmbed & { error?: string };
        if (json && (json as any).error) throw new Error((json as any).error);
        return json;
      };

      // Try Medium oEmbed endpoint directly
      const tryMediumOEmbed = async () => {
        try {
          const endpoint = `https://medium.com/oembed?url=${encodeURIComponent(url)}&format=json`;
          const res = await fetch(endpoint);
          if (!res.ok) throw new Error(`medium oembed failed: ${res.status}`);
          const json = (await res.json()) as OEmbed & { error?: string };
          if (json && (json as any).error) throw new Error((json as any).error);
          return json;
        } catch (e) {
          throw e;
        }
      };

      // Final fallback: fetch proxied HTML and parse OpenGraph tags (uses a CORS-friendly proxy)
      const tryOgViaProxy = async () => {
        const proxied = `https://r.jina.ai/http://${url.replace(/^https?:\/\//, "")}`;
        const res = await fetch(proxied);
        if (!res.ok) throw new Error(`proxy fetch failed: ${res.status}`);
        const text = await res.text();
        // Parse HTML to extract OG tags
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, "text/html");
        const title = (doc.querySelector('meta[property="og:title"]') as HTMLMetaElement)?.content
          || doc.querySelector('title')?.textContent || undefined;
        const desc = (doc.querySelector('meta[property="og:description"]') as HTMLMetaElement)?.content || undefined;
        const img = (doc.querySelector('meta[property="og:image"]') as HTMLMetaElement)?.content || undefined;
        const result: OEmbed = { title, thumbnail_url: img, author_name: desc };
        return result;
      };

      try {
        // 1. noembed
        const noembed = await tryNoembed();
        if (!cancelled) setData(noembed);
        return;
      } catch (err: any) {
        // continue to fallbacks
        const msg = err?.message || String(err);
        // If error suggests provider not supported, try medium oembed
        try {
          const medium = await tryMediumOEmbed();
          if (!cancelled) setData(medium);
          return;
        } catch (_) {
          // try proxy OG
        }
        try {
          const og = await tryOgViaProxy();
          if (!cancelled) setData(og);
          return;
        } catch (err2: any) {
          throw new Error(msg || (err2 && err2.message) || "Failed to load preview");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchPreview();
    return () => {
      cancelled = true;
    };
  }, [url]);

  if (loading) return <div style={{ padding: 12 }}>Loading preview…</div>;
  if (error || !data) {
    return (
      <div style={{ padding: 12 }}>
        <a href={url} target="_blank" rel="noreferrer">
          Open article
        </a>
        {error ? <div style={{ color: "#a00" }}>Preview unavailable: {error}</div> : null}
      </div>
    );
  }

  // If provider returned embeddable HTML, render it and show a small 'Open on Medium' button below.
  if (data.html) {
    return (
      <div style={{ marginTop: 8 }}>
        <div dangerouslySetInnerHTML={{ __html: data.html }} />
        <div style={{ marginTop: 8 }}>
          <a href={url} target="_blank" rel="noreferrer" aria-label="Open article on Medium" style={{ fontSize: 13 }}>
            Open on Medium
          </a>
        </div>
      </div>
    );
  }

  // Otherwise render a simple card and make the whole card a clickable link to the article.
  
  return (
    <a href={url} target="_blank" rel="noreferrer" aria-label={`Open ${data.title} on Medium`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
      <div style={{
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
        marginTop: 8,
        padding: 14,
        border: isHovered ? "1px solid #0b66c3" : "1px solid #e0e0e0",
        borderRadius: 8,
        backgroundColor: "#f9f9f9",
        cursor: "pointer",
        transition: "all 0.2s ease",
        boxShadow: isHovered ? "0 4px 8px rgba(0,0,0,0.15)" : "0 1px 3px rgba(0,0,0,0.1)",
        transform: isHovered ? "translateY(-2px)" : "translateY(0)"
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}>
        {data.thumbnail_url ? (
          <img src={data.thumbnail_url} alt={data.title || "thumbnail"} style={{ width: 140, height: "auto", borderRadius: 6 }} />
        ) : null}
        <div style={{ flex: 1 }}>
          <h4 style={{ margin: 0 }}>{data.title}</h4>
          {data.author_name ? <div style={{ color: "#666", fontSize: 13 }}>{data.author_name}</div> : null}
          <div style={{ marginTop: 10, fontSize: 13, color: '#0b66c3', fontWeight: 500 }}>
            Read More...
          </div>
        </div>
      </div>
    </a>
  );
};

export default MediumPreview;

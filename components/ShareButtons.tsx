"use client";

import { useMemo, useState } from "react";

type ShareButtonsProps = {
  title: string;
  text: string;
  path?: string;
};

export default function ShareButtons({ title, text, path = "/" }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") {
      return `https://streetlightstory.site${path}`;
    }

    return new URL(path, window.location.origin).toString();
  }, [path]);
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(text);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  }

  async function nativeShare() {
    if (!navigator.share) {
      await copyLink();
      return;
    }

    try {
      await navigator.share({
        title,
        text,
        url: shareUrl,
      });
    } catch {
      // The user cancelled the share sheet.
    }
  }

  return (
    <div className="share-buttons" aria-label="Share Streetlight">
      <p>Share this chapter</p>
      <div className="share-buttons-row">
        <button type="button" className="share-button" onClick={nativeShare}>
          Share
        </button>
        <a
          className="share-button"
          href={`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`}
          target="_blank"
          rel="noreferrer"
        >
          X
        </a>
        <a
          className="share-button"
          href={`https://wa.me/?text=${encodedText}%20${encodedUrl}`}
          target="_blank"
          rel="noreferrer"
        >
          WhatsApp
        </a>
        <button type="button" className="share-button" onClick={copyLink}>
          {copied ? "Copied" : "Copy link"}
        </button>
      </div>
    </div>
  );
}

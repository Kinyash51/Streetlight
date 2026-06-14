"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp, faXTwitter } from "@fortawesome/free-brands-svg-icons";
import {
  faCheck,
  faLink,
  faShareNodes,
} from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";

type ShareButtonsProps = {
  title: string;
  text: string;
  path?: string;
};

export default function ShareButtons({ title, text, path = "/" }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = `https://streetlightstory.site${path}`;
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
        <button
          type="button"
          className="share-button"
          onClick={nativeShare}
          aria-label="Share this chapter"
        >
          <FontAwesomeIcon className="share-button-icon" icon={faShareNodes} />
          <span>Share</span>
        </button>
        <a
          className="share-button"
          href={`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`}
          target="_blank"
          rel="noreferrer"
          aria-label="Share this chapter on X"
        >
          <FontAwesomeIcon className="share-button-icon" icon={faXTwitter} />
          <span>Post</span>
        </a>
        <a
          className="share-button"
          href={`https://wa.me/?text=${encodedText}%20${encodedUrl}`}
          target="_blank"
          rel="noreferrer"
          aria-label="Share this chapter on WhatsApp"
        >
          <FontAwesomeIcon className="share-button-icon" icon={faWhatsapp} />
          <span>WhatsApp</span>
        </a>
        <button
          type="button"
          className={copied ? "share-button copied" : "share-button"}
          onClick={copyLink}
          aria-label={copied ? "Chapter link copied" : "Copy chapter link"}
        >
          <FontAwesomeIcon
            className="share-button-icon"
            icon={copied ? faCheck : faLink}
          />
          <span aria-live="polite">{copied ? "Copied" : "Copy link"}</span>
        </button>
      </div>
    </div>
  );
}

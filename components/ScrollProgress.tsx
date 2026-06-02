"use client";

import { useEffect, useState } from "react";

export default function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function updateProgress() {
      const scrollableHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const nextProgress =
        scrollableHeight > 0 ? (window.scrollY / scrollableHeight) * 100 : 0;

      setProgress(nextProgress);
    }

    window.addEventListener("scroll", updateProgress, { passive: true });
    updateProgress();

    return () => window.removeEventListener("scroll", updateProgress);
  }, []);

  return (
    <div className="scroll-progress-bar" aria-hidden="true">
      <span style={{ width: `${progress}%` }} />
    </div>
  );
}

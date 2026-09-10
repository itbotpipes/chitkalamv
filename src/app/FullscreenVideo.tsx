'use client';

import React, { useEffect, useRef } from 'react';

export default function FullscreenVideo() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video) return;

    let isPlaying = false;
    let rafId: number;

    // rAF-based visibility check — bulletproof fallback
    const tick = () => {
      const rect = section.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const visibleHeight = Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0);
      const visibleRatio = Math.max(0, visibleHeight / rect.height);

      if (visibleRatio >= 0.5 && !isPlaying) {
        isPlaying = true;
        video.play().catch(() => {});
        document.documentElement.style.setProperty('--scrollbar-thumb', '#ffffff');
        document.documentElement.style.setProperty('--scrollbar-track', '#E34234');
        document.documentElement.style.setProperty('--scrollbar-border', '#E34234');
      } else if (visibleRatio < 0.5 && isPlaying) {
        isPlaying = false;
        video.pause();
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <section ref={sectionRef} className="fullscreen-video-section">
      <video
        ref={videoRef}
        src="/videos/temp.mp4"
        controls
        loop
        muted
        playsInline
        className="fullscreen-video"
      />
    </section>
  );
}

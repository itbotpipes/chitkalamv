'use client';

import { useEffect, useRef } from 'react';

export default function HeroScrollbarObserver() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          // Change scrollbar color to match hero section
          document.documentElement.style.setProperty('--scrollbar-thumb', '#ffffff');
          document.documentElement.style.setProperty('--scrollbar-track', '#E34234');
          document.documentElement.style.setProperty('--scrollbar-border', '#E34234');
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  return <div ref={ref} style={{ position: 'absolute', top: 0, height: '50vh', width: '1px' }} />;
}

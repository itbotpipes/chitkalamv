'use client';

import { useEffect } from 'react';

export default function ScrollbarThemer() {
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      
      // If we've scrolled past the hero section (which is 100vh)
      if (scrollY > windowHeight * 0.5) {
        // Theme for the scroll text section (warm cream background)
        document.documentElement.style.setProperty('--scrollbar-track', '#FAF8F5');
        document.documentElement.style.setProperty('--scrollbar-thumb', '#C4A882');
        document.documentElement.style.setProperty('--scrollbar-border', '#FAF8F5');
      } else {
        // Theme for the hero section (red background, white text)
        document.documentElement.style.setProperty('--scrollbar-track', '#E34234');
        document.documentElement.style.setProperty('--scrollbar-thumb', '#ffffff');
        document.documentElement.style.setProperty('--scrollbar-border', '#E34234');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initialize on mount
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return null;
}

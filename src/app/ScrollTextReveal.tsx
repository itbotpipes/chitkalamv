'use client';

import React, { useEffect, useRef, useState } from 'react';

// Each segment is either a plain word, a highlighted phrase, or a red block
type Segment =
  | { type: 'word'; text: string }
  | { type: 'highlight'; text: string; lineSvg: string }
  | { type: 'block' }
  | { type: 'break' }
  | { type: 'gif'; src: string };

interface ParagraphData {
  color: string; // Theme color for highlights and blocks in this paragraph
  segments: Segment[];
}

const ScrollTextSection = ({ paragraph }: { paragraph: ParagraphData }) => {
  return (
    <section className="scroll-text-section">
      <div className="scroll-text-paragraph">
        {paragraph.segments.map((segment, sIdx) => {
          if (segment.type === 'block') {
            return (
              <span
                key={sIdx}
                className="reveal-word reveal-block"
                style={{ backgroundColor: paragraph.color }}
              />
            );
          }
          if (segment.type === 'break') {
            return <div key={sIdx} className="scroll-text-break" />;
          }
          if (segment.type === 'gif') {
            return (
              <span key={sIdx} className="reveal-word reveal-gif-wrapper">
                <img src={segment.src} alt="" className="reveal-gif" />
              </span>
            );
          }
          if (segment.type === 'highlight') {
            return (
              <a
                key={sIdx}
                href="https://bemotionlabs.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="reveal-word highlight-word"
                style={{ color: paragraph.color, textDecoration: 'none' }}
              >
                {segment.text}
                <img
                  src={segment.lineSvg}
                  alt=""
                  className="highlight-line-svg"
                />
              </a>
            );
          }
          return (
            <span key={sIdx} className="reveal-word">
              {segment.text}
            </span>
          );
        })}
      </div>
    </section>
  );
};

export default function ScrollTextReveal() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let rafId: number;

    const tick = () => {
      const wrapper = sectionRef.current;
      if (wrapper) {
        const windowHeight = window.innerHeight;
        const sections = wrapper.querySelectorAll<HTMLElement>('.scroll-text-section');

        sections.forEach((section) => {
          const sectionRect = section.getBoundingClientRect();

          // Only process if section is in or near the viewport
          if (sectionRect.bottom > -200 && sectionRect.top < windowHeight + 200) {
            const words = section.querySelectorAll<HTMLElement>('.reveal-word');
            const totalWords = words.length;
            if (totalWords === 0) return;

            // Reading window: starts revealing as section enters viewport, completes as it scrolls through
            const startY = windowHeight * 0.85;
            const endY = windowHeight * 0.25;
            const revealDistance = startY - endY;
            const sectionProgress = Math.max(0, Math.min(1, (startY - sectionRect.top) / revealDistance));

            // Smooth trailing wave across words in reading order
            const overlap = Math.max(0.08, 2.5 / totalWords);
            const scale = 1 - overlap;

            words.forEach((word, index) => {
              const wordStart = (index / totalWords) * scale;
              const wordEnd = wordStart + overlap;

              let wordProgress = (sectionProgress - wordStart) / (wordEnd - wordStart);
              wordProgress = Math.max(0, Math.min(1, wordProgress));

              const minOpacity = 0.20;
              const finalOpacity = minOpacity + wordProgress * (1 - minOpacity);

              word.style.opacity = finalOpacity.toFixed(3);
              word.style.filter = 'none';
              word.style.transform = 'none';
            });
          }
        });

        // Change scrollbar color when this section is prominently in view
        const wrapperRect = wrapper.getBoundingClientRect();
        if (wrapperRect.top < windowHeight * 0.5 && wrapperRect.bottom > windowHeight * 0.5) {
          document.documentElement.style.setProperty('--scrollbar-thumb', '#E34234');
          document.documentElement.style.setProperty('--scrollbar-track', '#ffffff');
          document.documentElement.style.setProperty('--scrollbar-border', '#ffffff');
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <div ref={sectionRef} className="scroll-text-wrapper">
      {PARAGRAPHS.map((paragraph, pIdx) => (
        <ScrollTextSection key={pIdx} paragraph={paragraph} />
      ))}
    </div>
  );
}

const PARAGRAPHS: ParagraphData[] = [
  {
    color: '#A71714',
    segments: [
      { type: 'word', text: 'From' },
      { type: 'word', text: 'logos' },
      { type: 'gif', src: '/gifstexts/1.gif' },
      { type: 'word', text: '&' },
      { type: 'word', text: 'brand' },
      { type: 'word', text: 'identities' },
      { type: 'word', text: 'to' },
      { type: 'word', text: 'brochures,' },
      { type: 'word', text: 'packaging,' },
      { type: 'word', text: 'social' },
      { type: 'word', text: 'media' },
      { type: 'word', text: 'creatives,' },
      { type: 'word', text: '&' },
      { type: 'word', text: 'motion' },
      { type: 'word', text: 'graphics,' },
      { type: 'word', text: 'every' },
      { type: 'word', text: 'project' },
      { type: 'word', text: 'begins' },
      { type: 'word', text: 'with' },
      { type: 'word', text: 'a' },
      { type: 'word', text: 'strong' },
      { type: 'word', text: 'idea.' },
      { type: 'gif', src: '/gifstexts/2.gif' },
      { type: 'word', text: 'Explore' },
      { type: 'highlight', text: 'our Portfolio', lineSvg: '/lines/line1.svg' },
      { type: 'word', text: ',' },
      { type: 'word', text: 'crafted' },
      { type: 'word', text: 'for' },
      { type: 'word', text: 'brands,' },
      { type: 'word', text: 'businesses,' },
      { type: 'word', text: '&' },
      { type: 'break' },
      { type: 'word', text: 'individuals' },
      { type: 'word', text: 'across' },
      { type: 'word', text: 'diverse' },
      { type: 'word', text: 'industries.' },
    ],
  },
  {
    color: '#E34234',
    segments: [
      { type: 'word', text: 'From' },
      { type: 'highlight', text: 'our Art Studio', lineSvg: '/lines/line2.svg' },
      { type: 'gif', src: '/gifstexts/3.gif' },
      { type: 'word', text: 'a' },
      { type: 'word', text: 'curated' },
      { type: 'word', text: 'collection' },
      { type: 'word', text: 'of' },
      { type: 'break' },
      { type: 'word', text: 'original' },
      { type: 'word', text: 'artworks' },
      { type: 'word', text: '&' },
      { type: 'word', text: 'prints' },
      { type: 'word', text: 'inspired' },
      { type: 'word', text: 'by' },
      { type: 'gif', src: '/gifstexts/4.gif' },
      { type: 'word', text: 'mythology,' },
      { type: 'word', text: 'culture,' },
      { type: 'word', text: 'nature,' },
      { type: 'word', text: '&' },
      { type: 'word', text: 'the' },
      { type: 'word', text: 'quiet' },
      { type: 'word', text: 'moments' },
      { type: 'word', text: 'in' },
      { type: 'word', text: 'between.' },
      { type: 'break' },
      { type: 'word', text: 'Bring' },
      { type: 'word', text: 'home' },
      { type: 'word', text: 'a' },
      { type: 'word', text: 'piece' },
      { type: 'word', text: 'that' },
      { type: 'word', text: 'resonates' },
      { type: 'word', text: 'with' },
      { type: 'word', text: 'your' },
      { type: 'word', text: 'story.' },
    ],
  },
];


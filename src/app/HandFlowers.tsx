'use client';

import React, { useEffect, useRef, useState } from 'react';

interface FlowerData {
  id: string;
  name: string;
  quote: string;
  imgSrc: string;
  ticketStyle: React.CSSProperties;
  dotPosition: { top: string; left: string };
}

const FLOWERS: FlowerData[] = [
  {
    id: 'blue-lotus',
    name: 'Blue Lotus',
    quote: '"Something catches\nyour attention."',
    imgSrc: '/handflowers/fl3-p.webp',
    ticketStyle: { top: '-46%', left: '-12%' },
    dotPosition: { top: '19%', left: '42%' },
  },
  {
    id: 'lotus',
    name: 'Lotus',
    quote: '"What if...?"',
    imgSrc: '/handflowers/fl4-p.webp',
    ticketStyle: { top: '-18%', left: '112%' },
    dotPosition: { top: '15%', left: '68%' },
  },
  {
    id: 'mango-blossom',
    name: 'Mango Blossom',
    quote: '"Let\'s build this."',
    imgSrc: '/handflowers/fl5-p.webp',
    ticketStyle: { top: '65.57%', left: '92%' },
    dotPosition: { top: '38%', left: '75%' },
  },
  {
    id: 'jasmine',
    name: 'Jasmine',
    quote: '"This feels right."',
    imgSrc: '/handflowers/fl2-p.webp',
    ticketStyle: { top: '10%', left: '-75%' },
    dotPosition: { top: '33%', left: '19%' },
  },
  {
    id: 'ashoka',
    name: 'Ashoka',
    quote: '"It\'s alive."',
    imgSrc: '/handflowers/fl1-p.webp',
    ticketStyle: { top: '60.55%', left: '-48%' },
    dotPosition: { top: '42%', left: '17%' },
  },
];

const InlineFlowerSvg = React.memo(function InlineFlowerSvg({ src, className, onFlowerHover, onFlowerLeave, onClick }: { src: string; className: string; onFlowerHover: (id: string) => void; onFlowerLeave: () => void; onClick: (id: string) => void }) {
  const [svgContent, setSvgContent] = useState<string>('');

  useEffect(() => {
    fetch(src)
      .then((res) => res.text())
      .then((text) => setSvgContent(text))
      .catch((err) => console.error('Failed to load SVG', src, err));
  }, [src]);

  const handleInteraction = (e: React.MouseEvent | React.TouchEvent, isHover: boolean, isClick: boolean) => {
    const target = (e.target as Element).closest('g[id]');
    if (target && target.id) {
      const flower = FLOWERS.find(f => f.id === target.id);
      if (flower) {
        if (isHover) onFlowerHover(flower.id);
        if (isClick) onClick(flower.id);
        return;
      }
    }
    if (isHover) onFlowerLeave();
  };

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: svgContent }}
      onMouseMove={(e) => {
        if (window.matchMedia('(hover: hover)').matches) {
          handleInteraction(e, true, false);
        }
      }}
      onMouseLeave={() => onFlowerLeave()}
      onClick={(e) => handleInteraction(e, false, true)}
    />
  );
});

export default function HandFlowers() {
  const [revealedCount, setRevealedCount] = useState(0);
  const [activeFlowers, setActiveFlowers] = useState<Set<string>>(new Set());
  const [scrollProgress, setScrollProgress] = useState(0);
  const timeoutMapRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const totalFlowers = FLOWERS.length;

  useEffect(() => {
    return () => {
      timeoutMapRef.current.forEach((timeout) => clearTimeout(timeout));
    };
  }, []);

  const lastToggleTimeRef = useRef<number>(0);

  const activateFlower = (flowerId: string) => {
    const now = Date.now();
    if (now - lastToggleTimeRef.current < 300) {
      return;
    }
    lastToggleTimeRef.current = now;

    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
    const isTouchDevice = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
    const useTouchMode = isMobile || isTouchDevice;

    if (useTouchMode) {
      timeoutMapRef.current.forEach((timeout) => clearTimeout(timeout));
      timeoutMapRef.current.clear();
      setActiveFlowers((prev) => {
        if (prev.has(flowerId)) {
          return new Set();
        }
        return new Set([flowerId]);
      });
      return;
    }

    const existing = timeoutMapRef.current.get(flowerId);
    if (existing) {
      clearTimeout(existing);
      timeoutMapRef.current.delete(flowerId);
    }
    setActiveFlowers((prev) => {
      const next = new Set(prev);
      next.add(flowerId);
      return next;
    });
  };

  const deactivateFlowerDelayed = (flowerId: string) => {
    const existing = timeoutMapRef.current.get(flowerId);
    if (existing) {
      clearTimeout(existing);
    }
    const timeout = setTimeout(() => {
      setActiveFlowers((prev) => {
        const next = new Set(prev);
        next.delete(flowerId);
        return next;
      });
      timeoutMapRef.current.delete(flowerId);
    }, 1000);
    timeoutMapRef.current.set(flowerId, timeout);
  };

  useEffect(() => {
    let rafId: number;
    let lastProgress = -1;

    const getScrollTop = () => Math.max(
      window.pageYOffset || 0,
      document.documentElement ? document.documentElement.scrollTop : 0,
      document.body ? document.body.scrollTop : 0
    );

    const tick = () => {
      const scrollTop = getScrollTop();
      const windowHeight = window.innerHeight;
      const scrollableDistance = windowHeight * 2;
      const progress = Math.max(0, Math.min(1, scrollTop / scrollableDistance));
      
      if (Math.abs(progress - lastProgress) > 0.001) {
        lastProgress = progress;
        setScrollProgress(progress);
        const currentFlowerIndex = Math.min(
          totalFlowers,
          Math.floor(progress * (totalFlowers + 1))
        );
        setRevealedCount(currentFlowerIndex);
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [totalFlowers]);

  // Build the dynamic classes for reveal and hover
  const containerClasses = ['hand-svg-master-wrapper'];
  FLOWERS.forEach((flower, index) => {
    const flowerWindow = 1 / totalFlowers;
    const startProgress = index * flowerWindow;
    const endProgress = startProgress + flowerWindow;

    let localProgress = 0;
    if (scrollProgress >= endProgress) {
      localProgress = 1;
    } else if (scrollProgress > startProgress) {
      localProgress = (scrollProgress - startProgress) / flowerWindow;
    }

    if (localProgress > 0.5) {
      containerClasses.push(`reveal-${flower.id}`);
    }

    if (activeFlowers.has(flower.id)) {
      containerClasses.push(`hover-${flower.id}`);
    }
  });

  const handleFlowerHover = React.useCallback((id: string) => {
    activateFlower(id);
  }, []);

  const handleFlowerLeave = React.useCallback(() => {
    FLOWERS.forEach(f => deactivateFlowerDelayed(f.id));
  }, []);

  const handleFlowerClick = React.useCallback((id: string) => {
    activateFlower(id);
  }, []);

  return (
    <div className="hand-flowers-section">
      <div className="hand-flowers-container">
        {/* Full static hand-combined SVG Background with dynamic CSS targeting */}
        <div className={containerClasses.join(' ')} style={{ top: 0, left: 0, width: '100%', height: '100%', zIndex: 5, position: 'absolute' }}>
          <InlineFlowerSvg 
            src="/handflowers/hand-combined.svg" 
            className="hand-svg"
            onFlowerHover={handleFlowerHover}
            onFlowerLeave={handleFlowerLeave}
            onClick={handleFlowerClick}
          />
        </div>

        {/* Tickets */}
        {FLOWERS.map((flower) => {
          const isActive = activeFlowers.has(flower.id);
          const isRevealed = containerClasses.includes(`reveal-${flower.id}`);

          return (
            <div key={flower.id} className="flower-item">
              {/* Mobile tap indicator */}
              <div 
                className={`mobile-indicator-wrapper indicator-${flower.id}`}
                role="button"
                tabIndex={0}
                aria-label={`Show ${flower.name}`}
                style={{
                  top: flower.dotPosition.top,
                  left: flower.dotPosition.left,
                  position: 'absolute',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 150,
                  pointerEvents: isRevealed ? 'auto' : 'none',
                  opacity: isRevealed ? 1 : 0,
                  transition: 'opacity 0.4s ease',
                  cursor: 'pointer',
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (isRevealed) activateFlower(flower.id);
                }}
              >
                <div className="mobile-flower-indicator" />
              </div>

              {/* Ticket card */}
              <div
                className={`flower-ticket ${isActive ? 'visible' : ''} ${flower.id !== 'lotus' ? 'enlarged-ticket' : ''}`}
                style={{
                  '--desktop-top': flower.ticketStyle.top,
                  '--desktop-left': flower.ticketStyle.left,
                  '--ticket-scale': flower.id === 'lotus' ? 1 : 1
                } as React.CSSProperties} >
                <span className="ticket-name">{flower.name}</span>
                <div className="ticket-image-wrapper">
                  <img
                    src={flower.imgSrc}
                    alt={flower.name}
                    className="ticket-image"
                    style={{ transform: flower.id === 'mango-blossom' ? 'scaleX(-1)' : 'none' }}
                    draggable={false}
                  />
                </div>
                <span className="ticket-quote">
                  {flower.quote.split('\n').map((line, i) => (
                    <span key={i}>
                      {line}
                      {i < flower.quote.split('\n').length - 1 && <br />}
                    </span>
                  ))}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

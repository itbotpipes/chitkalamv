'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';

export default function HeroFaceBL() {
  const faceRef = useRef<HTMLDivElement>(null);
  const leftEyeRef = useRef<HTMLImageElement>(null);
  const rightEyeRef = useRef<HTMLImageElement>(null);
  const gifRef = useRef<HTMLImageElement>(null);

  const [isHovering, setIsHovering] = useState(false);
  const [showGif, setShowGif] = useState(false);
  const [gifKey, setGifKey] = useState(0);
  const isPlayingRef = useRef(false);
  const wantsToHideRef = useRef(false);

  // GIF duration in ms
  const GIF_DURATION = 3000;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startGif = useCallback(() => {
    isPlayingRef.current = true;
    wantsToHideRef.current = false;

    // Force the GIF to restart by remounting the img element
    setGifKey(prev => prev + 1);

    setShowGif(true);

    // Set a timer for when the GIF finishes one cycle
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      isPlayingRef.current = false;
      if (wantsToHideRef.current) {
        setShowGif(false);
        wantsToHideRef.current = false;
      } else if (isHovering) {
        startGif();
      }
    }, GIF_DURATION);
  }, [isHovering]);

  // Handle hover start
  const handleMouseEnter = useCallback(() => {
    setIsHovering(true);
    wantsToHideRef.current = false;
    if (!isPlayingRef.current) {
      startGif();
    }
  }, [startGif]);

  // Handle hover end
  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    if (isPlayingRef.current) {
      wantsToHideRef.current = true;
    } else {
      setShowGif(false);
    }
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Eye tracking effect
  useEffect(() => {
    const mouse = { x: 0, y: 0 };
    const leftCurrent = { x: 0, y: 0 };
    const rightCurrent = { x: 0, y: 0 };
    const lerp = 0.08;

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const getTarget = (containerClass: string) => {
      if (!faceRef.current) return { x: 0, y: 0 };
      const container = faceRef.current.querySelector(
        `.${containerClass}`
      ) as HTMLElement | null;
      if (!container) return { x: 0, y: 0 };

      const rect = container.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dx = mouse.x - centerX;
      const dy = mouse.y - centerY;
      const angle = Math.atan2(dy, dx);

      const maxMove = rect.width * 0.25;
      const dist = Math.min(Math.hypot(dx, dy) * 0.1, maxMove);

      let targetX = Math.cos(angle) * dist;
      let targetY = Math.sin(angle) * dist;

      // Limit X-axis movement:
      // The outer eye socket on the left narrows significantly. Limit leftward movement so it doesn't clip.
      if (targetX < 0) {
        targetX = Math.max(targetX * 0.45, -rect.width * 0.10);
      } else {
        targetX = Math.min(targetX, rect.width * 0.22);
      }

      // Limit Y-axis movement:
      // The upper eyelid is very low. Limit upward movement.
      // When looking towards top-left (targetX < 0), the eyelid corner drops even lower, so restrict upward range further.
      if (targetY < 0) {
        const upFactor = targetX < 0 ? 0.2 : 0.28;
        const maxUp = targetX < 0 ? rect.width * 0.045 : rect.width * 0.065;
        targetY = Math.max(targetY * upFactor, -maxUp);
      } else {
        targetY = Math.min(targetY, rect.width * 0.18);
      }

      return {
        x: targetX,
        y: targetY,
      };
    };

    let animId: number;
    const animate = () => {
      const leftTarget = getTarget('bl-left-eye-container');
      const rightTarget = getTarget('bl-right-eye-container');

      leftCurrent.x += (leftTarget.x - leftCurrent.x) * lerp;
      leftCurrent.y += (leftTarget.y - leftCurrent.y) * lerp;
      rightCurrent.x += (rightTarget.x - rightCurrent.x) * lerp;
      rightCurrent.y += (rightTarget.y - rightCurrent.y) * lerp;

      if (leftEyeRef.current) {
        leftEyeRef.current.style.transform = `translate(calc(-50% + ${leftCurrent.x}px), calc(-50% + ${leftCurrent.y}px))`;
      }
      if (rightEyeRef.current) {
        rightEyeRef.current.style.transform = `translate(calc(-50% + ${rightCurrent.x}px), calc(-50% + ${rightCurrent.y}px))`;
      }

      animId = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove);
    animId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div
      className="hero-face hero-face-bl"
      aria-hidden="true"
      ref={faceRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ pointerEvents: 'auto' }}
    >
      <div className="eye-container bl-left-eye-container" style={{ opacity: showGif ? 0 : 1 }}>
        <img
          src="/faces/eye-left.png"
          alt=""
          className="eye eye-left"
          ref={leftEyeRef}
        />
      </div>
      <div className="eye-container bl-right-eye-container" style={{ opacity: showGif ? 0 : 1 }}>
        <img
          src="/faces/eye-right.png"
          alt=""
          className="eye eye-right"
          ref={rightEyeRef}
        />
      </div>

      {/* GIF layer — sits on top of the PNG, hidden until hover */}
      <img
        key={gifKey}
        ref={gifRef}
        src="/facesgifs/Bottom-Left-Face-1024-Transperent.gif"
        alt=""
        className="hero-face-gif"
        style={{
          opacity: showGif ? 1 : 0,
          pointerEvents: 'none',
        }}
      />

      <Image
        src="/faces/Bottom Left Face without eyes with BG.png"
        alt=""
        fill
        sizes="(max-width: 768px) 78vw, 38vw"
        priority
        className="hero-face-image"
        style={{ opacity: showGif ? 0 : 1 }}
      />
    </div>
  );
}

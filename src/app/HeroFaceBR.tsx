'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';

export default function HeroFaceBR() {
  const faceRef = useRef<HTMLDivElement>(null);
  const gifRef = useRef<HTMLImageElement>(null);

  const [isHovering, setIsHovering] = useState(false);
  const [showGif, setShowGif] = useState(false);
  const [gifKey, setGifKey] = useState(0);
  const isPlayingRef = useRef(false);
  const wantsToHideRef = useRef(false);

  // Use 3000ms to let it play fully to the end
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
        startGif(); // loop
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
      // Let it finish its current loop before hiding
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

  return (
    <div
      className="hero-face hero-face-br"
      aria-hidden="true"
      ref={faceRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ pointerEvents: 'auto' }}
    >
      {/* GIF layer — sits on top of the PNG, hidden until hover */}
      <img
        key={gifKey}
        ref={gifRef}
        src="/facesgifs/BottomRightFace.webp"
        alt=""
        className="hero-face-gif"
        style={{
          opacity: showGif ? 1 : 0,
          pointerEvents: 'none',
        }}
      />

      <Image
        src="/faces/face-br.webp"
        alt=""
        fill
        sizes="(max-width: 768px) 78vw, 38vw"
        priority
        className="hero-face-image"
      />
    </div>
  );
}

'use client';

import React, { useState, useEffect, useRef } from 'react';

interface Position {
  top: number;
  left: number;
}

const DEFAULT_POSITIONS: Record<string, Position> = {
  'blue-lotus': { top: -31, left: -28 },
  'lotus': { top: -18, left: 112 },
  'mango-blossom': { top: 65.57, left: 92 },
  'jasmine': { top: 10, left: -75 },
  'ashoka': { top: 60.55, left: -48 },
};

const FLOWER_LABELS: Record<string, string> = {
  'blue-lotus': 'Blue Lotus',
  'lotus': 'Lotus',
  'mango-blossom': 'Mango Blossom',
  'jasmine': 'Jasmine',
  'ashoka': 'Ashoka',
};

const STORAGE_KEY = 'chitkala_ultrawide_29in_positions';

export default function FlowerUltrawideDevTool() {
  const [isOpen, setIsOpen] = useState(false);
  const [positions, setPositions] = useState<Record<string, Position>>(DEFAULT_POSITIONS);
  const [handY, setHandY] = useState(6); // in vh
  const [tickerOffset, setTickerOffset] = useState(50); // in px
  const [forceShow, setForceShow] = useState(false);
  const [dragEnabled, setDragEnabled] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isUltrawideActive, setIsUltrawideActive] = useState(false);
  const [activeTab, setActiveTab] = useState<'positions' | 'layout' | 'css'>('positions');

  // Check URL parameter (?dev=true) or localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if ?dev=true is in query params
    const params = new URLSearchParams(window.location.search);
    if (params.get('dev') === 'true') {
      setIsOpen(true);
    }

    // Keyboard shortcut: Ctrl + Shift + D to toggle
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'D' || e.key === 'd')) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Detect if current screen matches 29-inch ultrawide resolution
    const mql = window.matchMedia('(min-width: 2400px) and (min-aspect-ratio: 2/1)');
    const checkUltrawide = () => setIsUltrawideActive(mql.matches);
    checkUltrawide();
    mql.addEventListener('change', checkUltrawide);

    // Load saved settings from localStorage
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.positions) setPositions(parsed.positions);
        if (typeof parsed.handY === 'number') setHandY(parsed.handY);
        if (typeof parsed.tickerOffset === 'number') setTickerOffset(parsed.tickerOffset);
      }
    } catch (e) {
      console.warn('Failed to load ultrawide dev settings', e);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      mql.removeEventListener('change', checkUltrawide);
    };
  }, []);

  // Apply CSS variables dynamically to the document root
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;

    Object.entries(positions).forEach(([id, pos]) => {
      root.style.setProperty(`--uw-${id}-top`, `${pos.top}%`);
      root.style.setProperty(`--uw-${id}-left`, `${pos.left}%`);
    });

    root.style.setProperty('--uw-hand-y', `${handY}vh`);
    root.style.setProperty('--uw-ticker-offset', `${tickerOffset}px`);
  }, [positions, handY, tickerOffset]);

  // Toggle .force-show-tickets on hand-flowers-container
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const container = document.querySelector('.hand-flowers-container');
    if (!container) return;

    if (forceShow) {
      container.classList.add('force-show-tickets');
    } else {
      container.classList.remove('force-show-tickets');
    }

    return () => {
      container.classList.remove('force-show-tickets');
    };
  }, [forceShow]);

  // Direct canvas drag-and-drop for tickets
  const draggingRef = useRef<{ id: string; startMouseX: number; startMouseY: number; startLeft: number; startTop: number } | null>(null);

  useEffect(() => {
    if (!dragEnabled || !isOpen) return;

    const handleMouseDown = (e: MouseEvent) => {
      const ticketEl = (e.target as HTMLElement).closest('.flower-ticket');
      if (!ticketEl) return;

      const container = document.querySelector('.hand-flowers-container');
      if (!container) return;

      // Identify which flower ticket this is
      const classes = Array.from(ticketEl.classList);
      const match = classes.find((c) => c.startsWith('ticket-'));
      if (!match) return;

      const flowerId = match.replace('ticket-', '');
      if (!positions[flowerId]) return;

      e.preventDefault();
      draggingRef.current = {
        id: flowerId,
        startMouseX: e.clientX,
        startMouseY: e.clientY,
        startLeft: positions[flowerId].left,
        startTop: positions[flowerId].top,
      };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!draggingRef.current) return;
      const { id, startMouseX, startMouseY, startLeft, startTop } = draggingRef.current;
      const container = document.querySelector('.hand-flowers-container');
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const deltaX = e.clientX - startMouseX;
      const deltaY = e.clientY - startMouseY;

      // Convert pixel delta to percentage of container width and height
      const deltaPercentX = (deltaX / rect.width) * 100;
      const deltaPercentY = (deltaY / rect.height) * 100;

      const newTop = parseFloat((startTop + deltaPercentY).toFixed(2));
      const newLeft = parseFloat((startLeft + deltaPercentX).toFixed(2));

      setPositions((prev) => ({
        ...prev,
        [id]: { top: newTop, left: newLeft },
      }));
    };

    const handleMouseUp = () => {
      draggingRef.current = null;
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragEnabled, isOpen, positions]);

  const updatePosition = (id: string, axis: 'top' | 'left', val: number) => {
    setPositions((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [axis]: val,
      },
    }));
  };

  const handleSave = () => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ positions, handY, tickerOffset })
      );
      alert('Saved locally! Your 29-inch display settings will persist across reloads.');
    } catch (e) {
      console.error(e);
    }
  };

  const handleReset = () => {
    if (confirm('Reset to default positions?')) {
      setPositions(DEFAULT_POSITIONS);
      setHandY(6);
      setTickerOffset(50);
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) {}
    }
  };

  const generateCSS = () => {
    return `/* ===== 29-inch Ultrawide Display Adjustments (2560x1080) ===== */
/* Strictly scoped to ~2560px width with ultrawide aspect ratio (>= 21/9) */
@media screen and (min-width: 2400px) and (min-aspect-ratio: 2/1) {
  /* Shifts hand & flowers down */
  .hand-flowers-container {
    transform: translateY(calc(${handY}vh + var(--hand-y, 0rem)));
  }

  /* Shifts hero bottom ticker text down */
  .hero-bottom-text-container {
    transform: translateY(calc(clamp(135px, 32vh, 315px) * 0.85 + ${tickerOffset}px));
  }

  /* 29" Ultrawide Flower Ticket Positions */
  .flower-ticket.ticket-blue-lotus {
    top: ${positions['blue-lotus'].top}% !important;
    left: ${positions['blue-lotus'].left}% !important;
  }

  .flower-ticket.ticket-lotus {
    top: ${positions['lotus'].top}% !important;
    left: ${positions['lotus'].left}% !important;
  }

  .flower-ticket.ticket-mango-blossom {
    top: ${positions['mango-blossom'].top}% !important;
    left: ${positions['mango-blossom'].left}% !important;
  }

  .flower-ticket.ticket-jasmine {
    top: ${positions['jasmine'].top}% !important;
    left: ${positions['jasmine'].left}% !important;
  }

  .flower-ticket.ticket-ashoka {
    top: ${positions['ashoka'].top}% !important;
    left: ${positions['ashoka'].left}% !important;
  }
}`;
  };

  const handleCopyCSS = () => {
    navigator.clipboard.writeText(generateCSS()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <>
      {/* Floating Toggle Button (Always accessible or toggle with Ctrl+Shift+D) */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          zIndex: 99999,
          background: isUltrawideActive ? '#E34234' : '#1e1e1e',
          color: '#ffffff',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          borderRadius: '9999px',
          padding: '8px 14px',
          fontSize: '12px',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
          cursor: 'pointer',
          backdropFilter: 'blur(8px)',
        }}
        title="Toggle 29-Inch Ultrawide Dev Tool (Ctrl + Shift + D)"
      >
        <span>🛠️ 29&quot; Display Dev</span>
        {isUltrawideActive && (
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#10B981',
              display: 'inline-block',
            }}
            title="Ultrawide Screen Active"
          />
        )}
      </button>

      {/* Dev Control Modal/Panel */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '70px',
            left: '20px',
            width: '380px',
            maxHeight: '82vh',
            overflowY: 'auto',
            background: 'rgba(20, 20, 22, 0.96)',
            color: '#f0f0f0',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '16px',
            boxShadow: '0 18px 40px rgba(0, 0, 0, 0.65)',
            zIndex: 100000,
            padding: '18px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: '13px',
            backdropFilter: 'blur(16px)',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', paddingBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>29&quot; Ultrawide Dev Studio</span>
                <span style={{ fontSize: '10px', background: isUltrawideActive ? '#059669' : '#4B5563', padding: '2px 6px', borderRadius: '4px' }}>
                  {isUltrawideActive ? '29" Active' : 'Desktop Mode'}
                </span>
              </div>
              <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '2px' }}>
                Strictly scoped to 2560x1080 display
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#9CA3AF',
                cursor: 'pointer',
                fontSize: '18px',
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>

          {/* Quick Toggles */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
            <button
              onClick={() => setForceShow(!forceShow)}
              style={{
                flex: 1,
                padding: '6px 10px',
                background: forceShow ? '#E34234' : 'rgba(255,255,255,0.08)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 500,
              }}
            >
              {forceShow ? '👁️ Tickets: Visible' : '👁️ Force Show All'}
            </button>
            <button
              onClick={() => setDragEnabled(!dragEnabled)}
              style={{
                flex: 1,
                padding: '6px 10px',
                background: dragEnabled ? '#2563EB' : 'rgba(255,255,255,0.08)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 500,
              }}
            >
              {dragEnabled ? '✋ Drag: Enabled' : '✋ Drag: Disabled'}
            </button>
          </div>

          {/* Navigation Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '14px' }}>
            {(['positions', 'layout', 'css'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  flex: 1,
                  padding: '6px 0',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: activeTab === tab ? '2px solid #E34234' : '2px solid transparent',
                  color: activeTab === tab ? '#fff' : '#9CA3AF',
                  cursor: 'pointer',
                  fontWeight: activeTab === tab ? 600 : 400,
                  textTransform: 'capitalize',
                  fontSize: '12px',
                }}
              >
                {tab === 'css' ? 'Export CSS' : tab}
              </button>
            ))}
          </div>

          {/* Tab 1: Flower Ticket Coordinates */}
          {activeTab === 'positions' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontSize: '11px', color: '#9CA3AF', background: 'rgba(255,255,255,0.04)', padding: '6px 10px', borderRadius: '6px' }}>
                💡 <strong>Tip:</strong> Drag tickets directly with your mouse on screen, or fine-tune using these sliders:
              </div>

              {Object.entries(positions).map(([id, pos]) => (
                <div
                  key={id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    padding: '10px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <div style={{ fontWeight: 600, color: '#F3F4F6', marginBottom: '8px', fontSize: '12px' }}>
                    {FLOWER_LABELS[id] || id}
                  </div>
                  {/* Top Slider */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ width: '38px', color: '#9CA3AF', fontSize: '11px' }}>Top:</span>
                    <input
                      type="range"
                      min="-120"
                      max="140"
                      step="0.5"
                      value={pos.top}
                      onChange={(e) => updatePosition(id, 'top', parseFloat(e.target.value))}
                      style={{ flex: 1, accentColor: '#E34234', cursor: 'pointer' }}
                    />
                    <input
                      type="number"
                      value={pos.top}
                      step="0.5"
                      onChange={(e) => updatePosition(id, 'top', parseFloat(e.target.value) || 0)}
                      style={{
                        width: '56px',
                        background: '#262626',
                        color: '#fff',
                        border: '1px solid #404040',
                        borderRadius: '4px',
                        padding: '2px 4px',
                        fontSize: '11px',
                        textAlign: 'right',
                      }}
                    />
                    <span style={{ fontSize: '10px', color: '#9CA3AF' }}>%</span>
                  </div>

                  {/* Left Slider */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '38px', color: '#9CA3AF', fontSize: '11px' }}>Left:</span>
                    <input
                      type="range"
                      min="-120"
                      max="160"
                      step="0.5"
                      value={pos.left}
                      onChange={(e) => updatePosition(id, 'left', parseFloat(e.target.value))}
                      style={{ flex: 1, accentColor: '#2563EB', cursor: 'pointer' }}
                    />
                    <input
                      type="number"
                      value={pos.left}
                      step="0.5"
                      onChange={(e) => updatePosition(id, 'left', parseFloat(e.target.value) || 0)}
                      style={{
                        width: '56px',
                        background: '#262626',
                        color: '#fff',
                        border: '1px solid #404040',
                        borderRadius: '4px',
                        padding: '2px 4px',
                        fontSize: '11px',
                        textAlign: 'right',
                      }}
                    />
                    <span style={{ fontSize: '10px', color: '#9CA3AF' }}>%</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab 2: Layout & Ticker Tuning */}
          {activeTab === 'layout' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ background: 'rgba(255,255,255,0.04)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontWeight: 600, marginBottom: '6px' }}>Hand &amp; Flowers Container Y-Offset</div>
                <div style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '10px' }}>
                  Lowers or raises the entire hand illustration on ultrawide viewports.
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="range"
                    min="-10"
                    max="25"
                    step="0.5"
                    value={handY}
                    onChange={(e) => setHandY(parseFloat(e.target.value))}
                    style={{ flex: 1, accentColor: '#E34234' }}
                  />
                  <span style={{ minWidth: '45px', textAlign: 'right', fontWeight: 600 }}>{handY} vh</span>
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.04)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontWeight: 600, marginBottom: '6px' }}>Bottom Marquee Ticker Offset</div>
                <div style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '10px' }}>
                  Controls vertical placement of &quot;Branding, Design &amp; Motion&quot; text to prevent overlap.
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="range"
                    min="0"
                    max="120"
                    step="2"
                    value={tickerOffset}
                    onChange={(e) => setTickerOffset(parseInt(e.target.value, 10))}
                    style={{ flex: 1, accentColor: '#2563EB' }}
                  />
                  <span style={{ minWidth: '45px', textAlign: 'right', fontWeight: 600 }}>{tickerOffset} px</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Generated CSS */}
          {activeTab === 'css' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '11px', color: '#9CA3AF' }}>
                Copy and paste this CSS into <code>globals.css</code> to permanently bake in these 29&quot; display settings:
              </div>
              <textarea
                readOnly
                value={generateCSS()}
                style={{
                  width: '100%',
                  height: '240px',
                  background: '#121214',
                  color: '#A7F3D0',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  fontFamily: 'monospace',
                  fontSize: '10.5px',
                  padding: '8px',
                  resize: 'vertical',
                }}
              />
              <button
                onClick={handleCopyCSS}
                style={{
                  padding: '10px',
                  background: copied ? '#059669' : '#E34234',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                {copied ? '✓ Copied to Clipboard!' : '📋 Copy CSS Rule'}
              </button>
            </div>
          )}

          {/* Bottom Actions */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <button
              onClick={handleSave}
              style={{
                flex: 1,
                padding: '8px',
                background: '#10B981',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              💾 Save Locally
            </button>
            <button
              onClick={handleReset}
              style={{
                padding: '8px 12px',
                background: 'rgba(255,255,255,0.08)',
                color: '#9CA3AF',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </>
  );
}

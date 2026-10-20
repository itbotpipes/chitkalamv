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

type PresetKey = 'all-large' | 'ultrawide-21-9' | 'super-ultrawide-32-9' | '4k-uhd' | 'custom';

interface DisplayPreset {
  id: PresetKey;
  name: string;
  description: string;
  mediaQuery: string;
}

const PRESETS: DisplayPreset[] = [
  {
    id: 'all-large',
    name: 'All Large Screens (> 1920px)',
    description: 'Any display wider than standard 1080p desktop (2K, 4K, Ultrawides, TVs)',
    mediaQuery: 'screen and (min-width: 1921px)',
  },
  {
    id: 'ultrawide-21-9',
    name: '21:9 Ultrawides (29" & 34")',
    description: '2560x1080 or 3440x1440 with 21:9 aspect ratio',
    mediaQuery: 'screen and (min-width: 2400px) and (min-aspect-ratio: 2/1)',
  },
  {
    id: 'super-ultrawide-32-9',
    name: '32:9 Super Ultrawides (49")',
    description: '5120x1440 with 32:9 ultra-panoramic aspect ratio',
    mediaQuery: 'screen and (min-width: 3840px) and (min-aspect-ratio: 2.5/1)',
  },
  {
    id: '4k-uhd',
    name: '4K UHD Screens (3840x2160)',
    description: 'High-density 4K displays and large monitors',
    mediaQuery: 'screen and (min-width: 3200px)',
  },
  {
    id: 'custom',
    name: 'Custom Display Size',
    description: 'Manually defined width and aspect ratio',
    mediaQuery: '',
  },
];

const STORAGE_KEY = 'chitkala_large_display_custom_settings';

export default function FlowerUltrawideDevTool() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<PresetKey>('all-large');
  const [customMinWidth, setCustomMinWidth] = useState(2000);
  const [customMinAspectRatio, setCustomMinAspectRatio] = useState('2/1');
  const [useAspectRatio, setUseAspectRatio] = useState(false);
  
  const [positions, setPositions] = useState<Record<string, Position>>(DEFAULT_POSITIONS);
  const [handY, setHandY] = useState(6); // in vh
  const [tickerOffset, setTickerOffset] = useState(50); // in px
  const [forceShow, setForceShow] = useState(false);
  const [dragEnabled, setDragEnabled] = useState(true);
  const [previewAlways, setPreviewAlways] = useState(true);
  const [copied, setCopied] = useState(false);
  
  // Real-time screen telemetry
  const [screenWidth, setScreenWidth] = useState(0);
  const [screenHeight, setScreenHeight] = useState(0);
  const [screenRatio, setScreenRatio] = useState(0);
  const [isCurrentScreenTargeted, setIsCurrentScreenTargeted] = useState(false);

  const [activeTab, setActiveTab] = useState<'positions' | 'layout' | 'preset' | 'css'>('positions');

  // Measure screen dynamically
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const measure = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      setScreenWidth(w);
      setScreenHeight(h);
      setScreenRatio(parseFloat((w / h).toFixed(2)));
    };

    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  // Compute active media query
  const getActiveMediaQuery = (): string => {
    if (selectedPreset === 'custom') {
      if (useAspectRatio && customMinAspectRatio) {
        return `screen and (min-width: ${customMinWidth}px) and (min-aspect-ratio: ${customMinAspectRatio})`;
      }
      return `screen and (min-width: ${customMinWidth}px)`;
    }
    const found = PRESETS.find((p) => p.id === selectedPreset);
    return found ? found.mediaQuery : 'screen and (min-width: 1921px)';
  };

  // Evaluate whether current screen matches active media query
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const query = getActiveMediaQuery();
      const mql = window.matchMedia(query);
      setIsCurrentScreenTargeted(mql.matches);

      const handler = (e: MediaQueryListEvent) => setIsCurrentScreenTargeted(e.matches);
      mql.addEventListener('change', handler);
      return () => mql.removeEventListener('change', handler);
    } catch (e) {
      // Fallback
      setIsCurrentScreenTargeted(screenWidth > 1920);
    }
  }, [selectedPreset, customMinWidth, customMinAspectRatio, useAspectRatio, screenWidth, screenHeight]);

  // Handle URL (?dev=true) and keyboard toggle (Ctrl+Shift+D)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    if (params.get('dev') === 'true') {
      setIsOpen(true);
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'D' || e.key === 'd')) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Load saved settings
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.positions) setPositions(parsed.positions);
        if (typeof parsed.handY === 'number') setHandY(parsed.handY);
        if (typeof parsed.tickerOffset === 'number') setTickerOffset(parsed.tickerOffset);
        if (parsed.selectedPreset) setSelectedPreset(parsed.selectedPreset);
        if (parsed.customMinWidth) setCustomMinWidth(parsed.customMinWidth);
        if (parsed.customMinAspectRatio) setCustomMinAspectRatio(parsed.customMinAspectRatio);
        if (typeof parsed.useAspectRatio === 'boolean') setUseAspectRatio(parsed.useAspectRatio);
      }
    } catch (e) {
      console.warn('Failed to load display studio settings', e);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Live CSS injection: applies styles to the page
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;

    // Apply via CSS variables
    Object.entries(positions).forEach(([id, pos]) => {
      root.style.setProperty(`--large-display-${id}-top`, `${pos.top}%`);
      root.style.setProperty(`--large-display-${id}-left`, `${pos.left}%`);
      root.style.setProperty(`--uw-${id}-top`, `${pos.top}%`);
      root.style.setProperty(`--uw-${id}-left`, `${pos.left}%`);
    });

    root.style.setProperty('--large-display-hand-y', `${handY}vh`);
    root.style.setProperty('--large-display-ticker-offset', `${tickerOffset}px`);
    root.style.setProperty('--uw-hand-y', `${handY}vh`);
    root.style.setProperty('--uw-ticker-offset', `${tickerOffset}px`);

    // In dev preview mode, inject scoped live style tag if previewAlways is ON
    let styleTag = document.getElementById('chitkala-live-display-preview') as HTMLStyleElement | null;
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = 'chitkala-live-display-preview';
      document.head.appendChild(styleTag);
    }

    if (previewAlways && isOpen) {
      styleTag.innerHTML = `
        /* Live Dev Studio Preview - Active on current preview canvas */
        .hand-flowers-container {
          transform: translateY(calc(${handY}vh + var(--hand-y, 0rem))) !important;
        }
        .hero-bottom-text-container {
          transform: translateY(calc(clamp(135px, 32vh, 315px) * 0.85 + ${tickerOffset}px)) !important;
        }
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
      `;
    } else {
      styleTag.innerHTML = '';
    }
  }, [positions, handY, tickerOffset, previewAlways, isOpen]);

  // Toggle .force-show-tickets
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

  // Interactive ticket drag-and-drop
  const draggingRef = useRef<{ id: string; startMouseX: number; startMouseY: number; startLeft: number; startTop: number } | null>(null);

  useEffect(() => {
    if (!dragEnabled || !isOpen) return;

    const handleMouseDown = (e: MouseEvent) => {
      const ticketEl = (e.target as HTMLElement).closest('.flower-ticket');
      if (!ticketEl) return;

      const container = document.querySelector('.hand-flowers-container');
      if (!container) return;

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
        JSON.stringify({
          positions,
          handY,
          tickerOffset,
          selectedPreset,
          customMinWidth,
          customMinAspectRatio,
          useAspectRatio,
        })
      );
      alert('Settings saved locally! These coordinates will persist on your display.');
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
    const query = getActiveMediaQuery();
    return `/* ===== Display Adjustments for ${PRESETS.find(p => p.id === selectedPreset)?.name || 'Custom Display'} ===== */
/* Mobile (<= 768px), Tablet (769px-1024px), and Standard Desktop (<= 1920px) are 100% UNTOUCHED */
@media ${query} {
  /* Shifts hand & flowers down */
  .hand-flowers-container {
    transform: translateY(calc(${handY}vh + var(--hand-y, 0rem)));
  }

  /* Shifts hero bottom ticker text down */
  .hero-bottom-text-container {
    transform: translateY(calc(clamp(135px, 32vh, 315px) * 0.85 + ${tickerOffset}px));
  }

  /* Flower Ticket Positions */
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
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          zIndex: 99999,
          background: isCurrentScreenTargeted ? '#E34234' : '#1e1e1e',
          color: '#ffffff',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          borderRadius: '9999px',
          padding: '8px 16px',
          fontSize: '12px',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.35)',
          cursor: 'pointer',
          backdropFilter: 'blur(8px)',
        }}
        title="Toggle Display Customizer Studio (Ctrl + Shift + D)"
      >
        <span>🖥️ Display Studio</span>
        <span
          style={{
            fontSize: '10px',
            background: isCurrentScreenTargeted ? '#10B981' : '#4B5563',
            color: '#fff',
            padding: '1px 6px',
            borderRadius: '10px',
          }}
        >
          {screenWidth > 0 ? `${screenWidth}px` : 'Dev'}
        </span>
      </button>

      {/* Dev Control Modal */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '70px',
            left: '20px',
            width: '400px',
            maxHeight: '84vh',
            overflowY: 'auto',
            background: 'rgba(20, 20, 24, 0.97)',
            color: '#f3f4f6',
            border: '1px solid rgba(255, 255, 255, 0.16)',
            borderRadius: '16px',
            boxShadow: '0 20px 48px rgba(0, 0, 0, 0.7)',
            zIndex: 100000,
            padding: '18px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: '13px',
            backdropFilter: 'blur(20px)',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', paddingBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>Display Customizer Studio</span>
              </div>
              <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '3px' }}>
                Tuning for any large/ultrawide screen size
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#9CA3AF',
                cursor: 'pointer',
                fontSize: '20px',
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>

          {/* Live Screen Sensor Badge */}
          <div
            style={{
              background: isCurrentScreenTargeted ? 'rgba(16, 185, 129, 0.12)' : 'rgba(59, 130, 246, 0.1)',
              border: `1px solid ${isCurrentScreenTargeted ? 'rgba(16, 185, 129, 0.3)' : 'rgba(59, 130, 246, 0.25)'}`,
              borderRadius: '8px',
              padding: '8px 10px',
              marginBottom: '12px',
              fontSize: '11px',
              display: 'flex',
              flexDirection: 'column',
              gap: '3px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600, color: '#fff' }}>
                Current Viewport: {screenWidth} × {screenHeight} ({screenRatio}:1)
              </span>
              <span
                style={{
                  background: isCurrentScreenTargeted ? '#059669' : '#3B82F6',
                  color: '#fff',
                  fontSize: '9.5px',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontWeight: 600,
                }}
              >
                {isCurrentScreenTargeted ? 'Target Matched' : 'Standard View'}
              </span>
            </div>
            <div style={{ color: '#9CA3AF', fontSize: '10.5px' }}>
              🛡️ Standard Desktop (≤ 1920px), Tablet &amp; Mobile are strictly safeguarded.
            </div>
          </div>

          {/* Quick Action Toggles */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <button
              onClick={() => setForceShow(!forceShow)}
              style={{
                flex: 1,
                padding: '7px 8px',
                background: forceShow ? '#E34234' : 'rgba(255,255,255,0.08)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 500,
              }}
            >
              {forceShow ? '👁️ All Visible' : '👁️ Force Show All'}
            </button>
            <button
              onClick={() => setDragEnabled(!dragEnabled)}
              style={{
                flex: 1,
                padding: '7px 8px',
                background: dragEnabled ? '#2563EB' : 'rgba(255,255,255,0.08)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 500,
              }}
            >
              {dragEnabled ? '✋ Drag: ON' : '✋ Drag: OFF'}
            </button>
            <button
              onClick={() => setPreviewAlways(!previewAlways)}
              style={{
                flex: 1,
                padding: '7px 8px',
                background: previewAlways ? '#059669' : 'rgba(255,255,255,0.08)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 500,
              }}
              title="Preview adjustments on current screen regardless of display size"
            >
              {previewAlways ? '⚡ Live Preview' : '⚡ Preview: OFF'}
            </button>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '14px' }}>
            {(['positions', 'preset', 'layout', 'css'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  flex: 1,
                  padding: '7px 0',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: activeTab === tab ? '2px solid #E34234' : '2px solid transparent',
                  color: activeTab === tab ? '#fff' : '#9CA3AF',
                  cursor: 'pointer',
                  fontWeight: activeTab === tab ? 600 : 400,
                  fontSize: '12px',
                  textTransform: 'capitalize',
                }}
              >
                {tab === 'css' ? 'Export CSS' : tab === 'preset' ? 'Display Type' : tab}
              </button>
            ))}
          </div>

          {/* Tab 1: Ticket Positions */}
          {activeTab === 'positions' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '11px', color: '#9CA3AF', background: 'rgba(255,255,255,0.04)', padding: '6px 10px', borderRadius: '6px' }}>
                💡 Click &amp; drag tickets directly on the canvas, or fine-tune below:
              </div>

              {Object.entries(positions).map(([id, pos]) => (
                <div
                  key={id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <div style={{ fontWeight: 600, color: '#F3F4F6', marginBottom: '6px', fontSize: '11.5px' }}>
                    {FLOWER_LABELS[id] || id}
                  </div>
                  {/* Top Slider */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                    <span style={{ width: '34px', color: '#9CA3AF', fontSize: '10.5px' }}>Top:</span>
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
                        width: '52px',
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
                    <span style={{ width: '34px', color: '#9CA3AF', fontSize: '10.5px' }}>Left:</span>
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
                        width: '52px',
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

          {/* Tab 2: Display Type & Presets */}
          {activeTab === 'preset' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '4px' }}>
                Choose which display size these position adjustments will apply to:
              </div>

              {PRESETS.map((preset) => (
                <div
                  key={preset.id}
                  onClick={() => setSelectedPreset(preset.id)}
                  style={{
                    background: selectedPreset === preset.id ? 'rgba(227, 66, 52, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                    border: selectedPreset === preset.id ? '1px solid #E34234' : '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px',
                    padding: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ fontWeight: 600, color: '#fff', fontSize: '12px' }}>
                    {preset.name}
                  </div>
                  <div style={{ color: '#9CA3AF', fontSize: '11px', marginTop: '2px' }}>
                    {preset.description}
                  </div>
                  {preset.mediaQuery && (
                    <div style={{ color: '#6EE7B7', fontSize: '10px', fontFamily: 'monospace', marginTop: '4px' }}>
                      @media {preset.mediaQuery}
                    </div>
                  )}
                </div>
              ))}

              {/* Custom Display Inputs */}
              {selectedPreset === 'custom' && (
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    marginTop: '6px',
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: '8px', fontSize: '12px' }}>Custom Breakpoint Settings</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', color: '#9CA3AF', width: '90px' }}>Min-Width:</span>
                    <input
                      type="number"
                      value={customMinWidth}
                      onChange={(e) => setCustomMinWidth(parseInt(e.target.value, 10) || 1921)}
                      style={{
                        flex: 1,
                        background: '#262626',
                        color: '#fff',
                        border: '1px solid #404040',
                        borderRadius: '4px',
                        padding: '4px 8px',
                        fontSize: '11px',
                      }}
                    />
                    <span style={{ fontSize: '11px', color: '#9CA3AF' }}>px</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <label style={{ fontSize: '11px', color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={useAspectRatio}
                        onChange={(e) => setUseAspectRatio(e.target.checked)}
                      />
                      Filter by Aspect Ratio
                    </label>
                  </div>

                  {useAspectRatio && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '11px', color: '#9CA3AF', width: '90px' }}>Min Ratio:</span>
                      <input
                        type="text"
                        value={customMinAspectRatio}
                        placeholder="e.g. 21/9 or 2/1"
                        onChange={(e) => setCustomMinAspectRatio(e.target.value)}
                        style={{
                          flex: 1,
                          background: '#262626',
                          color: '#fff',
                          border: '1px solid #404040',
                          borderRadius: '4px',
                          padding: '4px 8px',
                          fontSize: '11px',
                        }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Layout (Hand & Ticker) */}
          {activeTab === 'layout' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ background: 'rgba(255,255,255,0.04)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontWeight: 600, marginBottom: '6px' }}>Hand &amp; Flowers Container Y-Offset</div>
                <div style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '10px' }}>
                  Lowers or raises the entire hand illustration on wide screens.
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

          {/* Tab 4: Generated CSS */}
          {activeTab === 'css' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '11px', color: '#9CA3AF' }}>
                Copy and paste this CSS into <code>globals.css</code> to permanently apply these settings for this display type:
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

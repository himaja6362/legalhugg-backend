import React from 'react';
import { PageRoute } from '../App';

export interface SpatialNodeItem {
  code: string;
  id: PageRoute;
  label: string;
  x: number;
  y: number;
}

interface SpatialNavigationPathProps {
  activePage: PageRoute;
  onNavigate: (route: PageRoute) => void;
  labels: {
    welcome: string;
    dashboard: string;
    analyze: string;
    qa: string;
    history: string;
    reports: string;
    languageVoice: string;
    settingsPrivacy: string;
    login: string;
  };
  variant?: 'hero' | 'rail';
}

/**
 * Spatial coordinates designed so that:
 * - In 'rail' mode, the sinuous SVG path flows along the left channel (x: 24..54 within a 280px viewBox),
 *   leaving generous room on the right for full, unclipped module labels inside a 280–320px sidebar.
 * - In 'hero' mode, the path flows across a wider canvas (360x560) with balanced alternating or clear labels
 *   that never clip at container edges.
 */
export const SPATIAL_NODE_COORDS: Array<{
  code: string;
  id: PageRoute;
  key: keyof SpatialNavigationPathProps['labels'];
  railX: number;
  railY: number;
  heroX: number;
  heroY: number;
}> = [
  { code: '01', id: 'welcome', key: 'welcome', railX: 34, railY: 32, heroX: 52, heroY: 36 },
  { code: '02', id: 'dashboard', key: 'dashboard', railX: 22, railY: 88, heroX: 32, heroY: 96 },
  { code: '03', id: 'analyze', key: 'analyze', railX: 46, railY: 144, heroX: 68, heroY: 156 },
  { code: '04', id: 'qa', key: 'qa', railX: 26, railY: 200, heroX: 38, heroY: 216 },
  { code: '05', id: 'history', key: 'history', railX: 44, railY: 256, heroX: 64, heroY: 276 },
  { code: '06', id: 'reports', key: 'reports', railX: 24, railY: 312, heroX: 34, heroY: 336 },
  { code: '07', id: 'language-voice', key: 'languageVoice', railX: 42, railY: 368, heroX: 62, heroY: 396 },
  { code: '08', id: 'settings', key: 'settingsPrivacy', railX: 26, railY: 424, heroX: 36, heroY: 456 },
  { code: '09', id: 'login', key: 'login', railX: 38, railY: 480, heroX: 54, heroY: 516 },
];

export const SpatialNavigationPath: React.FC<SpatialNavigationPathProps> = ({
  activePage,
  onNavigate,
  labels,
  variant = 'rail',
}) => {
  const effectiveActive: PageRoute = activePage === 'profile' ? 'settings' : activePage;
  const isHero = variant === 'hero';
  const viewWidth = isHero ? 340 : 280;
  const viewHeight = isHero ? 552 : 512;

  // Build smooth cubic bezier SVG path connecting the 9 irregular nodes
  const buildSvgPath = () => {
    const pts = SPATIAL_NODE_COORDS.map((n) => ({
      x: isHero ? n.heroX : n.railX,
      y: isHero ? n.heroY : n.railY,
    }));
    if (pts.length === 0) return '';
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const curr = pts[i];
      const next = pts[i + 1];
      const midY = (curr.y + next.y) / 2;
      d += ` C ${curr.x} ${midY}, ${next.x} ${midY}, ${next.x} ${next.y}`;
    }
    return d;
  };

  const pathD = buildSvgPath();
  const axisX = isHero ? 50 : 34;

  return (
    <div
      className={`relative select-none w-full ${
        isHero ? 'max-w-[360px] h-[552px] mx-auto' : 'h-[512px]'
      }`}
      role="navigation"
      aria-label="Spatial Application Navigation Path"
    >
      {/* Subtle geometric coordinate crosshairs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-85">
        <div className="absolute top-1 right-2 text-[9px] font-mono tracking-[0.22em] text-[#4d4a45]">
          SYS // 01—09
        </div>
        <div className="absolute bottom-1 right-2 text-[9px] font-mono tracking-[0.22em] text-[#4d4a45]">
          AXIS // Y-SPATIAL
        </div>
      </div>

      <svg
        viewBox={`0 0 ${viewWidth} ${viewHeight}`}
        className="w-full h-full overflow-visible"
        aria-hidden="true"
      >
        {/* Subtle vertical axis guide */}
        <line
          x1={axisX}
          y1="14"
          x2={axisX}
          y2={viewHeight - 14}
          stroke="#787166"
          strokeWidth="0.85"
          strokeDasharray="2 6"
        />

        {/* Irregular flowing charcoal path */}
        <path
          d={pathD}
          fill="none"
          stroke="#1a1a1a"
          strokeWidth="1.35"
          strokeLinecap="round"
        />

        {/* Secondary delicate echo path */}
        <path
          d={pathD}
          fill="none"
          stroke="#57534e"
          strokeWidth="0.75"
          strokeDasharray="3 5"
          transform="translate(5, 2)"
        />

        {/* Node markers along the SVG path */}
        {SPATIAL_NODE_COORDS.map((node) => {
          const isSelected = effectiveActive === node.id;
          const cx = isHero ? node.heroX : node.railX;
          const cy = isHero ? node.heroY : node.railY;
          return (
            <g key={node.code} transform={`translate(${cx}, ${cy})`}>
              {/* Outer dashed orbital ring on active node */}
              {isSelected && (
                <>
                  <circle
                    r="15"
                    fill="none"
                    stroke="#141413"
                    strokeWidth="1.1"
                    strokeDasharray="3 3"
                    className="animate-spin-slow"
                  />
                  <circle
                    r="9.5"
                    fill="none"
                    stroke="#141413"
                    strokeWidth="0.85"
                  />
                </>
              )}

              {/* Subtle ring on inactive nodes */}
              {!isSelected && (
                <circle
                  r="7.5"
                  fill="#f5ecd9"
                  stroke="#44403c"
                  strokeWidth="0.95"
                  strokeDasharray="2 2"
                />
              )}

              {/* Core node point */}
              <circle
                r={isSelected ? '4.25' : '3'}
                fill={isSelected ? '#141413' : '#2e2c29'}
              />
            </g>
          );
        })}
      </svg>

      {/* Interactive Accessible Buttons Positioned at Each Spatial Node */}
      {SPATIAL_NODE_COORDS.map((node) => {
        const isSelected = effectiveActive === node.id;
        const cx = isHero ? node.heroX : node.railX;
        const cy = isHero ? node.heroY : node.railY;
        const topPct = (cy / viewHeight) * 100;
        const leftPx = cx + 18;
        const labelText = labels[node.key];

        return (
          <button
            key={node.code}
            type="button"
            onClick={() => onNavigate(node.id)}
            style={{
              top: `${topPct}%`,
              left: `${leftPx}px`,
              right: '4px',
            }}
            aria-current={isSelected ? 'page' : undefined}
            className="group absolute -translate-y-1/2 text-left focus:outline-none focus-visible:ring-1 focus-visible:ring-neutral-950 cursor-pointer py-1.5 px-1.5 transition-all"
          >
            <div
              className={`flex items-baseline gap-1.5 transition-transform duration-200 ${
                isSelected ? 'translate-x-0.5' : 'group-hover:translate-x-1'
              }`}
            >
              <span
                className={`font-mono text-[10px] tracking-[0.16em] shrink-0 ${
                  isSelected
                    ? 'text-[#141413] font-bold'
                    : 'text-[#444444] font-medium group-hover:text-[#141413]'
                }`}
              >
                {node.code}
              </span>
              <span className="text-[#555555] font-mono text-[10px] shrink-0">—</span>
              <span
                className={`text-[11px] uppercase tracking-[0.11em] leading-snug break-words transition-colors ${
                  isSelected
                    ? 'text-[#141413] font-bold underline decoration-[#141413] decoration-1 underline-offset-4'
                    : 'text-[#2b2b2b] font-medium group-hover:text-[#141413]'
                }`}
              >
                {labelText}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
};

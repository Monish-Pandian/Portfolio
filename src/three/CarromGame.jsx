import { Component, forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { BOARD, CarromPhysics } from '../physics/carromPhysics.js';
import BoardScene from './BoardScene.jsx';

export function webglAvailable() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

const detectLowPower = () =>
  typeof window !== 'undefined' &&
  (window.matchMedia?.('(pointer: coarse)').matches || window.innerWidth < 700 || (navigator.hardwareConcurrency || 8) <= 4);

class Boundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error) {
    console.error('3D board failed:', error);
    this.props.onError?.();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/**
 * The playable board. `items` are the coins for the current section; `sectionIndex` is also the
 * side of the board the camera sits at.
 */
const CarromGame = forwardRef(function CarromGame(
  { active, overlayOpen = false, sectionIndex, sections, visited, onPocket, onFail },
  ref,
) {
  const section = sections[sectionIndex];
  const items = section.items;
  const lowPower = useMemo(detectLowPower, []);

  const [view, setView] = useState('striker');
  const [t, setT] = useState(0);
  const [status, setStatus] = useState('ready');
  const [hover, setHover] = useState(null);

  const hoverRef = useRef(null);
  const aimRef = useRef({ active: false, dx: 0, dy: 0, power: 0 });
  const powerRef = useRef(null);
  const onPocketRef = useRef(onPocket);
  onPocketRef.current = onPocket;

  const physics = useMemo(() => {
    const p = new CarromPhysics({ onPocket: (id) => onPocketRef.current(id) });
    p.loadSection(items.map((i) => i.id), sectionIndex);
    return p;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    physics.onStatus = setStatus;
    return () => {
      physics.onStatus = () => {};
    };
  }, [physics]);

  // New section: new coins, striker back to the middle of the new side.
  const firstRun = useRef(true);
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    physics.strikerT = 0;
    physics.loadSection(items.map((i) => i.id), sectionIndex);
    setT(0);
    hoverRef.current = null;
    setHover(null);
  }, [sectionIndex, items, physics]);

  useImperativeHandle(ref, () => ({ respawn: (id) => physics.respawn(id) }), [physics]);

  const onCoinClick = useCallback((id) => physics.shootCoin(id), [physics]);
  const onHover = useCallback((id) => setHover(id), []);
  const onPower = useCallback((p) => {
    if (powerRef.current) powerRef.current.style.transform = `scaleX(${p})`;
  }, []);

  const hoveredItem = hover ? items.find((i) => i.id === hover) : null;
  const busy = status !== 'ready';

  return (
    <div className="board-wrap">
      <Boundary onError={onFail}>
        <Canvas
          frameloop={active ? 'always' : 'never'}
          shadows={!lowPower}
          dpr={[1, lowPower ? 1.5 : 2]}
          camera={{ fov: 55, near: 0.1, far: 60, position: [0, 3.4, 4.7] }}
          gl={{ antialias: true, powerPreference: 'high-performance' }}
          aria-label="Interactive 3D carrom board"
        >
          <BoardScene
            physics={physics}
            items={items}
            sections={sections}
            side={sectionIndex}
            view={view}
            overlayOpen={overlayOpen}
            visited={visited}
            accent={section.accent}
            lowPower={lowPower}
            hoverRef={hoverRef}
            aimRef={aimRef}
            onHover={onHover}
            onCoinClick={onCoinClick}
            onPower={onPower}
          />
        </Canvas>
      </Boundary>

      <div className="board-hud">
        <div className="hud-title" aria-live="polite">
          <span className="hud-dot" style={{ background: section.accent }} />
          <strong>{section.label}</strong>
          <span className="hud-sub">
            {hoveredItem ? hoveredItem.title : `${items.length} coins · click one to pocket it`}
          </span>
        </div>

        <div className="hud-controls">
          <label className="hud-slider">
            <span>Striker</span>
            <input
              type="range"
              min={-BOARD.strikerRange}
              max={BOARD.strikerRange}
              step={5}
              value={t}
              disabled={busy}
              aria-label="Move the striker along the baseline"
              onChange={(e) => {
                const v = Number(e.target.value);
                setT(v);
                physics.setStrikerT(v);
              }}
            />
          </label>
          <button
            type="button"
            className="btn btn-sm btn-outline-light"
            onClick={() => setView((v) => (v === 'striker' ? 'overview' : 'striker'))}
          >
            {view === 'striker' ? 'Overview' : 'Striker view'}
          </button>
        </div>

        <div className="hud-hint">
          <span>
            {view === 'striker'
              ? 'Drag down to pull back, sideways to aim, release to flick. Or click a coin.'
              : 'Drag back anywhere and release to flick the striker'}
          </span>
          <div className="power" aria-hidden="true">
            <div className="power-fill" ref={powerRef} />
          </div>
        </div>
      </div>
    </div>
  );
});

export default CarromGame;

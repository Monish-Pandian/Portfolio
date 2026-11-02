import { useCallback, useEffect, useRef, useState } from 'react';
import { allItems, sections } from './data/portfolio.js';
import Navbar from './components/Navbar.jsx';
import EntryScreen from './components/EntryScreen.jsx';
import Overlay from './components/Overlay.jsx';
import ListView from './components/ListView.jsx';
import CarromGame, { webglAvailable } from './three/CarromGame.jsx';

const STORE_KEY = 'carrom-portfolio-visited';

const loadVisited = () => {
  try {
    return new Set(JSON.parse(localStorage.getItem(STORE_KEY) || '[]'));
  } catch {
    return new Set();
  }
};

export default function App() {
  const [webgl, setWebgl] = useState(() => webglAvailable());
  const [screen, setScreen] = useState('entry'); // entry | board | list
  const [sectionIndex, setSectionIndex] = useState(0);
  const [boardMounted, setBoardMounted] = useState(false);
  const [open, setOpen] = useState(null); // { item, sectionIndex, fromBoard }
  const [visited, setVisited] = useState(loadVisited);

  const gameRef = useRef(null);
  const openRef = useRef(null);
  openRef.current = open;

  useEffect(() => {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify([...visited]));
    } catch {
      /* storage can be blocked; visited marks are only a convenience */
    }
  }, [visited]);

  const close = useCallback(() => {
    const o = openRef.current;
    if (!o) return;
    if (o.fromBoard) gameRef.current?.respawn(o.item.id);
    setOpen(null);
  }, []);

  const showItem = useCallback((item, si, fromBoard) => {
    setVisited((v) => (v.has(item.id) ? v : new Set(v).add(item.id)));
    setOpen({ item, sectionIndex: si, fromBoard });
  }, []);

  // A coin dropped into a pocket. If another details panel is already open, the coin just goes back.
  const onPocket = useCallback(
    (id) => {
      const item = allItems.find((i) => i.id === id);
      if (!item) return;
      if (openRef.current) gameRef.current?.respawn(id);
      else showItem(item, item.sectionIndex, true);
    },
    [showItem],
  );

  const goBoard = (i = sectionIndex) => {
    close();
    if (!webgl) return setScreen('list');
    setSectionIndex(i);
    setBoardMounted(true);
    setScreen('board');
  };
  const goAbout = () => {
    close();
    setScreen('entry');
  };
  const goList = () => {
    close();
    setScreen('list');
  };

  return (
    <div className="app">
      <a className="skip-link" href="#stage">
        Skip to content
      </a>
      <Navbar
        screen={screen}
        sectionIndex={sectionIndex}
        onAbout={goAbout}
        onSection={goBoard}
        onList={goList}
      />

      <div className="stage" id="stage">
        {boardMounted && webgl && (
          <div className={`layer${screen === 'board' ? '' : ' layer-hidden'}`}>
            <CarromGame
              ref={gameRef}
              active={screen === 'board'}
              overlayOpen={!!open}
              sectionIndex={sectionIndex}
              sections={sections}
              visited={visited}
              onPocket={onPocket}
              onFail={() => {
                setWebgl(false);
                setScreen('list');
              }}
            />
          </div>
        )}

        {screen === 'entry' && (
          <div className="layer layer-scroll">
            <EntryScreen onEnter={() => goBoard(0)} onList={goList} />
          </div>
        )}

        {screen === 'list' && (
          <div className="layer layer-scroll">
            <ListView
              webgl={webgl}
              visited={visited}
              onBoard={() => goBoard()}
              onOpen={(item, si) => showItem(item, si, false)}
            />
          </div>
        )}
      </div>

      {open && (
        <Overlay
          item={open.item}
          section={sections[open.sectionIndex]}
          onClose={close}
          onList={!open.fromBoard}
        />
      )}
    </div>
  );
}

import { useState } from 'react';
import { profile, sections } from '../data/portfolio.js';

/** Top bar. Choosing a section moves the camera to that side of the board. */
export default function Navbar({ screen, sectionIndex, onAbout, onSection, onList }) {
  const [open, setOpen] = useState(false);
  const go = (fn) => () => {
    setOpen(false);
    fn();
  };
  const cls = (on) => `nav-link nav-btn${on ? ' active' : ''}`;

  return (
    <nav className="navbar navbar-expand-lg navbar-dark app-nav" aria-label="Main">
      <div className="container-fluid px-3 px-lg-4">
        <button type="button" className="navbar-brand brand" onClick={go(onAbout)}>
          {profile.name}
        </button>
        <button
          type="button"
          className="navbar-toggler"
          aria-expanded={open}
          aria-controls="main-nav"
          aria-label="Toggle navigation"
          onClick={() => setOpen((o) => !o)}
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div id="main-nav" className={`collapse navbar-collapse${open ? ' show' : ''}`}>
          <ul className="navbar-nav ms-lg-auto align-items-lg-center gap-lg-1">
            <li className="nav-item">
              <button type="button" className={cls(screen === 'entry')} onClick={go(onAbout)}>
                About &amp; Contact
              </button>
            </li>
            {sections.map((s, i) => (
              <li className="nav-item" key={s.key}>
                <button
                  type="button"
                  className={cls(screen === 'board' && sectionIndex === i)}
                  aria-current={screen === 'board' && sectionIndex === i ? 'page' : undefined}
                  onClick={go(() => onSection(i))}
                >
                  <span className="nav-dot" style={{ background: s.accent }} />
                  {s.label}
                </button>
              </li>
            ))}
            <li className="nav-item">
              <button type="button" className={cls(screen === 'list')} onClick={go(onList)}>
                View as list
              </button>
            </li>
            <li className="nav-item ms-lg-2">
              <a className="btn btn-sm btn-outline-light" href={profile.resume} download>
                Resume
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

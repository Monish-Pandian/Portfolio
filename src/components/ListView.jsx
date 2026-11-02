import { sections } from '../data/portfolio.js';

/** Plain, fast, accessible version of the portfolio. Also the fallback when WebGL is unavailable. */
export default function ListView({ onOpen, onBoard, webgl, visited }) {
  return (
    <main className="list-view">
      <div className="container py-5">
        <div className="d-flex flex-wrap align-items-end justify-content-between gap-3 mb-4">
          <h1 className="h2 m-0">Portfolio</h1>
          {webgl && (
            <button type="button" className="btn btn-outline-light" onClick={onBoard}>
              Play the board
            </button>
          )}
        </div>
        {!webgl && <p className="text-secondary">3D is not available on this device, so here is the plain version.</p>}

        {sections.map((s, si) => (
          <section key={s.key} className="mb-5" aria-labelledby={`sec-${s.key}`} style={{ '--accent': s.accent }}>
            <h2 id={`sec-${s.key}`} className="list-heading">
              <span className="nav-dot" style={{ background: s.accent }} />
              {s.label}
            </h2>
            <div className="row g-3">
              {s.items.map((item) => (
                <div className="col-12 col-md-6 col-xl-4" key={item.id}>
                  <button type="button" className="list-card" onClick={() => onOpen(item, si)}>
                    <span className="list-card-top">
                      <span className="list-coin" style={{ borderColor: s.accent }}>
                        {item.short}
                      </span>
                      {visited.has(item.id) && <span className="badge text-bg-warning">Seen</span>}
                    </span>
                    <strong>{item.title}</strong>
                    <span className="list-sub">{[item.subtitle, item.date].filter(Boolean).join(' · ')}</span>
                    <span className="list-summary">{item.summary}</span>
                  </button>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}

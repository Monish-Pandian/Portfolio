import { useEffect, useRef } from 'react';


const youTubeId = (url) => {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
  return m ? m[1] : null;
};

/** Optional media for an item: certificate / intern-letter photos, a demo video, skill logos. */
function Media({ item }) {
  const images = (item.images ?? (item.image ? [item.image] : [])).map((i) => (typeof i === 'string' ? { src: i } : i)).filter((i) => i.src);
  const logos = (item.logos ?? []).filter((l) => l.name);
  const yt = item.video ? youTubeId(item.video) : null;
  if (!images.length && !logos.length && !item.video) return null;
  return (
    <div className="overlay-media">
      {item.video &&
        (yt ? (
          <div className="media-frame">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${yt}`}
              title={`${item.title} demo video`}
              loading="lazy"
              allow="accelerometer; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
            />
          </div>
        ) : (
          <video className="media-video" src={item.video} poster={item.poster} controls preload="metadata" playsInline />
        ))}
      {images.length > 0 && (
        <div className={`media-images${images.length > 1 ? ' media-images-multi' : ''}`}>
          {images.map((img) => (
            <a key={img.src} href={img.src} target="_blank" rel="noreferrer" title="Open full size">
              <img src={img.src} alt={img.alt || `${item.title} certificate`} loading="lazy" />
            </a>
          ))}
        </div>
      )}
      {logos.length > 0 && (
        <ul className="media-logos" aria-label="Skills">
          {logos.map((l) => (
            <li key={l.name}>
              {l.src ? <img src={l.src} alt="" loading="lazy" /> : <span className="logo-fallback" aria-hidden="true">{l.name.slice(0, 2)}</span>}
              <span>{l.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Full details for one coin. The board stays visible behind the translucent backdrop. */
export default function Overlay({ item, section, onClose, onList }) {
  const closeRef = useRef(null);

  useEffect(() => {
    const previous = document.activeElement;
    closeRef.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') {
        // keep focus inside the dialog
        const nodes = [...document.querySelectorAll('.overlay-card a[href], .overlay-card button')];
        if (!nodes.length) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      previous?.focus?.();
    };
  }, [onClose, item.id]);

  const links = item.links.filter((l) => l.url);

  return (
    <div className={`overlay${onList ? ' overlay-solid' : ''}`} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <article
        className="overlay-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="overlay-title"
        style={{ '--accent': section.accent }}
      >
        <button ref={closeRef} type="button" className="overlay-close" onClick={onClose} aria-label="Close details">
          <span aria-hidden="true">×</span>
        </button>

        <header>
          <p className="overlay-kicker">
            <span className="overlay-chip">{section.label}</span>
            {item.date && <span>{item.date}</span>}
          </p>
          <h2 id="overlay-title">{item.title}</h2>
          {item.subtitle && <p className="overlay-sub">{item.subtitle}</p>}
        </header>

        <Media item={item} />

        <div className="overlay-body">
          <p className="overlay-lead">{item.summary}</p>
          {item.details.map((d, i) => (
            <p key={i}>{d}</p>
          ))}
          {item.highlights.length > 0 && (
            <>
              <h3>Highlights</h3>
              <ul>
                {item.highlights.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            </>
          )}
          {item.tags.length > 0 && (
            <div className="overlay-tags" aria-label="Tags">
              {item.tags.map((t) => (
                <span key={t} className="badge rounded-pill text-bg-dark">
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>

        <footer className="overlay-foot">
          {links.map((l) => (
            <a key={l.label} className="btn btn-brass btn-sm" href={l.url} target="_blank" rel="noreferrer">
              {l.label} ↗
            </a>
          ))}
          <button type="button" className="btn btn-outline-light btn-sm ms-auto" onClick={onClose}>
            {onList ? 'Close' : 'Back to the board'}
          </button>
        </footer>
      </article>
    </div>
  );
}

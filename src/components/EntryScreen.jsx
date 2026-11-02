import { profile } from '../data/portfolio.js';

const initials = (name) =>
  name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

/** About + contact: the first thing visitors see, before any game. */
export default function EntryScreen({ onEnter, onList }) {
  const contact = [
    { label: 'Email', value: profile.email, url: `mailto:${profile.email}` },
    ...profile.links.map((l) => ({ label: l.label, value: l.url.replace(/^https?:\/\/(www\.)?/, ''), url: l.url })),
  ];

  return (
    <main className="entry" id="about">
      <div className="entry-rings" aria-hidden="true" />
      <div className="container entry-grid">
        <section className="entry-copy">
          <p className="eyebrow">{profile.role}</p>
          <h1>{profile.name}</h1>
          <p className="lead tagline">{profile.tagline}</p>
          <p className="intro">{profile.intro}</p>
          <div className="d-flex flex-wrap gap-2 mt-4">
            <button type="button" className="btn btn-brass btn-lg" onClick={onEnter} autoFocus>
              Enter Portfolio
            </button>
            <button type="button" className="btn btn-outline-light btn-lg" onClick={onList}>
              View as list
            </button>
          </div>
          <p className="entry-note">The board is a game, but you never have to play: the top bar goes anywhere.</p>
        </section>

        <aside className="entry-card" aria-label="Contact">
          <div className="avatar" aria-hidden="true">
            {initials(profile.name)}
          </div>
          <p className="entry-loc">{profile.location}</p>
          <ul className="contact-list">
            {contact.map((c) => (
              <li key={c.label}>
                <a href={c.url} target={c.url.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
                  <span className="contact-label">{c.label}</span>
                  <span className="contact-value">{c.value}</span>
                  <span aria-hidden="true">↗</span>
                </a>
              </li>
            ))}
          </ul>
          <a className="btn btn-outline-light w-100" href={profile.resume} download>
            Download resume
          </a>
        </aside>
      </div>
    </main>
  );
}

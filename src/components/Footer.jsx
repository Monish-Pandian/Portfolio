import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">

      <div className="container">

        <div className="row">

          <div className="col-lg-5 mb-4">

            <h3>
              Monish Pandian<span className="text-info">.</span>
            </h3>

            <p>
              Passionate Information Technology student focused on
              Full-Stack Development, Artificial Intelligence,
              and building impactful software solutions.
            </p>

          </div>

          <div className="col-lg-3 mb-4">

            <h5>Quick Links</h5>

            <ul className="footer-links">

              <li><a href="#home">Home</a></li>

              <li><a href="#about">About</a></li>

              <li><a href="#skills">Skills</a></li>

              <li><a href="#projects">Projects</a></li>

              <li><a href="#contact">Contact</a></li>

            </ul>

          </div>

          <div className="col-lg-4">

            <h5>Connect</h5>

            <div className="footer-social">

              <a
                href="https://github.com/Monish-Pandian"
                target="_blank"
                rel="noreferrer"
              >
                <i className="bi bi-github"></i>
              </a>

              <a
                href="https://www.linkedin.com/in/monish-pandian-234a93333"
                target="_blank"
                rel="noreferrer"
              >
                <i className="bi bi-linkedin"></i>
              </a>

              <a
                href="mailto:monishpandian.25@gmail.com"
              >
                <i className="bi bi-envelope-fill"></i>
              </a>

            </div>

          </div>

        </div>

        <hr />

        <div className="text-center copyright">

          © 2026 Monish Pandian. All Rights Reserved.

        </div>

      </div>

    </footer>
  );
}

export default Footer;
// Phase 7 real automatic sync test

import "./Contact.css";

function Contact() {
  return (
    <section id="contact" className="contact">

      <div className="container">

        <div className="text-center mb-5">

          <h2 className="fw-bold">Let's Connect</h2>

          <p className="text-secondary">
            Interested in collaborating, discussing opportunities,
            or just saying hello? I'd love to hear from you.
          </p>

        </div>

        <div className="row g-5">

          {/* Left */}

          <div className="col-lg-5">

            <div className="contact-card">

              <h3>Contact Information</h3>

              <p className="contact-text">
                Feel free to reach out for internships,
                freelance opportunities, collaborations,
                or technical discussions.
              </p>

              <div className="contact-item">

                <div className="icon">
                  <i className="bi bi-envelope-fill"></i>
                </div>

                <div>
                  <h6>Email</h6>
                  <p>monishpandian.25@gmail.com</p>
                </div>

              </div>

              <div className="contact-item">

                <div className="icon">
                  <i className="bi bi-telephone-fill"></i>
                </div>

                <div>
                  <h6>Phone</h6>
                  <p>+91 9600869049</p>
                </div>

              </div>

              <div className="contact-item">

                <div className="icon">
                  <i className="bi bi-geo-alt-fill"></i>
                </div>

                <div>
                  <h6>Location</h6>
                  <p>Madurai,Tamil Nadu, India</p>
                </div>

              </div>

              <div className="contact-item">

                <div className="icon">
                  <i className="bi bi-github"></i>
                </div>

                <div>
                  <h6>GitHub</h6>

                  <a
                    href="https://github.com/Monish-Pandian"
                    target="_blank"
                    rel="noreferrer"
                  >
                    github.com/Monish-Pandian
                  </a>

                </div>

              </div>

              <div className="contact-item">

                <div className="icon">
                  <i className="bi bi-linkedin"></i>
                </div>

                <div>
                  <h6>LinkedIn</h6>

                  <a
                    href="https://www.linkedin.com/in/monish-pandian-234a93333"
                    target="_blank"
                    rel="noreferrer"
                  >
                    View Profile
                  </a>

                </div>

              </div>

            </div>

          </div>

          {/* Right */}

          <div className="col-lg-7">

            <div className="contact-form">

              <form>

                <div className="row">

                  <div className="col-md-6 mb-3">

                    <input
                      type="text"
                      className="form-control"
                      placeholder="Your Name"
                    />

                  </div>

                  <div className="col-md-6 mb-3">

                    <input
                      type="email"
                      className="form-control"
                      placeholder="Your Email"
                    />

                  </div>

                </div>

                <div className="mb-3">

                  <input
                    type="text"
                    className="form-control"
                    placeholder="Subject"
                  />

                </div>

                <div className="mb-4">

                  <textarea
                    rows="6"
                    className="form-control"
                    placeholder="Write your message..."
                  ></textarea>

                </div>

                <button
                  type="submit"
                  className="btn btn-info px-5 py-2"
                >
                  Send Message
                </button>

              </form>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}

export default Contact;
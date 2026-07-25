import "./Achievements.css";

const achievements = [
  {
    title: "250+ LeetCode Problems",
    description:
      "Solved 250+ coding problems covering arrays, trees, graphs, dynamic programming, greedy algorithms, and more.",
  },
];

const certifications = [
  {
    issuer: "Coursera",
    title: "Machine Learning Specialization",
    year: "2026",
    file: "public/certificates/Coursera 6BJ7K4S28RGA.pdf",
  },
  {
    issuer: "NPTEL",
    title: "Python for Data Science",
    year: "2023",
    file: "/public/certificates/Python For Data Science.pdf",
  },
  {
    issuer: "NPTEL",
    title: "Responsible AI",
    year: "2025",
    file: "/public/certificates/Responsible & Safe AI Systems.pdf",
  },
];

function Achievements() {
  return (
    <section id="achievements" className="achievements">

      <div className="container">

        {/* Heading */}

        <div className="text-center mb-5">
          <h2 className="fw-bold">Achievements & Certifications</h2>
          <p className="text-secondary">
            Milestones that reflect my coding journey and continuous learning.
          </p>
        </div>

        {/* Achievements */}

        <h3 className="section-title mb-4">
          🏆 Achievements
        </h3>

        {achievements.map((item, index) => (
          <div className="achievement-card mb-4" key={index}>
            <h4>{item.title}</h4>
            <p>{item.description}</p>
          </div>
        ))}

        {/* Certificates */}

        <h3 className="section-title mt-5 mb-4">
          📜 Certifications
        </h3>

        <div className="row g-4">

          {certifications.map((certificate, index) => (

            <div className="col-md-6 col-lg-4" key={index}>

              <div className="certificate-card">

                <div className="certificate-top">

                  <h5>{certificate.issuer}</h5>

                  <span>{certificate.year}</span>

                </div>

                <h4>{certificate.title}</h4>

                <a
                  href={certificate.file}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-info mt-3"
                >
                  View Certificate
                </a>

              </div>

            </div>

          ))}

        </div>

      </div>

    </section>
  );
}

export default Achievements;
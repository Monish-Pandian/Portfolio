import "./About.css";

function About() {
  return (
    <section id="about" className="about">

      <div className="container">

        <div className="text-center mb-5">
          <h2 className="fw-bold">About Me</h2>
          <p className="text-secondary">
            Get to know me better
          </p>
        </div>

       <div className="row justify-content-center">

          

          <div className="col-lg-10">

            <h3 className="fw-bold mb-3">
              Information Technology Student & Full Stack Developer
            </h3>

            <p className="text-secondary">
              I'm Monish Pandian, an Information Technology student at
              Velammal College of Engineering & Technology with a strong
              interest in Full Stack Development, Artificial Intelligence,
              and Data Structures & Algorithms.

              I enjoy solving real-world problems by building scalable
              applications using the MERN stack and continuously improving
              my programming skills through competitive coding.
            </p>

            <div className="row mt-4">

              <div className="col-md-6">

                <p><strong>Name:</strong> Monish Pandian</p>

                <p><strong>Degree:</strong> B.Tech IT</p>

                <p><strong>College:</strong> VCET</p>

              </div>

              <div className="col-md-6">

                <p><strong>CGPA:</strong> 8.39</p>

                <p><strong>Location:</strong>Madurai,Tamil Nadu</p>

                <p><strong>Email:</strong> monnishpandian.25@gmail.com</p>

              </div>

            </div>

          </div>

        </div>

        {/* Statistics */}

        <div className="row text-center mt-5 g-4">

                    <div className="col-md-3">
                        <div className="about-card">
                        <h2>250+</h2>
                        <h5>LeetCode</h5>
                        <p>Problems Solved</p>
                        </div>
                    </div>

                    <div className="col-md-3">
                        <div className="about-card">
                        <h2>5+</h2>
                        <h5>Projects</h5>
                        </div>
                    </div>

                    <div className="col-md-3">
                        <div className="about-card">
                        <h2>AI & ML</h2>
                        <h5>Exploring</h5>
                        <p>Intelligent Systems</p>
                        </div>
                    </div>

                    <div className="col-md-3">
                        <div className="about-card">
                        <h2>8.39</h2>
                        <h5>Current</h5>
                        <p>CGPA</p>
                        </div>
                    </div>
          
          

        </div>

      </div>

    </section>
  );
}

export default About;
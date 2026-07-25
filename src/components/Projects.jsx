import "./Projects.css";
import projects from "../data/projects";

function Projects() {
  return (
    <section id="projects" className="projects">

      <div className="container">

        <div className="text-center mb-5">
          <h2 className="fw-bold">Projects</h2>
          <p className="text-secondary">
            A selection of projects that showcase my skills in full-stack development and AI.
          </p>
        </div>

        <div className="row g-4">

          {projects.map((project) => (

            <div className="col-lg-4" key={project.id}>

              <div className="project-card">

                {/* <img
                   src={project.image}
                  alt={project.title}
                  className="project-image"
                /> */}

                <div className="p-4">

                  <h4>{project.title}</h4>

                  <p className="text-secondary">
                    {project.description}
                  </p>

                  <div className="tech-stack">

                    {project.tech.map((tech, index) => (

                      <span key={index} className="tech-badge">
                        {tech}
                      </span>

                    ))}

                  </div>

                  <div className="mt-4 d-flex gap-2">

                    <a
                      href={project.github}
                      className="btn btn-outline-info"
                      target="_blank"
                      rel="noreferrer"
                    >
                      GitHub
                    </a>

                    <a
                      href={project.demo}
                      className="btn btn-info"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Live Demo
                    </a>

                  </div>

                </div>

              </div>

            </div>

          ))}

        </div>

      </div>

    </section>
  );
}

export default Projects;
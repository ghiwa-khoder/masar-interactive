const projects = [
  {
    number: "01",
    title: "MASAR LAB 001",
    category: "WEBGL / CREATIVE DEVELOPMENT",
    description:
      "An experimental 3D experience exploring movement, geometry, interaction, and digital space.",
  },
  {
    number: "02",
    title: "CONCEPT 001",
    category: "DIGITAL REIMAGINING / INTERACTIVE WEB",
    description:
      "A self-initiated digital reinterpretation exploring a new visual and interactive direction for an existing brand.",
  },
  {
    number: "03",
    title: "COMING NEXT",
    category: "EXPERIMENT / DIGITAL EXPERIENCE",
    description:
      "New interactive concepts and digital experiments are currently in development.",
  },
];

export default function Work() {
  return (
    <section className="section work-section" id="work">
      <div className="work-header">
        <div>
          <p className="eyebrow">SELECTED WORK</p>

          <h2>
            IDEAS IN
            <br />
            <span>MOTION.</span>
          </h2>
        </div>

        <p className="work-intro">
          A growing collection of interactive experiences,
          experiments, and digital concepts exploring new ways
          brands can live on the web.
        </p>
      </div>

      <div className="projects-list">
        {projects.map((project) => (
          <article
            className="project-item"
            key={project.number}
          >
            <span className="project-number">
              {project.number}
            </span>

            <div className="project-info">
              <h3>{project.title}</h3>
              <p>{project.category}</p>

              <p className="project-description">
                {project.description}
              </p>
            </div>

            <span className="project-arrow">↗</span>
          </article>
        ))}
      </div>
    </section>
  );
}
const projects = [
  {
    title: "MASAR LAB 001",
    category: "WEBGL / CREATIVE DEVELOPMENT",
    description:
      "A self-initiated WebGL study exploring how geometry, motion, and interaction can shape a digital experience in the browser.",
    status: "EXPERIMENT",
  },
  {
    title: "CONCEPT 001",
    category: "DIGITAL REIMAGINING / INTERACTIVE WEB",
    description:
      "A digital reinterpretation of an existing brand, exploring how its identity could translate into a more interactive web direction.",
    status: "CONCEPT",
  },
  {
    title: "COMING NEXT",
    category: "MASAR LAB",
    description:
      "New self-initiated experiments are being built as we continue exploring what interaction, motion, and 3D can do on the web.",
    status: "IN PROGRESS",
  },
];

export default function Work() {
  return (
    <section className="section work-section" id="work">
      <div className="work-header">
        <div>
          <p className="eyebrow">SELECTED WORK</p>

          <h2>
            BUILT ALONG
            <br />
            <span>THE WAY.</span>
          </h2>
        </div>

        <p className="work-intro">
          MASAR Lab is where we test ideas before they become
          patterns — through self-initiated concepts, WebGL studies,
          and interactive experiments built directly in the browser.
        </p>
      </div>

      <div className="projects-list">
        {projects.map((project) => (
          <article
            className="project-item"
            key={project.title}
          >
            <div className="project-info">
              <p className="project-status">
                {project.status}
              </p>

              <h3>{project.title}</h3>
              <p>{project.category}</p>

              <p className="project-description">
                {project.description}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
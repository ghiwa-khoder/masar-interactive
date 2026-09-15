const services = [
  {
    title: "INTERACTIVE WEBSITES",
    description:
      "Websites shaped around how people move, explore, and interact — combining clear structure with purposeful motion and responsive digital experiences.",
  },
  {
    title: "CREATIVE DEVELOPMENT",
    description:
      "Frontend development that turns ambitious visual ideas into fast, responsive, production-ready experiences using modern web technologies.",
  },
  {
    title: "3D & WEBGL EXPERIENCES",
    description:
      "Browser-based 3D scenes and WebGL interactions that add depth, spatial movement, and exploration where the concept genuinely calls for it.",
  },
  {
    title: "MOTION & INTERACTION",
    description:
      "Scroll behavior, transitions, micro-interactions, and motion systems designed to guide attention and make the interface feel connected.",
  },
  {
    title: "DIGITAL CONCEPTS",
    description:
      "Original web concepts and digital reinterpretations used to explore new directions for brands, products, spaces, and ideas online.",
  },
];

export default function Services() {
  return (
    <section
      className="section services-section"
      id="services"
    >
      <div className="services-header">
        <p className="eyebrow">WHAT WE BUILD</p>

        <h2>
          DIFFERENT
          <br />
          <span>PATHS.</span>
        </h2>
      </div>

      <div className="services-list">
        {services.map((service) => (
          <article
            className="service-item"
            key={service.title}
          >
            <div className="service-content">
              <h3>{service.title}</h3>
              <p>{service.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
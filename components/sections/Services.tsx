const services = [
  {
    number: "01",
    title: "INTERACTIVE WEBSITES",
    description:
      "Custom digital experiences built around interaction, storytelling, and movement — designed to make brands impossible to ignore.",
  },
  {
    number: "02",
    title: "CREATIVE DEVELOPMENT",
    description:
      "High-end frontend development combining modern frameworks, animation, and creative coding to turn ambitious concepts into polished digital products.",
  },
  {
    number: "03",
    title: "3D & WEBGL EXPERIENCES",
    description:
      "Immersive browser-based environments using WebGL and 3D technology to create depth, exploration, and memorable interactions.",
  },
  {
    number: "04",
    title: "MOTION & INTERACTION",
    description:
      "Scroll experiences, transitions, micro-interactions, and motion systems designed to make every part of a website feel responsive and alive.",
  },
  {
    number: "05",
    title: "DIGITAL CONCEPTS",
    description:
      "Experimental website concepts and digital reinterpretations exploring how brands, products, and ideas could exist differently online.",
  },
];

export default function Services() {
  return (
    <section
      className="section services-section"
      id="services"
    >
      <div className="services-header">
        <p className="eyebrow">WHAT WE DO</p>

        <h2>
          BUILT TO
          <br />
          <span>MOVE.</span>
        </h2>
      </div>

      <div className="services-list">
        {services.map((service) => (
          <article
            className="service-item"
            key={service.number}
          >
            <span className="service-number">
              {service.number}
            </span>

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
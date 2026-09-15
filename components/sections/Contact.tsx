"use client";

import {
  useEffect,
  useState,
} from "react";

/* =========================================
   LOCAL TIME
========================================= */

function LocalTime() {
  const [time, setTime] =
    useState<string | null>(null);

  useEffect(() => {
    const formatter =
      new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Beirut",
        hour: "2-digit",
        minute: "2-digit",
      });

    const update = () => {
      setTime(formatter.format(new Date()));
    };

    update();

    const id = setInterval(
      update,
      60_000
    );

    return () => clearInterval(id);
  }, []);

  if (!time) return null;

  return (
    <p className="contact-time">
      <span
        className="contact-time-dot"
        aria-hidden="true"
      />

      {time} in Beirut
    </p>
  );
}

/* =========================================
   CONTACT
========================================= */

export default function Contact() {
  const year = new Date().getFullYear();

  const [submitted, setSubmitted] =
    useState(false);

  const [success, setSuccess] =
    useState(false);

  const [error, setError] =
    useState("");

  /* =========================================
     SUBMIT INQUIRY
  ========================================= */

  async function handleInquirySubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    const formElement = e.currentTarget;
    const form = new FormData(formElement);

    const payload = {
      name: String(
        form.get("name") || ""
      ).trim(),

      email: String(
        form.get("email") || ""
      ).trim(),

      projectType: String(
        form.get("projectType") || ""
      ).trim(),

      budget: String(
        form.get("budget") || ""
      ).trim(),

      timeline: String(
        form.get("timeline") || ""
      ).trim(),

      message: String(
        form.get("message") || ""
      ).trim(),
    };

    setSubmitted(true);
    setSuccess(false);
    setError("");

    try {
      const response = await fetch(
        "/api/inquiry",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(payload),
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Unable to send inquiry."
        );
      }

      formElement.reset();

      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to send inquiry. Please try again."
      );
    } finally {
      setSubmitted(false);
    }
  }

  return (
    <section
      className="section contact-section"
      id="contact"
    >
      <div className="contact-layout">

        {/* =================================
            LEFT SIDE
        ================================= */}

        <div className="contact-heading">
          <p className="eyebrow">
            START A PROJECT
          </p>

          <h2>
            LET&apos;S BUILD
            <br />
            SOMETHING
            <br />
            <span>MEMORABLE.</span>
          </h2>

          <p className="contact-intro">
            Have a project, a brand, or
            simply an idea worth exploring?
            Tell us where you want to go.
            We&apos;ll help shape the digital
            path to get there.
          </p>

          <LocalTime />

          {/* CONTACT LINKS */}

          <div className="contact-mini-links">

            <a href="mailto:masar.interactive@hotmail.com">
              <span>EMAIL</span>

              <strong>
                masar.interactive@hotmail.com
              </strong>

              <span aria-hidden="true">
                ↗
              </span>
            </a>

            <a
              href="https://www.instagram.com/maser.interactive/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>INSTAGRAM</span>

              <strong>
                @maser.interactive
              </strong>

              <span aria-hidden="true">
                ↗
              </span>
            </a>

            <a href="tel:+96181310887">
              <span>
                PHONE / WHATSAPP
              </span>

              <strong>
                +961 81 310 887
              </strong>

              <span aria-hidden="true">
                ↗
              </span>
            </a>

          </div>
        </div>

        {/* =================================
            PROJECT INQUIRY FORM
        ================================= */}

        <div className="quote-panel">

          {/* FORM HEADER */}

          <div className="quote-panel-head">
            <div>
              <span
                className="quote-status-dot"
              />

              <span>
                PROJECT INQUIRY
              </span>
            </div>

            <span>
              GET A QUOTE
            </span>
          </div>

          {/* FORM */}

          <form
            className="quote-form"
            onSubmit={handleInquirySubmit}
          >

            {/* =============================
                NAME + EMAIL
            ============================= */}

            <div className="quote-field-row">

              <label className="quote-field">
                <span className="quote-label">
                  <small>01</small>
                  YOUR NAME
                </span>

                <input
                  type="text"
                  name="name"
                  placeholder="Your name"
                  autoComplete="name"
                  required
                />
              </label>

              <label className="quote-field">
                <span className="quote-label">
                  <small>02</small>
                  EMAIL
                </span>

                <input
                  type="email"
                  name="email"
                  placeholder="you@email.com"
                  autoComplete="email"
                  required
                />
              </label>

            </div>

            {/* =============================
                PROJECT TYPE
            ============================= */}

            <label className="quote-field">

              <span className="quote-label">
                <small>03</small>
                WHAT ARE WE CREATING?
              </span>

              <select
                name="projectType"
                defaultValue=""
                required
              >
                <option
                  value=""
                  disabled
                >
                  Select project type
                </option>

                <option value="Interactive Website">
                  Interactive Website
                </option>

                <option value="Creative Development">
                  Creative Development
                </option>

                <option value="3D / WebGL Experience">
                  3D / WebGL Experience
                </option>

                <option value="Motion & Interaction">
                  Motion & Interaction
                </option>

                <option value="Digital Concept">
                  Digital Concept
                </option>

                <option value="Other">
                  Something Else
                </option>
              </select>

            </label>

            {/* =============================
                BUDGET + TIMELINE
            ============================= */}

            <div className="quote-field-row">

              <label className="quote-field">

                <span className="quote-label">
                  <small>04</small>
                  ESTIMATED BUDGET
                </span>

                <select
                  name="budget"
                  defaultValue=""
                >
                  <option
                    value=""
                    disabled
                  >
                    Select a range
                  </option>

                  <option value="Under $1,000">
                    Under $1,000
                  </option>

                  <option value="$1,000 – $2,500">
                    $1,000 – $2,500
                  </option>

                  <option value="$2,500 – $5,000">
                    $2,500 – $5,000
                  </option>

                  <option value="$5,000+">
                    $5,000+
                  </option>

                  <option value="Not sure yet">
                    Not sure yet
                  </option>
                </select>

              </label>

              <label className="quote-field">

                <span className="quote-label">
                  <small>05</small>
                  TIMELINE
                </span>

                <select
                  name="timeline"
                  defaultValue=""
                >
                  <option
                    value=""
                    disabled
                  >
                    When do we start?
                  </option>

                  <option value="ASAP">
                    ASAP
                  </option>

                  <option value="Within 1 month">
                    Within 1 month
                  </option>

                  <option value="1 – 3 months">
                    1 – 3 months
                  </option>

                  <option value="3+ months">
                    3+ months
                  </option>

                  <option value="Flexible">
                    Flexible
                  </option>
                </select>

              </label>

            </div>

            {/* =============================
                MESSAGE
            ============================= */}

            <label
              className="
                quote-field
                quote-message-field
              "
            >
              <span className="quote-label">
                <small>06</small>
                TELL US ABOUT THE IDEA
              </span>

              <textarea
                name="message"
                rows={4}
                placeholder="What are you building? What should it feel like? Tell us about the idea, goals, references, or anything we should know."
                required
              />
            </label>

            {/* =============================
                SUBMIT
            ============================= */}

            <div className="quote-submit-wrap">

              <div className="quote-submit-message">

                {success ? (
                  <p
                    className="quote-success"
                    role="status"
                  >
                    INQUIRY SENT ✓
                    We&apos;ll get back to you
                    soon.
                  </p>
                ) : (
                  <p>
                    Send your project details
                    directly to MASAR
                    Interactive.
                  </p>
                )}

                {error && (
                  <p
                    className="quote-error"
                    role="alert"
                  >
                    {error}
                  </p>
                )}

              </div>

              <button
                className="quote-submit"
                type="submit"
                disabled={submitted}
              >
                <span>
                  {submitted
                    ? "SENDING..."
                    : "SEND INQUIRY"}
                </span>

                <span
                  className="quote-submit-arrow"
                  aria-hidden="true"
                >
                  ↗
                </span>
              </button>

            </div>

          </form>
        </div>
      </div>

      {/* =================================
          FOOTER
      ================================= */}

      <footer className="footer">

        <span>
          © {year} MASAR INTERACTIVE
        </span>

        <span>
          DESIGN / MOTION / TECHNOLOGY
        </span>

      </footer>
    </section>
  );
}
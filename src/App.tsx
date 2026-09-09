import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  ArrowDown,
  Plus,
  X,
  List,
  CornersOut,
  MapPin,
  Buildings,
  Lightning,
  Truck,
  Phone,
} from "@phosphor-icons/react";
import { motion, useReducedMotion } from "motion/react";
import {
  contact,
  property,
  units,
  specifications,
  distances,
  highways,
  terms,
} from "./content";
import EstateTour from "./EstateTour";

function BriefLink({ className = "button" }: { className?: string }) {
  return (
    <a
      className={className}
      href={contact.whatsapp}
      target="_blank"
      rel="noopener noreferrer"
    >
      {contact.whatsappLabel} <ArrowUpRight size={18} />
    </a>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const outside = (e: PointerEvent) => {
      if (!navRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", key);
    document.addEventListener("pointerdown", outside);
    return () => {
      document.removeEventListener("keydown", key);
      document.removeEventListener("pointerdown", outside);
    };
  }, []);
  return (
    <header className="site-header" ref={navRef}>
      <a className="brand" href="#home">
        <span className="brand-mark" aria-hidden="true">
          ce.
        </span>
        <span>
          Corporate Estates<small>ALAM IMPIAN</small>
        </span>
      </a>
      <nav
        className={`main-nav ${open ? "nav-open" : ""}`}
        id="main-navigation"
        aria-label="Main navigation"
      >
        {[
          ["The estate", "#experience"],
          ["The spaces", "#spaces"],
          ["Location", "#location"],
        ].map(([label, href]) => (
          <a key={href} href={href} onClick={() => setOpen(false)}>
            {label}
          </a>
        ))}
        <BriefLink className="nav-brief" />
      </nav>
      <button
        className="menu-toggle icon-button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-controls="main-navigation"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        {open ? <X size={23} /> : <List size={23} />}
      </button>
    </header>
  );
}

function Hero() {
  const reduced = useReducedMotion();
  return (
    <section className="hero" id="home">
      <div className="hero-body">
        <div className="hero-copy">
          <motion.div
            initial={reduced ? false : { y: 12 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="eyebrow">
              <MapPin size={14} /> ALAM IMPIAN, SHAH ALAM
            </p>
            <h1>
              <span className="hero-descriptor">3-Storey Semi-D</span>Corporate
              <br />
              <em>Estates.</em>
            </h1>
            <p className="hero-description">
              A place for your business.
              <br />
              An address for your future.
            </p>
            <a className="button" href="#experience">
              Experience the estate <ArrowDown size={17} />
            </a>
          </motion.div>
        </div>
        <div className="hero-visual">
          <img
            src="/assets/exterior.webp"
            alt="Illustrative exterior of a three-storey semi-detached corporate building with glazed frontage"
            width="1500"
            height="1009"
            fetchPriority="high"
          />
          <span className="image-caption">Architectural illustration</span>
        </div>
        <div className="hero-side-label">SPACE TO BUILD YOUR NEXT CHAPTER</div>
      </div>
      <div className="hero-facts">
        <div>
          <span>Ownership</span>
          <strong>
            Freehold<span className="fact-detail">Individual title</span>
          </strong>
        </div>
        <div>
          <span>Development</span>
          <strong>
            30 <span>exclusive units</span>
          </strong>
        </div>
        <div>
          <span>Indicative price</span>
          <strong>
            RM9M <span>onwards</span>
          </strong>
        </div>
        <div>
          <span>Expected completion</span>
          <strong>
            Q1–Q2 <span>2029</span>
          </strong>
        </div>
      </div>
    </section>
  );
}

function Proposition() {
  return (
    <section className="proposition section-pad" id="overview">
      <div className="proposition-intro">
        <p className="eyebrow">OWN YOUR BUSINESS ADDRESS</p>
        <h2>
          More than a workplace.
          <br />
          <em>A place to grow.</em>
        </h2>
        <p>
          Freehold corporate estates with individual titles in Alam Impian. A
          standalone setting for your headquarters, showroom, and next stage of
          business.
        </p>
      </div>
      <div className="benefits">
        <article>
          <Buildings size={30} weight="light" />
          <h3>A presence of your own</h3>
          <p>
            Three-storey semi-detached spaces with a commercial title, generous
            frontage, and room for your business identity.
          </p>
        </article>
        <article>
          <Truck size={30} weight="light" />
          <h3>Made for movement</h3>
          <p>
            A listed 132-ft main road and access designed for 20-ft and 40-ft
            trailers. Confirm operational requirements with the agent.
          </p>
        </article>
        <article>
          <Lightning size={30} weight="light" />
          <h3>Power your operations</h3>
          <p>
            Three-phase, 200-amp supply and three listed PMU substations support
            the development’s business infrastructure.
          </p>
        </article>
      </div>
    </section>
  );
}

function Spaces() {
  return (
    <section className="spaces section-pad" id="spaces">
      <div className="spaces-heading">
        <h2>
          Two formats.
          <br />
          <em>Your possibilities.</em>
        </h2>
        <p>Choose the footprint that fits your ambition.</p>
      </div>
      <div className="unit-grid">
        {units.map((unit, index) => (
          <article className="unit" key={unit.name}>
            <div className="unit-heading">
              <h3>{unit.name}</h3>
              <span>{unit.count} in the development</span>
            </div>
            <p className="unit-area">
              {unit.area}
              <span>sq ft built-up</span>
            </p>
            <p className="unit-purpose">
              {index === 0
                ? "A distinctive home for your growing business."
                : "A larger canvas for your corporate vision."}
            </p>
          </article>
        ))}
      </div>
      <div className="comparison-wrap">
        <table className="comparison">
          <caption className="sr-only">
            Type A and Type B property comparison
          </caption>
          <thead>
            <tr>
              <th scope="col">The details</th>
              {units.map((u) => (
                <th scope="col" key={u.name}>
                  {u.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ["Lot dimensions", ...units.map((u) => u.lots)],
              ["Parking, including OKU", ...units.map((u) => u.parking)],
              ["Light points", ...units.map((u) => u.lights)],
              ["Power points", ...units.map((u) => u.power)],
            ].map(([name, a, b]) => (
              <tr key={name}>
                <th scope="row">{name}</th>
                <td>{a}</td>
                <td>{b}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="fine-print">
        Dimensions and parking vary by lot. Ask for the floor plan and
        individual pricing for your preferred unit.
      </p>
    </section>
  );
}

function Masterplan() {
  const dialog = useRef<HTMLDialogElement>(null);
  const [zoom, setZoom] = useState(false);
  function close() {
    dialog.current?.close();
    setZoom(false);
  }
  useEffect(() => {
    const el = dialog.current;
    const cleanup = () => {
      document.body.style.overflow = "";
      setZoom(false);
    };
    el?.addEventListener("close", cleanup);
    return () => {
      el?.removeEventListener("close", cleanup);
      document.body.style.overflow = "";
    };
  }, []);
  return (
    <section className="masterplan section-pad" id="masterplan">
      <div className="masterplan-copy">
        <h2>
          A considered
          <br />
          <em>place to belong.</em>
        </h2>
        <p>
          A 30-unit development along Persiaran Balai Muda, with a mix of Type A
          and Type B corporate estates.
        </p>
        <dl className="plan-facts">
          <div>
            <dt>Main road frontage</dt>
            <dd>
              132 <span>ft</span>
            </dd>
          </div>
          <div>
            <dt>Internal road</dt>
            <dd>
              66 <span>ft</span>
            </dd>
          </div>
        </dl>
        <p className="plan-note">
          Explore the site layout, access roads, and surrounding land uses. The
          plan includes future development and an amenities site.
        </p>
        <button
          className="text-link"
          onClick={() => {
            dialog.current?.showModal();
            document.body.style.overflow = "hidden";
          }}
        >
          Enlarge master plan <CornersOut size={19} />
        </button>
      </div>
      <button
        className="plan-image"
        aria-label="Enlarge master plan"
        onClick={() => {
          dialog.current?.showModal();
          document.body.style.overflow = "hidden";
        }}
      >
        <img
          src="/assets/masterplan.webp"
          width="1400"
          height="1496"
          loading="lazy"
          alt="Master plan showing Type A and B variants, access roads and adjoining land uses"
        />
        <span>
          <CornersOut size={20} />
        </span>
      </button>
      <dialog
        ref={dialog}
        className="plan-dialog"
        aria-labelledby="plan-title"
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
      >
        <div className="dialog-header">
          <h3 id="plan-title">Estate master plan</h3>
          <div>
            <button className="text-link" onClick={() => setZoom(!zoom)}>
              {zoom ? "Fit to screen" : "Zoom in"}
            </button>
            <button
              className="icon-button"
              aria-label="Close master plan"
              onClick={close}
            >
              <X size={25} />
            </button>
          </div>
        </div>
        <div className={`dialog-image ${zoom ? "zoomed" : ""}`}>
          <img
            src="/assets/masterplan.webp"
            alt="Enlarged master plan of the Corporate Estates in Alam Impian"
          />
        </div>
        <p>
          Source-provided master plan. Confirm current layout and lot details
          with the agent.
        </p>
      </dialog>
    </section>
  );
}

function Specifications() {
  return (
    <section className="specifications section-pad" id="specifications">
      <div className="spec-heading">
        <h2>
          Built for the
          <br />
          <em>business of every day.</em>
        </h2>
        <p>
          From the structure to the finishing details, explore the source-listed
          building specifications.
        </p>
        <div className="spec-highlight">
          <strong>21 ft</strong>
          <span>Listed ground-floor height</span>
        </div>
        <div className="spec-highlight">
          <strong>14 persons</strong>
          <span>Passenger lift capacity</span>
        </div>
      </div>
      <div className="spec-list">
        {specifications.map((group) => (
          <details key={group.title}>
            <summary>
              {group.title}
              <Plus size={20} />
            </summary>
            <dl>
              {group.items.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </details>
        ))}
        <p className="fine-print">
          Specifications are reproduced from the property brief. Confirm their
          application to your chosen type and lot, including floor loading and
          lift load capacity.
        </p>
      </div>
    </section>
  );
}

function Location() {
  return (
    <section className="location section-pad" id="location">
      <div className="location-heading">
        <p className="eyebrow">ALAM IMPIAN, SHAH ALAM</p>
        <h2>
          Your business.
          <br />
          <em>Well connected.</em>
        </h2>
        <p>
          Within reach of the Klang Valley’s business centres, airports, and
          major ports.
        </p>
      </div>
      <div className="location-layout">
        <figure className="location-image">
          <img
            src="/assets/streetscape.webp"
            loading="lazy"
            width="1500"
            height="1000"
            alt="Illustrative streetscape of a corporate park with landscaped verges"
          />
          <figcaption>Illustrative corporate park streetscape</figcaption>
        </figure>
        <div className="connections">
          <h3>Connections that matter</h3>
          <div className="highways">
            {highways.map((h) => (
              <span key={h}>{h}</span>
            ))}
          </div>
          <dl className="distances">
            {distances.map(([place, km]) => (
              <div key={place}>
                <dt>{place}</dt>
                <dd>
                  {km}
                  <span> km</span>
                </dd>
              </div>
            ))}
          </dl>
          <p className="fine-print">
            Distances as listed in the property brief; route and measurement
            basis are to be confirmed.
          </p>
        </div>
      </div>
    </section>
  );
}

function Commercial() {
  return (
    <section className="commercial section-pad" id="terms">
      <h2>
        Your next move
        <br />
        <em>starts here.</em>
      </h2>
      <div className="commercial-layout">
        <div className="price">
          <span>Indicative price from</span>
          <strong>
            RM9<span>million</span>
          </strong>
          <p>Per unit · Subject to current pricing</p>
        </div>
        <div>
          <dl className="terms">
            {terms.map(([key, value]) => (
              <div key={key}>
                <dt>{key}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          <p className="fine-print">
            *Confirm offer eligibility, booking conditions, and the scope of
            absorbed legal fees with the agent. Availability and terms are
            subject to confirmation.
          </p>
        </div>
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section className="contact section-pad" id="contact">
      <div className="contact-image">
        <img
          src="/assets/arrival.webp"
          width="1280"
          height="861"
          loading="lazy"
          alt="Illustrative logistics-branded corporate building with a glazed entrance"
        />
      </div>
      <div className="contact-copy">
        <p className="eyebrow">LET’S TALK POSSIBILITIES</p>
        <h2>
          Find your
          <br />
          <em>business address.</em>
        </h2>
        <p>
          Request floor plans, individual unit pricing, and a private site
          viewing.
        </p>
        <BriefLink />
        <div className="agent">
          <div className="agent-monogram" aria-hidden="true">
            {contact.initials}
          </div>
          <div>
            <strong>{contact.name}</strong>
            <span>{contact.company}</span>
          </div>
        </div>
        <a className="phone-link" href={contact.telephone}>
          <Phone size={17} />
          {contact.phone}
        </a>
      </div>
    </section>
  );
}

export default function App() {
  return (
    <>
      <a className="skip-link" href="#overview">
        Skip to property information
      </a>
      <Header />
      <main>
        <Hero />
        <EstateTour />
        <Proposition />
        <Spaces />
        <Masterplan />
        <Specifications />
        <Location />
        <Commercial />
        <Contact />
      </main>
      <footer className="site-footer">
        <div className="footer-top">
          <a href="#home" className="footer-brand">
            Corporate Estates<span>Alam Impian, Shah Alam</span>
          </a>
          <a href="#home" className="text-link">
            Back to top <ArrowUpRight size={18} />
          </a>
        </div>
        <div className="footer-bottom">
          <p>
            Illustrations and the approximate 3D model are for visual reference.
            Property information is based on the{" "}
            <a href={property.source} target="_blank" rel="noopener noreferrer">
              source brief
            </a>{" "}
            accessed {property.sourceDate}; verify current details with the
            agent.
          </p>
          <span>
            {contact.name}
            <br />
            {contact.company}
          </span>
        </div>
      </footer>
    </>
  );
}

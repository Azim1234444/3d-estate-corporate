"use client";
import {
  Component,
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  motion,
  useInView,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Cube,
  Pause,
  Play,
} from "@phosphor-icons/react";

const EstateScene = lazy(() => import("./EstateScene"));
class SceneBoundary extends Component<
  { children: ReactNode; onFailure: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFailure();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}
const chapters = [
  {
    title: "An address for\nyour next chapter.",
    label: "The estate",
    copy: "Freehold ownership. A standalone presence. Space to make your own.",
  },
  {
    title: "Built to make\nan impression.",
    label: "The architecture",
    copy: "Three storeys of possibility, from a welcoming showroom to your corporate headquarters.",
  },
  {
    title: "Room for\nbigger ambitions.",
    label: "The perspective",
    copy: "A considered setting for work, with generous parking and a connected business address.",
  },
];

export default function EstateTour() {
  const section = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const [motionOptIn, setMotionOptIn] = useState(false);
  const respectReducedMotion = Boolean(reduced) && !motionOptIn;
  const visible = useInView(section);
  const [paused, setPaused] = useState(false),
    [ready, setReady] = useState(false),
    [failed, setFailed] = useState(false),
    [hidden, setHidden] = useState(false);
  const [chapter, setChapter] = useState(0);
  const [graphicsChecked, setGraphicsChecked] = useState(false);
  const [started, setStarted] = useState(false);
  const { scrollYProgress } = useScroll({
    target: section,
    offset: ["start start", "end end"],
  });
  const onReady = useCallback(() => setReady(true), []);
  const onFailure = useCallback(() => setFailed(true), []);
  useMotionValueEvent(scrollYProgress, "change", (p) =>
    setChapter(p < 0.32 ? 0 : p < 0.7 ? 1 : 2),
  );
  const noMotion = respectReducedMotion || paused || failed;
  const stageProgress = useTransform(scrollYProgress, [0, 1], [0, 1]);
  useEffect(() => {
    if (visible) setStarted(true);
  }, [visible]);
  useEffect(() => {
    if (!started) return;
    if (respectReducedMotion) return;
    // Detect unsupported/disabled GPU contexts before R3F's asynchronous renderer setup.
    // A failed async WebGL constructor is not reliably caught by a React boundary.
    const probe = document.createElement("canvas");
    try {
      const context = probe.getContext("webgl2");
      if (!context) setFailed(true);
      else context.getExtension("WEBGL_lose_context")?.loseContext();
    } catch {
      setFailed(true);
    }
    setGraphicsChecked(true);
  }, [respectReducedMotion, started]);
  useEffect(() => {
    const listener = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", listener);
    return () => document.removeEventListener("visibilitychange", listener);
  }, []);
  function goChapter(index: number) {
    const element = section.current;
    if (!element) return;
    const start = element.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({
      top:
        start +
        (element.offsetHeight - window.innerHeight) * [0, 0.5, 1][index],
      behavior: reduced ? "instant" : "smooth",
    });
  }
  return (
    <section
      id="experience"
      ref={section}
      className={`tour ${noMotion ? "tour-static" : ""}`}
      aria-label="Interactive estate tour"
    >
      <div className="tour-sticky">
        <div className="tour-topline">
          <span>
            <Cube size={17} weight="light" /> A different perspective
          </span>
          <a href="#spaces">
            Explore the spaces <ArrowDownRight size={18} />
          </a>
        </div>
        <div className="tour-copy" aria-live="off">
          <span className="tour-chapter-label">
            {noMotion ? chapters[0].label : chapters[chapter].label}
          </span>
          <h2>
            {(noMotion ? chapters[0].title : chapters[chapter].title)
              .split("\n")
              .map((line, i) => (
                <span key={`${chapter}-${i}`}>{line}</span>
              ))}
          </h2>
          <p>{noMotion ? chapters[0].copy : chapters[chapter].copy}</p>
          <a className="text-link" href="#masterplan">
            View the master plan <ArrowUpRight size={18} />
          </a>
          {!noMotion && (
            <p className="interaction-hint">
              Scroll down to drive. Scroll up to retrace.
            </p>
          )}
        </div>
        <div
          className={`scene-wrap ${ready && !noMotion ? "scene-ready" : ""}`}
          aria-label="Illustrative 3D model of the corporate estate"
        >
          <img
            className="scene-poster"
            src="/assets/estate-poster.webp"
            alt="Architectural miniature showing two corporate buildings, parking and landscaping"
            width="1400"
            height="899"
          />
          {!noMotion && started && graphicsChecked && (
            <SceneBoundary onFailure={onFailure}>
              <Suspense fallback={null}>
                <EstateScene
                  progress={stageProgress}
                  active={visible && !hidden}
                  onReady={onReady}
                  onFailure={onFailure}
                />
              </Suspense>
            </SceneBoundary>
          )}
          {!ready && !noMotion && (
            <span className="scene-loading" role="status">
              Preparing your perspective…
            </span>
          )}
        </div>
        <div className="tour-bottom">
          <div className="chapter-controls" aria-label="Tour viewpoints">
            {!noMotion &&
              chapters.map((item, index) => (
                <button
                  key={item.label}
                  onClick={() => goChapter(index)}
                  aria-current={chapter === index ? "step" : undefined}
                >
                  <span>0{index + 1}</span>
                  {item.label}
                </button>
              ))}
            {noMotion && (
              <span className="static-label">
                {failed
                  ? "3D unavailable · Static preview"
                  : respectReducedMotion
                    ? "Reduced motion · Static preview"
                    : "Static preview"}
              </span>
            )}
          </div>
          <div className="tour-note">
            <span>Illustrative model · Not to scale</span>
            {!failed && (
              <button
                className={noMotion ? "animation-enable" : "icon-button"}
                onClick={() => {
                  setReady(false);
                  if (noMotion) {
                    setMotionOptIn(true);
                    setPaused(false);
                  } else {
                    setPaused(true);
                  }
                }}
                aria-label={
                  noMotion ? "Enable 3D animation" : "Pause 3D animation"
                }
                title={noMotion ? "Enable 3D animation" : "Pause 3D animation"}
              >
                {noMotion ? <><Play size={17} /> Enable 3D animation</> : <Pause size={17} />}
              </button>
            )}
          </div>
        </div>
        {!noMotion && (
          <motion.div
            className="tour-progress"
            style={{ scaleX: stageProgress }}
          />
        )}
        <p className="sr-only">
          Scroll down to drive the car forward and move through three views.
          Scroll up to retrace the journey. The car stops when you stop
          scrolling.
        </p>
      </div>
    </section>
  );
}

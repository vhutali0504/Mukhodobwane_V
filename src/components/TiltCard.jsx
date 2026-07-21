import { useRef } from "react";

const reduced =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function TiltCard({ enabled = true, className = "", style = {}, children }) {
  const ref = useRef(null);

  function onMove(e) {
    if (!enabled || reduced) return;
    const el = ref.current;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;   // -0.5 .. 0.5
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform =
      `perspective(900px) rotateX(${py * -10}deg) rotateY(${px * 12}deg) translateY(-4px)`;
  }

  function onLeave() {
    if (!enabled || reduced) return;
    ref.current.style.transform = "";
  }

  return (
    <article
      ref={ref}
      className={className}
      style={style}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {children}
    </article>
  );
}
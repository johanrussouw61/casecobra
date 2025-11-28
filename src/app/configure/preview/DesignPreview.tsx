"use client";
// lightweight in-place confetti generator (no external deps)
import { Configuration } from "@prisma/client";
import { useEffect, useState, useRef } from "react";

const confettiConfig = {
  elementCount: 80,
  duration: 3000,
  colors: ["#a864fd", "#29cdff", "#78ff44", "#ff718d", "#fdff6a"],
};

function spawnConfetti(container: HTMLElement, opts: typeof confettiConfig) {
  const { elementCount, duration, colors } = opts;
  const rect = container.getBoundingClientRect();
  // spawnConfetti (no debug logs)

  const canvas = document.createElement("canvas");
  const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
  canvas.style.position = "fixed";
  canvas.style.left = "0";
  canvas.style.top = "0";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "9999";
  document.body.appendChild(canvas);

  const vw = Math.max(
    document.documentElement.clientWidth || 0,
    window.innerWidth || 0
  );
  const vh = Math.max(
    document.documentElement.clientHeight || 0,
    window.innerHeight || 0
  );
  canvas.width = Math.round(vw * dpr);
  canvas.height = Math.round(vh * dpr);
  const renderCtx = canvas.getContext("2d")!;
  renderCtx.scale(dpr, dpr);

  // no debug draw

  type Particle = {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
    rot: number;
    vr: number;
  };

  const particles: Particle[] = [];
  for (let i = 0; i < elementCount; i++) {
    const size = 6 + Math.random() * 14;
    const x = rect.left + Math.random() * Math.max(20, rect.width);
    const y = rect.top + Math.random() * 20;
    const vx = (Math.random() - 0.5) * 2 - 1;
    const vy = 1 + Math.random() * 2;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const rot = Math.random() * Math.PI * 2;
    const vr = (Math.random() - 0.5) * 0.2;
    particles.push({ x, y, vx, vy, size, color, rot, vr });
  }

  const start = performance.now();

  function frame(now: number) {
    const t = now - start;
    renderCtx.clearRect(0, 0, vw, vh);
    for (const p of particles) {
      // physics
      p.vy += 0.03;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;

      renderCtx.save();
      renderCtx.translate(p.x + p.size / 2, p.y + p.size / 2);
      renderCtx.rotate(p.rot);
      renderCtx.fillStyle = p.color;
      renderCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      renderCtx.restore();
    }

    if (t < duration) {
      requestAnimationFrame(frame);
    } else {
      // cleanup
      canvas.remove();
    }
  }

  requestAnimationFrame(frame);
  requestAnimationFrame(frame);
}

const DesignPreview = ({ configuration }: { configuration: Configuration }) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const confettiRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // trigger once on mount
    setShowConfetti(true);
    const t = setTimeout(
      () => setShowConfetti(false),
      confettiConfig.duration + 200
    );

    const el = confettiRef.current;
    if (el) spawnConfetti(el, confettiConfig);

    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <div className="pointer-events-none select-none absolute inset-0 overflow-hidden flex justify-center items-start z-50">
        {/* give the confetti container a visible horizontal area so dom-confetti can position particles */}
        <div
          ref={confettiRef}
          className="w-full h-32 pointer-events-none flex justify-center"
        >
          {/* our lightweight confetti draws directly into the container */}
        </div>
      </div>
    </>
  );
};

export default DesignPreview;

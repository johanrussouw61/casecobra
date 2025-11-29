"use client";
import Phone from "@/app/components/Phone";
import ScrollableArea from "@/app/components/ScrollableArea";
import { cn } from "@/lib/utils";
import { COLORS, MODELS } from "@/validators/option-validator";
// lightweight in-place confetti generator (no external deps)
import { Configuration } from "@prisma/client";
import { Check } from "lucide-react";
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

  const { color, model } = configuration;
  const tw = COLORS.find(
    (supportedColor) => supportedColor.value === color
  )?.tw;

  const { label: modelLabel } = MODELS.options.find(
    ({ value }) => value === model
  )!;

  return (
    <ScrollableArea height="700px">
      <div className="text-center px-4 flex flex-col items-center justify-center ">
        <Phone
          className={cn(`bg-${tw}`)}
          imgSrc={configuration.croppedImageUrl!}
        />
        <h3 className="text-3xl font-bold tracking-tight text-gray-900">
          Your {modelLabel} Case
        </h3>
        <Check className="h-5 w-5 text-green-500" />
        <p className="text-gray-600">In stock and ready to ship</p>
        <p className="font-medium text-zinc-950">Highlights</p>
        <ol className="mt-3 text-zinc-700 list-disc list-inside">
          <li>Wireless charging compatible</li>
          <li>TPU schock absorption</li>
          <li>Packaging made from recycled materials</li>
          <li>5 year print warranty</li>
        </ol>
      </div>
    </ScrollableArea>
  );
};

export default DesignPreview;

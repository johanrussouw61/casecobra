"use client";
import Phone from "@/app/components/Phone";
import ScrollableArea from "@/app/components/ScrollableArea";
import { Button } from "@/components/ui/button";
import { BASE_PRICE, PRODUCT_PRICES } from "@/config/products";
import { cn, formatPrice } from "@/lib/utils";
import { COLORS, MODELS } from "@/validators/option-validator";
import { Configuration } from "@prisma/client";
import { ArrowRight, Check } from "lucide-react";
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showConfetti, setShowConfetti] = useState(false);
  //useEffect(() => setShowConfetti(true));
  const confettiRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    // trigger once on mount
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShowConfetti(true);
    const t = setTimeout(
      () => setShowConfetti(false),
      confettiConfig.duration + 200
    );

    const el = confettiRef.current;
    if (el) spawnConfetti(el, confettiConfig);

    return () => clearTimeout(t);
  }, []);
  const { color, model, finish, material } = configuration;
  const tw = COLORS.find(
    (supportedColor) => supportedColor.value === color
  )?.tw;

  const { label: modelLabel } = MODELS.options.find(
    ({ value }) => value === model
  )!;

  let totalPrice = BASE_PRICE;
  if (material === "polycarbonate")
    totalPrice += PRODUCT_PRICES.material.polycarbonate;
  if (finish == "textured") totalPrice += PRODUCT_PRICES.finish.textured;

  return (
    <>
      <ScrollableArea height="700px">
        <div
          aria-hidden="true"
          className="pointer-events-none select-none absolute inset-0 overflow-hidden flex justify-center"
        >
          <div
            ref={confettiRef}
            className="w-full h-32 pointer-events-none flex justify-center"
          />
        </div>
        <div className="px-4 w-full">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            <div className="md:col-span-5 lg:col-span-4 flex justify-center">
              <div className="w-full max-w-xs">
                <Phone
                  className={cn(`bg-${tw}`)}
                  imgSrc={configuration.croppedImageUrl!}
                />
              </div>
            </div>

            <div className="md:col-span-7 lg:col-span-8">
              <h3 className="text-3xl font-bold tracking-tight text-gray-900">
                Your {modelLabel} Case
              </h3>
              <div className="mt-3 flex items-center gap-1.5 text-base">
                <Check className="h-4 w-4 text-green-500" />
                <span>In stock and ready to ship</span>
              </div>
              <div className="mt-6">
                <p className="font-medium text-zinc-950">Highlights</p>
                <ol className="mt-3 text-zinc-700 list-disc list-inside">
                  <li>Wireless charging compatible</li>
                  <li>TPU shock absorption</li>
                  <li>Packaging made from recycled materials</li>
                  <li>5 year print warranty</li>
                </ol>
              </div>

              <div className="mt-6">
                <p className="font-medium text-zinc-950">Materials</p>
                <ol className="mt-3 text-zinc-700 list-disc list-inside">
                  <li>High-quality, durable material</li>
                  <li>Scratch- and fingerprint resistant coating</li>
                </ol>
              </div>

              <div className="mt-8">
                <div className="bg-gray50 p-6">
                  <div className="flow-root text-sm">
                    <div className="flex items-center justify-between py-1 mt-2">
                      <p className="text-gray-600">Base Price</p>
                      <p className="font-medium text-gray-900">
                        {formatPrice(BASE_PRICE / 100)}
                      </p>
                    </div>
                    {finish === "textured" ? (
                      <div className="flex items-center justify-between py-1 mt-2">
                        <p className="text-gray-600">Textured finish</p>
                        <p className="font-medium text-gray-900">
                          {formatPrice(PRODUCT_PRICES.finish.textured / 100)}
                        </p>
                      </div>
                    ) : null}
                    {material === "polycarbonate" ? (
                      <div className="flex items-center justify-between py-1 mt-2">
                        <p className="text-gray-600">
                          Soft plycarbonate material{" "}
                        </p>
                        <p className="font-medium text-gray-900">
                          {formatPrice(
                            PRODUCT_PRICES.material.polycarbonate / 100
                          )}
                        </p>
                      </div>
                    ) : null}

                    <div className="flex items-center justify-between py-1 mt-2">
                      <p className="text-gray-600">Total Price</p>
                      <p className="font-medium text-gray-900">
                        {formatPrice(totalPrice / 100)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-8 flex justify-end pb-12">
                  <Button className="px-4 sm:px-6.lg:px-8 bg-green-600">
                    Check out <ArrowRight className="h-4 w-4 ml-1.5 inline" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollableArea>
    </>
  );
};

export default DesignPreview;

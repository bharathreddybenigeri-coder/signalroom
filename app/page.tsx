"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Activity, ArrowRight, Cpu, Gauge, Layers3, Radio, Sparkles, Zap } from "lucide-react";
import { writeUser } from "@/lib/userStore";

const PALETTE = ["#ff6b5f", "#1fb8a8", "#7058d8", "#f4b23e", "#e14da3"];

function SignalCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let raf = 0;
    let width = 0;
    let height = 0;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    };
    resize();
    window.addEventListener("resize", resize);

    const start = performance.now();
    const draw = (now: number) => {
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const t = (now - start) / 1000;

      // Flowing sine wave layers
      const layers = 5;
      for (let l = 0; l < layers; l += 1) {
        const color = PALETTE[l % PALETTE.length];
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.6;
        ctx.globalAlpha = 0.22 + (l * 0.04);
        ctx.beginPath();
        const amp = 32 + l * 8;
        const freq = 0.006 + l * 0.001;
        const phase = t * (0.35 + l * 0.05) + l * 1.1;
        const yBase = height * (0.32 + l * 0.09);
        for (let x = 0; x <= width; x += 4) {
          const y = yBase + Math.sin(x * freq + phase) * amp + Math.sin(x * freq * 2.3 + phase * 1.3) * (amp * 0.4);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // Drifting glow particles
      ctx.globalAlpha = 1;
      const particles = 34;
      for (let i = 0; i < particles; i += 1) {
        const seedX = (i * 137.5) % 100;
        const seedY = (i * 71.3) % 100;
        const drift = (t * 12 + i * 20) % (width + 200);
        const x = ((seedX / 100) * width + drift) % width;
        const y = (seedY / 100) * height + Math.sin(t * 0.6 + i) * 24;
        const color = PALETTE[i % PALETTE.length];
        const r = 1.8 + Math.sin(t * 1.2 + i) * 0.9;
        const grad = ctx.createRadialGradient(x, y, 0, x, y, r * 5);
        grad.addColorStop(0, `${color}cc`);
        grad.addColorStop(1, `${color}00`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, r * 5, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);
  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0" aria-hidden />;
}

const FEATURES = [
  { icon: Activity, color: "#ff6b5f", title: "Real-time canvas", body: "10k+ points at 60fps, drawn from scratch on Canvas 2D." },
  { icon: Layers3, color: "#1fb8a8", title: "Four chart lenses", body: "Line, bars, scatter, heatmap — all live off the same feed." },
  { icon: Gauge, color: "#7058d8", title: "Performance HUD", body: "FPS, memory, and a stress slider that goes to 50k." },
  { icon: Sparkles, color: "#f4b23e", title: "Saved views", body: "Snapshot mode + filters + range into one-tap presets." },
];

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const rise = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 140, damping: 22 } },
};

export default function LandingPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [entering, setEntering] = useState(false);

  const firstName = useMemo(() => name.trim().split(/\s+/)[0] || "", [name]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 5) return "Still up";
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const nameValid = name.trim().length >= 2;
  const canSubmit = nameValid && emailValid && !entering;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameValid) {
      setError("Please enter your name (at least 2 characters).");
      return;
    }
    if (!emailValid) {
      setError("That email doesn't look right.");
      return;
    }
    setError(null);
    setEntering(true);
    writeUser({ name: name.trim(), email: email.trim(), createdAt: Date.now() });
    setTimeout(() => router.push("/dashboard"), 650);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0b0b10] text-white">
      {/* Radial spotlight backdrop */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-90"
        style={{
          background:
            "radial-gradient(circle at 20% 15%, rgba(255,107,95,.16), transparent 42%), radial-gradient(circle at 82% 82%, rgba(112,88,216,.18), transparent 45%), radial-gradient(circle at 55% 40%, rgba(31,184,168,.10), transparent 55%)",
        }}
      />
      {/* Grain */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[.35] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .15 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
        }}
      />

      <SignalCanvas />

      {/* Giant word-mark backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-16 left-1/2 -translate-x-1/2 select-none whitespace-nowrap text-[26vw] font-black leading-none tracking-[-.09em] text-white/[.025]"
      >
        signalroom
      </div>

      {/* Floating corner KPI — top left */}
      <motion.div
        initial={{ opacity: 0, y: -12, x: -12 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        transition={{ delay: 0.7, duration: 0.7 }}
        className="absolute left-8 top-8 hidden items-center gap-3 rounded-2xl border border-white/10 bg-white/[.04] px-3.5 py-2.5 backdrop-blur-xl md:flex"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ff6b5f]/20 text-[#ff8f85]">
          <Radio size={14} />
        </span>
        <div>
          <div className="text-[9px] font-bold uppercase tracking-[.15em] text-white/40">Live</div>
          <div className="text-sm font-extrabold tracking-[-.02em]">1,248 events / s</div>
        </div>
      </motion.div>
      {/* Floating corner KPI — top right */}
      <motion.div
        initial={{ opacity: 0, y: -12, x: 12 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        transition={{ delay: 0.9, duration: 0.7 }}
        className="absolute right-8 top-8 hidden items-center gap-3 rounded-2xl border border-white/10 bg-white/[.04] px-3.5 py-2.5 backdrop-blur-xl md:flex"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1fb8a8]/20 text-[#4fdac9]">
          <Zap size={14} />
        </span>
        <div>
          <div className="text-[9px] font-bold uppercase tracking-[.15em] text-white/40">FPS</div>
          <div className="text-sm font-extrabold tracking-[-.02em]">60 stable</div>
        </div>
      </motion.div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-14 md:py-10">
        <motion.div variants={stagger} initial="hidden" animate="show" className="grid gap-14 md:grid-cols-[1.05fr_.95fr] md:items-center">
          {/* Left column: story */}
          <div>
            <motion.div variants={rise} className="mb-5 flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#0b0b10] shadow-[0_4px_0_rgba(255,255,255,.15)]">
                <Activity size={16} strokeWidth={2.6} />
              </span>
              <span className="text-[15px] font-extrabold tracking-[-.03em]">
                signal<span className="text-[#ff6b5f]">/</span>room
              </span>
            </motion.div>

            <motion.div
              variants={rise}
              className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.04] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[.14em] text-white/60 backdrop-blur"
            >
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#ff6b5f]" />
              Realtime observatory
            </motion.div>

            <motion.h1
              variants={rise}
              className="mt-1 text-[52px] font-black leading-[0.95] tracking-[-.055em] text-white sm:text-[62px] md:text-[72px]"
            >
              Watch every
              <br />
              <span className="relative inline-block bg-gradient-to-r from-[#ff6b5f] via-[#f4b23e] to-[#e14da3] bg-clip-text pr-2 text-transparent">
                signal
                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 1.0, duration: 0.9, ease: "easeOut" }}
                  className="absolute -bottom-1 left-0 h-1.5 w-full origin-left rounded-full bg-gradient-to-r from-[#ff6b5f] via-[#f4b23e] to-[#e14da3]"
                />
              </span>{" "}
              breathe.
            </motion.h1>

            <motion.p variants={rise} className="mt-5 max-w-lg text-[15px] leading-[1.6] text-white/60">
              A handcrafted realtime dashboard. Ten thousand points a second, four chart lenses, a live performance HUD — all
              painted from scratch on canvas, none of it template.
            </motion.p>

            <motion.ul variants={rise} className="mt-8 grid gap-4 sm:grid-cols-2">
              {FEATURES.map(({ icon: Icon, color, title, body }) => (
                <li key={title} className="group flex items-start gap-3 rounded-2xl border border-white/[.07] bg-white/[.02] p-3.5 backdrop-blur transition hover:border-white/15 hover:bg-white/[.04]">
                  <span
                    className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-[inset_0_-2px_0_rgba(0,0,0,.15)]"
                    style={{ backgroundColor: `${color}22`, color }}
                  >
                    <Icon size={16} />
                  </span>
                  <div>
                    <div className="text-[13px] font-extrabold tracking-[-.02em]">{title}</div>
                    <div className="mt-0.5 text-[11px] leading-[1.5] text-white/50">{body}</div>
                  </div>
                </li>
              ))}
            </motion.ul>

            <motion.div variants={rise} className="mt-8 flex items-center gap-4 text-[11px] font-bold text-white/40">
              <div className="flex items-center gap-1.5"><Cpu size={12} className="text-[#4fdac9]" /> Zero chart libraries</div>
              <span className="h-1 w-1 rounded-full bg-white/20" />
              <div className="flex items-center gap-1.5"><Sparkles size={12} className="text-[#f4b23e]" /> Next.js App Router</div>
            </motion.div>
          </div>

          {/* Right column: form card */}
          <motion.div variants={rise} className="relative">
            {/* Live greeting preview */}
            <AnimatePresence mode="wait">
              {firstName && (
                <motion.div
                  key={firstName}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35 }}
                  className="mb-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[.05] px-4 py-3 backdrop-blur-xl"
                >
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-full text-[12px] font-extrabold"
                    style={{ background: "linear-gradient(135deg,#ff6b5f,#f4b23e)", color: "#0b0b10" }}
                  >
                    {firstName[0]?.toUpperCase() ?? "S"}
                  </span>
                  <div>
                    <div className="text-[10px] font-extrabold uppercase tracking-[.15em] text-white/50">Preview</div>
                    <div className="text-sm font-extrabold tracking-[-.02em]">
                      {greeting}, {firstName} <span className="text-[#ff6b5f]">.</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div
              className="relative overflow-hidden rounded-[26px] border border-white/10 bg-gradient-to-b from-white/[.06] to-white/[.02] p-6 shadow-[0_20px_60px_rgba(0,0,0,.5)] backdrop-blur-2xl sm:p-8"
            >
              <div
                aria-hidden
                className="absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-40 blur-3xl"
                style={{ background: "radial-gradient(circle, #ff6b5f 0%, transparent 70%)" }}
              />
              <div
                aria-hidden
                className="absolute -bottom-16 -left-10 h-40 w-40 rounded-full opacity-30 blur-3xl"
                style={{ background: "radial-gradient(circle, #7058d8 0%, transparent 70%)" }}
              />

              <div className="relative">
                <div className="mb-1.5 text-[10px] font-extrabold uppercase tracking-[.18em] text-white/50">
                  Step in
                </div>
                <h2 className="text-[26px] font-black leading-[1] tracking-[-.03em] sm:text-[28px]">
                  Two lines, then the dashboard.
                </h2>
                <p className="mt-2 text-sm text-white/50">
                  We'll personalise the observatory to you. Nothing leaves this browser.
                </p>

                <form onSubmit={onSubmit} className="mt-6 space-y-4">
                  <label className="block">
                    <span className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-[.15em] text-white/40">
                      Your name
                    </span>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      autoFocus
                      placeholder="Ada Lovelace"
                      className="w-full rounded-xl border border-white/10 bg-white/[.03] px-4 py-3 text-[15px] font-bold tracking-[-.01em] text-white placeholder:font-medium placeholder:text-white/25 outline-none transition focus:border-[#ff6b5f]/60 focus:bg-white/[.06]"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-[.15em] text-white/40">
                      Email
                    </span>
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      type="email"
                      placeholder="ada@analytical-engine.io"
                      className="w-full rounded-xl border border-white/10 bg-white/[.03] px-4 py-3 text-[15px] font-bold tracking-[-.01em] text-white placeholder:font-medium placeholder:text-white/25 outline-none transition focus:border-[#1fb8a8]/60 focus:bg-white/[.06]"
                    />
                  </label>

                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="rounded-lg border border-[#ff6b5f]/30 bg-[#ff6b5f]/10 px-3 py-2 text-xs font-bold text-[#ff8f85]"
                      >
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.button
                    type="submit"
                    disabled={!canSubmit}
                    whileHover={canSubmit ? { y: -2 } : undefined}
                    whileTap={canSubmit ? { y: 0, scale: 0.98 } : undefined}
                    className={`group relative flex h-13 w-full items-center justify-center gap-2 overflow-hidden rounded-2xl py-4 text-[13px] font-black uppercase tracking-[.12em] text-[#0b0b10] transition ${
                      canSubmit
                        ? "bg-gradient-to-r from-[#ff6b5f] via-[#f4b23e] to-[#e14da3] shadow-[0_8px_0_rgba(0,0,0,.35),0_18px_40px_rgba(255,107,95,.35)] hover:shadow-[0_10px_0_rgba(0,0,0,.35),0_22px_50px_rgba(255,107,95,.5)]"
                        : "cursor-not-allowed bg-white/[.06] text-white/30"
                    }`}
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      {entering ? "Opening the observatory…" : "Enter the observatory"}
                      {!entering && (
                        <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                      )}
                    </span>
                    {canSubmit && (
                      <span
                        aria-hidden
                        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full"
                      />
                    )}
                  </motion.button>
                </form>

                <div className="mt-6 flex items-center gap-3 border-t border-white/[.06] pt-5 text-[10px] font-bold text-white/35">
                  <span className="flex h-1.5 w-1.5 animate-pulse rounded-full bg-[#4fdac9]" />
                  Streams boot in under a second
                  <span className="ml-auto">no account required</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          className="mt-14 flex flex-wrap items-center justify-between gap-4 text-[10px] font-bold text-white/30"
        >
          <span>© signalroom · built for engineers who like their data with taste</span>
          <div className="flex items-center gap-4">
            <span>Next.js App Router</span>
            <span>·</span>
            <span>Canvas 2D from scratch</span>
            <span>·</span>
            <span>Web Workers</span>
          </div>
        </motion.div>
      </div>
    </main>
  );
}

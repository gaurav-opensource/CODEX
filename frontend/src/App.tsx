import { Canvas, useFrame } from "@react-three/fiber";
import {
  Activity,
  ArrowRight,
  BrainCircuit,
  DatabaseZap,
  GitBranch,
  HeartPulse,
  LockKeyhole,
  Network,
  Play,
  Radio,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  TerminalSquare,
  TimerReset,
  Workflow,
  Zap
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { lazy, memo, Suspense, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import type { Group, Points } from "three";

const LiveDashboardSection = lazy(() =>
  import("./components/landing/LiveDashboardSection").then((m) => ({ default: m.LiveDashboardSection }))
);

const agents = [
  "Sentinel",
  "Diagnostician",
  "Strategist",
  "Governor",
  "Executor",
  "Verifier",
  "Historian",
  "HydraDB"
];

const pipeline = ["Detect", "Diagnose", "Recover", "Rollback", "Restore"];

const story = [
  { title: "Workflow Failure", detail: "Latency spike and agent exception detected.", tone: "danger" },
  { title: "Detection", detail: "Sentinel locks the incident and emits a live recovery signal.", tone: "warn" },
  { title: "Recovery", detail: "Strategist selects a repair plan and Governor approves execution.", tone: "cyan" },
  { title: "Verification Failed", detail: "Verifier rejects unstable output and escalates to memory rollback.", tone: "danger" },
  { title: "HydraDB Rollback", detail: "Checkpoint graph restores durable operational state.", tone: "purple" },
  { title: "Workflow Restored", detail: "Health probes pass and the workflow rejoins production.", tone: "green" }
];

const memoryCells = [
  "checkpoint: clinical-triage:42",
  "incident: queue-timeout:7",
  "rollback: approved",
  "vector trace: healthy",
  "agent plan: governor-signed",
  "event stream: replayable",
  "runtime diff: isolated",
  "health proof: verified",
  "HydraDB shard: hot",
  "workflow memory: persistent",
  "lineage: preserved",
  "semantic patch: stored"
];

const useCases = [
  ["Healthcare AI", "Recover clinical workflow agents before triage queues stall.", HeartPulse],
  ["Autonomous Agents", "Give long-running agent swarms memory, checkpoints, and rollback.", BrainCircuit],
  ["Fintech Workflows", "Protect transaction automations from partial failures and drift.", ShieldCheck],
  ["Infrastructure Reliability", "Orchestrate recovery agents across APIs, queues, and jobs.", Network],
  ["AI Operations", "Stream incidents, plans, and health verdicts as first-class telemetry.", Activity],
  ["Workflow Resilience", "Turn brittle DAGs into systems that can repair their own execution.", Workflow]
] as const;

const roadmap = [
  "Semantic recovery planning",
  "Distributed rollback consensus",
  "Multi-agent health arbitration",
  "HydraDB temporal memory graphs",
  "Policy-aware autonomous execution",
  "Cross-workflow immune response"
];

const revealViewport = { once: true, margin: "-80px" } as const;

const BrainMesh = memo(function BrainMesh() {
  const group = useRef<Group>(null);
  const points = useRef<Points>(null);
  const positions = useMemo(() => {
    const values = new Float32Array(140 * 3);
    for (let i = 0; i < 140; i += 1) {
      const radius = 1.7 + Math.random() * 1.4;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      values[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      values[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      values[i * 3 + 2] = radius * Math.cos(phi);
    }
    return values;
  }, []);

  useFrame(({ clock, pointer }) => {
    if (group.current) {
      group.current.rotation.y = clock.elapsedTime * 0.06 + pointer.x * 0.1;
      group.current.rotation.x = Math.sin(clock.elapsedTime * 0.18) * 0.06 - pointer.y * 0.05;
    }
    if (points.current) {
      points.current.rotation.z = clock.elapsedTime * 0.025;
    }
  });

  return (
    <group ref={group}>
      <points ref={points}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial color="#67e8f9" size={0.022} transparent opacity={0.72} />
      </points>
      {agents.map((agent, index) => {
        const angle = (index / agents.length) * Math.PI * 2;
        const x = Math.cos(angle) * 2.45;
        const y = Math.sin(angle * 1.2) * 0.55;
        const z = Math.sin(angle) * 2.45;
        return (
          <mesh key={agent} position={[x, y, z]}>
            <sphereGeometry args={[index === 7 ? 0.16 : 0.09, 12, 12]} />
            <meshStandardMaterial
              color={index === 7 ? "#a78bfa" : "#22d3ee"}
              emissive={index === 7 ? "#7c3aed" : "#0891b2"}
              emissiveIntensity={1.2}
            />
          </mesh>
        );
      })}
      <mesh>
        <torusKnotGeometry args={[1.2, 0.01, 64, 8, 2, 5]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.28} />
      </mesh>
      <ambientLight intensity={0.55} />
      <pointLight position={[3, 4, 4]} color="#22d3ee" intensity={8} />
      <pointLight position={[-4, -2, -2]} color="#8b5cf6" intensity={5} />
    </group>
  );
});

function IntroCurtain() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timeout = window.setTimeout(() => setVisible(false), 1200);
    return () => window.clearTimeout(timeout);
  }, []);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center bg-black"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.45 }}
            className="text-center"
          >
            <div className="mx-auto mb-5 grid h-20 w-20 place-items-center rounded-full border border-cyan-300/40 bg-cyan-300/10 shadow-[0_0_40px_rgba(34,211,238,0.25)]">
              <BrainCircuit className="h-9 w-9 text-cyan-200" />
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.4em] text-cyan-100">CORTEX boot sequence</p>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

const SectionReveal = memo(function SectionReveal({
  children,
  className = "",
  id,
  deferred = false
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
  deferred?: boolean;
}) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={revealViewport}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className={`${deferred ? "landing-section-deferred" : ""} ${className}`.trim()}
    >
      {children}
    </motion.section>
  );
});

const Hero = memo(function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const [heroVisible, setHeroVisible] = useState(true);

  useEffect(() => {
    const node = heroRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => setHeroVisible(entry.isIntersecting),
      { rootMargin: "120px 0px", threshold: 0.08 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={heroRef} className="relative min-h-screen overflow-hidden px-5 py-6 sm:px-8">
      <div className="hero-grid absolute inset-0" />
      <div className={`data-rain absolute inset-0 ${heroVisible ? "is-active" : ""}`} />
      <div className="relative z-10 mx-auto flex min-h-[92vh] max-w-7xl flex-col hero-parallax-layer">
        <nav className="flex items-center justify-between py-2">
          <a href="#hero" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg border border-cyan-300/30 bg-cyan-300/10">
              <BrainCircuit className="h-5 w-5 text-cyan-200" />
            </span>
            <span className="text-sm font-black uppercase tracking-[0.3em] text-slate-100">CORTEX</span>
          </a>
          <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-cyan-100 md:flex">
            <span className="live-dot" />
            autonomous recovery OS
          </div>
        </nav>

        <div id="hero" className="grid flex-1 items-center gap-10 py-14 lg:grid-cols-[1fr_0.9fr]">
          <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }}>
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-cyan-200/20 bg-cyan-200/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-cyan-100">
              <Sparkles className="h-4 w-4" />
              AI Infrastructure + Autonomous Recovery
            </div>
            <h1 className="max-w-5xl text-[clamp(3.6rem,10vw,8.6rem)] font-black leading-[0.86] text-white">
              The Self-Healing Workflow Brain
            </h1>
            <p className="mt-8 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
              Autonomous recovery infrastructure powered by persistent operational memory.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <a className="cortex-button primary" href="/dashboard">
                <Play className="h-5 w-5" />
                Open Dashboard
              </a>
              <a className="cortex-button secondary" href="#live-os">
                <TerminalSquare className="h-5 w-5" />
                Live Preview
              </a>
              <a className="cortex-button secondary" href="/dashboard/architecture">
                <GitBranch className="h-5 w-5" />
                View Architecture
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.75, delay: 0.12 }}
            className="relative min-h-[430px] lg:min-h-[620px]"
          >
            <div className="hero-glow absolute inset-0 rounded-full" />
            <Canvas
              camera={{ position: [0, 0, 6.2], fov: 48 }}
              className="hero-canvas"
              dpr={[1, 1.25]}
              frameloop={heroVisible ? "always" : "never"}
              gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
            >
              <Suspense fallback={null}>
                <BrainMesh />
              </Suspense>
            </Canvas>
            <div className="hero-stream-panel absolute inset-x-4 bottom-5 grid gap-3 p-4 sm:inset-x-10">
              {["failure.signal", "agent.plan", "hydradb.restore"].map((item, index) => (
                <div
                  key={item}
                  className="hero-stream-row flex items-center justify-between border-b border-white/10 pb-2 last:border-0 last:pb-0"
                  style={{ "--stream-delay": `${index * 0.45}s` } as CSSProperties}
                >
                  <span className="font-mono text-xs text-cyan-100">{item}</span>
                  <span className="font-mono text-xs text-emerald-200">streaming</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
});

const OrchestrationVisual = memo(function OrchestrationVisual() {
  return (
    <SectionReveal id="architecture" className="relative mx-auto max-w-7xl px-5 py-24 sm:px-8" deferred>
      <div className="section-kicker">Live orchestration visual</div>
      <div className="section-heading">
        <h2>Recovery agents move like a living operating system.</h2>
        <p>Detect, diagnose, recover, rollback, and restore are coordinated as one live recovery pipeline.</p>
      </div>
      <div className="mt-12 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="glass-panel p-5">
          <div className="mb-5 flex items-center justify-between">
            <span className="font-mono text-xs uppercase text-slate-400">agent runtime</span>
            <Radio className="h-5 w-5 text-cyan-200" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {agents.map((agent, index) => (
              <div
                key={agent}
                className="agent-orb agent-orb-float"
                style={{ "--agent-delay": `${index * 0.18}s` } as CSSProperties}
              >
                <span>{agent}</span>
                <small>{index === 7 ? "memory core" : "agent online"}</small>
              </div>
            ))}
          </div>
        </div>
        <div className="glass-panel relative overflow-hidden p-6">
          <div className="absolute inset-0 pipeline-stream" />
          <div className="relative grid gap-5">
            {pipeline.map((step, index) => (
              <div key={step} className="pipeline-row">
                <div
                  className="pipeline-node pipeline-node-pulse"
                  style={{ "--pipeline-delay": `${index * 0.35}s` } as CSSProperties}
                >
                  {index + 1}
                </div>
                <div>
                  <strong>{step}</strong>
                  <p>
                    {agents[index]} hands state to {agents[(index + 1) % agents.length]}.
                  </p>
                </div>
                <div
                  className="pipeline-link hidden h-px flex-1 md:block"
                  style={{ "--pipeline-delay": `${index * 0.2}s` } as CSSProperties}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </SectionReveal>
  );
});

const RecoveryStory = memo(function RecoveryStory() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => setActive((current) => (current + 1) % story.length), 2200);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <SectionReveal className="relative px-5 py-24 sm:px-8" deferred>
      <div className="mx-auto max-w-7xl">
        <div className="section-kicker">Failure to recovery story</div>
        <div className="section-heading">
          <h2>The strongest moment: collapse becomes restoration.</h2>
          <p>CORTEX turns a failed workflow into a verified rollback sequence with visible operational memory.</p>
        </div>
        <div className="timeline-stage mt-12">
          <div className="timeline-line" />
          {story.map((item, index) => (
            <button
              key={item.title}
              className={`story-node ${active === index ? "active" : ""} ${item.tone}`}
              onClick={() => setActive(index)}
              type="button"
            >
              <span>{index + 1}</span>
              <strong>{item.title}</strong>
            </button>
          ))}
        </div>
        <div className="recovery-card story-card-active" key={active}>
          <div className="flex items-center gap-3">
            <TimerReset className="h-6 w-6 text-cyan-100" />
            <span className="font-mono text-xs uppercase tracking-[0.22em] text-cyan-100">state transition</span>
          </div>
          <h3>{story[active].title}</h3>
          <p>{story[active].detail}</p>
          <div className="checkpoint-bar">
            <span className="checkpoint-fill" style={{ transform: `scaleX(${(active + 1) / story.length})` }} />
          </div>
        </div>
      </div>
    </SectionReveal>
  );
});

const HydraMemory = memo(function HydraMemory() {
  return (
    <SectionReveal className="mx-auto grid max-w-7xl gap-10 px-5 py-24 sm:px-8 lg:grid-cols-[0.85fr_1.15fr]" deferred>
      <div>
        <div className="section-kicker">HydraDB memory engine</div>
        <h2 className="text-4xl font-black leading-tight text-white sm:text-6xl">Persistent memory for autonomous recovery.</h2>
        <p className="mt-6 text-lg leading-8 text-slate-300">
          HydraDB stores workflow checkpoints, incident lineage, rollback history, recovery plans, and health proof so
          agents can restore reality instead of guessing at it.
        </p>
        <div className="mt-8 grid gap-3">
          {["workflow memory", "checkpoint storage", "rollback restoration", "incident persistence", "recovery history"].map((item) => (
            <div key={item} className="memory-pill">
              <DatabaseZap className="h-4 w-4" />
              {item}
            </div>
          ))}
        </div>
      </div>
      <div className="memory-grid glass-panel">
        {memoryCells.map((cell, index) => (
          <div
            key={cell}
            className="memory-cell memory-cell-pulse"
            style={{ "--memory-delay": `${index * 0.12}s` } as CSSProperties}
          >
            <span>{cell}</span>
          </div>
        ))}
      </div>
    </SectionReveal>
  );
});

const WhyCortex = memo(function WhyCortex() {
  return (
    <SectionReveal className="mx-auto max-w-7xl px-5 py-24 sm:px-8" deferred>
      <div className="section-kicker">Why CORTEX matters</div>
      <div className="section-heading">
        <h2>AI workflows are becoming infrastructure. Infrastructure needs recovery.</h2>
        <p>CORTEX gives high-stakes automation an immune response: memory, agents, policy, and verification.</p>
      </div>
      <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {useCases.map(([title, detail, Icon], index) => (
          <article key={title} className="use-card use-card-hover">
            <Icon className="h-7 w-7 text-cyan-200" />
            <h3>{title}</h3>
            <p>{detail}</p>
            <span>0{index + 1}</span>
          </article>
        ))}
      </div>
    </SectionReveal>
  );
});

const FutureLayer = memo(function FutureLayer() {
  return (
    <SectionReveal className="mx-auto max-w-7xl px-5 py-24 sm:px-8" deferred>
      <div className="future-panel">
        <div>
          <div className="section-kicker">Future of AI infrastructure</div>
          <h2>Operating system layer for autonomous AI reliability.</h2>
          <p>
            CORTEX is positioned below agents and above workflow runtimes: the recovery fabric that remembers, reasons,
            repairs, and proves system health.
          </p>
        </div>
        <div className="roadmap-grid">
          {roadmap.map((item, index) => (
            <div
              key={item}
              className="roadmap-item"
              style={{ "--roadmap-delay": `${index * 0.2}s` } as CSSProperties}
            >
              <LockKeyhole className="h-4 w-4 text-violet-200" />
              <span>Roadmap feature</span>
              <strong>{item}</strong>
            </div>
          ))}
        </div>
      </div>
    </SectionReveal>
  );
});

function FinalCta() {
  return (
    <section className="relative overflow-hidden px-5 py-28 sm:px-8 landing-section-deferred">
      <div className="orbital-bg" />
      <div className="relative z-10 mx-auto max-w-5xl text-center">
        <div className="cta-orbit-icon mx-auto mb-8 grid h-24 w-24 place-items-center rounded-full border border-cyan-200/30 bg-cyan-200/10 shadow-[0_0_60px_rgba(34,211,238,0.22)]">
          <Stethoscope className="h-10 w-10 text-cyan-100" />
        </div>
        <h2 className="text-5xl font-black leading-none text-white sm:text-7xl">AI systems need an immune system.</h2>
        <p className="mt-6 text-3xl font-black text-cyan-100 sm:text-5xl">CORTEX is building it.</p>
        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <a className="cortex-button primary" href="/dashboard">
            <Zap className="h-5 w-5" />
            Open Dashboard
          </a>
          <a className="cortex-button secondary" href="#hero">
            <ArrowRight className="h-5 w-5" />
            Replay Experience
          </a>
        </div>
        <footer className="mt-20 flex flex-wrap items-center justify-center gap-4 text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
          <span>CORTEX</span>
          <span>HydraDB Memory</span>
          <span>Autonomous Recovery OS</span>
        </footer>
      </div>
    </section>
  );
}

function LiveDashboardFallback() {
  return <section className="mx-auto max-w-7xl px-5 py-24 text-slate-400">Loading live dashboard preview…</section>;
}

export function App() {
  return (
    <main className="landing-shell">
      <IntroCurtain />
      <Hero />
      <OrchestrationVisual />
      <RecoveryStory />
      <HydraMemory />
      <Suspense fallback={<LiveDashboardFallback />}>
        <LiveDashboardSection />
      </Suspense>
      <WhyCortex />
      <FutureLayer />
      <FinalCta />
    </main>
  );
}

import { Canvas, useFrame } from "@react-three/fiber";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
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
import { AnimatePresence, motion, useInView, useScroll, useTransform } from "framer-motion";
import { memo, Suspense, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import type { Group, Points } from "three";

import { AgentRuntimePanel } from "./components/AgentRuntimePanel";
import { AgentTimeline } from "./components/AgentTimeline";
import { EventFeed } from "./components/EventFeed";
import { MetricsGrid } from "./components/MetricsGrid";
import { WorkflowTable } from "./components/WorkflowTable";
import { useLiveRecovery } from "./hooks/useLiveRecovery";

gsap.registerPlugin(ScrollTrigger);

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
];

const roadmap = [
  "Semantic recovery planning",
  "Distributed rollback consensus",
  "Multi-agent health arbitration",
  "HydraDB temporal memory graphs",
  "Policy-aware autonomous execution",
  "Cross-workflow immune response"
];

const sectionRevealTransition = { duration: 0.9, ease: [0.2, 0.8, 0.2, 1] } as const;
const revealViewport = { once: true, margin: "-120px" } as const;

const BrainMesh = memo(function BrainMesh() {
  const group = useRef<Group>(null);
  const points = useRef<Points>(null);
  const positions = useMemo(() => {
    const values = new Float32Array(360 * 3);
    for (let i = 0; i < 360; i += 1) {
      const radius = 1.7 + Math.random() * 1.8;
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
      group.current.rotation.y = clock.elapsedTime * 0.08 + pointer.x * 0.16;
      group.current.rotation.x = Math.sin(clock.elapsedTime * 0.22) * 0.08 - pointer.y * 0.08;
    }
    if (points.current) {
      points.current.rotation.z = clock.elapsedTime * 0.035;
    }
  });

  return (
    <group ref={group}>
      <points ref={points}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial color="#67e8f9" size={0.025} transparent opacity={0.78} />
      </points>
      {agents.map((agent, index) => {
        const angle = (index / agents.length) * Math.PI * 2;
        const x = Math.cos(angle) * 2.45;
        const y = Math.sin(angle * 1.2) * 0.55;
        const z = Math.sin(angle) * 2.45;
        return (
          <mesh key={agent} position={[x, y, z]}>
            <sphereGeometry args={[index === 7 ? 0.18 : 0.1, 32, 32]} />
            <meshStandardMaterial
              color={index === 7 ? "#a78bfa" : "#22d3ee"}
              emissive={index === 7 ? "#7c3aed" : "#0891b2"}
              emissiveIntensity={1.6}
            />
          </mesh>
        );
      })}
      <mesh>
        <torusKnotGeometry args={[1.2, 0.01, 180, 12, 2, 5]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.35} />
      </mesh>
      <ambientLight intensity={0.6} />
      <pointLight position={[3, 4, 4]} color="#22d3ee" intensity={10} />
      <pointLight position={[-4, -2, -2]} color="#8b5cf6" intensity={7} />
    </group>
  );
});

function IntroCurtain() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timeout = window.setTimeout(() => setVisible(false), 1450);
    return () => window.clearTimeout(timeout);
  }, []);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center bg-black"
          exit={{ opacity: 0, filter: "blur(18px)" }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.08 }}
            className="text-center"
          >
            <div className="mx-auto mb-5 grid h-20 w-20 place-items-center rounded-full border border-cyan-300/40 bg-cyan-300/10 shadow-[0_0_80px_rgba(34,211,238,0.45)]">
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
  id
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 64, filter: "blur(12px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={revealViewport}
      transition={sectionRevealTransition}
      className={className}
    >
      {children}
    </motion.section>
  );
});

const Hero = memo(function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const heroInView = useInView(heroRef, { margin: "360px 0px 360px 0px" });
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.28], [0, -140]);

  return (
    <section ref={heroRef} className="relative min-h-screen overflow-hidden px-5 py-6 sm:px-8">
      <div className="hero-grid absolute inset-0" />
      <div className="data-rain absolute inset-0 opacity-70" />
      <motion.div style={{ y: heroY }} className="relative z-10 mx-auto flex min-h-[92vh] max-w-7xl flex-col">
        <nav className="flex items-center justify-between py-2">
          <a href="#hero" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg border border-cyan-300/30 bg-cyan-300/10">
              <BrainCircuit className="h-5 w-5 text-cyan-200" />
            </span>
            <span className="text-sm font-black uppercase tracking-[0.3em] text-slate-100">CORTEX</span>
          </a>
          <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-cyan-100 backdrop-blur md:flex">
            <span className="live-dot" />
            autonomous recovery OS
          </div>
        </nav>

        <div id="hero" className="grid flex-1 items-center gap-10 py-14 lg:grid-cols-[1fr_0.9fr]">
          <motion.div initial={{ opacity: 0, y: 42 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }}>
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
              <a className="cortex-button primary" href="#live-os">
                <Play className="h-5 w-5" />
                Launch Live Demo
              </a>
              <a className="cortex-button secondary" href="#architecture">
                <GitBranch className="h-5 w-5" />
                View Architecture
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9, filter: "blur(18px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 1.1, delay: 0.2 }}
            className="relative min-h-[430px] lg:min-h-[620px]"
          >
            <div className="absolute inset-0 rounded-full bg-cyan-400/15 blur-3xl" />
            <Canvas
              camera={{ position: [0, 0, 6.2], fov: 48 }}
              className="hero-canvas"
              dpr={[1, 1.5]}
              frameloop={heroInView ? "always" : "never"}
              gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
            >
              <Suspense fallback={null}>
                <BrainMesh />
              </Suspense>
            </Canvas>
            <div className="absolute inset-x-4 bottom-5 grid gap-3 rounded-xl border border-cyan-200/20 bg-black/55 p-4 shadow-[0_0_60px_rgba(34,211,238,0.22)] backdrop-blur-xl sm:inset-x-10">
              {["failure.signal", "agent.plan", "hydradb.restore"].map((item, index) => (
                <motion.div
                  key={item}
                  animate={{ opacity: [0.45, 1, 0.45], x: [0, 8, 0] }}
                  transition={{ duration: 2.8, repeat: Infinity, delay: index * 0.45 }}
                  className="flex items-center justify-between border-b border-white/10 pb-2 last:border-0 last:pb-0"
                >
                  <span className="font-mono text-xs text-cyan-100">{item}</span>
                  <span className="font-mono text-xs text-emerald-200">streaming</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
});

const OrchestrationVisual = memo(function OrchestrationVisual() {
  return (
    <SectionReveal id="architecture" className="relative mx-auto max-w-7xl px-5 py-24 sm:px-8">
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
              <motion.div
                key={agent}
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2.4, repeat: Infinity, delay: index * 0.18 }}
                className="agent-orb"
                style={{ "--agent-delay": `${index * 0.18}s` } as CSSProperties}
              >
                <span>{agent}</span>
                <small>{index === 7 ? "memory core" : "agent online"}</small>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="glass-panel relative overflow-hidden p-6">
          <div className="absolute inset-0 pipeline-stream" />
          <div className="relative grid gap-5">
            {pipeline.map((step, index) => (
              <div key={step} className="pipeline-row">
                <motion.div
                  animate={{ scale: [1, 1.18, 1], opacity: [0.62, 1, 0.62] }}
                  transition={{ duration: 2, repeat: Infinity, delay: index * 0.35 }}
                  className="pipeline-node"
                >
                  {index + 1}
                </motion.div>
                <div>
                  <strong>{step}</strong>
                  <p>{agents[index]} hands state to {agents[(index + 1) % agents.length]}.</p>
                </div>
                <motion.div
                  className="hidden h-px flex-1 bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 md:block"
                  animate={{ opacity: [0.2, 0.9, 0.2] }}
                  transition={{ duration: 1.8, repeat: Infinity, delay: index * 0.2 }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </SectionReveal>
  );
});

function RecoveryStory() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => setActive((current) => (current + 1) % story.length), 1550);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <SectionReveal className="relative px-5 py-24 sm:px-8">
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
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 22, filter: "blur(12px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -18, filter: "blur(12px)" }}
            transition={{ duration: 0.42 }}
            className="recovery-card"
          >
            <div className="flex items-center gap-3">
              <TimerReset className="h-6 w-6 text-cyan-100" />
              <span className="font-mono text-xs uppercase tracking-[0.22em] text-cyan-100">state transition</span>
            </div>
            <h3>{story[active].title}</h3>
            <p>{story[active].detail}</p>
            <div className="checkpoint-bar">
              <motion.span
                key={active}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: (active + 1) / story.length }}
                transition={{ duration: 0.85, ease: "easeOut" }}
              />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </SectionReveal>
  );
}

const HydraMemory = memo(function HydraMemory() {
  return (
    <SectionReveal className="mx-auto grid max-w-7xl gap-10 px-5 py-24 sm:px-8 lg:grid-cols-[0.85fr_1.15fr]">
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
          <motion.div
            key={cell}
            animate={{ opacity: [0.45, 1, 0.55], scale: [1, 1.03, 1] }}
            transition={{ duration: 2.2, repeat: Infinity, delay: index * 0.12 }}
            className="memory-cell"
          >
            <span>{cell}</span>
          </motion.div>
        ))}
      </div>
    </SectionReveal>
  );
});

function LiveDashboardPreview() {
  const {
    workflows,
    metrics,
    latestRecovery,
    loading,
    recover,
    recoveringId,
    events,
    connected,
    session,
    agents: runtimeAgents,
    timeline
  } = useLiveRecovery();
  const live = Boolean(session && session.phase !== "idle");

  return (
    <SectionReveal id="live-os" className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
      <div className="section-kicker">Real-time dashboard preview</div>
      <div className="section-heading">
        <h2>A futuristic observability OS, wired to live recovery events.</h2>
        <p>Runtime, rollback events, WebSocket activity, agent state, and workflow health share one operating surface.</p>
      </div>
      <div className="landing-dashboard mt-12">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <TerminalSquare className="h-5 w-5 text-cyan-200" />
            <span className="font-mono text-xs uppercase tracking-[0.22em] text-slate-300">cortex live system</span>
          </div>
          <span className={`stream-status ${connected ? "online" : "offline"}`}>
            <span className="live-dot" />
            {connected ? "WebSocket online" : "WebSocket offline"}
          </span>
        </div>
        <MemoMetricsGrid metrics={metrics} />
        <div className="content-grid">
          {loading ? (
            <section className="panel loading-panel">Loading CORTEX telemetry...</section>
          ) : (
            <MemoWorkflowTable workflows={workflows} recoveringId={recoveringId} onRecover={recover} />
          )}
          <div className="side-stack">
            <MemoAgentRuntimePanel agents={runtimeAgents} session={session} />
            <MemoAgentTimeline recovery={latestRecovery} timeline={timeline} session={session} live={live} />
            <MemoEventFeed events={events} connected={connected} />
          </div>
        </div>
      </div>
    </SectionReveal>
  );
}

const MemoMetricsGrid = memo(MetricsGrid);
const MemoWorkflowTable = memo(WorkflowTable);
const MemoAgentRuntimePanel = memo(AgentRuntimePanel);
const MemoAgentTimeline = memo(AgentTimeline);
const MemoEventFeed = memo(EventFeed);

const WhyCortex = memo(function WhyCortex() {
  return (
    <SectionReveal className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
      <div className="section-kicker">Why CORTEX matters</div>
      <div className="section-heading">
        <h2>AI workflows are becoming infrastructure. Infrastructure needs recovery.</h2>
        <p>CORTEX gives high-stakes automation an immune response: memory, agents, policy, and verification.</p>
      </div>
      <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {useCases.map(([title, detail, Icon], index) => (
          <motion.div
            key={title as string}
            whileHover={{ y: -8, scale: 1.015 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="use-card"
          >
            <Icon className="h-7 w-7 text-cyan-200" />
            <h3>{title as string}</h3>
            <p>{detail as string}</p>
            <span>0{index + 1}</span>
          </motion.div>
        ))}
      </div>
    </SectionReveal>
  );
});

const FutureLayer = memo(function FutureLayer() {
  return (
    <SectionReveal className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
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
    <section className="relative overflow-hidden px-5 py-28 sm:px-8">
      <div className="orbital-bg" />
      <div className="relative z-10 mx-auto max-w-5xl text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="mx-auto mb-8 grid h-24 w-24 place-items-center rounded-full border border-cyan-200/30 bg-cyan-200/10 shadow-[0_0_100px_rgba(34,211,238,0.35)]"
        >
          <Stethoscope className="h-10 w-10 text-cyan-100" />
        </motion.div>
        <h2 className="text-5xl font-black leading-none text-white sm:text-7xl">AI systems need an immune system.</h2>
        <p className="mt-6 text-3xl font-black text-cyan-100 sm:text-5xl">CORTEX is building it.</p>
        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <a className="cortex-button primary" href="#live-os">
            <Zap className="h-5 w-5" />
            Launch Live Demo
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

export function App() {
  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.085, smoothWheel: true });
    lenis.on("scroll", () => ScrollTrigger.update());
    gsap.ticker.lagSmoothing(0);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);

    const sections = gsap.utils.toArray<HTMLElement>(".glass-panel, .use-card, .future-panel");
    sections.forEach((section) => {
      gsap.fromTo(
        section,
        { y: 32, opacity: 0.55 },
        {
          y: 0,
          opacity: 1,
          ease: "power3.out",
          scrollTrigger: { trigger: section, start: "top 86%", end: "top 48%", scrub: 0.7 }
        }
      );
    });

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <main className="landing-shell">
      <IntroCurtain />
      <Hero />
      <OrchestrationVisual />
      <RecoveryStory />
      <HydraMemory />
      <LiveDashboardPreview />
      <WhyCortex />
      <FutureLayer />
      <FinalCta />
    </main>
  );
}

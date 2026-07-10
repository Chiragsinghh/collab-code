/**
 * LandingPage.jsx — dark redesign notes
 * ---------------------------------------
 * Same Claude-derived palette, flipped to dark: warm near-black background
 * (#191817), off-white ink, clay accent brightened for contrast, teal as
 * the second collaborator color. All hexes are explicit — swap for your
 * own CSS variables once wired up.
 *
 * New: a cursor-following radial spotlight (the "responsive" part — it
 * tracks the mouse) layered with slow ambient blob drift (the "dynamic"
 * part — it moves on its own even if you don't touch anything) and the
 * same faint dot grid, now readable against dark.
 *
 * Fonts (add to index.html <head>):
 * <link rel="preconnect" href="https://fonts.googleapis.com">
 * <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,440;9..144,560&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
 */

import { motion, useMotionValue, useMotionTemplate, useSpring } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { v4 as uuidV4 } from "uuid";
import { useAuth } from "../Context/AuthContext";
import {
  Users,
  Monitor,
  MessageSquare,
  GitBranch,
  Globe,
  Play,
  LogIn,
  Braces,
} from "lucide-react";
import { useEffect } from "react";

/* ---- Design tokens (dark) ------------------------------------------ */
const bg = "#191817";
const surface = "#221F1A";
const surfaceRaised = "#26221C";
const text = "#F4F1EA";
const textMuted = "#9B988F";
const line = "rgba(244,241,234,0.10)";
const clay = "#E4895F";
const clayDeep = "#D97757";
const teal = "#7FB39E";

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.09 } },
};

const features = [
  { icon: Users, title: "Live cursors", description: "See exactly where your team is working, character by character." },
  { icon: Monitor, title: "Instant preview", description: "Every save renders — no tab switching, no manual refresh." },
  { icon: MessageSquare, title: "Chat in context", description: "Talk next to the code you're talking about." },
  { icon: GitBranch, title: "Automatic history", description: "Every change is a checkpoint. Roll back without thinking twice." },
  { icon: Globe, title: "One-click deploy", description: "Ship the room straight to a live URL." },
  { icon: Braces, title: "Real project structure", description: "Folders, multi-file imports, the codebase as it actually is." },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user, navigate]);

  const handleCreateRoom = () => {
    if (!user) return navigate("/login");
    navigate(`/editor/${uuidV4()}`);
  };

  const handleJoinRoom = () => {
    if (!user) return navigate("/login");
    const roomId = prompt("Enter the Room ID to join:");
    if (roomId?.trim()) navigate(`/editor/${roomId.trim()}`);
  };

  /* cursor-following spotlight */
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 60, damping: 24, mass: 0.4 });
  const springY = useSpring(mouseY, { stiffness: 60, damping: 24, mass: 0.4 });
  const spotlight = useMotionTemplate`radial-gradient(560px circle at ${springX}px ${springY}px, rgba(228,137,95,0.16), transparent 78%)`;

  useEffect(() => {
    const handleMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [mouseX, mouseY]);

  return (
    <div
      className="min-h-screen overflow-hidden relative"
      style={{ background: bg, color: text, fontFamily: "Inter, sans-serif" }}
    >
      {/* ---------------- Ambient background layer (fixed, tracks whole page) ---------------- */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* cursor-following spotlight — the "responsive" element */}
        <motion.div className="absolute inset-0" style={{ background: spotlight }} />

        {/* faint dot grid */}
        <div
          className="absolute inset-0 opacity-[0.5]"
          style={{
            backgroundImage: `radial-gradient(${line} 1px, transparent 1px)`,
            backgroundSize: "26px 26px",
            maskImage: "radial-gradient(ellipse 70% 55% at 50% 15%, black 40%, transparent 100%)",
          }}
        />

        {/* slow-drifting ambient blobs — the "dynamic" element */}
        <motion.div
          className="absolute rounded-full blur-[130px]"
          style={{ width: 520, height: 520, background: clayDeep, opacity: 0.16, top: -160, left: "16%", mixBlendMode: "screen" }}
          animate={{ x: [0, 50, -10, 0], y: [0, 30, -20, 0] }}
          transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute rounded-full blur-[130px]"
          style={{ width: 460, height: 460, background: teal, opacity: 0.14, top: -60, right: "10%", mixBlendMode: "screen" }}
          animate={{ x: [0, -40, 10, 0], y: [0, 35, 0, 0] }}
          transition={{ duration: 28, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
      </div>

      {/* ---------------- Nav ---------------- */}
      <motion.nav
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md"
        style={{ background: `${bg}CC`, borderBottom: `1px solid ${line}` }}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <span
              className="w-7 h-7 rounded-[6px] flex items-center justify-center text-sm"
              style={{ background: clay, color: bg, fontFamily: "'JetBrains Mono', monospace" }}
            >
              {"</>"}
            </span>
            <span className="text-[17px] tracking-tight" style={{ fontFamily: "'Fraunces', serif", fontWeight: 560 }}>
              CodeSync
            </span>
          </Link>

          <div className="flex items-center gap-2">
            {!user && (
              <Link
                to="/login"
                className="px-4 py-2 text-sm rounded-full transition-colors"
                style={{ color: textMuted }}
              >
                Sign in
              </Link>
            )}
            <button
              onClick={handleCreateRoom}
              className="px-4 py-2 text-sm rounded-full transition-colors"
              style={{ background: clay, color: bg }}
            >
              Get started
            </button>
          </div>
        </div>
      </motion.nav>

      {/* ---------------- Hero ---------------- */}
      <section className="relative z-10 pt-40 pb-24 px-6">
        <motion.div variants={stagger} initial="initial" animate="animate" className="relative max-w-3xl mx-auto text-center">
          <motion.div
            variants={fadeUp}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-8 text-[13px]"
            style={{ border: `1px solid ${line}`, color: textMuted, fontFamily: "'JetBrains Mono', monospace" }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: teal }} />
            multiplayer · real-time
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="text-[44px] md:text-[64px] leading-[1.05] tracking-tight mb-6"
            style={{ fontFamily: "'Fraunces', serif", fontWeight: 560 }}
          >
            Code together,
            <br />
            <span style={{ color: clay }}>in the same line.</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="text-lg mx-auto mb-10 max-w-xl"
            style={{ color: textMuted }}
          >
            One editor, one room, everyone's cursor. Write, review, and ship
            without leaving the file you're both looking at.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleCreateRoom}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-[15px] transition-transform hover:-translate-y-0.5"
              style={{ background: clay, color: bg }}
            >
              <Play className="w-4 h-4" />
              Create a project
            </button>
            <button
              onClick={handleJoinRoom}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-[15px] transition-colors"
              style={{ border: `1px solid ${line}`, color: text }}
            >
              <LogIn className="w-4 h-4" />
              Join a room
            </button>
          </motion.div>
        </motion.div>

        {/* ---------------- IDE mockup ---------------- */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35 }}
          className="relative mt-20 max-w-4xl mx-auto"
        >
          <div
            className="rounded-xl overflow-hidden"
            style={{ background: surfaceRaised, border: `1px solid ${line}`, boxShadow: "0 30px 80px -30px rgba(0,0,0,0.6)" }}
          >
            {/* title bar */}
            <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: `1px solid ${line}`, background: surface }}>
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: line }} />
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: line }} />
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: line }} />
              </div>
              <div className="flex-1 flex justify-center">
                <span
                  className="px-3 py-0.5 rounded text-[12px]"
                  style={{ background: surfaceRaised, color: textMuted, fontFamily: "'JetBrains Mono', monospace" }}
                >
                  my-awesome-project
                </span>
              </div>
            </div>

            <div className="grid grid-cols-12 min-h-[360px] text-[13px]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {/* file tree */}
              <div className="col-span-3 md:col-span-2 p-3" style={{ borderRight: `1px solid ${line}`, background: surface }}>
                <div className="text-[10px] mb-2 uppercase tracking-wider" style={{ color: textMuted }}>Files</div>
                <div className="space-y-0.5">
                  <div className="px-2 py-1 rounded" style={{ background: `${clay}22`, color: clay }}>index.tsx</div>
                  <div className="px-2 py-1 rounded" style={{ color: textMuted }}>App.tsx</div>
                  <div className="px-2 py-1 rounded" style={{ color: textMuted }}>components/</div>
                  <div className="px-2 py-1 pl-4 rounded" style={{ color: textMuted }}>Button.tsx</div>
                  <div className="px-2 py-1 rounded" style={{ color: textMuted }}>styles.css</div>
                </div>
              </div>

              {/* code */}
              <div className="col-span-6 md:col-span-7 p-4 relative" style={{ color: textMuted }}>
                <pre className="whitespace-pre-wrap leading-relaxed">
                  <span style={{ color: teal }}>import</span> React <span style={{ color: teal }}>from</span>{" "}
                  <span style={{ color: clay }}>'react'</span>;{"\n"}
                  <span style={{ color: teal }}>import</span> {"{ Button }"} <span style={{ color: teal }}>from</span>{" "}
                  <span style={{ color: clay }}>'./components'</span>;{"\n\n"}
                  <span style={{ color: teal }}>export default function</span>{" "}
                  <span style={{ color: text }}>App</span>() {"{"}{"\n"}
                  {"  "}<span style={{ color: teal }}>return</span> ({"\n"}
                  {"    "}<span style={{ color: text }}>{"<div>"}</span>{"\n"}
                  {"      "}<span style={{ color: text }}>{"<h1>"}</span>Hello World<span style={{ color: text }}>{"</h1>"}</span>{"\n"}
                  {"      "}<span style={{ color: text }}>{"<Button"}</span>
                  <motion.span
                    className="inline-block w-[2px] h-3.5 ml-0.5 align-middle"
                    style={{ background: clay }}
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  />
                  {"\n"}
                  {"    "}<span style={{ color: text }}>{"</div>"}</span>{"\n"}
                  {"  "});{"\n"}
                  {"}"}
                </pre>

                <motion.div
                  className="absolute top-[126px] left-[164px]"
                  animate={{ x: [0, 26, 26, 0], y: [0, 0, 18, 18] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <div className="w-[2px] h-4" style={{ background: clay }} />
                  <div className="absolute -top-5 left-0 px-1.5 py-0.5 rounded text-[10px] whitespace-nowrap" style={{ background: clay, color: bg }}>
                    sarah
                  </div>
                </motion.div>
                <motion.div
                  className="absolute top-[160px] left-[240px]"
                  animate={{ x: [0, -18, -18, 0], y: [0, 18, 18, 0] }}
                  transition={{ duration: 5, repeat: Infinity, delay: 1 }}
                >
                  <div className="w-[2px] h-4" style={{ background: teal }} />
                  <div className="absolute -top-5 left-0 px-1.5 py-0.5 rounded text-[10px] whitespace-nowrap" style={{ background: teal, color: bg }}>
                    alex
                  </div>
                </motion.div>
              </div>

              {/* chat */}
              <div className="col-span-3 p-3" style={{ borderLeft: `1px solid ${line}`, background: surface }}>
                <div className="text-[10px] mb-3 uppercase tracking-wider flex items-center justify-between" style={{ color: textMuted }}>
                  Chat
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: teal }} />
                    3
                  </span>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="text-[10px] mb-0.5" style={{ color: clay }}>sarah</div>
                    <div style={{ color: text }}>working on the header</div>
                  </div>
                  <div>
                    <div className="text-[10px] mb-0.5" style={{ color: teal }}>alex</div>
                    <div style={{ color: text }}>lgtm 🚀</div>
                  </div>
                </div>
              </div>
            </div>

            {/* live preview bar */}
            <div className="flex items-center justify-between px-4 py-2.5 text-[12px]" style={{ borderTop: `1px solid ${line}`, background: surface, color: textMuted, fontFamily: "'JetBrains Mono', monospace" }}>
              <div className="flex items-center gap-2">
                <motion.span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: teal }}
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.6, repeat: Infinity }}
                />
                Live preview
              </div>
              <span>saved 2s ago</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ---------------- Features ---------------- */}
      <section className="relative z-10 py-24 px-6" style={{ borderTop: `1px solid ${line}` }}>
        <div className="max-w-5xl mx-auto">
          <h2
            className="text-3xl mb-14 text-center"
            style={{ fontFamily: "'Fraunces', serif", fontWeight: 560 }}
          >
            Everything happens in the room
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-10">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                className="pb-8"
                style={{ borderBottom: `1px solid ${line}` }}
              >
                <f.icon className="w-5 h-5 mb-4" style={{ color: clay }} />
                <h3 className="text-[16px] mb-1.5" style={{ fontFamily: "'Fraunces', serif", fontWeight: 560 }}>
                  {f.title}
                </h3>
                <p className="text-[14px] leading-relaxed" style={{ color: textMuted }}>
                  {f.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Footer ---------------- */}
      <footer className="relative z-10 py-10 px-6" style={{ borderTop: `1px solid ${line}` }}>
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span
              className="w-6 h-6 rounded-[5px] flex items-center justify-center text-[11px]"
              style={{ background: clay, color: bg, fontFamily: "'JetBrains Mono', monospace" }}
            >
              {"</>"}
            </span>
            <span style={{ fontFamily: "'Fraunces', serif", fontWeight: 560 }}>CodeSync</span>
          </div>
          <p className="text-[13px]" style={{ color: textMuted }}>© 2026 CodeSync</p>
        </div>
      </footer>
    </div>
  );
}
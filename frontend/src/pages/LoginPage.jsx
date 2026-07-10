

import { useState } from "react";
import { motion, useMotionValue, useMotionTemplate, useSpring } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useEffect } from "react";
import { useAuth } from "../Context/AuthContext";
import { ArrowRight, Github, Mail } from "lucide-react";

/* ---- Design tokens (same as LandingPage) ---- */
const bg = "#191817";
const surface = "#221F1A";
const surfaceRaised = "#26221C";
const text = "#F4F1EA";
const textMuted = "#9B988F";
const line = "rgba(244,241,234,0.10)";
const clay = "#E4895F";
const inputBg = "#1E1B16";

function AmbientBackground() {
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
    <div className="fixed inset-0 pointer-events-none z-0">
      <motion.div className="absolute inset-0" style={{ background: spotlight }} />
      <div
        className="absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage: `radial-gradient(${line} 1px, transparent 1px)`,
          backgroundSize: "26px 26px",
          maskImage: "radial-gradient(ellipse 70% 55% at 50% 25%, black 40%, transparent 100%)",
        }}
      />
      <motion.div
        className="absolute rounded-full blur-[130px]"
        style={{ width: 480, height: 480, background: "#D97757", opacity: 0.16, top: "10%", left: "10%", mixBlendMode: "screen" }}
        animate={{ x: [0, 40, -10, 0], y: [0, 25, -15, 0] }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute rounded-full blur-[130px]"
        style={{ width: 420, height: 420, background: "#7FB39E", opacity: 0.13, bottom: "5%", right: "10%", mixBlendMode: "screen" }}
        animate={{ x: [0, -30, 10, 0], y: [0, -25, 0, 0] }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
    </div>
  );
}

function FieldLabel({ children, htmlFor }) {
  return (
    <label htmlFor={htmlFor} className="block text-[13px] mb-1.5" style={{ color: textMuted }}>
      {children}
    </label>
  );
}

function Field(props) {
  return (
    <input
      {...props}
      className="w-full px-3.5 py-2.5 rounded-lg text-[14px] outline-none transition-colors"
      style={{ background: inputBg, border: `1px solid ${line}`, color: text }}
      onFocus={(e) => (e.target.style.borderColor = clay)}
      onBlur={(e) => (e.target.style.borderColor = line)}
    />
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post("http://localhost:5001/api/auth/login", {
        email,
        password,
      });

      if (response.data.token) {
        login(response.data.user, response.data.token);
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid login credentials.");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
      style={{ background: bg, color: text, fontFamily: "Inter, sans-serif" }}
    >
      <AmbientBackground />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <Link to="/" className="flex items-center gap-2.5 justify-center mb-8">
          <span
            className="w-9 h-9 rounded-[7px] flex items-center justify-center text-sm"
            style={{ background: clay, color: bg, fontFamily: "'JetBrains Mono', monospace" }}
          >
            {"</>"}
          </span>
          <span className="text-[18px] tracking-tight" style={{ fontFamily: "'Fraunces', serif", fontWeight: 560 }}>
            CodeSync
          </span>
        </Link>

        <div className="rounded-2xl p-8" style={{ background: surfaceRaised, border: `1px solid ${line}`, boxShadow: "0 30px 80px -30px rgba(0,0,0,0.6)" }}>
          <div className="text-center mb-8">
            <h1 className="text-2xl mb-1.5" style={{ fontFamily: "'Fraunces', serif", fontWeight: 560 }}>
              Welcome back
            </h1>
            <p className="text-[14px]" style={{ color: textMuted }}>Sign in to keep coding</p>
          </div>

          {error && (
            <p className="text-sm text-center mb-4" style={{ color: "#E08A6B" }}>{error}</p>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Field id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Link to="/forgot-password" className="text-[13px] hover:underline" style={{ color: clay }}>
                  Forgot password?
                </Link>
              </div>
              <Field id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-[15px] transition-transform hover:-translate-y-0.5"
              style={{ background: clay, color: bg }}
            >
              Sign in
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="relative my-7 flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: line }} />
            <span className="text-[11px] uppercase tracking-wider" style={{ color: textMuted }}>Or continue with</span>
            <div className="flex-1 h-px" style={{ background: line }} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-[14px] transition-colors"
              style={{ border: `1px solid ${line}`, color: text }}
            >
              <Github className="w-4 h-4" /> GitHub
            </button>
            <button
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-[14px] transition-colors"
              style={{ border: `1px solid ${line}`, color: text }}
            >
              <Mail className="w-4 h-4" /> Google
            </button>
          </div>
        </div>

        <p className="text-center mt-6 text-[14px]" style={{ color: textMuted }}>
          Don't have an account?{" "}
          <Link to="/signup" className="font-medium hover:underline" style={{ color: clay }}>
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
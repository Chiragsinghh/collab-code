/**
 * SettingsPage.jsx — matches the dark redesign
 * ------------------------------------------------------------------
 * All state and handleSave logic untouched. Swapped <Button>/<Input>
 * for plain styled elements, same reasoning as the other pages.
 * <UserAvatar> kept as-is (unknown internals).
 */

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import api from "../lib/api";
import UserAvatar from "../components/ide/UserAvatar";
import {
  ArrowLeft,
  User,
  Globe,
  Settings,
  CheckCircle2,
  Github,
  Twitter,
  Linkedin,
  Sparkles,
} from "lucide-react";

/* ---- Design tokens (same across the app) ---- */
const bg = "#191817";
const surfaceRaised = "#26221C";
const text = "#F4F1EA";
const textMuted = "#9B988F";
const line = "rgba(244,241,234,0.10)";
const clay = "#E4895F";
const teal = "#7FB39E";
const errorColor = "#D9705A";
const inputBg = "#1E1B16";

function Label({ children }) {
  return (
    <label className="text-[11px] font-medium uppercase tracking-wider block mb-2" style={{ color: textMuted }}>
      {children}
    </label>
  );
}

function TextField(props) {
  return (
    <input
      {...props}
      className={`w-full px-3.5 py-2.5 rounded-lg text-[14px] outline-none transition-colors ${props.className || ""}`}
      style={{ background: inputBg, border: `1px solid ${line}`, color: text }}
      onFocus={(e) => (e.target.style.borderColor = clay)}
      onBlur={(e) => (e.target.style.borderColor = line)}
    />
  );
}

function Select(props) {
  return (
    <select
      {...props}
      className="w-full h-10 px-3 rounded-lg text-sm cursor-pointer outline-none"
      style={{ background: inputBg, border: `1px solid ${line}`, color: text }}
    >
      {props.children}
    </select>
  );
}

function Card({ children, className = "" }) {
  return (
    <div className={`rounded-xl p-6 space-y-6 ${className}`} style={{ background: surfaceRaised, border: `1px solid ${line}` }}>
      {children}
    </div>
  );
}

function SectionHeader({ icon: Icon, children }) {
  return (
    <div className="flex items-center gap-2 pb-3" style={{ borderBottom: `1px solid ${line}` }}>
      <Icon className="w-[18px] h-[18px]" style={{ color: clay }} />
      <h3 className="text-[15px]" style={{ fontFamily: "'Fraunces', serif", fontWeight: 560 }}>{children}</h3>
    </div>
  );
}

export default function SettingsPage() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [projectsDone, setProjectsDone] = useState(user?.projectsDoneCount || 0);

  const [github, setGithub] = useState(user?.socialLinks?.github || "");
  const [twitter, setTwitter] = useState(user?.socialLinks?.twitter || "");
  const [linkedin, setLinkedin] = useState(user?.socialLinks?.linkedin || "");
  const [website, setWebsite] = useState(user?.socialLinks?.website || "");

  const [theme, setTheme] = useState(user?.preferences?.theme || "dark");
  const [editorFontSize, setEditorFontSize] = useState(user?.preferences?.editorFontSize || 14);
  const [tabSize, setTabSize] = useState(user?.preferences?.tabSize || 2);
  const [keymap, setKeymap] = useState(user?.preferences?.keymap || "vscode");

  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const { data } = await api.put("/auth/profile", {
        name: name.trim(),
        bio: bio.trim(),
        projectsDoneCount: projectsDone,
        socialLinks: {
          github: github.trim(),
          twitter: twitter.trim(),
          linkedin: linkedin.trim(),
          website: website.trim(),
        },
        preferences: {
          theme,
          editorFontSize,
          tabSize,
          keymap,
        },
      });

      setUser(data);
      localStorage.setItem("codesync_user", JSON.stringify(data));

      setSuccessMsg("Settings updated successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || "Failed to update settings.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen relative pb-12" style={{ background: bg, color: text, fontFamily: "Inter, sans-serif" }}>
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.35]"
        style={{
          backgroundImage: `radial-gradient(${line} 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
          maskImage: "radial-gradient(ellipse 55% 40% at 15% 0%, black 30%, transparent 100%)",
        }}
      />

      {/* NAVBAR */}
      <nav className="relative z-10" style={{ borderBottom: `1px solid ${line}`, background: `${bg}E6` }}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="p-2 -ml-2 rounded-lg transition-colors"
              style={{ color: textMuted }}
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className="text-[16px]" style={{ fontFamily: "'Fraunces', serif", fontWeight: 560 }}>Settings</span>
          </div>

          <Link to="/dashboard" className="text-[13px] hover:underline" style={{ color: clay }}>
            Dashboard
          </Link>
        </div>
      </nav>

      {/* MAIN CONTAINER */}
      <main className=" z-10 max-w-4xl mx-auto px-6 mt-8">
        {successMsg && (
          <div
            className="mb-6 p-4 rounded-lg flex items-center gap-3 text-[13px]"
            style={{ background: `${teal}15`, border: `1px solid ${teal}40`, color: teal }}
          >
            <CheckCircle2 className="w-[18px] h-[18px] flex-shrink-0" />
            {successMsg}
          </div>
        )}

        {errorMsg && (
          <div
            className="mb-6 p-4 rounded-lg flex items-center gap-3 text-[13px]"
            style={{ background: `${errorColor}15`, border: `1px solid ${errorColor}40`, color: errorColor }}
          >
            {errorMsg}
          </div>
        )}

        {/* PROFILE HEADER CARD */}
        <div
          className="rounded-xl p-6 mb-8 flex flex-col sm:flex-col items-center gap-6"
          style={{ background: surfaceRaised, border: `1px solid ${line}` }}
        >
          <UserAvatar
            name={name || user?.username || "?"}
            className="w-20 h-20 text-3xl"
            style={{ boxShadow: `0 0 0 2px ${bg}, 0 0 0 3px ${line}` }}
          />
          <div className="text-center sm:text-left flex-1">
            <h2 className="text-xl" style={{ fontFamily: "'Fraunces', serif", fontWeight: 560 }}>
              {name || user?.username || "Developer"}
            </h2>
            <p className="text-[13px] mt-1" style={{ color: textMuted }}>@{user?.username || "username"}</p>
            <p
              className="text-[12px] rounded px-2.5 py-0.5 inline-block mt-3"
              style={{ color: clay, background: `${clay}15`, border: `1px solid ${clay}30` }}
            >
              Registered developer
            </p>
          </div>
        </div>

        {/* FORMS SECTION */}
        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* LEFT COLUMN */}
          <div space-y-8 >
            <Card>
              <SectionHeader icon={User}>Profile details</SectionHeader>

              <div>
                <Label>Display name</Label>
                <TextField value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Chirag Singh" />
              </div>

              <div>
                <Label>Short bio</Label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                  maxLength={200}
                  className="w-full min-h-[100px] px-3.5 py-2.5 rounded-lg text-[14px] outline-none resize-none transition-colors"
                  style={{ background: inputBg, border: `1px solid ${line}`, color: text }}
                  onFocus={(e) => (e.target.style.borderColor = clay)}
                  onBlur={(e) => (e.target.style.borderColor = line)}
                />
                <div className="text-right text-[11px] mt-1" style={{ color: textMuted }}>
                  {bio.length}/200 characters
                </div>
              </div>

              <div>
                <Label>Number of projects done</Label>
                <TextField
                  type="number"
                  min="0"
                  value={projectsDone}
                  onChange={(e) => setProjectsDone(parseInt(e.target.value) || 0)}
                />
              </div>
            </Card>

            <Card>
              <SectionHeader icon={Globe}>Social links</SectionHeader>

              <div>
                <Label>
                  <span className="inline-flex items-center gap-1.5"><Github className="w-3.5 h-3.5" /> GitHub URL</span>
                </Label>
                <TextField value={github} onChange={(e) => setGithub(e.target.value)} placeholder="https://github.com/your-username" />
              </div>

              <div>
                <Label>
                  <span className="inline-flex items-center gap-1.5"><Twitter className="w-3.5 h-3.5" /> Twitter / X URL</span>
                </Label>
                <TextField value={twitter} onChange={(e) => setTwitter(e.target.value)} placeholder="https://twitter.com/your-handle" />
              </div>

              <div>
                <Label>
                  <span className="inline-flex items-center gap-1.5"><Linkedin className="w-3.5 h-3.5" /> LinkedIn URL</span>
                </Label>
                <TextField value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/your-name" />
              </div>

              <div>
                <Label>Personal website</Label>
                <TextField value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://yourportfolio.com" />
              </div>
            </Card>
          </div>
              

          {/* SAVE BUTTON */}
          <div
    className="md:col-span-2 flex items-center gap-4 pt-6"
    style={{ borderTop: `1px solid ${line}` }}
  >
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="px-4 py-2.5 rounded-lg text-[14px]"
              style={{ color: textMuted }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-lg text-[14px] disabled:opacity-50 transition-transform hover:-translate-y-0.5"
              style={{ background: clay, color: bg }}
            >
              {isSaving ? "Saving settings..." : "Save configuration"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
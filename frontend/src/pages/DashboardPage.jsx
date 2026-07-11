/**
 * DashboardPage.jsx — matches the dark redesign (Landing/Login/Signup)
 * ------------------------------------------------------------------
 * All fetch/create/sort/filter/logout logic is untouched — only markup
 * and styling changed.
 *
 * Swapped <Button>, <Input>, and the <Dialog> family for plain styled
 * elements + a small self-contained modal, same reasoning as the other
 * pages: guarantees the new palette renders regardless of those
 * components' current internals. <UserAvatar> is kept as-is since I
 * can't see its internal styling — you'll likely want to pass it the
 * `clay` hex below for its ring/background to match.
 *
 * This is a working screen, not a marketing screen, so the ambient
 * background here is intentionally quiet — a faint corner glow and dot
 * grid, no cursor spotlight, so it doesn't compete with the project grid.
 */

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import api from "../lib/api";
import { useAuth } from "../Context/AuthContext";
import UserAvatar from "../components/ide/UserAvatar";
import { Plus, LogOut, Search, X, Share2, Users, Github } from "lucide-react";

/* ---- Design tokens (same across the app) ---- */
const bg = "#191817";
const surface = "#221F1A";
const surfaceRaised = "#26221C";
const text = "#F4F1EA";
const textMuted = "#9B988F";
const line = "rgba(244,241,234,0.10)";
const clay = "#E4895F";
const inputBg = "#1E1B16";

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.05 } },
};

const fadeInUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
};

function QuietBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `radial-gradient(${line} 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
          maskImage: "radial-gradient(ellipse 55% 40% at 85% 0%, black 30%, transparent 100%)",
        }}
      />
      <div
        className="absolute rounded-full blur-[140px]"
        style={{ width: 500, height: 500, background: clay, opacity: 0.08, top: -180, right: -100 }}
      />
    </div>
  );
}

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("updated-desc");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [joinRoomId, setJoinRoomId] = useState("");

  const [isGithubOpen, setIsGithubOpen] = useState(false);
  const [githubRepoUrl, setGithubRepoUrl] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  const handleJoinSubmit = (e) => {
    e.preventDefault();
    if (!joinRoomId.trim()) return;
    setIsJoinOpen(false);
    navigate(`/editor/${joinRoomId.trim()}`);
  };

  const [copiedId, setCopiedId] = useState(null);

  const handleCopyLink = (roomId) => {
    navigator.clipboard.writeText(roomId);
    setCopiedId(roomId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  useEffect(() => {
    if (!user) return;

    const fetchProjects = async () => {
      try {
        const { data } = await api.get(`/projects`);
        setProjects(data);
      } catch (err) {
        console.error("Failed to fetch projects:", err);
      }
    };

    fetchProjects();
  }, [user]);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();

    if (!projectName.trim() || isCreating) return;

    setIsCreating(true);

    try {
      const { data } = await api.post("/projects", {
        name: projectName.trim(),
      });

      setIsCreateOpen(false);
      setProjectName("");

      navigate(`/editor/${data.roomId}`);
    } catch (err) {
      console.error("Create failed:", err);
      alert("Project creation failed. Check backend.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleGithubImport = async (e) => {
    e.preventDefault();
    if (!githubRepoUrl.trim() || isImporting) return;

    setIsImporting(true);

    try {
      const { data } = await api.post("/github/import-url", {
        repoUrl: githubRepoUrl.trim(),
      });

      setIsGithubOpen(false);
      setGithubRepoUrl("");
      navigate(`/editor/${data.roomId}`);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to import repository.");
    } finally {
      setIsImporting(false);
    }
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (!confirmLogout) return;

    logout();
    navigate("/");
  };

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    if (sortBy === "name-asc") return a.name.localeCompare(b.name);
    if (sortBy === "name-desc") return b.name.localeCompare(a.name);
    if (sortBy === "created-desc") return new Date(b.createdAt) - new Date(a.createdAt);
    return new Date(b.updatedAt) - new Date(a.updatedAt);
  });

  return (
    <div className="min-h-screen relative" style={{ background: bg, color: text, fontFamily: "Inter, sans-serif" }}>
      <QuietBackground />

      {/* NAVBAR */}
      <nav className="relative z-10" style={{ borderBottom: `1px solid ${line}`, background: `${bg}E6` }}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <span
              className="w-8 h-8 rounded-[6px] flex items-center justify-center text-sm"
              style={{ background: clay, color: bg, fontFamily: "'JetBrains Mono', monospace" }}
            >
              {"</>"}
            </span>
            <span className="text-[17px] tracking-tight" style={{ fontFamily: "'Fraunces', serif", fontWeight: 560 }}>
              CodeSync
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[14px] transition-transform hover:-translate-y-0.5"
              style={{ background: clay, color: bg }}
            >
              <Plus className="w-4 h-4" />
              New project
            </button>

            <button
              onClick={() => setIsJoinOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[14px] transition-transform hover:-translate-y-0.5"
              style={{ border: `1px solid ${line}`, color: text }}
            >
              <Users className="w-4 h-4" />
              Join project
            </button>

            <UserAvatar
              name={user?.name || user?.username || "U"}
              className="w-8 h-8 text-sm cursor-pointer transition-all"
              style={{ boxShadow: `0 0 0 2px ${bg}, 0 0 0 3px ${line}` }}
              onClick={() => navigate("/settings")}
            />

            <button
              onClick={handleLogout}
              className="p-2 rounded-lg transition-colors"
              style={{ color: textMuted }}
              title="Logout"
            >
              <LogOut className="w-[18px] h-[18px]" />
            </button>
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-9">
          <h1 className="text-2xl" style={{ fontFamily: "'Fraunces', serif", fontWeight: 560 }}>
            Welcome, {user?.name || user?.username || "Developer"}
          </h1>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: textMuted }} />
              <input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-lg text-[14px] outline-none transition-colors"
                style={{ background: inputBg, border: `1px solid ${line}`, color: text }}
                onFocus={(e) => (e.target.style.borderColor = clay)}
                onBlur={(e) => (e.target.style.borderColor = line)}
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-[42px] px-3 rounded-lg text-sm w-full sm:w-auto cursor-pointer outline-none"
              style={{ background: inputBg, border: `1px solid ${line}`, color: text }}
            >
              <option value="updated-desc">Last updated (newest)</option>
              <option value="created-desc">Date created (newest)</option>
              <option value="name-asc">Name (A–Z)</option>
              <option value="name-desc">Name (Z–A)</option>
            </select>
          </div>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {sortedProjects.length === 0 ? (
            <p className="col-span-full" style={{ color: textMuted }}>
              No projects found. Create your first one.
            </p>
          ) : (
            sortedProjects.map((project) => (
              <motion.div key={project.roomId} variants={fadeInUp} whileHover={{ y: -4 }}>
                <Link
                  to={`/editor/${project.roomId}`}
                  className="block p-6 rounded-xl transition-colors"
                  style={{ background: surfaceRaised, border: `1px solid ${line}` }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = clay)}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = line)}
                >
                  <div className="flex justify-between items-start mb-1.5 gap-2">
                    <h3 className="text-[16px] leading-tight" style={{ fontFamily: "'Fraunces', serif", fontWeight: 560 }}>
                      {project.name}
                    </h3>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleCopyLink(project.roomId);
                      }}
                      className="p-1.5 rounded-lg transition-all hover:scale-105 active:scale-95 flex items-center justify-center shrink-0"
                      style={{ border: `1px solid ${line}`, background: bg }}
                      title="Copy sharing link"
                    >
                      {copiedId === project.roomId ? (
                        <span className="text-[11px]" style={{ color: "#7FB39E" }}>Copied!</span>
                      ) : (
                        <Share2 className="w-3.5 h-3.5" style={{ color: textMuted }} />
                      )}
                    </button>
                  </div>
                  <p className="text-[13px]" style={{ color: textMuted, fontFamily: "'JetBrains Mono', monospace" }}>
                    {project.roomId.slice(0, 8)}...
                  </p>
                </Link>
              </motion.div>
            ))
          )}
        </motion.div>
      </main>

      {/* CREATE PROJECT MODAL */}
      {isCreateOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: "rgba(10,9,8,0.6)", backdropFilter: "blur(4px)" }}
          onClick={() => setIsCreateOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-sm rounded-2xl p-6"
            style={{ background: surfaceRaised, border: `1px solid ${line}`, boxShadow: "0 30px 80px -30px rgba(0,0,0,0.6)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 560, fontSize: 18 }}>
                Create new project
              </h2>
              <button onClick={() => setIsCreateOpen(false)} style={{ color: textMuted }}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit}>
              <input
                placeholder="Project name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                autoFocus
                className="w-full px-3.5 py-2.5 rounded-lg text-[14px] outline-none transition-colors"
                style={{ background: inputBg, border: `1px solid ${line}`, color: text }}
                onFocus={(e) => (e.target.style.borderColor = clay)}
                onBlur={(e) => (e.target.style.borderColor = line)}
              />

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-lg text-[14px]"
                  style={{ color: textMuted }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!projectName.trim() || isCreating}
                  className="px-4 py-2 rounded-lg text-[14px] disabled:opacity-50"
                  style={{ background: clay, color: bg }}
                >
                  {isCreating ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* JOIN PROJECT MODAL */}
      {isJoinOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: "rgba(10,9,8,0.6)", backdropFilter: "blur(4px)" }}
          onClick={() => setIsJoinOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-sm rounded-2xl p-6"
            style={{ background: surfaceRaised, border: `1px solid ${line}`, boxShadow: "0 30px 80px -30px rgba(0,0,0,0.6)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 560, fontSize: 18 }}>
                Join project
              </h2>
              <button onClick={() => setIsJoinOpen(false)} style={{ color: textMuted }}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleJoinSubmit}>
              <input
                placeholder="Project ID (Room ID)"
                value={joinRoomId}
                onChange={(e) => setJoinRoomId(e.target.value)}
                autoFocus
                className="w-full px-3.5 py-2.5 rounded-lg text-[14px] outline-none transition-colors"
                style={{ background: inputBg, border: `1px solid ${line}`, color: text }}
                onFocus={(e) => (e.target.style.borderColor = clay)}
                onBlur={(e) => (e.target.style.borderColor = line)}
              />

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsJoinOpen(false)}
                  className="px-4 py-2 rounded-lg text-[14px]"
                  style={{ color: textMuted }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!joinRoomId.trim()}
                  className="px-4 py-2 rounded-lg text-[14px] disabled:opacity-50"
                  style={{ background: clay, color: bg }}
                >
                  Join
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* IMPORT GITHUB REPO MODAL */}
      {isGithubOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: "rgba(10,9,8,0.6)", backdropFilter: "blur(4px)" }}
          onClick={() => setIsGithubOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-md rounded-2xl p-6"
            style={{ background: surfaceRaised, border: `1px solid ${line}`, boxShadow: "0 30px 80px -30px rgba(0,0,0,0.6)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 560, fontSize: 18 }}>
                Import GitHub Repo
              </h2>
              <button onClick={() => setIsGithubOpen(false)} style={{ color: textMuted }}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[13px] mb-4" style={{ color: textMuted }}>
              Paste a public GitHub repository URL to import its files into a new project.
            </p>

            <form onSubmit={handleGithubImport}>
              <input
                placeholder="https://github.com/owner/repo"
                value={githubRepoUrl}
                onChange={(e) => setGithubRepoUrl(e.target.value)}
                autoFocus
                className="w-full px-3.5 py-2.5 rounded-lg text-[14px] outline-none transition-colors"
                style={{ background: inputBg, border: `1px solid ${line}`, color: text }}
                onFocus={(e) => (e.target.style.borderColor = clay)}
                onBlur={(e) => (e.target.style.borderColor = line)}
              />

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsGithubOpen(false)}
                  className="px-4 py-2 rounded-lg text-[14px]"
                  style={{ color: textMuted }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!githubRepoUrl.trim() || isImporting}
                  className="px-4 py-2 rounded-lg text-[14px] disabled:opacity-50 inline-flex items-center gap-2"
                  style={{ background: clay, color: bg }}
                >
                  <Github className="w-4 h-4" />
                  {isImporting ? "Importing..." : "Import & Open"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
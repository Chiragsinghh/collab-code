import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { v4 as uuidV4 } from "uuid";
import { Button } from "../components/button";
import { useAuth } from "../Context/AuthContext";
import {
  Code2,
  Users,
  Zap,
  Play,
  Monitor,
  MessageSquare,
  GitBranch,
  Globe,
  LogIn,
} from "lucide-react";
import { useEffect } from "react";

/* Animations */
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

/* Data */
const features = [
  {
    icon: Users,
    title: "Real-Time Collaboration",
    description:
      "Code together with your team in real-time. See cursors, edits, and changes instantly.",
  },
  {
    icon: Code2,
    title: "Multi-File Projects",
    description:
      "Work on complete project structures with folders, files, and full codebase management.",
  },
  {
    icon: Monitor,
    title: "Live Preview",
    description:
      "See your changes instantly with hot-reload preview. No more switching tabs.",
  },
  {
    icon: MessageSquare,
    title: "Integrated Chat",
    description:
      "Communicate with collaborators without leaving the editor. Context stays intact.",
  },
  {
    icon: GitBranch,
    title: "Version History",
    description:
      "Track every change with automatic versioning. Rollback anytime, anywhere.",
  },
  {
    icon: Globe,
    title: "Deploy Instantly",
    description:
      "Go live in seconds. Share your project with the world with one click.",
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth(); // ✅ SINGLE SOURCE OF TRUTH

  /* Redirect logged-in users */
  useEffect(() => {
    if (user) {
      navigate("/dashboard"); // change if needed
    }
  }, [user, navigate]);

  const handleCreateRoom = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    navigate(`/editor/${uuidV4()}`);
  };

  const handleJoinRoom = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    const roomId = prompt("Enter the Room ID to join:");
    if (roomId?.trim()) {
      navigate(`/editor/${roomId.trim()}`);
    }
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50"
      >
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Code2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg">CodeSync</span>
          </Link>

          <div className="flex items-center gap-3">
            {!user && (
              <Button variant="ghost" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
            )}
            <Button variant="glow" onClick={handleCreateRoom}>
              Get Started
            </Button>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32">
        <div className="absolute inset-0 bg-glow pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="container mx-auto px-6 relative">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="max-w-4xl mx-auto text-center"
          >
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border mb-8"
            >
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">
                Real-time collaboration for developers
              </span>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
            >
              Code Together.{" "}
              <span className="text-primary text-glow">Build Faster.</span>
              <br />
              In Real Time.
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
            >
              The collaborative coding platform that lets your team write,
              review, and ship code together — all in one powerful editor.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button variant="hero" size="xl" onClick={handleCreateRoom}>
                <Play className="w-5 h-5" />
                Create New Project
              </Button>

              <Button
                variant="hero-outline"
                size="xl"
                onClick={handleJoinRoom}
              >
                <LogIn className="w-5 h-5" />
                Join Existing Room
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32 relative">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-12">Built for Modern Teams</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Code2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-semibold">CodeSync</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 CodeSync. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

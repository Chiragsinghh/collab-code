import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "../components/button";
import { 
  Code2, 
  Users, 
  Zap, 
  Play, 
  ArrowRight, 
  Monitor,
  MessageSquare,
  GitBranch,
  Globe
} from "lucide-react";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const features = [
  {
    icon: Users,
    title: "Real-Time Collaboration",
    description: "Code together with your team in real-time. See cursors, edits, and changes instantly."
  },
  {
    icon: Code2,
    title: "Multi-File Projects",
    description: "Work on complete project structures with folders, files, and full codebase management."
  },
  {
    icon: Monitor,
    title: "Live Preview",
    description: "See your changes instantly with hot-reload preview. No more switching tabs."
  },
  {
    icon: MessageSquare,
    title: "Integrated Chat",
    description: "Communicate with collaborators without leaving the editor. Context stays intact."
  },
  {
    icon: GitBranch,
    title: "Version History",
    description: "Track every change with automatic versioning. Rollback anytime, anywhere."
  },
  {
    icon: Globe,
    title: "Deploy Instantly",
    description: "Go live in seconds. Share your project with the world with one click."
  }
];

const techStack = [
  { name: "React", icon: "⚛️" },
  { name: "TypeScript", icon: "📘" },
  { name: "Node.js", icon: "🟢" },
  { name: "WebSockets", icon: "🔌" },
  { name: "Tailwind", icon: "🎨" },
  { name: "Vite", icon: "⚡" }
];

export default function LandingPage() {
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
            <Button variant="ghost" asChild>
              <Link to="/login">Sign In</Link>
            </Button>
            <Button variant="glow" asChild>
              <Link to="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32">
        {/* Background Glow */}
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
              <span className="text-sm text-muted-foreground">Real-time collaboration for developers</span>
            </motion.div>
            
            <motion.h1 
              variants={fadeInUp}
              className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
            >
              Code Together.{" "}
              <span className="text-primary text-glow">Build Faster.</span>
              <br />In Real Time.
            </motion.h1>
            
            <motion.p 
              variants={fadeInUp}
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
            >
              The collaborative coding platform that lets your team write, review, and ship code together — all in one powerful editor.
            </motion.p>
            
            <motion.div 
              variants={fadeInUp}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button variant="hero" size="xl" asChild>
                <Link to="/dashboard">
                  <Play className="w-5 h-5" />
                  Start Coding
                </Link>
              </Button>
              <Button variant="hero-outline" size="xl" asChild>
                <Link to="/editor/demo">
                  Create a Room
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Editor Preview */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-20 max-w-5xl mx-auto"
          >
            <div className="relative rounded-xl border border-border bg-card overflow-hidden shadow-2xl">
              {/* Editor Header */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-surface">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-destructive/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-green-500/60" />
                </div>
                <div className="flex-1 flex items-center justify-center">
                  <div className="px-4 py-1 rounded-md bg-secondary text-sm text-muted-foreground">
                    my-awesome-project
                  </div>
                </div>
              </div>
              
              {/* Editor Content */}
              <div className="grid grid-cols-12 min-h-[400px]">
                {/* File Tree */}
                <div className="col-span-2 border-r border-border p-3 bg-surface">
                  <div className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Files</div>
                  <div className="space-y-1 font-mono text-sm">
                    <div className="flex items-center gap-2 px-2 py-1 rounded bg-primary/10 text-primary">
                      <span className="text-xs">📄</span> index.tsx
                    </div>
                    <div className="flex items-center gap-2 px-2 py-1 rounded text-muted-foreground hover:bg-secondary">
                      <span className="text-xs">📄</span> App.tsx
                    </div>
                    <div className="flex items-center gap-2 px-2 py-1 rounded text-muted-foreground hover:bg-secondary">
                      <span className="text-xs">📁</span> components
                    </div>
                    <div className="flex items-center gap-2 px-2 py-1 rounded text-muted-foreground hover:bg-secondary pl-4">
                      <span className="text-xs">📄</span> Button.tsx
                    </div>
                    <div className="flex items-center gap-2 px-2 py-1 rounded text-muted-foreground hover:bg-secondary">
                      <span className="text-xs">📄</span> styles.css
                    </div>
                  </div>
                </div>
                
                {/* Code Area */}
                <div className="col-span-7 p-4 font-mono text-sm relative">
                  <pre className="text-muted-foreground text-left whitespace-pre leading-6">
                    <code>
                      <span className="text-purple-400">import</span> <span className="text-foreground">React</span> <span className="text-purple-400">from</span> <span className="text-green-400">'react'</span>;{"\n"}
                      <span className="text-purple-400">import</span> {"{ Button }"} <span className="text-purple-400">from</span> <span className="text-green-400">'./components'</span>;{"\n\n"}
                      <span className="text-purple-400">export default function</span> <span className="text-yellow-400">App</span>() {"{"}{"\n"}
                      {"  "}<span className="text-purple-400">return</span> ({"\n"}
                      {"    "}<span className="text-foreground">{"<"}</span><span className="text-primary">div</span> <span className="text-yellow-400">className</span>=<span className="text-green-400">"app"</span><span className="text-foreground">{">"}</span>{"\n"}
                      {"      "}<span className="text-foreground">{"<"}</span><span className="text-primary">h1</span><span className="text-foreground">{">"}</span>Hello World<span className="text-foreground">{"</"}</span><span className="text-primary">h1</span><span className="text-foreground">{">"}</span>{"\n"}
                      {"      "}<span className="text-foreground">{"<"}</span><span className="text-yellow-400">Button</span><span className="text-foreground">{" />"}</span>
                      <motion.span 
                        className="inline-block w-0.5 h-4 bg-primary ml-1"
                        animate={{ opacity: [1, 0] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                      />
                      {"\n"}
                      {"    "}<span className="text-foreground">{"</"}</span><span className="text-primary">div</span><span className="text-foreground">{">"}</span>{"\n"}
                      {"  "});{"\n"}
                      {"}"}{"\n"}
                    </code>
                  </pre>
                  
                  {/* Collaborative Cursors */}
                  <motion.div 
                    className="absolute top-[140px] left-[200px]"
                    animate={{ x: [0, 30, 30, 0], y: [0, 0, 20, 20] }}
                    transition={{ duration: 4, repeat: Infinity }}
                  >
                    <div className="w-0.5 h-4 bg-blue-500" />
                    <div className="absolute -top-5 left-0 px-1.5 py-0.5 bg-blue-500 rounded text-xs text-background font-sans whitespace-nowrap">
                      Sarah
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className="absolute top-[180px] left-[280px]"
                    animate={{ x: [0, -20, -20, 0], y: [0, 20, 20, 0] }}
                    transition={{ duration: 5, repeat: Infinity, delay: 1 }}
                  >
                    <div className="w-0.5 h-4 bg-green-500" />
                    <div className="absolute -top-5 left-0 px-1.5 py-0.5 bg-green-500 rounded text-xs text-background font-sans whitespace-nowrap">
                      Alex
                    </div>
                  </motion.div>
                </div>
                
                {/* Chat Panel */}
                <div className="col-span-3 border-l border-border bg-surface p-3">
                  <div className="text-xs text-muted-foreground mb-3 uppercase tracking-wider flex items-center justify-between">
                    Chat
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                      3 online
                    </span>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-xs text-background">S</div>
                      <div className="flex-1">
                        <div className="text-xs text-muted-foreground">Sarah</div>
                        <div className="text-foreground">Working on the header</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-xs text-background">A</div>
                      <div className="flex-1">
                        <div className="text-xs text-muted-foreground">Alex</div>
                        <div className="text-foreground">LGTM! 🚀</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Live Preview Bar */}
              <div className="border-t border-border p-3 bg-surface flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Live Preview
                </div>
                <div className="text-xs text-muted-foreground">Auto-saved 2s ago</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32 relative">
        <div className="container mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need to Code Together</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Powerful features designed for modern development teams who want to move fast without breaking things.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="group p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="py-20 border-t border-border">
        <div className="container mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p className="text-sm text-muted-foreground uppercase tracking-wider mb-4">Built With Modern Tech</p>
            <div className="flex flex-wrap items-center justify-center gap-8">
              {techStack.map((tech, index) => (
                <motion.div
                  key={tech.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary"
                >
                  <span className="text-lg">{tech.icon}</span>
                  <span className="text-sm font-medium">{tech.name}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 relative">
        <div className="absolute inset-0 bg-glow pointer-events-none opacity-50" />
        <div className="container mx-auto px-6 relative">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Ready to Build Together?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of developers who are already coding collaboratively. Start for free, no credit card required.
            </p>
            <Button variant="hero" size="xl" asChild>
              <Link to="/signup">
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Code2 className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-semibold">CodeSync</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
              <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
              <Link to="/docs" className="hover:text-foreground transition-colors">Documentation</Link>
              <a href="https://github.com" className="hover:text-foreground transition-colors">GitHub</a>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 CodeSync. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

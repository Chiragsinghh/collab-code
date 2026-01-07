import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/button";
import { Input } from "../components/input";
import { 
  Code2, 
  Plus, 
  Search, 
  Clock, 
  Users, 
  MoreVertical,
  FolderOpen,
  Settings,
  LogOut,
  User
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/dropdown-menu";

const projects = [
  {
    id: "1",
    name: "E-commerce Dashboard",
    lastEdited: "2 hours ago",
    collaborators: [
      { name: "Sarah", color: "bg-blue-500" },
      { name: "Alex", color: "bg-green-500" },
      { name: "Mike", color: "bg-purple-500" }
    ],
    language: "TypeScript"
  },
  {
    id: "2",
    name: "Landing Page Redesign",
    lastEdited: "5 hours ago",
    collaborators: [
      { name: "Emma", color: "bg-pink-500" },
      { name: "John", color: "bg-orange-500" }
    ],
    language: "React"
  },
  {
    id: "3",
    name: "API Integration Tests",
    lastEdited: "1 day ago",
    collaborators: [
      { name: "Alex", color: "bg-green-500" }
    ],
    language: "JavaScript"
  },
  {
    id: "4",
    name: "Mobile App Components",
    lastEdited: "2 days ago",
    collaborators: [
      { name: "Sarah", color: "bg-blue-500" },
      { name: "Emma", color: "bg-pink-500" }
    ],
    language: "React Native"
  },
  {
    id: "5",
    name: "Documentation Site",
    lastEdited: "3 days ago",
    collaborators: [
      { name: "Mike", color: "bg-purple-500" },
      { name: "John", color: "bg-orange-500" },
      { name: "Sarah", color: "bg-blue-500" }
    ],
    language: "MDX"
  },
  {
    id: "6",
    name: "Analytics Dashboard",
    lastEdited: "1 week ago",
    collaborators: [
      { name: "Alex", color: "bg-green-500" },
      { name: "Emma", color: "bg-pink-500" }
    ],
    language: "TypeScript"
  }
];

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.05
    }
  }
};

const fadeInUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 }
};

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleNewProject = () => {
    const projectName = prompt("Enter a name for your new project:");
    if (projectName && projectName.trim() !== "") {
      // Redirect to editor with the project name as a query parameter
      navigate(`/editor/new?name=${encodeURIComponent(projectName.trim())}`);
    }
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-surface">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Code2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg">CodeSync</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <Button variant="glow" size="sm" onClick={handleNewProject}>
              <Plus className="w-4 h-4" />
              New Project
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium hover:opacity-90 transition-opacity">
                  J
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/login" className="flex items-center gap-2 text-destructive">
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold mb-1">Your Projects</h1>
              <p className="text-muted-foreground">Manage and collaborate on your code</p>
            </div>
            
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-secondary border-border"
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <motion.div
              whileHover={{ y: -2 }}
              className="p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-all cursor-pointer group"
              onClick={handleNewProject}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Plus className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">New Project</h3>
                  <p className="text-sm text-muted-foreground">Start from scratch</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -2 }}
              className="p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <FolderOpen className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Import Project</h3>
                  <p className="text-sm text-muted-foreground">From GitHub or ZIP</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -2 }}
              className="p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Join Room</h3>
                  <p className="text-sm text-muted-foreground">Via invite link</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -2 }}
              className="p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Code2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Templates</h3>
                  <p className="text-sm text-muted-foreground">Quick start templates</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Projects Grid */}
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {filteredProjects.map((project) => (
              <motion.div
                key={project.id}
                variants={fadeInUp}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group relative"
              >
                <Link
                  to={`/editor/${project.id}?name=${encodeURIComponent(project.name)}`}
                  className="block p-5 rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Code2 className="w-5 h-5 text-primary" />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button 
                          className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-secondary transition-all"
                          onClick={(e) => e.preventDefault()}
                        >
                          <MoreVertical className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Open in new tab</DropdownMenuItem>
                        <DropdownMenuItem>Duplicate</DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to={`/project/${project.id}/settings`}>Settings</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                    {project.name}
                  </h3>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {project.lastEdited}
                    </div>
                    <div className="px-2 py-0.5 rounded-md bg-secondary text-xs">
                      {project.language}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {project.collaborators.slice(0, 4).map((collaborator, index) => (
                        <div
                          key={index}
                          className={`w-7 h-7 rounded-full ${collaborator.color} flex items-center justify-center text-xs text-background font-medium ring-2 ring-card`}
                          title={collaborator.name}
                        >
                          {collaborator.name[0]}
                        </div>
                      ))}
                      {project.collaborators.length > 4 && (
                        <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-xs text-muted-foreground ring-2 ring-card">
                          +{project.collaborators.length - 4}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Users className="w-3.5 h-3.5" />
                      {project.collaborators.length}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          {filteredProjects.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No projects found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search or create a new project
              </p>
              <Button variant="glow" onClick={handleNewProject}>
                <Plus className="w-4 h-4" />
                Create Project
              </Button>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
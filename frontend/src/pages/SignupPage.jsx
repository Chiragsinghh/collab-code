import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios"; // Added axios
import { Button } from "../components/button";
import { Input } from "../components/input";
import { Label } from "../components/label";
import { Code2, ArrowRight, Github, Mail, Check } from "lucide-react";

const benefits = [
  "Real-time collaboration with your team",
  "Unlimited projects and collaborators",
  "Live preview and instant deployment"
];

export default function SignupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    try {
      // Connect to your backend auth route
      const response = await axios.post("http://localhost:5001/api/auth/signup", {
        username: name,
        email,
        password
      });

      if (response.data.token) {
        // Store user info and token
        localStorage.setItem("codesync_user", JSON.stringify(response.data.user));
        localStorage.setItem("codesync_token", response.data.token);
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-glow pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative"
      >
        <Link to="/" className="flex items-center gap-2 justify-center mb-8">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <Code2 className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="font-semibold text-xl">CodeSync</span>
        </Link>

        <div className="bg-card border border-border rounded-xl p-8 shadow-card">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">Create Your Account</h1>
            <p className="text-muted-foreground">Start coding together in seconds</p>
          </div>

          {error && <p className="text-destructive text-sm text-center mb-4">{error}</p>}

          <div className="mb-6 space-y-2">
            {benefits.map((benefit) => (
              <div key={benefit} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-primary" />
                {benefit}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" type="text" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} className="bg-secondary border-border" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-secondary border-border" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-secondary border-border" required />
            </div>

            <Button type="submit" variant="hero" className="w-full">
              Create Account
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">Or continue with</span></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="w-full"><Github className="w-4 h-4" />GitHub</Button>
            <Button variant="outline" className="w-full"><Mail className="w-4 h-4" />Google</Button>
          </div>
        </div>

        <p className="text-center mt-6 text-muted-foreground">
          Already have an account? <Link to="/login" className="text-primary hover:underline font-medium">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
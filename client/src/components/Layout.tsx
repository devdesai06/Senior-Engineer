import { Link, useLocation } from "wouter";
import { useProgress } from "@/hooks/use-progress";
import { Trophy, Zap, LayoutGrid, Github } from "lucide-react";
import { motion } from "framer-motion";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { progress } = useProgress();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="sticky top-0 z-50 border-b border-white/5 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/25 group-hover:scale-110 transition-transform">
              <Zap className="w-5 h-5 text-white fill-white" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight">
              Course<span className="text-primary">Quest</span>
            </span>
          </Link>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-4 bg-secondary/10 px-4 py-1.5 rounded-full border border-secondary/20">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-secondary" />
                <span className="text-sm font-medium text-secondary">Level {progress.level}</span>
              </div>
              <div className="w-px h-4 bg-secondary/20" />
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="text-sm font-medium text-yellow-400">{progress.xp} XP</span>
              </div>
            </div>

            <nav className="flex items-center gap-1">
              <Link href="/leaderboard">
                <a className={`p-2 rounded-lg transition-colors ${location === '/leaderboard' ? 'bg-primary/10 text-primary' : 'hover:bg-accent/10 hover:text-accent'}`}>
                  <Trophy className="w-5 h-5" />
                </a>
              </Link>
            </nav>
          </div>
        </div>
        
        {/* Progress Bar Loader (Visual Only) */}
        <motion.div 
          initial={{ scaleX: 0 }} 
          animate={{ scaleX: 1 }} 
          className="h-[1px] bg-gradient-to-r from-primary via-accent to-secondary origin-left" 
        />
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>

      <footer className="border-t border-white/5 py-8 bg-black/20">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-muted-foreground text-sm">
          <p>© 2024 CourseQuest. Gamified Learning Platform.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-primary transition-colors flex items-center gap-2">
              <Github className="w-4 h-4" /> Source
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

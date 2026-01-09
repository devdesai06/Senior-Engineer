import { Layout } from "@/components/Layout";
import { useProgress } from "@/hooks/use-progress";
import { Trophy, Medal, User, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LeaderboardEntry } from "@shared/schema";

// Mock data generator since we don't have a real backend for other users
const MOCK_USERS: LeaderboardEntry[] = [
  { username: "CodeMaster99", xp: 12500, level: 125, rank: 1 },
  { username: "ReactNinja", xp: 8400, level: 84, rank: 2 },
  { username: "TypeScriptWiz", xp: 6200, level: 62, rank: 3 },
  { username: "FrontendDev", xp: 4500, level: 45, rank: 4 },
  { username: "NewbieCoder", xp: 1200, level: 12, rank: 5 },
];

export default function Leaderboard() {
  const { progress } = useProgress();

  const userEntry: LeaderboardEntry = {
    username: "You",
    xp: progress.xp,
    level: progress.level,
    rank: 0 // Will calculate
  };

  const allEntries = [...MOCK_USERS, userEntry]
    .sort((a, b) => b.xp - a.xp)
    .map((entry, idx) => ({ ...entry, rank: idx + 1 }));

  return (
    <Layout>
      <div className="max-w-3xl mx-auto py-8">
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-4xl font-display font-bold text-gradient">Global Leaderboard</h1>
          <p className="text-muted-foreground">Top learners this week. Keep learning to climb the ranks!</p>
        </div>

        <div className="bg-card/40 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-sm">
          {/* Header */}
          <div className="grid grid-cols-12 gap-4 p-6 border-b border-white/5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <div className="col-span-2 text-center">Rank</div>
            <div className="col-span-6">User</div>
            <div className="col-span-2 text-center">Level</div>
            <div className="col-span-2 text-right">XP</div>
          </div>

          <div className="divide-y divide-white/5">
            {allEntries.map((entry) => (
              <div 
                key={entry.username}
                className={cn(
                  "grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/5 transition-colors",
                  entry.username === "You" && "bg-primary/10 hover:bg-primary/20"
                )}
              >
                <div className="col-span-2 flex justify-center">
                  {entry.rank === 1 ? <Trophy className="w-6 h-6 text-yellow-400" /> :
                   entry.rank === 2 ? <Medal className="w-6 h-6 text-gray-400" /> :
                   entry.rank === 3 ? <Medal className="w-6 h-6 text-amber-700" /> :
                   <span className="font-mono font-bold text-muted-foreground">#{entry.rank}</span>
                  }
                </div>
                
                <div className="col-span-6 flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border-2",
                    entry.username === "You" ? "border-primary bg-primary text-white" : "border-white/10 bg-card text-muted-foreground"
                  )}>
                    <User className="w-5 h-5" />
                  </div>
                  <span className={cn("font-bold", entry.username === "You" && "text-primary")}>
                    {entry.username}
                  </span>
                  {entry.username === "You" && <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded ml-2">YOU</span>}
                </div>

                <div className="col-span-2 text-center font-mono text-sm text-muted-foreground">
                  Lvl {entry.level}
                </div>

                <div className="col-span-2 text-right font-mono font-bold text-yellow-500 flex items-center justify-end gap-1">
                  {entry.xp.toLocaleString()} <Zap className="w-3 h-3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}

import { useState } from "react";
import { useLocation } from "wouter";
import { useImportCourse } from "@/hooks/use-courses";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Play, Sparkles, Youtube, ArrowRight, BookOpen, Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [url, setUrl] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const importMutation = useImportCourse();

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    try {
      const result = await importMutation.mutateAsync({ playlistUrl: url });
      setLocation(`/course/${result.courseId}`);
    } catch (error) {
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const demoCourse = () => {
    setUrl("https://www.youtube.com/playlist?list=PL4cUxeGkcC9g9gP2onazU5-2M-AzA8eBw");
    importMutation.mutate({ playlistUrl: "https://www.youtube.com/playlist?list=PL4cUxeGkcC9g9gP2onazU5-2M-AzA8eBw" }, {
      onSuccess: (data) => setLocation(`/course/${data.courseId}`)
    });
  };

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-12">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6 max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            <span>Gamify your YouTube learning experience</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-display font-bold leading-tight">
            Turn Playlists into <br />
            <span className="text-gradient">Quests & XP</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Import any educational YouTube playlist. We'll turn it into a structured course with quizzes, progress tracking, and rewards.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="w-full max-w-xl relative group"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
          <div className="relative glass-panel rounded-2xl p-8">
            <form onSubmit={handleImport} className="space-y-4">
              <div className="relative">
                <Youtube className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input 
                  placeholder="Paste YouTube Playlist URL..." 
                  className="pl-12 h-14 text-lg bg-background/50 border-white/10 focus:border-primary/50 transition-all rounded-xl"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
              
              <Button 
                type="submit" 
                size="lg" 
                className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary/90"
                disabled={importMutation.isPending}
              >
                {importMutation.isPending ? (
                  "Generating Course..." 
                ) : (
                  <>Start Learning <ArrowRight className="ml-2 w-5 h-5" /></>
                )}
              </Button>
            </form>
            
            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <span>Or try a demo:</span>
              <button 
                onClick={demoCourse}
                className="text-primary hover:text-primary/80 hover:underline font-medium"
              >
                React Mastery Course
              </button>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full"
        >
          <FeatureCard 
            icon={<BookOpen className="w-8 h-8 text-secondary" />}
            title="Structured Learning"
            description="Automatic chapter organization and progress tracking for any playlist."
          />
          <FeatureCard 
            icon={<Trophy className="w-8 h-8 text-accent" />}
            title="Earn Rewards"
            description="Gain XP, level up, and compete on the global leaderboard."
          />
          <FeatureCard 
            icon={<Play className="w-8 h-8 text-primary" />}
            title="Interactive Quizzes"
            description="Test your knowledge after every video to unlock the next chapter."
          />
        </motion.div>
      </div>
    </Layout>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-6 rounded-2xl bg-card/40 border border-white/5 hover:border-white/10 transition-colors text-left">
      <div className="mb-4 p-3 bg-background/50 rounded-xl w-fit">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

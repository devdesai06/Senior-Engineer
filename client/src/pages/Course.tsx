import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { useCourse, useVideo } from "@/hooks/use-courses";
import { useProgress } from "@/hooks/use-progress";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Lock, Play, CheckCircle, ChevronRight, Trophy, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import YouTube from "react-youtube";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "react-confetti";
import { useToast } from "@/hooks/use-toast";
import type { VideoWithQuestions } from "@shared/schema";

export default function Course() {
  const [, params] = useRoute("/course/:id");
  const courseId = params ? parseInt(params.id) : 0;
  
  const { data: course, isLoading: loadingCourse } = useCourse(courseId);
  const { progress, unlockVideo, addXp } = useProgress();
  
  const [activeVideoId, setActiveVideoId] = useState<number | null>(null);
  
  // Set initial active video once course loads
  useEffect(() => {
    if (course && course.videos.length > 0 && !activeVideoId) {
      // Find first unlocked video or default to first
      const firstUnlocked = course.videos.find(v => progress.unlockedVideoIds.includes(v.id)) || course.videos[0];
      
      // Ensure the first video is unlocked in state if it's new
      if (!progress.unlockedVideoIds.includes(course.videos[0].id)) {
        unlockVideo(course.videos[0].id);
      }
      
      setActiveVideoId(firstUnlocked.id);
    }
  }, [course, activeVideoId, progress.unlockedVideoIds, unlockVideo]);

  if (loadingCourse || !activeVideoId) return <CourseSkeleton />;
  if (!course) return <Layout><div className="text-center py-20">Course not found</div></Layout>;

  return (
    <Layout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-140px)]">
        {/* Main Content Area */}
        <div className="lg:col-span-2 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
          <div className="rounded-2xl overflow-hidden bg-black shadow-2xl ring-1 ring-white/10 aspect-video">
             <VideoPlayer videoId={activeVideoId} onComplete={() => {}} />
          </div>
          
          <div className="glass-panel p-6 rounded-2xl">
            <VideoDetails 
              videoId={activeVideoId} 
              courseId={courseId} 
              nextVideoId={course.videos.find((_, i) => course.videos[i].id === activeVideoId && i < course.videos.length - 1) 
                ? course.videos[course.videos.findIndex(v => v.id === activeVideoId) + 1].id 
                : undefined
              }
            />
          </div>
        </div>

        {/* Sidebar / Playlist */}
        <div className="lg:col-span-1 flex flex-col gap-4 overflow-hidden h-full glass-panel rounded-2xl border-white/10">
          <div className="p-6 border-b border-white/5 bg-card/50">
            <h2 className="text-xl font-bold font-display">{course.title}</h2>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{course.description}</p>
            <div className="mt-4 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <span>{course.videos.length} Lessons</span>
              <span>•</span>
              <span>{Math.round((progress.completedVideoIds.length / course.videos.length) * 100)}% Complete</span>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-3 h-2 w-full bg-secondary/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-secondary transition-all duration-500"
                style={{ width: `${(progress.completedVideoIds.length / course.videos.length) * 100}%` }}
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
            {course.videos.map((video, index) => {
              const isUnlocked = progress.unlockedVideoIds.includes(video.id);
              const isCompleted = progress.completedVideoIds.includes(video.id);
              const isActive = activeVideoId === video.id;

              return (
                <button
                  key={video.id}
                  disabled={!isUnlocked}
                  onClick={() => setActiveVideoId(video.id)}
                  className={cn(
                    "w-full flex items-center gap-4 p-3 rounded-xl transition-all text-left border border-transparent group",
                    isActive 
                      ? "bg-primary/10 border-primary/20 shadow-lg shadow-primary/5" 
                      : "hover:bg-white/5 hover:border-white/5",
                    !isUnlocked && "opacity-50 cursor-not-allowed hover:bg-transparent"
                  )}
                >
                  <div className="relative shrink-0">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm",
                      isActive ? "bg-primary text-white" : "bg-card border border-white/10 text-muted-foreground",
                      isCompleted && !isActive && "bg-green-500/10 text-green-500 border-green-500/20"
                    )}>
                      {isCompleted ? <CheckCircle className="w-5 h-5" /> : (isUnlocked ? index + 1 : <Lock className="w-4 h-4" />)}
                    </div>
                    {isActive && (
                      <div className="absolute inset-0 bg-primary/20 blur-lg rounded-lg -z-10" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className={cn(
                      "text-sm font-medium truncate",
                      isActive ? "text-primary-foreground" : "text-foreground"
                    )}>
                      {video.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                      {video.duration}
                      {!isUnlocked && <span className="text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground">Locked</span>}
                    </p>
                  </div>

                  {isActive && <Play className="w-4 h-4 text-primary fill-current" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
}

function VideoPlayer({ videoId, onComplete }: { videoId: number, onComplete: () => void }) {
  const { data: video } = useVideo(videoId);
  const [isPlaying, setIsPlaying] = useState(false);
  
  if (!video) return null;

  return (
    <div className="w-full h-full relative group">
      <YouTube
        videoId={video.youtubeId}
        className="w-full h-full absolute inset-0"
        iframeClassName="w-full h-full"
        opts={{
          height: '100%',
          width: '100%',
          playerVars: {
            autoplay: 0,
            controls: 1, // Changed to 1 for better UX in mock
            modestbranding: 1,
            rel: 0,
          },
        }}
        onPlay={() => setIsPlaying(true)}
        onEnd={() => {
          setIsPlaying(false);
          onComplete();
        }}
      />
    </div>
  );
}

function VideoDetails({ videoId, courseId, nextVideoId }: { videoId: number, courseId: number, nextVideoId?: number }) {
  const { data: video } = useVideo(videoId);
  const { progress, addXp, unlockVideo, completeVideo, saveQuizScore } = useProgress();
  const { toast } = useToast();
  
  // Local state for quiz
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false); // In real app, drive this from player onEnd

  // Reset quiz state when video changes
  useEffect(() => {
    setShowQuiz(false);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setScore(0);
    setQuizCompleted(false);
    setShowConfetti(false);
    setVideoEnded(false); 
  }, [videoId]);

  // Mock video end handler for prototype since we can't force user to watch full video
  const handleMockVideoEnd = () => {
    setVideoEnded(true);
    toast({
      title: "Video Completed!",
      description: "Take the quiz to unlock the next lesson.",
      variant: "default",
    });
  };

  if (!video) return <div className="h-40 animate-pulse bg-muted/20 rounded-xl" />;

  const questions = video.questions || [];
  const currentQuestion = questions[currentQuestionIndex];
  const isVideoCompleted = progress.completedVideoIds.includes(videoId);

  const handleAnswer = (optionIndex: number) => {
    setSelectedOption(optionIndex);
  };

  const submitAnswer = () => {
    if (selectedOption === null) return;

    let newScore = score;
    if (selectedOption === currentQuestion.correctAnswer) {
      newScore += 1;
    }
    setScore(newScore);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
    } else {
      finishQuiz(newScore + (selectedOption === currentQuestion.correctAnswer ? 1 : 0));
    }
  };

  const finishQuiz = (finalScore: number) => {
    const percentage = (finalScore / questions.length) * 100;
    const passed = percentage >= 80;
    
    setQuizCompleted(true);
    saveQuizScore(videoId, percentage);

    if (passed) {
      setShowConfetti(true);
      if (!isVideoCompleted) {
        addXp(50);
        completeVideo(videoId);
        
        if (nextVideoId) {
          unlockVideo(nextVideoId);
          toast({
            title: "Quiz Passed! +50 XP",
            description: "Next lesson unlocked!",
            className: "bg-green-600 border-green-700 text-white",
          });
        } else {
          toast({
            title: "Course Completed! +50 XP",
            description: "You've mastered this course!",
            className: "bg-green-600 border-green-700 text-white",
          });
        }
      }
    } else {
      toast({
        title: "Quiz Failed",
        description: "You need 80% to pass. Watch the video again!",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      {showConfetti && <Confetti recycle={false} numberOfPieces={500} />}
      
      {!showQuiz ? (
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">{video.title}</h1>
              <p className="text-muted-foreground">{video.description}</p>
            </div>
            {isVideoCompleted && (
              <div className="bg-green-500/10 text-green-400 px-3 py-1 rounded-full text-xs font-bold border border-green-500/20 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> COMPLETED
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-4 border-t border-white/5">
             {/* Mock button for prototype to simulate watching video */}
             {!videoEnded && !isVideoCompleted && (
                <Button variant="outline" size="sm" onClick={handleMockVideoEnd}>
                  (Debug) Simulate Video End
                </Button>
             )}

             <Button 
               size="lg" 
               disabled={!videoEnded && !isVideoCompleted}
               onClick={() => setShowQuiz(true)}
               className={cn(
                 "w-full md:w-auto font-bold",
                 isVideoCompleted ? "bg-secondary text-secondary-foreground" : "bg-primary"
               )}
             >
               {isVideoCompleted ? "Retake Quiz" : "Take Quiz to Unlock Next"}
               <ChevronRight className="w-4 h-4 ml-2" />
             </Button>
          </div>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto">
          {!quizCompleted ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center mb-6">
                <span className="text-sm font-medium text-muted-foreground">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
                <span className="text-sm font-medium text-primary">
                  {score} Correct
                </span>
              </div>

              <h3 className="text-xl font-bold mb-6">{currentQuestion.question}</h3>

              <div className="space-y-3">
                {currentQuestion.options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    className={cn(
                      "w-full p-4 rounded-xl text-left border-2 transition-all flex items-center gap-3 group",
                      selectedOption === idx 
                        ? "border-primary bg-primary/10 text-primary-foreground" 
                        : "border-white/5 bg-card hover:bg-white/5 hover:border-white/10"
                    )}
                  >
                    <div className={cn(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-colors",
                      selectedOption === idx ? "border-primary bg-primary text-white" : "border-muted-foreground text-muted-foreground group-hover:border-white"
                    )}>
                      {String.fromCharCode(65 + idx)}
                    </div>
                    {option}
                  </button>
                ))}
              </div>

              <div className="pt-6 flex justify-end">
                <Button 
                  onClick={submitAnswer} 
                  disabled={selectedOption === null}
                  className="px-8"
                >
                  {currentQuestionIndex === questions.length - 1 ? "Finish Quiz" : "Next Question"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 space-y-6 animate-in zoom-in duration-300">
              <div className="inline-flex p-4 rounded-full bg-card border border-white/10 shadow-xl mb-4">
                {score / questions.length >= 0.8 ? (
                   <Trophy className="w-16 h-16 text-yellow-400" />
                ) : (
                   <AlertCircle className="w-16 h-16 text-destructive" />
                )}
              </div>
              
              <h2 className="text-3xl font-bold">
                {score / questions.length >= 0.8 ? "Quiz Passed!" : "Keep Trying!"}
              </h2>
              
              <p className="text-xl text-muted-foreground">
                You scored <span className="text-foreground font-bold">{Math.round((score / questions.length) * 100)}%</span>
              </p>

              <div className="flex justify-center gap-4 pt-4">
                <Button variant="outline" onClick={() => {
                  setQuizCompleted(false);
                  setCurrentQuestionIndex(0);
                  setScore(0);
                  setSelectedOption(null);
                }}>
                  Retry Quiz
                </Button>
                
                {score / questions.length >= 0.8 && (
                   <Button onClick={() => setShowQuiz(false)}>
                     Continue Learning
                   </Button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CourseSkeleton() {
  return (
    <Layout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="w-full aspect-video rounded-2xl bg-muted/20" />
          <div className="space-y-4 p-6 rounded-2xl border border-white/5">
            <Skeleton className="h-8 w-3/4 bg-muted/20" />
            <Skeleton className="h-4 w-1/2 bg-muted/20" />
          </div>
        </div>
        <div className="lg:col-span-1 h-[600px] border border-white/5 rounded-2xl p-4 space-y-4">
          <Skeleton className="h-10 w-full bg-muted/20" />
          <div className="space-y-3">
            {[1,2,3,4,5].map(i => (
              <Skeleton key={i} className="h-16 w-full rounded-xl bg-muted/10" />
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}

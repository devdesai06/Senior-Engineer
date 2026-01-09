import { useState, useEffect } from 'react';
import type { UserProgress } from '@shared/schema';

const STORAGE_KEY = 'coursequest_progress_v1';

const INITIAL_PROGRESS: UserProgress = {
  xp: 0,
  level: 1,
  unlockedVideoIds: [], // Will be populated with first video on init if empty
  completedVideoIds: [],
  quizScores: {},
};

export function useProgress() {
  const [progress, setProgressState] = useState<UserProgress>(INITIAL_PROGRESS);

  // Load from local storage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Ensure defaults for any new fields
        setProgressState({ ...INITIAL_PROGRESS, ...parsed });
      } catch (e) {
        console.error("Failed to parse progress", e);
      }
    }
  }, []);

  // Save to local storage whenever progress changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  const addXp = (amount: number) => {
    setProgressState(prev => {
      const newXp = prev.xp + amount;
      // Simple leveling formula: Level = 1 + floor(XP / 100)
      const newLevel = 1 + Math.floor(newXp / 100);
      return { ...prev, xp: newXp, level: newLevel };
    });
  };

  const unlockVideo = (videoId: number) => {
    setProgressState(prev => {
      if (prev.unlockedVideoIds.includes(videoId)) return prev;
      return { ...prev, unlockedVideoIds: [...prev.unlockedVideoIds, videoId] };
    });
  };

  const completeVideo = (videoId: number) => {
    setProgressState(prev => {
      if (prev.completedVideoIds.includes(videoId)) return prev;
      return { ...prev, completedVideoIds: [...prev.completedVideoIds, videoId] };
    });
  };

  const saveQuizScore = (videoId: number, score: number) => {
    setProgressState(prev => ({
      ...prev,
      quizScores: { ...prev.quizScores, [videoId]: score }
    }));
  };

  const resetProgress = () => {
    setProgressState(INITIAL_PROGRESS);
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    progress,
    addXp,
    unlockVideo,
    completeVideo,
    saveQuizScore,
    resetProgress
  };
}

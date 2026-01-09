import { pgTable, text, serial, integer, json, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Content Tables (Static course data)
export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  thumbnailUrl: text("thumbnail_url").notNull(),
});

export const videos = pgTable("videos", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull(),
  youtubeId: text("youtube_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  order: integer("order").notNull(),
  duration: text("duration").notNull(), // e.g. "10:05"
});

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  videoId: integer("video_id").notNull(),
  question: text("question").notNull(),
  options: json("options").notNull().$type<string[]>(),
  correctAnswer: integer("correct_answer").notNull(), // Index of correct option
  explanation: text("explanation").notNull(),
});

// Schemas
export const insertCourseSchema = createInsertSchema(courses);
export const insertVideoSchema = createInsertSchema(videos);
export const insertQuestionSchema = createInsertSchema(questions);

// Types
export type Course = typeof courses.$inferSelect;
export type Video = typeof videos.$inferSelect;
export type Question = typeof questions.$inferSelect;

// Full video type with questions
export type VideoWithQuestions = Video & { questions: Question[] };

// Progress Types (Stored in LocalStorage, but typed here for consistency)
export type UserProgress = {
  xp: number;
  level: number;
  unlockedVideoIds: number[];
  completedVideoIds: number[];
  quizScores: Record<number, number>; // videoId -> score
};

export type LeaderboardEntry = {
  username: string;
  xp: number;
  level: number;
  rank: number;
};

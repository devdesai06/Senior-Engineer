import { db } from "./db";
import { courses, videos, questions, type Course, type Video, type Question, type VideoWithQuestions } from "@shared/schema";
import { eq, asc } from "drizzle-orm";

export interface IStorage {
  // Course Content
  getCourses(): Promise<Course[]>;
  getCourse(id: number): Promise<Course | undefined>;
  getCourseVideos(courseId: number): Promise<Video[]>;
  getVideo(id: number): Promise<Video | undefined>;
  getVideoQuestions(videoId: number): Promise<Question[]>;
  
  // Creation (for seeding)
  createCourse(course: typeof courses.$inferInsert): Promise<Course>;
  createVideo(video: typeof videos.$inferInsert): Promise<Video>;
  createQuestion(question: typeof questions.$inferInsert): Promise<Question>;
}

export class DatabaseStorage implements IStorage {
  async getCourses(): Promise<Course[]> {
    return await db.select().from(courses);
  }

  async getCourse(id: number): Promise<Course | undefined> {
    const [course] = await db.select().from(courses).where(eq(courses.id, id));
    return course;
  }

  async getCourseVideos(courseId: number): Promise<Video[]> {
    return await db.select().from(videos)
      .where(eq(videos.courseId, courseId))
      .orderBy(asc(videos.order));
  }

  async getVideo(id: number): Promise<Video | undefined> {
    const [video] = await db.select().from(videos).where(eq(videos.id, id));
    return video;
  }

  async getVideoQuestions(videoId: number): Promise<Question[]> {
    return await db.select().from(questions).where(eq(questions.videoId, videoId));
  }

  async createCourse(course: typeof courses.$inferInsert): Promise<Course> {
    const [newCourse] = await db.insert(courses).values(course).returning();
    return newCourse;
  }

  async createVideo(video: typeof videos.$inferInsert): Promise<Video> {
    const [newVideo] = await db.insert(videos).values(video).returning();
    return newVideo;
  }

  async createQuestion(question: typeof questions.$inferInsert): Promise<Question> {
    const [newQuestion] = await db.insert(questions).values(question).returning();
    return newQuestion;
  }
}

export const storage = new DatabaseStorage();

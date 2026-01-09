import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // === COURSES ===
  app.get(api.courses.list.path, async (req, res) => {
    const courses = await storage.getCourses();
    res.json(courses);
  });

  app.get(api.courses.get.path, async (req, res) => {
    const id = Number(req.params.id);
    const course = await storage.getCourse(id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    const videos = await storage.getCourseVideos(id);
    res.json({ ...course, videos });
  });

  // Mock Import (Always returns course ID 1)
  app.post(api.courses.import.path, async (req, res) => {
    // In a real app, this would fetch YouTube API
    // Here we just return the ID of our seeded course
    const courses = await storage.getCourses();
    const courseId = courses.length > 0 ? courses[0].id : 1;
    res.json({ courseId });
  });

  // === VIDEOS ===
  app.get(api.videos.get.path, async (req, res) => {
    const id = Number(req.params.id);
    const video = await storage.getVideo(id);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }
    const questions = await storage.getVideoQuestions(id);
    res.json({ ...video, questions });
  });

  // Seed Data on startup
  seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const existingCourses = await storage.getCourses();
  if (existingCourses.length > 0) return;

  console.log("Seeding database...");

  const course = await storage.createCourse({
    title: "Master React: From Zero to Hero",
    description: "A comprehensive path to mastering modern React with Hooks, Context, and more.",
    thumbnailUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/1200px-React-icon.svg.png"
  });

  const v1 = await storage.createVideo({
    courseId: course.id,
    youtubeId: "Tn6-PIqc4UM", // React in 100 Seconds
    title: "1. Introduction to React",
    description: "What is React? Why is it so popular? Learn the basics in 100 seconds.",
    order: 1,
    duration: "2:05"
  });

  const v2 = await storage.createVideo({
    courseId: course.id,
    youtubeId: "SqcY0GlETPk", // React Tutorial for Beginners
    title: "2. React Components & Props",
    description: "Learn how to build reusable components and pass data with props.",
    order: 2,
    duration: "10:30"
  });

  const v3 = await storage.createVideo({
    courseId: course.id,
    youtubeId: "TNhaISOUy6Q", // 10 React Hooks Explained
    title: "3. React Hooks Explained",
    description: "Understand useState, useEffect, and other essential hooks.",
    order: 3,
    duration: "12:15"
  });

  // Questions for Video 1
  await storage.createQuestion({
    videoId: v1.id,
    question: "What is the primary purpose of React?",
    options: ["To style web pages", "To build user interfaces", "To manage databases", "To send emails"],
    correctAnswer: 1,
    explanation: "React is a JavaScript library for building user interfaces."
  });
  await storage.createQuestion({
    videoId: v1.id,
    question: "Which company developed React?",
    options: ["Google", "Facebook (Meta)", "Microsoft", "Amazon"],
    correctAnswer: 1,
    explanation: "React was created by Jordan Walke, a software engineer at Facebook."
  });
  await storage.createQuestion({
    videoId: v1.id,
    question: "What syntax extension does React use?",
    options: ["HTML", "XML", "JSX", "Swift"],
    correctAnswer: 2,
    explanation: "React uses JSX (JavaScript XML) to describe what the UI should look like."
  });
  await storage.createQuestion({
    videoId: v1.id,
    question: "What is the Virtual DOM?",
    options: ["A direct copy of the browser DOM", "A lightweight representation of the DOM", "A virtual reality browser", "A database for React"],
    correctAnswer: 1,
    explanation: "The Virtual DOM is a lightweight copy of the actual DOM that React uses to optimize updates."
  });
  await storage.createQuestion({
    videoId: v1.id,
    question: "How do you define a component in modern React?",
    options: ["As a class", "As a function", "As a variable", "As a string"],
    correctAnswer: 1,
    explanation: "Modern React heavily favors functional components using Hooks."
  });

   // Questions for Video 2
   await storage.createQuestion({
    videoId: v2.id,
    question: "How do you pass data to a component?",
    options: ["State", "Props", "Context", "Ref"],
    correctAnswer: 1,
    explanation: "Props (short for properties) are used to pass data from parent to child components."
  });
  await storage.createQuestion({
    videoId: v2.id,
    question: "Are props mutable?",
    options: ["Yes", "No", "Only in class components", "Only in functional components"],
    correctAnswer: 1,
    explanation: "Props are read-only (immutable) from the perspective of the child component."
  });
  await storage.createQuestion({
    videoId: v2.id,
    question: "What is the children prop?",
    options: ["The first child component", "An array of all state variables", "The content between component tags", "A method to update state"],
    correctAnswer: 2,
    explanation: "props.children contains the content passed between the opening and closing tags of a component."
  });
  await storage.createQuestion({
    videoId: v2.id,
    question: "Can a component return multiple elements?",
    options: ["Yes, always", "No, never", "Only if wrapped in a fragment or parent", "Only in strict mode"],
    correctAnswer: 2,
    explanation: "A component must return a single parent element or a Fragment (<>...</>)."
  });
  await storage.createQuestion({
    videoId: v2.id,
    question: "What is conditional rendering?",
    options: ["Rendering based on user location", "Rendering based on a condition (true/false)", "Rendering only on mobile", "Rendering randomly"],
    correctAnswer: 1,
    explanation: "Conditional rendering allows you to render different UI based on state or props."
  });

  console.log("Database seeded successfully!");
}

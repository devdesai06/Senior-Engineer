import { useQuery, useMutation } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";

// Types from schema/routes
type Course = z.infer<typeof api.courses.get.responses[200]>;
type VideoDetails = z.infer<typeof api.videos.get.responses[200]>;
type ImportCourseInput = z.infer<typeof api.courses.import.input>;
type ImportCourseResponse = z.infer<typeof api.courses.import.responses[200]>;

export function useCourses() {
  return useQuery({
    queryKey: [api.courses.list.path],
    queryFn: async () => {
      const res = await fetch(api.courses.list.path);
      if (!res.ok) throw new Error("Failed to fetch courses");
      return api.courses.list.responses[200].parse(await res.json());
    },
  });
}

export function useCourse(id: number) {
  return useQuery({
    queryKey: [api.courses.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.courses.get.path, { id });
      const res = await fetch(url);
      if (res.status === 404) throw new Error("Course not found");
      if (!res.ok) throw new Error("Failed to fetch course");
      return api.courses.get.responses[200].parse(await res.json());
    },
    enabled: !isNaN(id),
  });
}

export function useVideo(id: number) {
  return useQuery({
    queryKey: [api.videos.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.videos.get.path, { id });
      const res = await fetch(url);
      if (res.status === 404) throw new Error("Video not found");
      if (!res.ok) throw new Error("Failed to fetch video");
      return api.videos.get.responses[200].parse(await res.json());
    },
    enabled: !isNaN(id) && id > 0,
  });
}

export function useImportCourse() {
  return useMutation({
    mutationFn: async (data: ImportCourseInput) => {
      const res = await fetch(api.courses.import.path, {
        method: api.courses.import.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "Failed to import course");
      }

      return api.courses.import.responses[200].parse(await res.json());
    },
  });
}

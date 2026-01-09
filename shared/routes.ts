import { z } from 'zod';
import { courses, videos, questions } from './schema';

export const errorSchemas = {
  notFound: z.object({ message: z.string() }),
  validation: z.object({ message: z.string(), field: z.string().optional() }),
};

export const api = {
  courses: {
    list: {
      method: 'GET' as const,
      path: '/api/courses',
      responses: {
        200: z.array(z.custom<typeof courses.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/courses/:id',
      responses: {
        200: z.custom<typeof courses.$inferSelect & { videos: (typeof videos.$inferSelect)[] }>(),
        404: errorSchemas.notFound,
      },
    },
    // Mock playlist import
    import: {
      method: 'POST' as const,
      path: '/api/courses/import',
      input: z.object({ playlistUrl: z.string().url() }),
      responses: {
        200: z.object({ courseId: z.number() }),
        400: errorSchemas.validation,
      },
    },
  },
  videos: {
    get: {
      method: 'GET' as const,
      path: '/api/videos/:id',
      responses: {
        200: z.custom<typeof videos.$inferSelect & { questions: (typeof questions.$inferSelect)[] }>(),
        404: errorSchemas.notFound,
      },
    },
  },
};

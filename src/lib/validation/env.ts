import { z } from "zod";

export const envSchema = z.object({
  APP_SECRET: z.string().min(24).optional(),
  DATABASE_URL: z.string().optional()
});

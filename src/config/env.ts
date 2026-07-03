import * as dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  GEMINI_API_KEY: z.string().min(1, "GEMINI_API_KEY is required"),
  GEMINI_MODEL: z.string().default("gemini-2.5-flash"),
  PORT: z
    .string()
    .default("3000")
    .transform((val) => parseInt(val, 10)),
  MAX_IMAGE_SIZE_MB: z
    .string()
    .default("8")
    .transform((val) => parseInt(val, 10)),

  // FLUX Image Generation
  FLUX_API_KEY: z.string().min(1, "FLUX_API_KEY is required"),
  FLUX_ENDPOINT: z.string().url().default("https://gateway.pixazo.ai/flux-1-schnell/v1/getData"),
  FLUX_WIDTH: z
    .string()
    .default("512")
    .transform((val) => parseInt(val, 10)),
  FLUX_HEIGHT: z
    .string()
    .default("512")
    .transform((val) => parseInt(val, 10)),
  FLUX_NUM_STEPS: z
    .string()
    .default("4")
    .transform((val) => parseInt(val, 10)),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  // eslint-disable-next-line no-console
  console.error(
    "❌ Invalid environment variables:",
    parsedEnv.error.flatten().fieldErrors
  );
  throw new Error("Invalid environment variables. Check your .env file.");
}

export const env = parsedEnv.data;

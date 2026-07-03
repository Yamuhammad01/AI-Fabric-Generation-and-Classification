import { Router } from "express";
import { imageGenerationController } from "../controllers/image-generation.controller";
import { asyncHandler } from "../utils/async-handler";

export const imageGenerationRouter = Router();

/**
 * POST /api/generate-image
 * Accepts a JSON body matching the structured fabric analysis schema,
 * builds a prompt, sends it to FLUX, and returns the generated image URL.
 */
imageGenerationRouter.post(
  "/",
  asyncHandler((req, res) => imageGenerationController.generate(req, res))
);
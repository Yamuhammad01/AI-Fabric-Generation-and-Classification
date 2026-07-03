import { Request, Response } from "express";
import { env } from "../config/env";
import {
  GenerateImageRequestSchema,
  GenerateImageResponseDto,
} from "../dto/image-generation.dto";
import { buildPrompt } from "../services/prompt-builder.service";
import { fluxService } from "../services/flux.service";
import { AppError } from "../utils/app-error";

export class ImageGenerationController {
  /**
   * POST /api/generate-image
   * Accepts structured fabric analysis JSON, builds a prompt,
   * sends it to FLUX, and returns the generated image URL.
   */
  async generate(req: Request, res: Response): Promise<void> {
    const validation = GenerateImageRequestSchema.safeParse(req.body);

    if (!validation.success) {
      throw AppError.badRequest(
        "Invalid request body. Expected structured fabric analysis data.",
        validation.error.flatten()
      );
    }

    const analysisData = validation.data;

    // 1. Build the prompt from the structured data
    const prompt = buildPrompt(analysisData);

    // 2. Send the prompt to FLUX
    const generatedImageUrl = await fluxService.generateImage(prompt);

    const responseBody: GenerateImageResponseDto = {
      success: true,
      data: {
        prompt,
        generatedImageUrl,
      },
      meta: {
        model: "flux-1-schnell",
        processedAt: new Date().toISOString(),
      },
    };

    res.status(200).json(responseBody);
  }
}

export const imageGenerationController = new ImageGenerationController();
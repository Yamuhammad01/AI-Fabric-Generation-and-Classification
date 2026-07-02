import { Request, Response } from "express";
import { env } from "../config/env";
import { FabricAnalysisResponseDto } from "../dto/fabric-analysis.dto";
import { fabricAnalysisService } from "../services/fabric-analysis.service";
import { AppError } from "../utils/app-error";

export class FabricAnalysisController {
  async analyze(req: Request, res: Response): Promise<void> {
    const file = req.file;

    // validateUploadedImage middleware already guarantees req.file exists,
    // but we guard again here so this controller is safe to reuse elsewhere.
    if (!file) {
      throw AppError.badRequest("No image file provided.");
    }

    const result = await fabricAnalysisService.analyzeFabricImage(
      file.buffer,
      file.mimetype
    );

    const responseBody: FabricAnalysisResponseDto = {
      success: true,
      data: result,
      meta: {
        model: env.GEMINI_MODEL,
        processedAt: new Date().toISOString(),
        imageSizeBytes: file.size,
        mimeType: file.mimetype,
      },
    };

    res.status(200).json(responseBody);
  }
}

export const fabricAnalysisController = new FabricAnalysisController();

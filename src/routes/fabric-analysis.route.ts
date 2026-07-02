import { Router } from "express";
import { fabricAnalysisController } from "../controllers/fabric-analysis.controller";
import {
  handleMulterError,
  uploadImage,
  validateUploadedImage,
} from "../middleware/image-validation.middleware";
import { asyncHandler } from "../utils/async-handler";

export const fabricAnalysisRouter = Router();

/**
 * POST /api/fabric-analysis
 * multipart/form-data, field name: "image"
 */
fabricAnalysisRouter.post(
  "/",
  uploadImage,
  handleMulterError,
  validateUploadedImage,
  asyncHandler((req, res) => fabricAnalysisController.analyze(req, res))
);

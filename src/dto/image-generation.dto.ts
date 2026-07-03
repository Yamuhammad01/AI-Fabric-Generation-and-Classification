import { z } from "zod";

/**
 * Request body accepted by the standalone generate-image endpoint.
 * Mirrors the shape of FabricAnalysisResult from the Gemini analysis.
 */
export const GenerateImageRequestSchema = z.object({
  fabric_type: z.string(),
  dominant_colors: z.array(z.string()).default([]),
  secondary_colors: z.array(z.string()).default([]),
  pattern: z.string(),
  texture: z.string(),
  material: z.string(),
  complexity: z.string(),
  style: z.string(),
  recommended_garment: z.string(),
  gender: z.string(),
  occasion: z.string(),
  cultural_influences: z.array(z.string()).default([]),
  confidence_score: z.number().min(0).max(1),
  analysis_notes: z.string(),
  care_hint: z.string(),
});

export type GenerateImageRequest = z.infer<typeof GenerateImageRequestSchema>;

export interface GenerateImageResponseDto {
  success: boolean;
  data: {
    prompt: string;
    generatedImageUrl: string;
  };
  meta: {
    model: string;
    processedAt: string;
  };
}
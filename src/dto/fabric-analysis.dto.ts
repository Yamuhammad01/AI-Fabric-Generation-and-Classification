import { z } from "zod";

/**
 * Shape returned by the Gemini model. Validated defensively -
 * LLM output is untrusted input even when responseMimeType is JSON.
 */
export const FabricAnalysisResultSchema = z.object({
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

export type FabricAnalysisResult = z.infer<typeof FabricAnalysisResultSchema>;

export interface FabricAnalysisResponseDto {
  success: true;
  data: FabricAnalysisResult;
  meta: {
    model: string;
    processedAt: string;
    imageSizeBytes: number;
    mimeType: string;
  };
}

export interface ErrorResponseDto {
  success: false;
  message: string;
  details?: unknown;
}

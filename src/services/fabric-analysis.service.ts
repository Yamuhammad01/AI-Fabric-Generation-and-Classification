import { GoogleGenAI } from "@google/genai";
import { env } from "../config/env";
import {
  FabricAnalysisResult,
  FabricAnalysisResultSchema,
} from "../dto/fabric-analysis.dto";
import { AppError } from "../utils/app-error";

const FABRIC_ANALYSIS_PROMPT = `
You are an expert Nigerian textile and fashion analyst.

Analyze this fabric image.

Return ONLY valid JSON.

Schema:

{
  "fabric_type": "",
  "dominant_colors": [],
  "secondary_colors": [],
  "pattern": "",
  "texture": "",
  "material": "",
  "complexity": "",
  "style": "",
  "recommended_garment": "",
  "gender": "",
  "occasion": "",
  "cultural_influences": [],
  "confidence_score": 0.0,
  "analysis_notes": "",
  "care_hint": "",
  "creative_direction": ""
}

The "creative_direction" field is a single concise sentence suggesting a creative scene or concept for a fashion photoshoot featuring this fabric. For example: "A model walking through a bustling Lagos market at golden hour, the fabric catching the warm sunlight." or "A dramatic studio portrait with bold shadows, emphasizing the fabric's texture against a minimalist backdrop." Be imaginative but keep it to one sentence.

Do not return markdown.

Do not return explanations.

Return JSON only.
`;

export class FabricAnalysisService {
  private client: GoogleGenAI;

  constructor() {
    // Constructed once per service instance; the API key is validated
    // at startup via src/config/env.ts, so this never runs with an empty key.
    this.client = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  }

  async analyzeFabricImage(
    imageBuffer: Buffer,
    mimeType: string
  ): Promise<FabricAnalysisResult> {
    const base64Image = imageBuffer.toString("base64");

    let rawText: string | undefined;

    try {
      const response = await this.client.models.generateContent({
        model: env.GEMINI_MODEL,
        contents: [
          {
            role: "user",
            parts: [
              { text: FABRIC_ANALYSIS_PROMPT },
              {
                inlineData: {
                  mimeType,
                  data: base64Image,
                },
              },
            ],
          },
        ],
        config: {
          temperature: 0.2,
          responseMimeType: "application/json",
        },
      });

      rawText = response.text;
    } catch (err) {
      throw AppError.badGateway(
        "Failed to reach the image analysis model. Please try again.",
        err instanceof Error ? err.message : err
      );
    }

    if (!rawText) {
      throw AppError.badGateway("The analysis model returned an empty response.");
    }

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(rawText);
    } catch {
      throw AppError.unprocessable(
        "The analysis model returned a response that was not valid JSON."
      );
    }

    const validation = FabricAnalysisResultSchema.safeParse(parsedJson);

    if (!validation.success) {
      throw AppError.unprocessable(
        "The analysis model's response did not match the expected schema.",
        validation.error.flatten()
      );
    }

    return validation.data;
  }
}

// Singleton instance - the client holds no per-request state.
export const fabricAnalysisService = new FabricAnalysisService();

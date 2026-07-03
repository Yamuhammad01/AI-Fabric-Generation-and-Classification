import {
  FabricAnalysisResult,
} from "../dto/fabric-analysis.dto";

/**
 * Safely retrieves an element from an array, returning a fallback if
 * the index is out of bounds.
 */
function safeArrayGet<T>(arr: T[], index: number, fallback: T): T {
  return index < arr.length ? arr[index] : fallback;
}

/**
 * Builds a rich, descriptive prompt from the structured fabric analysis
 * data returned by Gemini. The prompt is designed to be sent directly to
 * FLUX Pro for photorealistic fashion image generation.
 */
export function buildPrompt(data: FabricAnalysisResult): string {
  const dominantColor1 = safeArrayGet(data.dominant_colors, 0, "N/A");
  const dominantColor2 = safeArrayGet(data.dominant_colors, 1, dominantColor1);
  const secondaryColor1 = safeArrayGet(data.secondary_colors, 0, "N/A");
  const secondaryColor2 = safeArrayGet(data.secondary_colors, 1, secondaryColor1);
  const cultural1 = safeArrayGet(data.cultural_influences, 0, "Nigerian");
  const cultural2 = safeArrayGet(data.cultural_influences, 1, "West African");
  const confidencePct = Math.round(data.confidence_score * 100);

  return `Create a photorealistic Nigerian fashion model, ${data.gender}, wearing a ${data.recommended_garment} made from ${data.fabric_type} fabric (specifically a ${data.material} base with ${data.material} characteristics). The fabric, which has a ${data.texture} visual texture, features a ${data.pattern} pattern that exhibits a ${data.complexity} complexity. The dominant colors are ${dominantColor1} and ${dominantColor2}, accented by secondary colors of ${secondaryColor1} and ${secondaryColor2}. The outfit should reflect ${data.style} Nigerian fashion, deeply inspired by ${cultural1} and ${cultural2} traditions, suitable for ${data.occasion}. An image should reflect an analysis confidence of ${confidencePct}%. Editorial fashion photography. Luxury tailoring. Natural body proportions. Professional studio lighting. Ultra detailed fabric folds. Highly realistic skin tones. Full body composition. 8K. Fashion magazine quality. Note: Care is ${data.care_hint}, suggesting a need to showcase pristine quality. ${data.analysis_notes}.`;
}
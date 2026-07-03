import { env } from "../config/env";
import { AppError } from "../utils/app-error";

interface FluxResponse {
  output: string;
}

/**
 * Service that sends a prompt to the FLUX Pro image generation API
 * and returns the URL of the generated image.
 */
export class FluxService {
  /**
   * Generates an image from the given prompt using FLUX Pro.
   *
   * @param prompt - The text prompt describing the image to generate.
   * @returns The URL of the generated image.
   */
  async generateImage(prompt: string): Promise<string> {
    const body = {
      prompt,
      num_steps: env.FLUX_NUM_STEPS,
      seed: Math.floor(Math.random() * 100000),
      height: env.FLUX_HEIGHT,
      width: env.FLUX_WIDTH,
    };

    let response: Response;

    try {
      response = await fetch(env.FLUX_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
          "Ocp-Apim-Subscription-Key": env.FLUX_API_KEY,
        },
        body: JSON.stringify(body),
      });
    } catch (err) {
      throw AppError.badGateway(
        "Failed to reach the FLUX image generation API.",
        err instanceof Error ? err.message : err
      );
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      throw AppError.badGateway(
        `FLUX API responded with status ${response.status}.`,
        errorText
      );
    }

    let json: FluxResponse;

    try {
      json = (await response.json()) as FluxResponse;
    } catch {
      throw AppError.badGateway(
        "FLUX API returned a response that was not valid JSON."
      );
    }

    if (!json.output) {
      throw AppError.badGateway(
        "FLUX API response did not contain an image URL."
      );
    }

    return json.output;
  }
}

export const fluxService = new FluxService();
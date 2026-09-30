# Fabric Analysis & AI Fashion Design 

An API that analyzes fabric images using **Google Gemini Vision** and generates photorealistic fashion designs using **FLUX.1 Schnell**. Built with a focus on Nigerian textiles; Ankara, Aso-Oke, Adire, and more.

<p align="center">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript&logoColor=white" />
  <img alt="Node.js" src="https://img.shields.io/badge/Node.js-22.x-339933?logo=node.js&logoColor=white" />
  <img alt="Express" src="https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white" />
  <img alt="Gemini" src="https://img.shields.io/badge/Google%20Gemini-2.5%20Flash-4285F4?logo=googlegemini&logoColor=white" />
  <img alt="Zod" src="https://img.shields.io/badge/Validation-Zod%203-3068B7?logo=zod&logoColor=white" />
  <img alt="Vercel" src="https://img.shields.io/badge/Deployed%20on-Vercel-000000?logo=vercel&logoColor=white" />
  <img alt="License: ISC" src="https://img.shields.io/badge/License-ISC-yellow" />
</p>

## Features

- **Fabric Analysis** — Upload a fabric image and get a structured analysis: type, colors, pattern, texture, material, cultural influences, recommended garments, and a creative direction for photoshoots.
- **Image Generation** — Analyze a fabric and auto-generate a fashion photoshoot image in one request (`?generate=true`).
- **Design Studio** — Standalone endpoint that accepts structured analysis JSON and generates a fashion image via FLUX.
- **Manual Design** — Build a design brief from scratch (fabric type, colors, garment, occasion) without uploading an image.
- **Built-in Frontend** — A responsive single-page UI served at the root for analyzing fabrics and generating designs interactively.

## Tech Stack

| Layer | Tech |
|-------|------|
| Language | TypeScript (ES2020) |
| Runtime | Node.js 22 |
| Framework | Express 4 |
| AI Analysis | Google Gemini (`@google/genai`) |
| Image Generation | FLUX.1 Schnell via Pixazo gateway |
| Validation | Zod |
| File Uploads | Multer (in-memory storage) |
| Config | dotenv + Zod-validated env schema |
| Dev Tooling | ts-node-dev, tsc |

## Project Structure

```
public/
  index.html                      # Frontend served by Vercel's CDN
src/
  app.ts                          # Vercel Express application export
  server.ts                       # Local/self-hosted HTTP listener
  config/
    env.ts                        # Zod-validated environment config
  controllers/
    fabric-analysis.controller.ts # Analyze endpoint logic
    image-generation.controller.ts# Generate image endpoint logic
  dto/
    fabric-analysis.dto.ts        # Analysis response & result schemas
    image-generation.dto.ts       # Generate-image request/response DTOs
  middleware/
    error-handler.middleware.ts    # Global 404 + error handler
    image-validation.middleware.ts # Multer setup, magic-byte validation
  routes/
    fabric-analysis.route.ts      # POST /api/fabric-analysis
    image-generation.route.ts     # POST /api/generate-image
  services/
    fabric-analysis.service.ts    # Gemini Vision integration
    flux.service.ts               # FLUX image generation integration
    prompt-builder.service.ts     # Builds rich prompts from analysis data
  utils/
    app-error.ts                  # Typed error class (400/422/500/502)
    async-handler.ts              # Async Express handler wrapper
```

## Getting Started

### Prerequisites

- Node.js 22
- A **Google Gemini API key** ([Get one here](https://aistudio.google.com/app/apikey))
- A **Pixazo / FLUX API key** ([Get one here](https://pixazo.ai))

### Installation

```bash
git clone https://github.com/Yamuhammad01/AI-Fabric-Generation-and-Classification.git
cd fabric-analysis-api
npm install
```

### Environment Setup


Edit `.env` and fill in your keys:

```env
GEMINI_API_KEY="your_gemini_api_key"
GEMINI_MODEL=gemini-2.5-flash
PORT=3000
MAX_IMAGE_SIZE_MB=4

FLUX_API_KEY="your_flux_api_key"
FLUX_ENDPOINT=https://gateway.pixazo.ai/flux-1-schnell/v1/getData
FLUX_WIDTH=512
FLUX_HEIGHT=512
FLUX_NUM_STEPS=4
```

### Development

```bash
npm run dev
```

Server starts at `http://localhost:3000`. The frontend is served at `/`.

### Production

```bash
npm run build
npm start
```

For a complete Vercel walkthrough, including environment variables, Git deployment, CLI deployment, testing, custom domains, and troubleshooting, see **[DEPLOYMENT.md](DEPLOYMENT.md)**.

## API Endpoints

### Health Check

```
GET /health
```

```json
{ "success": true, "status": "ok", "server": "Server is running" }
```

---

### Analyze Fabric

```
POST /api/fabric-analysis
Content-Type: multipart/form-data
Body: image (file, required)
Query: generate=true (optional, triggers image generation)
```

**Upload a fabric image** (JPEG, PNG, or WEBP; maximum 4 MB so multipart requests stay under Vercel's 4.5 MB request limit). Returns structured analysis JSON.

With `?generate=true`, the response additionally includes a `prompt` and `generatedImageUrl` from FLUX.

**Response (200):**

```json
{
  "success": true,
  "data": {
    "fabric_type": "Ankara",
    "dominant_colors": ["indigo", "gold"],
    "secondary_colors": ["cream"],
    "pattern": "geometric",
    "texture": "smooth woven",
    "material": "cotton wax print",
    "complexity": "high",
    "style": "contemporary Nigerian",
    "recommended_garment": "Buba and Iro",
    "gender": "female",
    "occasion": "Traditional Wedding",
    "cultural_influences": ["Yoruba", "West African"],
    "confidence_score": 0.92,
    "analysis_notes": "...",
    "care_hint": "Hand wash cold, hang dry",
    "creative_direction": "A model walking through a bustling Lagos market at golden hour..."
  },
  "meta": {
    "model": "gemini-2.5-flash",
    "processedAt": "2025-01-01T00:00:00.000Z",
    "imageSizeBytes": 1048576,
    "mimeType": "image/jpeg"
  }
}
```

**With `?generate=true`**, the `data` shape changes to:

```json
{
  "data": {
    "analysis": { "...full analysis object..." },
    "prompt": "A model walking through...",
    "generatedImageUrl": "https://..."
  }
}
```

---

### Generate Image from Analysis

```
POST /api/generate-image
Content-Type: application/json
Body: FabricAnalysisResult JSON
```

Accepts a structured fabric analysis object (same shape as the analysis response), builds a detailed prompt, sends it to FLUX, and returns the generated image URL.

**Request Body:**

```json
{
  "fabric_type": "Ankara",
  "dominant_colors": ["indigo", "gold"],
  "secondary_colors": ["cream"],
  "pattern": "geometric",
  "texture": "smooth woven",
  "material": "cotton wax print",
  "complexity": "high",
  "style": "contemporary Nigerian",
  "recommended_garment": "Buba and Iro",
  "gender": "female",
  "occasion": "Traditional Wedding",
  "cultural_influences": ["Yoruba", "West African"],
  "confidence_score": 0.92,
  "analysis_notes": "...",
  "care_hint": "Hand wash cold",
  "creative_direction": "A model walking through a bustling Lagos market..."
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "prompt": "A model walking through a bustling Lagos market...",
    "generatedImageUrl": "https://..."
  },
  "meta": {
    "model": "flux-1-schnell",
    "processedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

---

## Error Responses

All errors follow a consistent envelope:

```json
{
  "success": false,
  "message": "Error description",
  "details": {}
}
```

| Status | Meaning |
|--------|---------|
| 400 | Bad request (missing file, invalid type, file too large, malformed body) |
| 404 | Route not found |
| 422 | Model returned unexpected output (invalid JSON or schema mismatch) |
| 500 | Unexpected server error |
| 502 | Upstream API failure (Gemini or FLUX unreachable/errored) |

## Image Validation

Uploaded images go through multi-layer validation:

1. **MIME type check** — Only `image/jpeg`, `image/png`, `image/webp` allowed
2. **Magic-byte verification** — File contents are checked against known signatures (JPEG `FF D8 FF`, PNG `89 50 4E 47`, WEBP `RIFF....WEBP`) to prevent spoofed headers
3. **Size limit** — Configurable from 1 to 4 MB via `MAX_IMAGE_SIZE_MB` (default 4 MB)

## Frontend

The built-in frontend at `/` provides:

- **Fabric Vision** — Upload a photo, get AI analysis, then optionally generate a fashion design in one flow
- **Design Studio** — Manually build a design brief with fabric type, pattern, garment, colors, occasion, and complexity, then generate a fashion image

## License

This project is licensed under the MIT License.

---
## Author
 **Muhammad Idris**

• GitHub: https://github.com/Yamuhammad01 <br>
• LinkedIn: https://www.linkedin.com/in/muhammad-idrisb2/ <br>
• Email: idrismuhd814@gmail.com <br>
• Live Demo: https://ai-fabric-generation-and-classifica.vercel.app/ <br>

---

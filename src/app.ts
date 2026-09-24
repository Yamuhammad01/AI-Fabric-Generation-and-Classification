import express from "express";
import path from "path";
import {
  errorHandler,
  notFoundHandler,
} from "./middleware/error-handler.middleware";
import { fabricAnalysisRouter } from "./routes/fabric-analysis.route";
import { imageGenerationRouter } from "./routes/image-generation.route";

const app = express();

app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({ success: true, status: "ok", server: "Server is running" });
});

app.use("/api/fabric-analysis", fabricAnalysisRouter);
app.use("/api/generate-image", imageGenerationRouter);

// Vercel serves files in public/ through its CDN and ignores express.static().
// Keeping this middleware also makes the built-in frontend work with npm run dev
// and npm start outside Vercel.
app.use(express.static(path.join(__dirname, "../public")));

app.use(notFoundHandler);
app.use(errorHandler);

export default app;

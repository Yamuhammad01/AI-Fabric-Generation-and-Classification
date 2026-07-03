import express from "express";
import { env } from "./config/env";
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

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(` Fabric analysis API running on port ${env.PORT}`);
});

export default app;

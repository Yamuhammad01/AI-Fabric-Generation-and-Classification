import express from "express";
import { env } from "./config/env";
import {
  errorHandler,
  notFoundHandler,
} from "./middleware/error-handler.middleware";
import { fabricAnalysisRouter } from "./routes/fabric-analysis.route";

const app = express();

app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({ success: true, status: "ok" });
});

app.use("/api/fabric-analysis", fabricAnalysisRouter);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`🚀 Fabric analysis API running on port ${env.PORT}`);
});

export default app;

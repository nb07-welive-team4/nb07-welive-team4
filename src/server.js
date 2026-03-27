const express = require("express");
const cors = require("cors");
const { getEnv } = require("./config/env");

const env = getEnv();
const app = express();

app.use(cors({ origin: env.CORS_ORIGIN === "*" ? true : env.CORS_ORIGIN }));
app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({
    ok: true,
    service: "codequest-api",
    env: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/ping", (req, res) => {
  res.status(200).json({
    message: "pong",
    success: true,
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Not Found",
  });
});

app.listen(env.PORT, () => {
  console.log(`[BOOT] api is running on port ${env.PORT}`);
});
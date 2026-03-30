import express from "express";
import dotenv from "dotenv";

import apartmentRouter from "./routes/apartment.routes";

import { errorHandler } from "./middlewares/errorHandler.middleware";
import { setupSwagger } from "./docs/swagger";

dotenv.config();

const app = express();
const PORT = process.env.PORT ?? 3000;

// ── 미들웨어 ──────────────────────────────────────────
app.use(express.json());

// ── Swagger ───────────────────────────────────────────
setupSwagger(app);

// ── 헬스 체크 ─────────────────────────────────────────
app.get("/api", (_req, res) => {
  res.json({ message: "위리브 API 서버가 실행 중입니다." });
});

// ── 라우터 ────────────────────────────────────────────
app.use("/api/apartments", apartmentRouter);

// ── 에러 핸들러 (반드시 라우터 아래에 위치) ────────────
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`);
  console.log(`Swagger: http://localhost:${PORT}/api-docs`);
});

export default app;
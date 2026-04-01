import express from "express";
import dotenv from "dotenv";

import apartmentRouter from "./routes/apartment.routes";

import { errorHandler } from "./middlewares/errorHandler";
import { setupSwagger } from "./docs/swagger";

dotenv.config();

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(express.json());

setupSwagger(app);

app.get("/api", (_req, res) => {
  res.json({ message: "?�리�?API ?�버가 ?�행 중입?�다." });
});

app.use("/api/apartments", apartmentRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Swagger: http://localhost:${PORT}/api-docs`);
});

export default app;

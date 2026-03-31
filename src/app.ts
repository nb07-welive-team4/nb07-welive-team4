import express from "express";
import dotenv from "dotenv";
import authRouter from "./routes/auth.route";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
app.use(cookieParser());

const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use("/auth", authRouter);

app.listen(PORT, () => {
  console.log(`🚀 Server is actually running on port ${PORT}`);
});

export default app;

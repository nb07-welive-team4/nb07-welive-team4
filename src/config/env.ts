export interface Env {
  NODE_ENV: string;
  PORT: number;
  CORS_ORIGIN: string;
  JWT_ACCESS_SECRET: string;
  JWT_REFRESH_SECRET: string;
}

export function getEnv(): Env {
  const port = Number(process.env.PORT ?? 4000);

  if (Number.isNaN(port)) {
    throw new Error("PORT must be a number");
  }

  if (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET) {
    throw new Error("JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be set in environment variables");
  }

  return {
    NODE_ENV: process.env.NODE_ENV ?? "development",
    PORT: port,
    CORS_ORIGIN: process.env.CORS_ORIGIN ?? "*",
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  };
}

export const env = {
  REDIS_URL: process.env.REDIS_URL || "redis://host.docker.internal:6379",
  PORT: process.env.PORT ?? "4000",
  NODE_ENV: process.env.NODE_ENV ?? "development",
};

const requiredEnv = [];

function getEnv() {
  const env = {
    NODE_ENV: process.env.NODE_ENV || "development",
    PORT: Number(process.env.PORT || 3000),
    CORS_ORIGIN: process.env.CORS_ORIGIN || "*",
  };

  const missing = requiredEnv.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error("[ENV ERROR] Missing required environment variables:");
    missing.forEach((key) => console.error(`- ${key}`));
    process.exit(1);
  }

  return env;
}

module.exports = { getEnv };
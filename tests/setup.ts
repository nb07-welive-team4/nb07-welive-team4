process.env.JWT_SECRET = "test_secret_key_12345";
process.env.ACCESS_TOKEN_SECRET = "test_access_token_secret_123";
process.env.REFRESH_TOKEN_SECRET = "test_refresh_token_secret_123";

// AWS S3 관련 (mocking)
process.env.AWS_REGION = "ap-northeast-2";
process.env.S3_BUCKET = "mock-bucket";
process.env.AWS_ACCESS_KEY_ID = "mock-key";
process.env.AWS_SECRET_ACCESS_KEY = "mock-secret";

process.env.NODE_ENV = "test";

import { jest } from "@jest/globals";
import jwt from "jsonwebtoken";


jest.unstable_mockModule("../src/lib/redis", () => ({
  redisPub: {
    publish: jest.fn<() => Promise<number>>().mockResolvedValue(1),
    xadd: jest.fn<() => Promise<string>>().mockResolvedValue("1-0"),
    on: jest.fn(),
  },
  redisSub: {
    subscribe: jest.fn(),
    on: jest.fn(),
  },
  redisQueueConnection: {},
}));

jest.unstable_mockModule("../src/queue/notification.queue", () => ({
  createNotificationQueue: jest.fn(),
  getNotificationQueue: jest.fn().mockReturnValue({
    add: jest.fn<() => Promise<unknown>>().mockResolvedValue({}),
    getWaitingCount: jest.fn<() => Promise<number>>().mockResolvedValue(2),
    getActiveCount: jest.fn<() => Promise<number>>().mockResolvedValue(1),
    getCompletedCount: jest.fn<() => Promise<number>>().mockResolvedValue(10),
    getFailedCount: jest.fn<() => Promise<number>>().mockResolvedValue(3),
    getDelayedCount: jest.fn<() => Promise<number>>().mockResolvedValue(0),
    getFailed: jest.fn<() => Promise<unknown[]>>().mockResolvedValue([]),
  }),
}));

jest.unstable_mockModule("../src/routes/upload.route", async () => {
  const { default: express } = await import("express");
  return { default: express.Router() };
});

jest.unstable_mockModule("../src/lib/s3", () => ({
  s3: { send: jest.fn() },
}));

const request = (await import("supertest")).default;
const app = (await import("../src/app")).default;

const jwtSecret = process.env.JWT_ACCESS_SECRET;

if (!jwtSecret) {
  throw new Error("JWT_ACCESS_SECRET is required for queue.api.test.ts");
}

const superAdminToken = jwt.sign(
  {
    id: "test-super-admin-id",
    username: "test_superadmin",
    role: "SUPER_ADMIN",
  },
  jwtSecret,
  { expiresIn: "15m" },
);

const authCookie = [`accessToken=${superAdminToken}`];

describe("Queue API", () => {
  describe("GET /api/queue/notifications/summary", () => {
    it("200을 반환해야 한다", async () => {
      const res = await request(app)
        .get("/api/queue/notifications/summary")
        .set("Cookie", authCookie);

      expect(res.status).toBe(200);
    });

    it("waiting / active / completed / failed / delayed 키를 포함해야 한다", async () => {
      const res = await request(app)
        .get("/api/queue/notifications/summary")
        .set("Cookie", authCookie);

      expect(res.body).toHaveProperty("waiting");
      expect(res.body).toHaveProperty("active");
      expect(res.body).toHaveProperty("completed");
      expect(res.body).toHaveProperty("failed");
      expect(res.body).toHaveProperty("delayed");
    });

    it("각 카운트 값이 숫자여야 한다", async () => {
      const res = await request(app)
        .get("/api/queue/notifications/summary")
        .set("Cookie", authCookie);

      expect(typeof res.body.waiting).toBe("number");
      expect(typeof res.body.active).toBe("number");
      expect(typeof res.body.completed).toBe("number");
      expect(typeof res.body.failed).toBe("number");
      expect(typeof res.body.delayed).toBe("number");
    });
  });

  describe("GET /api/queue/notifications/failed", () => {
    it("200을 반환해야 한다", async () => {
      const res = await request(app)
        .get("/api/queue/notifications/failed")
        .set("Cookie", authCookie);

      expect(res.status).toBe(200);
    });

    it("배열 형태를 반환해야 한다", async () => {
      const res = await request(app)
        .get("/api/queue/notifications/failed")
        .set("Cookie", authCookie);

      expect(Array.isArray(res.body)).toBe(true);
    });
  });
});
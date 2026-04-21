import { jest } from "@jest/globals";

// Redis / BullMQ 실제 연결 차단
jest.mock("../src/lib/redis", () => ({
  redisPub: {
    publish: jest.fn().mockResolvedValue(1),
    xadd: jest.fn().mockResolvedValue("1-0"),
    on: jest.fn(),
  },
  redisSub: { subscribe: jest.fn(), on: jest.fn() },
  redisQueueConnection: {},
}));

jest.mock("bullmq", () => ({
  Queue: jest.fn().mockImplementation(() => ({
    add: jest.fn().mockResolvedValue({}),
    getWaitingCount: jest.fn().mockResolvedValue(2),
    getActiveCount: jest.fn().mockResolvedValue(1),
    getCompletedCount: jest.fn().mockResolvedValue(10),
    getFailedCount: jest.fn().mockResolvedValue(3),
    getDelayedCount: jest.fn().mockResolvedValue(0),
    getFailed: jest.fn().mockResolvedValue([]),
  })),
  Worker: jest.fn().mockImplementation(() => ({
    on: jest.fn(),
  })),
}));

jest.mock("../src/routes/upload.route", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const express = require("express");
  return express.Router();
});

jest.mock("../src/lib/s3", () => ({
  s3: { send: jest.fn() },
}));

import request from "supertest";
import app from "../src/app";

describe("Queue API", () => {
  describe("GET /api/queue/notifications/summary", () => {
    it("200을 반환해야 한다", async () => {
      const res = await request(app).get("/api/queue/notifications/summary");
      expect(res.status).toBe(200);
    });

    it("waiting / active / completed / failed / delayed 키를 포함해야 한다", async () => {
      const res = await request(app).get("/api/queue/notifications/summary");
      expect(res.body).toHaveProperty("waiting");
      expect(res.body).toHaveProperty("active");
      expect(res.body).toHaveProperty("completed");
      expect(res.body).toHaveProperty("failed");
      expect(res.body).toHaveProperty("delayed");
    });

    it("각 카운트 값이 숫자여야 한다", async () => {
      const res = await request(app).get("/api/queue/notifications/summary");
      expect(typeof res.body.waiting).toBe("number");
      expect(typeof res.body.active).toBe("number");
      expect(typeof res.body.completed).toBe("number");
      expect(typeof res.body.failed).toBe("number");
      expect(typeof res.body.delayed).toBe("number");
    });
  });

  describe("GET /api/queue/notifications/failed", () => {
    it("200을 반환해야 한다", async () => {
      const res = await request(app).get("/api/queue/notifications/failed");
      expect(res.status).toBe(200);
    });

    it("배열 형태를 반환해야 한다", async () => {
      const res = await request(app).get("/api/queue/notifications/failed");
      expect(Array.isArray(res.body)).toBe(true);
    });
  });
});

import { getEnv } from "./env";

describe("getEnv", () => {
  it("returns PORT default 4000 when not set", () => {
    delete process.env.PORT;
    process.env.JWT_ACCESS_SECRET = "test_access";
    process.env.JWT_REFRESH_SECRET = "test_refresh";
    expect(getEnv().PORT).toBe(4000);
  });
});

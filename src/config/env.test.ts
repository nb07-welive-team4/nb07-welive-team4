import { getEnv } from './env.js';

describe('getEnv', () => {
  it('returns PORT default 3000 when not set', () => {
    delete process.env.PORT;
    expect(getEnv().PORT).toBe(3000);
  });
});

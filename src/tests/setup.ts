jest.mock("../utils/redisClient", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    setEx: jest.fn(),
    del: jest.fn(),
    isOpen: true,
  },
  connectRedis: jest.fn(),
}));

import request from "supertest";
import app from "../app";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
let mongo: MongoMemoryServer;

describe("Player API", () => {
  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    const uri = mongo.getUri();
    await mongoose.connect(uri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongo.stop();
  });

  afterEach(async () => {
    const collections = await mongoose.connection.db.collections();
    for (const col of collections) {
      await col.deleteMany({});
    }
  });

  it("should create a new player", async () => {
    const res = await request(app).post("/api/players").send({
      nickname: "Test Player",
      backNumber: 99,
      position: "delantero",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("success");
  });

  it("should get a list of players", async () => {
    const res = await request(app).get("/api/players");
    expect(res.statusCode).toBe(200);
    expect(res.body.players).toBeInstanceOf(Array);
  });
});

import request from "supertest";
import app from "../app";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import Player from "../models/player.model";

let mongo: MongoMemoryServer;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

afterEach(async () => {
  await mongoose.connection.db.dropDatabase();
});

describe("LineUp API", () => {
  it("should create a valid lineup (4-4-2)", async () => {
    // Create 11 players with correct positions
    const positions = [
      ...Array(4).fill("defensa"),
      ...Array(4).fill("mediocentro"),
      ...Array(2).fill("delantero"),
      "portero",
    ];

    const players = await Player.insertMany(
      positions.map((pos, i) => ({
        nickname: `P${i}`,
        backNumber: i + 1,
        position: pos,
      }))
    );

    const res = await request(app)
      .post("/api/lineups")
      .send({
        formation: "4-4-2",
        type: "local",
        players: players.map((p) => p._id),
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("_id");
    expect(res.body.players.length).toBe(11);
  });

  it("should fail if formation is invalid", async () => {
    const res = await request(app).post("/api/lineups").send({
      formation: "9-0-1",
      type: "visitante",
      players: [],
    });

    expect(res.statusCode).toBe(400);
  });
});

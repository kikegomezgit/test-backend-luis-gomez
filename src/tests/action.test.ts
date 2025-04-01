import request from "supertest";
import app from "../app";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import Player from "../models/player.model";
import LineUp from "../models/lineUp.model";

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

describe("Action API", () => {
  it("should create a valid action for a player", async () => {
    const positions = [
      ...Array(4).fill("defensa"),
      ...Array(4).fill("mediocentro"),
      ...Array(2).fill("delantero"),
      "portero",
    ];

    const players = await Player.insertMany(
      positions.map((pos, index) => ({
        nickname: `Player ${index + 1}`,
        backNumber: index + 1,
        position: pos,
      }))
    );

    const targetPlayer = players.find((p) => p.position === "delantero");
    const lineup = await LineUp.create({
      formation: "4-4-2",
      type: "local",
      players: players.map((p) => p._id),
    });

    const res = await request(app).post("/api/actions").send({
      type: "gol",
      minute: 12,
      player: targetPlayer!._id.toString(),
      lineUp: lineup._id.toString(),
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
  });
  it("should not allow creating an action with invalid player", async () => {
    const res = await request(app).post("/api/actions").send({
      type: "gol",
      minute: 10,
      player: new mongoose.Types.ObjectId(),
      lineUp: new mongoose.Types.ObjectId(),
    });

    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty("message");
  });
});

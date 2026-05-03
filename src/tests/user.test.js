import request from "supertest";
import express from "express";
import bcrypt from "bcrypt";
import AppDataSource from "../config/data-source.js";

const app = express();
app.use(express.json());

beforeAll(async () => {
  await AppDataSource.initialize();
  const userRepository = AppDataSource.getRepository("User");

  app.post("/users", async (req, res) => {
    try {
      const { name, email, password, age, role } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = userRepository.create({
        name, email, age,
        password: hashedPassword,
        role: role || "user"
      });
      const savedUser = await userRepository.save(newUser);
      res.status(201).json({ message: "User created successfully", user: savedUser });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
});

afterAll(async () => {
  const userRepository = AppDataSource.getRepository("User");
  await userRepository.delete({ email: "testuser@test.com" });
  await AppDataSource.destroy();
});

describe("POST /users", () => {
  it("should create a new user and store in database", async () => {
    const res = await request(app).post("/users").send({
      name: "Test User",
      email: "testuser@test.com",
      password: "123456",
      age: 25
    });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("User created successfully");
    expect(res.body.user.email).toBe("testuser@test.com");
    expect(res.body.user.role).toBe("user");

    // Verify in database
    const userRepository = AppDataSource.getRepository("User");
    const userInDb = await userRepository.findOneBy({ email: "testuser@test.com" });
    expect(userInDb).not.toBeNull();
    expect(userInDb.name).toBe("Test User");
  });
});
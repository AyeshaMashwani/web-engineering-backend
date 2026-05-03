import express from "express";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import AppDataSource from "./config/data-source.js";

import loggerMiddleware from "./middleware/loggerMiddleware.js";
import validateRegister from "./middleware/validateRegister.js";
import validateLogin from "./middleware/validateLogin.js";
import authMiddleware from "./middleware/authMiddleware.js";
import roleMiddleware from "./middleware/roleMiddleware.js";
import errorMiddleware from "./middleware/errorMiddleware.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(loggerMiddleware);

const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );
};

app.get("/", (req, res) => {
  res.send("Server is running");
});

AppDataSource.initialize()
  .then(() => {
    console.log("Database connected successfully");

    const userRepository = AppDataSource.getRepository("User");
    const resultRepository = AppDataSource.getRepository("Result"); // Added for Lab Task

    // -----------------------------------------------------------
    // LAB TASK ROUTES (Results)
    // -----------------------------------------------------------

    // TASK: add route to fetch all results
    app.get("/results/all", async (req, res, next) => {
      try {
        const allResults = await resultRepository.find();
        res.status(200).json(allResults);
      } catch (error) {
        next(error);
      }
    });

    // TASK: add route to fetch results of one student
    app.get("/results/student/:name", async (req, res, next) => {
      try {
        const studentName = req.params.name;
        const studentResults = await resultRepository.findBy({ 
          student_name: studentName 
        });
        res.status(200).json(studentResults);
      } catch (error) {
        next(error);
      }
    });

    // -----------------------------------------------------------
    // EXISTING AUTH ROUTES
    // -----------------------------------------------------------

    app.post("/users", async (req, res, next) => {
      try {
        const { name, email, age, password, role } = req.body;
        if (!name || !email || !password) {
          return res.status(400).json({ message: "Name, email and password are required" });
        }
        const existingUser = await userRepository.findOneBy({ email });
        if (existingUser) return res.status(400).json({ message: "Email already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = userRepository.create({
          name, email, age, password: hashedPassword, role: role || "user"
        });
        const savedUser = await userRepository.save(newUser);
        res.status(201).json({
          message: "User created successfully",
          user: { id: savedUser.id, name: savedUser.name, email: savedUser.email, role: savedUser.role }
        });
      } catch (error) { next(error); }
    });

    app.post("/register", validateRegister, async (req, res, next) => {
      try {
        const { name, email, password, age } = req.body;
        const existingUser = await userRepository.findOneBy({ email });
        if (existingUser) return res.status(400).json({ message: "Email already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = userRepository.create({
          name, email, password: hashedPassword, age, role: "user"
        });
        const savedUser = await userRepository.save(newUser);
        res.status(201).json({ message: "User registered successfully", user: { id: savedUser.id, name: savedUser.name, email: savedUser.email } });
      } catch (error) { next(error); }
    });

    app.post("/login", validateLogin, async (req, res, next) => {
      try {
        const { email, password } = req.body;
        const user = await userRepository.findOneBy({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
          return res.status(400).json({ message: "Invalid email or password" });
        }
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);
        user.refreshToken = refreshToken;
        await userRepository.save(user);
        res.json({ message: "Login successful", accessToken, refreshToken, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
      } catch (error) { next(error); }
    });

    app.post("/refresh", async (req, res, next) => {
      try {
        const { refreshToken } = req.body;
        if (!refreshToken) return res.status(401).json({ message: "Refresh token required" });
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const user = await userRepository.findOneBy({ id: decoded.id });
        if (!user || user.refreshToken !== refreshToken) return res.status(403).json({ message: "Invalid refresh token" });
        const newAccessToken = generateAccessToken(user);
        res.json({ accessToken: newAccessToken });
      } catch (error) { next(error); }
    });

    app.post("/logout", authMiddleware, async (req, res, next) => {
      try {
        const user = await userRepository.findOneBy({ id: req.user.id });
        if (!user) return res.status(404).json({ message: "User not found" });
        user.refreshToken = null;
        await userRepository.save(user);
        res.json({ message: "Logged out successfully" });
      } catch (error) { next(error); }
    });

    app.get("/profile", authMiddleware, async (req, res, next) => {
      try {
        const user = await userRepository.findOneBy({ id: req.user.id });
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json({ message: "Profile fetched successfully", user: { id: user.id, name: user.name, email: user.email, role: user.role } });
      } catch (error) { next(error); }
    });

    app.get("/admin", authMiddleware, roleMiddleware("admin"), async (req, res, next) => {
      try { res.json({ message: "Welcome Admin" }); } catch (error) { next(error); }
    });

    app.get("/users", async (req, res, next) => {
      try {
        const users = await userRepository.find();
        const safeUsers = users.map(({ password, refreshToken, ...user }) => user);
        res.json(safeUsers);
      } catch (error) { next(error); }
    });

    app.use(errorMiddleware);

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Database connection failed:", error);
  });
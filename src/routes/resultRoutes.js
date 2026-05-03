import express from "express";
import AppDataSource from "../config/data-source.js";

const router = express.Router();
const resultRepo = AppDataSource.getRepository("Result");

// TASK: add route to fetch all results
router.get("/all", async (req, res) => {
    try {
        const allResults = await resultRepo.find();
        res.status(200).json(allResults);
    } catch (error) {
        res.status(500).json({ message: "Error fetching data", error });
    }
});

// TASK: add route to fetch results of one student
// Example call: http://localhost:3000/results/student/Ali
router.get("/student/:name", async (req, res) => {
    try {
        const studentName = req.params.name;
        const studentResults = await resultRepo.findBy({ student_name: studentName });
        
        res.status(200).json(studentResults);
    } catch (error) {
        res.status(500).json({ message: "Error fetching student data", error });
    }
});

export default router;
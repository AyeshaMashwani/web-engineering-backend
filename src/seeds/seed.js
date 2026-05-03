import AppDataSource from "../config/data-source.js";

async function seedDatabase() {
  try {
    await AppDataSource.initialize();
    console.log("Database connected for seeding");

    const userRepository = AppDataSource.getRepository("User");
    const resultRepository = AppDataSource.getRepository("Result");

    // -----------------------------
    // Seed Users (3 Users - Required)
    // -----------------------------
    const users = [
      { name: "Ali", email: "ali@gmail.com", age: 21 },
      { name: "Ayesha", email: "ayesha@gmail.com", age: 22 },
      { name: "Ahmed", email: "ahmed@gmail.com", age: 20 }
    ];

    for (const userData of users) {
      const existingUser = await userRepository.findOneBy({ email: userData.email });
      if (!existingUser) {
        const newUser = userRepository.create(userData);
        await userRepository.save(newUser);
        console.log(`Inserted user: ${userData.email}`);
      } else {
        console.log(`User already exists: ${userData.email}`);
      }
    }

    // -----------------------------
    // Seed Results (5 Results - Required)
    // -----------------------------
    const results = [
      { student_name: "Ali", subject: "Math", marks: 85, grade: "A" },
      { student_name: "Ayesha", subject: "Science", marks: 78, grade: "B" },
      { student_name: "Ahmed", subject: "English", marks: 92, grade: "A+" },
      // Added two more results to satisfy the "seed 5 student results" task
      { student_name: "Ali", subject: "Programming", marks: 90, grade: "A" },
      { student_name: "Ahmed", subject: "Database", marks: 88, grade: "A" }
    ];

    for (const resultData of results) {
      const existingResult = await resultRepository.findOneBy({
        student_name: resultData.student_name,
        subject: resultData.subject
      });

      if (!existingResult) {
        const newResult = resultRepository.create(resultData);
        await resultRepository.save(newResult);
        console.log(`Inserted result: ${resultData.student_name} - ${resultData.subject}`);
      } else {
        console.log(`Result already exists: ${resultData.student_name} - ${resultData.subject}`);
      }
    }

    console.log("Seeding completed successfully");
    await AppDataSource.destroy();
    console.log("Database connection closed");
  } catch (error) {
    console.error("Seeding failed:", error);
  }
}

seedDatabase();
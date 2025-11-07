import mongoose from "mongoose";
import UE from "./model/UE.js";
import User from "./model/User.js";
import { connectDB } from "./db.mjs";

// High-level (top-level) await is supported in ESM. No wrapper function needed.
await connectDB();

try {
  // Seed only if collection empty to avoid duplicates on every run
  const existing = await UE.countDocuments({ name: "Python" });
  if (existing === 0) {
    const stud1 = await User.create({ name: "Stud_1" });
    const stud2 = await User.create({ name: "Stud_2" });
    const teacher_L1 = await User.create({
      name: "Dupont",
      email: "dupont@univ.fr",
    });

    await UE.create({
      name: "Python",
      teacher: teacher_L1._id,
      students: [
        { student: stud1._id, mark: 15 },
        { student: stud2._id, mark: 17 },
      ],
    });
    console.log("[seed] Inserted sample data");
  }

  // Find the UE with the name "Python" and log the average mark via instance method
  const ue = await UE.findOne({ name: "Python" }).populate("teacher");
  if (ue) {
    console.log("Instance average():", ue.average());
    if (ue.teacher) {
      console.log("Teacher:", {
        name: ue.teacher.name,
        email: ue.teacher.email,
      });
    } else {
      console.log("Teacher not found or not populated");
    }
  }

  // Compute average using aggregation pipeline (match by name for portability)
  const result = await UE.aggregate([
    { $match: { name: "Python" } },
    { $unwind: "$students" },
    { $group: { _id: "$name", averageMark: { $avg: "$students.mark" } } },
  ]);
  console.log("Aggregate pipeline result:", result);
} catch (error) {
  console.error(error);
} finally {
  await mongoose.connection.close();
  console.log("[db] Connection closed");
}

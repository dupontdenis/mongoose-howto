import mongoose from "mongoose";
import UE from "./model/UE.js";
import User from "./model/User.js";

mongoose.connect("mongodb://127.0.0.1:27017/licence");

const stud1 = await User.create({
  name: "Stud_1",
});

const stud2 = await User.create({
  name: "Stud_2",
});

const teacher_L1 = await User.create({
  name: "Dupont",
  email: "dupont@univ.fr",
});

// Create a new UE and insert into database
const python = await UE.create({
  name: "Python",
  teacher: teacher_L1._id,
  students: [
    { student: stud1._id, mark: 15 },
    { student: stud2._id, mark: 17 },
  ],
});

// Find the UE with the name "Python" and log the average mark
const ue = await UE.findOne({ name: "Python" });
console.log(ue.average());

// Find the UE with the name "Python" and log the average mark using the aggregate method
try {
  const result = await UE.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId("662a7a082423e2fafc3c19e4"),
      },
    },
    {
      $unwind: "$students",
    },
    {
      $group: {
        _id: "$_id",
        averageMark: { $avg: "$students.mark" },
      },
    },
  ]); // replace someAsyncFunction with the actual function
  console.log(result);
} catch (error) {
  console.error(error);
}

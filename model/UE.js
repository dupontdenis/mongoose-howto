import mongoose from "mongoose";
const { Schema, SchemaTypes, model } = mongoose;

const ue = new Schema({
  name: String,
  teacher: {
    type: SchemaTypes.ObjectId,
    ref: "User",
  },
  students: [
    {
      student: {
        type: SchemaTypes.ObjectId,
        ref: "User",
      },
      mark: Number,
    },
  ],
});

// Add a method to the schema
ue.methods.average = function () {
  return (
    this.students.reduce((sum, { mark }) => sum + mark, 0) /
    this.students.length
  );
};

const UE = model("UE", ue);
export default UE;

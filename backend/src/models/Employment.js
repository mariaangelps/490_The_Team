import mongoose from "mongoose";

const employmentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true, required: true },
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: String,
    startDate: { type: String, required: true }, // YYYY-MM-DD
    endDate: { type: String, default: null },
    current: { type: Boolean, default: false },
    description: String,
  },
  { timestamps: true }
);

export default mongoose.model("Employment", employmentSchema);

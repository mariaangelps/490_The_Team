import mongoose from "mongoose";

const EmploymentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true, required: true },
    title: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    location: { type: String, default: "" },
    startDate: { type: String, required: true }, // ISO yyyy-mm or yyyy-mm-dd
    endDate: { type: String, default: null },    // null if current
    current: { type: Boolean, default: false },
    description: { type: String, default: "" }
  },
  { timestamps: true }
);

export default mongoose.model("Employment", EmploymentSchema);

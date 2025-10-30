import mongoose from "mongoose";

const ProfileBasicSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true, unique: true },
    fullName: String,
    email: String,
    phone: String,
    city: String,
    state: String,
    headline: String,
    bio: { type: String, maxlength: 500 },
    industry: String,
    experience: String, // "Entry" | "Mid" | "Senior" | "Executive"
  },
  { timestamps: true }
);

export default mongoose.model("ProfileBasic", ProfileBasicSchema);

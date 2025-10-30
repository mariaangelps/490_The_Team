// backend/src/models/Skill.js  (ESM)
import mongoose from "mongoose";

export const PROFICIENCIES = ["Beginner", "Intermediate", "Advanced", "Expert"];
export const CATEGORIES = ["Technical", "Soft Skills", "Languages", "Industry-Specific"];

const SkillSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true, required: true },
    name: { type: String, required: true, trim: true, maxlength: 64 },
    normalizedName: { type: String, required: true, trim: true, maxlength: 64 },
    category: { type: String, enum: CATEGORIES, required: true },
    proficiency: { type: String, enum: PROFICIENCIES, required: true },
  },
  { timestamps: true }
);

SkillSchema.index({ user: 1, normalizedName: 1 }, { unique: true });

SkillSchema.pre("validate", function (next) {
  if (this.name) this.normalizedName = this.name.trim().toLowerCase();
  next();
});

export const Skill = mongoose.model("Skill", SkillSchema);

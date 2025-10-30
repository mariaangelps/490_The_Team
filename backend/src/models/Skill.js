import mongoose from "mongoose";

const PROFICIENCIES = ["Beginner", "Intermediate", "Advanced", "Expert"];
const CATEGORIES = ["Technical", "Soft Skills", "Languages", "Industry-Specific"];

const SkillSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, enum: CATEGORIES, required: true },
    proficiency: { type: String, enum: PROFICIENCIES, required: true },
  },
  { timestamps: true }
);

// índice para prevenir duplicados por usuario (case-insensitive)
SkillSchema.index(
  { userId: 1, name: 1, category: 1 },
  {
    unique: true,
    collation: { locale: "en", strength: 2 }, // case-insensitive
  }
);

export const PROFICIENCIES_LIST = PROFICIENCIES;
export const CATEGORIES_LIST = CATEGORIES;

export default mongoose.model("Skill", SkillSchema);

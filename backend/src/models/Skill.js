// backend/src/models/Skill.js  (ESM)
import mongoose from "mongoose";

export const PROFICIENCIES = ["Beginner", "Intermediate", "Advanced", "Expert"];
export const CATEGORIES = ["Technical", "Soft Skills", "Languages", "Industry-Specific"];

const { Schema } = mongoose;

const SkillSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 100,
    },
    // Campo derivado para unicidad case-insensitive por usuario
    normalizedName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      minlength: 1,
      maxlength: 100,
    },
    category: {
      type: String,
      enum: CATEGORIES,
      required: true,
    },
    proficiency: {
      type: String,
      enum: PROFICIENCIES,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        // Uniformar id
        ret.id = ret._id?.toString();
        delete ret._id;
        delete ret.normalizedName; // ocultamos el derivado si no lo necesitas en el cliente
        return ret;
      },
    },
  }
);

// Índice único: un usuario no puede repetir la misma skill (ignorando mayúsculas)
SkillSchema.index({ user: 1, normalizedName: 1 }, { unique: true });

// Pre-validación: asegura normalizedName a partir de name
SkillSchema.pre("validate", function (next) {
  if (this.isModified("name") || this.isNew) {
    this.normalizedName = String(this.name || "").trim().toLowerCase();
  }
  next();
});

// Evitar recompilar el modelo en hot-reload / tests
export const Skill =
  mongoose.models.Skill || mongoose.model("Skill", SkillSchema);

export default Skill;

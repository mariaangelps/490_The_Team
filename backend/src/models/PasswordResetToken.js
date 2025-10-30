import mongoose from "mongoose";

const PasswordResetTokenSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true, index: { expires: 0 } }, // TTL index
    usedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

export default mongoose.model("PasswordResetToken", PasswordResetTokenSchema);

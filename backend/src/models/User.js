import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, index: true },
    emailNorm: { type: String, unique: true, index: true }, // lowercase unique
    passwordHash: { type: String }, // undefined for OAuth-only users
    firstName: String,
    lastName: String,
    picture: String,
    providers: [{ type: String }],
    deletedAt: Date
  },
  { timestamps: true }
);

UserSchema.pre("save", function (next) {
  if (this.email) this.emailNorm = this.email.toLowerCase().trim();
  next();
});

export default mongoose.model("User", UserSchema);
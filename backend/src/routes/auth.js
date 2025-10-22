import { Router } from "express";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import { isValidEmail, isStrongPwd, apiError } from "../utils/validate.js";
import { setSessionUser } from "../middleware/auth.js";

const router = Router();

// UC-001: Register
router.post("/register", async (req, res) => {
  const { email, password, confirmPassword, firstName, lastName } = req.body || {};

  // validation
  if (!isValidEmail(email))
    return res.status(400).json(apiError("VALIDATION_ERROR", "Invalid email", { email: "Invalid email" }));

  if (!isStrongPwd(password))
    return res.status(400).json(
      apiError("VALIDATION_ERROR", "Weak password", { password: "Min 8, 1 upper, 1 lower, 1 number" })
    );

  if (password !== confirmPassword)
    return res.status(400).json(
      apiError("VALIDATION_ERROR", "Passwords do not match", { confirmPassword: "Does not match" })
    );

  const norm = email.toLowerCase().trim();
  const existing = await User.findOne({ emailNorm: norm });
  if (existing) return res.status(409).json(apiError("DUPLICATE_EMAIL", "Email already registered"));

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({
    email,
    passwordHash,
    firstName: firstName || "",
    lastName: lastName || "",
    providers: ["local"]
  });

  setSessionUser(user, req); // auto-login
  return res.status(201).json({
    message: "Registered",
    user: { id: String(user._id), email: user.email, firstName: user.firstName, lastName: user.lastName }
  });
});

export default router;

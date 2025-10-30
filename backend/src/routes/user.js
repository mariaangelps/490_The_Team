import { Router } from "express";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import { apiError } from "../utils/validate.js";
import { sendAccountDeletionEmail } from "../utils/mailer.js";
import { isValidEmail } from "../utils/validate.js";

const router = Router();

/**
 * DELETE /api/users/me
 * Body: { password: string }
 *
 * Requirements from UC-009:
 * - Must be logged in
 * - Must confirm password
 * - Hard delete the user + all related data
 * - End the user session
 * - Send confirmation email
 */
router.delete("/me", async (req, res) => {
  const sessionUser = req.session?.user;
  if (!sessionUser || !sessionUser.id) {
    return res
      .status(401)
      .json(apiError("AUTH_REQUIRED", "Login required"));
  }

  const { password } = req.body || {};
  if (!password) {
    return res
      .status(400)
      .json(apiError("VALIDATION_ERROR", "Password required", { password: "Required" }));
  }

  const user = await User.findById(sessionUser.id);
  if (!user) {
    req.session?.destroy?.(() => {});
    return res.json({ message: "Account deleted" });
  }

  if (!user.passwordHash) {
    return res
      .status(403)
      .json(apiError("OAUTH_ONLY", "This account doesn't have a password. You cannot delete via password."));
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return res
      .status(401)
      .json(apiError("INVALID_PASSWORD", "Incorrect password", { password: "Incorrect password" }));
  }

  const deletedEmail = user.email;

  await User.findByIdAndDelete(user._id);

  req.session?.destroy?.(() => {});

  sendAccountDeletionEmail(deletedEmail).catch((err) => {
    console.error("Failed to send deletion email:", err);
  });

  return res.json({ message: "Account deleted" });
});

/**
 * PUT /api/users/me (per UC-010)
 * Updates the logged-in user's profile fields (no password/provider changes here)
 */
router.put("/me", async (req, res) => {
  const sessionUser = req.session?.user;
  if (!sessionUser || !sessionUser.id) {
    return res.status(401).json(apiError("AUTH_REQUIRED", "Login required"));
  }

  const {
    email,
    firstName,
    lastName,
    picture,
    employment,
    skills,
    education,
    projects
  } = req.body || {};

  // validate email if provided
  if (email && !isValidEmail(email)) {
    return res.status(400).json(apiError("VALIDATION_ERROR", "Invalid email", { email: "Invalid email" }));
  }

  // check duplicate email if changing
  if (email) {
    const norm = String(email).toLowerCase().trim();
    const existing = await User.findOne({ emailNorm: norm, _id: { $ne: sessionUser.id } });
    if (existing) {
      return res.status(409).json(apiError("DUPLICATE_EMAIL", "Email already in use"));
    }
  }

  const user = await User.findById(sessionUser.id);
  if (!user) {
    // user missing: clear session and respond
    req.session?.destroy?.(() => {});
    return res.status(404).json(apiError("NOT_FOUND", "User not found"));
  }

  // apply updates only for provided fields
  if (email) user.email = email;
  if (typeof firstName === "string") user.firstName = firstName;
  if (typeof lastName === "string") user.lastName = lastName;
  if (typeof picture === "string") user.picture = picture;
  if (Array.isArray(employment)) user.employment = employment.map(String);
  if (Array.isArray(skills)) user.skills = skills.map(String);
  if (Array.isArray(education)) user.education = education.map(String);
  if (Array.isArray(projects)) user.projects = projects.map(String);

  user.updatedAt = new Date();

  await user.save();

  // keep session user in sync if present
  if (req.session && req.session.user) {
    req.session.user = { id: String(user._id), email: user.email, firstName: user.firstName, lastName: user.lastName };
  }

  return res.json({
    user: {
      id: String(user._id),
      email: user.email,
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      picture: user.picture || "",
      employment: user.employment || [],
      skills: user.skills || [],
      education: user.education || [],
      projects: user.projects || []
    }
  });
});

export default router;
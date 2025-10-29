import { Router } from "express";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import { apiError } from "../utils/validate.js";
import { sendAccountDeletionEmail } from "../utils/mailer.js";

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

export default router;
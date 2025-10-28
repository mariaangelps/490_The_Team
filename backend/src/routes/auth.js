import { Router } from "express";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import { isValidEmail, isStrongPwd, apiError } from "../utils/validate.js";
import { setSessionUser } from "../middleware/auth.js";
import passport from "../passport.js";
import PasswordResetToken from "../models/PasswordResetToken.js";
import { generateRawToken, hashToken } from "../utils/tokens.js";
import { sendPasswordResetEmail } from "../utils/mailer.js";

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

router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  const norm = (email || "").toLowerCase().trim();

  const user = await User.findOne({ emailNorm: norm });
  if (!user) {
    return res
      .status(401)
      .json(apiError("INVALID_CREDENTIALS", "Invalid email or password"));
  }

  if (!user.passwordHash) {
    return res
      .status(403)
      .json(
        apiError(
          "OAUTH_ONLY",
          "This account uses Google Sign-In. Continue with Google or set a password."
        )
      );
  }

  const ok = await bcrypt.compare(password || "", user.passwordHash);
  if (!ok) {
    return res
      .status(401)
      .json(apiError("INVALID_CREDENTIALS", "Invalid email or password"));
  }

  setSessionUser(user, req);
  return res.json({
    user: { id: String(user._id), email: user.email, name: user.firstName || "" },
  });
});


router.post("/logout", (req, res) => {
  req.session?.destroy(() => res.json({ message: "Logged out" }));
});

// start Google OAuth
router.get(
  "/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

// oauth callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.CLIENT_URL || "http://localhost:5173"}/login?error=oauth`
  }),
  (req, res) => {
    res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/dashboard`);
  }
);

// debug route to get current user
router.get("/me", (req, res) => {
  if (!req.session?.passport?.user) return res.status(401).json({ error: { message: "Login required" } });
  res.json({ user: req.session.passport.user });
});

// start linkedin oauth
router.get(
  "/linkedin",
  passport.authenticate("linkedin", {
    scope: ["openid", "profile", "email"]
  })
);

// linkedin oauth callback
router.get(
  "/linkedin/callback",
  passport.authenticate("linkedin", {
    failureRedirect: `${process.env.CLIENT_URL || "http://localhost:5173"}/login?error=oauth`,
  }),
  (req, res) => {
    res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/dashboard`);
  }
);


// UC-006: Request password reset (always 200 for privacy)
router.post("/reset/request", async (req, res) => {
  const { email } = req.body || {};
  const norm = String(email || "").toLowerCase().trim();

  const generic = { message: "If an account exists, a reset link has been sent." };

  const user = await User.findOne({ emailNorm: norm });
  if (!user) return res.json(generic);

  await PasswordResetToken.updateMany(
    { userId: user._id, usedAt: null },
    { $set: { usedAt: new Date() } }
  );

  const raw = generateRawToken(32);
  const token = await PasswordResetToken.create({
    userId: user._id,
    tokenHash: hashToken(raw),
    expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
  });

  const resetUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/reset?token=${raw}`;

  await sendPasswordResetEmail(user.email, resetUrl);
  return res.json(generic);

});

// UC-007: Complete reset
router.post("/reset/complete", async (req, res) => {
  const { token, password, confirmPassword } = req.body || {};
  if (!token) return res.status(400).json(apiError("VALIDATION_ERROR","Missing token"));

  if (!isStrongPwd(password))
    return res.status(400).json(apiError(
      "VALIDATION_ERROR","Weak password",
      { password: "Min 8, 1 upper, 1 lower, 1 number" }
    ));

  if (password !== confirmPassword)
    return res.status(400).json(apiError(
      "VALIDATION_ERROR","Passwords do not match",
      { confirmPassword: "Does not match" }
    ));

  const tokenHash = hashToken(token);
  const record = await PasswordResetToken.findOne({ tokenHash });

  if (!record) return res.status(400).json(apiError("INVALID_TOKEN","Invalid or expired link"));
  if (record.usedAt) return res.status(400).json(apiError("INVALID_TOKEN","Invalid or expired link"));
  if (record.expiresAt.getTime() < Date.now())
    return res.status(400).json(apiError("INVALID_TOKEN","Invalid or expired link"));

  const user = await User.findById(record.userId);
  if (!user) return res.status(400).json(apiError("INVALID_TOKEN","Invalid or expired link"));

  // set new password (old password effectively invalidated)
  user.passwordHash = await bcrypt.hash(password, 12);
  // ensure "local" provider is present
  const prov = new Set(user.providers || []);
  prov.add("local");
  user.providers = [...prov];
  await user.save();

  // mark token used and invalidate any others
  const now = new Date();
  await PasswordResetToken.updateMany(
    { userId: user._id, usedAt: null },
    { $set: { usedAt: now } }
  );

  // auto-login
  setSessionUser(user, req);

  return res.json({ message: "Password has been reset", user: { id: String(user._id), email: user.email } });
});


export default router;
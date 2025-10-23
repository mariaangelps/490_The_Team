import { Router } from "express";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import { isValidEmail, isStrongPwd, apiError } from "../utils/validate.js";
import { setSessionUser } from "../middleware/auth.js";
import passport from "../passport.js";

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


export default router;

// passport287.js
import 'dotenv/config';
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "./models/User.js";

/* ================================
   GOOGLE STRATEGY (ACTIVE)
================================ */
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK || "http://localhost:4000/api/auth/google/callback",
      passReqToCallback: false
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) return done(null, false, { message: "No email returned from Google" });

        const firstName = profile.name?.givenName || "";
        const lastName = profile.name?.familyName || "";
        const picture = profile.photos?.[0]?.value;

        const emailNorm = email.toLowerCase();

        let user = await User.findOne({ emailNorm });

        if (!user) {
          // Create new user
          user = await User.create({
            email,
            emailNorm,
            firstName,
            lastName,
            picture,
            providers: ["google"]
          });
        } else {
          // Update providers list if needed
          const prov = new Set(user.providers || []);
          prov.add("google");
          user.providers = [...prov];
          if (!user.picture && picture) user.picture = picture;
          await user.save();
        }

        done(null, {
          id: String(user._id),
          email: user.email,
          name: user.firstName || ""
        });
      } catch (err) {
        done(err);
      }
    }
  )
);

/* ================================
   SERIALIZATION
================================ */
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

export default passport;

import 'dotenv/config';
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "./models/User.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) return done(null, false, { message: "No email from Google" });

        const firstName = profile.name?.givenName || "";
        const lastName = profile.name?.familyName || "";
        const picture = profile.photos?.[0]?.value;

        let user = await User.findOne({ emailNorm: email.toLowerCase() });

        if (!user) {
          user = await User.create({
            email,
            firstName,
            lastName,
            picture,
            providers: ["google"]
          });
        } else {
          // link provider if not linked
          const prov = new Set(user.providers || []);
          prov.add("google");
          user.providers = [...prov];
          if (!user.picture && picture) user.picture = picture;
          await user.save();
        }

        // keep the session payload small
        done(null, { id: String(user._id), email: user.email, name: user.firstName || "" });
      } catch (err) {
        done(err);
      }
    }
  )
);

// store minimal user in session
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

export default passport;

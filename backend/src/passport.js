// backend/src/passport.js (or ./auth/linkedin.js)
import 'dotenv/config';
import passport from 'passport';
import OAuth2Strategy from 'passport-oauth2';
import fetch from 'node-fetch';
import User from './models/User.js';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';


// ---- LinkedIn OIDC via generic OAuth2 ----
class LinkedInOIDCStrategy extends OAuth2Strategy {
  constructor(options, verify) {
    super(
      {
        authorizationURL: 'https://www.linkedin.com/oauth/v2/authorization',
        tokenURL: 'https://www.linkedin.com/oauth/v2/accessToken',
        clientID: options.clientID,
        clientSecret: options.clientSecret,
        callbackURL: options.callbackURL,
        scope: ['openid', 'profile', 'email'],
        state: true,
      },
      verify
    );
    this.name = 'linkedin'; // <-- this must match your route
  }

  userProfile(accessToken, done) {
    fetch('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`LinkedIn userinfo ${res.status}: ${await res.text()}`);
        return res.json();
      })
      .then((json) => {
        const profile = {
          provider: 'linkedin',
          id: json.sub,
          displayName: json.name || '',
          name: { givenName: json.given_name || '', familyName: json.family_name || '' },
          emails: json.email ? [{ value: json.email }] : [],
          photos: json.picture ? [{ value: json.picture }] : [],
          _json: json,
        };
        done(null, profile);
      })
      .catch((err) => done(err));
  }
}

passport.use(
  new LinkedInOIDCStrategy(
    {
      clientID: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
      callbackURL: process.env.LINKEDIN_CALLBACK, // e.g. http://localhost:4000/api/auth/linkedin/callback
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) return done(null, false, { message: 'No email from LinkedIn' });

        const firstName = profile.name?.givenName || '';
        const lastName = profile.name?.familyName || '';
        const picture = profile.photos?.[0]?.value || null;

        let user = await User.findOne({ emailNorm: email.toLowerCase() });
        if (!user) {
          user = await User.create({
            email,
            firstName,
            lastName,
            picture,
            providers: ['linkedin'],
          });
        } else {
          const prov = new Set(user.providers || []);
          prov.add('linkedin');
          user.providers = [...prov];
          if (!user.picture && picture) user.picture = picture;
          await user.save();
        }

        return done(null, { id: String(user._id), email: user.email, name: user.firstName || '' });
      } catch (err) {
        return done(err);
      }
    }
  )
);

// --- GOOGLE ---
passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK, // e.g. http://localhost:4000/api/auth/google/callback
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) return done(null, false, { message: 'No email from Google' });
  
          const firstName = profile.name?.givenName || '';
          const lastName  = profile.name?.familyName || '';
          const picture   = profile.photos?.[0]?.value;
  
          let user = await User.findOne({ emailNorm: email.toLowerCase() });
          if (!user) {
            user = await User.create({
              email, firstName, lastName, picture, providers: ['google'],
            });
          } else {
            const prov = new Set(user.providers || []);
            prov.add('google');
            user.providers = [...prov];
            if (!user.picture && picture) user.picture = picture;
            await user.save();
          }
  
          return done(null, { id: String(user._id), email: user.email, name: user.firstName || '' });
        } catch (err) {
          return done(err);
        }
      }
    )
  );
  
// minimal session payload
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

export default passport;

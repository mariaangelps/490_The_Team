// Ensures session and request-level user data are set in a shape compatible
// with Passport's session format (req.session.passport.user) and also
// sets req.user so routes that rely on req.user work immediately after
// registering/logging in a user.
export const setSessionUser = (user, req) => {
  const payload = {
    id: String(user._id ?? user.id),
    email: user.email,
    name: user.firstName || ""
  };

  // Set Passport-compatible session container
  if (!req.session) req.session = {};
  req.session.passport = req.session.passport || {};
  req.session.passport.user = payload;

  // Also set a convenient short-hand and req.user for immediate access
  req.session.user = payload;
  req.user = payload;
};

// ESM
export const setSessionUser = (user, req) => {
  // Guarda en sesión (para persistencia entre requests)
  req.session.user = {
    id: String(user._id ?? user.id),
    email: user.email ?? "",
    name: user.firstName || user.name || "",
  };

  // Opcional: normaliza también req.user para este request
  req.user = {
    _id: String(user._id ?? user.id),
    email: user.email ?? "",
    name: user.firstName || user.name || "",
  };
};

export const clearSessionUser = (req) => {
  req.user = null;
  if (req.session) req.session.user = null;
};

export const ensureAuthed = (req, res, next) => {
  // Passport
  const viaPassport = typeof req.isAuthenticated === "function" && req.isAuthenticated();

  // Sesión propia
  const sessionUserId = req.session?.user?.id;

  const uid =
    req.user?._id ??
    req.user?.id ??
    sessionUserId;

  if (!viaPassport && !uid) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Normaliza req.user
  req.user = {
    ...(req.user || {}),
    _id: String(uid),
    email: req.user?.email ?? req.session?.user?.email ?? "",
    name: req.user?.name ?? req.session?.user?.name ?? "",
  };

  next();
};

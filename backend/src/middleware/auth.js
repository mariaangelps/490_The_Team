export const setSessionUser = (user, req) => {
  req.session.user = {
    id: String(user._id),
    email: user.email,
    name: user.firstName || ""
  };
};

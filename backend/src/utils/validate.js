export const isValidEmail = (e) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(e || ""));

export const isStrongPwd = (p) =>
  /[A-Z]/.test(p) && /[a-z]/.test(p) && /\d/.test(p) && String(p || "").length >= 8;

export const apiError = (code, message, fields) => ({
  error: { code, message, ...(fields ? { fields } : {}) }
});

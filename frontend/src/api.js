const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export async function post(path, body) {
  let res;
  try {
    console.log("POST request to:", `${API_URL}${path}`, "with body:", body);

    res = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // important for session cookies
      body: JSON.stringify(body),
    });
  } catch (networkErr) {
    console.error("Network error:", networkErr);
    throw { message: `Network error: ${networkErr.message || networkErr}` };
  }

  let data;
  try {
    data = await res.json();
  } catch (jsonErr) {
    console.error("Failed to parse JSON:", jsonErr);
    data = {};
  }

  if (!res.ok) {
    console.error("API error response:", res.status, data);
    const err = data?.error || data || { message: "Request failed" };
    throw { status: res.status, ...err };
  }

  console.log("API response:", data);
  return data;
}

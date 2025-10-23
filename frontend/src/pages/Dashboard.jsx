export default function Dashboard() {
  const logout = async () => {
    await fetch((import.meta.env.VITE_API_URL || "http://localhost:4000") + "/api/auth/logout", {
      method: "POST", credentials: "include"
    });
    window.location.href = "/login";
  };
  return (
    <div style={{ padding: 12 }}>
      <h2>Dashboard ✅</h2>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

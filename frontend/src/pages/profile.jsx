import { useEffect, useState } from "react";

export default function Profile287({ userId }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState(null);

  // Fetch user profile info
  useEffect(() => {
    fetch(`/api/profile/${userId}`, { credentials: "include" })
      .then(res => res.json())
      .then(data => setProfile(data))
      .catch(err => setError(err.message));
  }, [userId]);

  const handleChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (!f.type.startsWith("image/") || f.size > 5 * 1024 * 1024) {
      setError("Invalid file type or size > 5MB");
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError("");
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("avatar", file);
    try {
      await fetch("/api/profile/upload", { method: "POST", body: formData, credentials: "include" });
      alert("Uploaded successfully!");
      setFile(null);
      setPreview(null);
    } catch {
      setError("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    setUploading(true);
    try {
      await fetch("/api/profile/upload", { method: "DELETE", credentials: "include" });
      alert("Avatar removed!");
      setPreview(null);
      setFile(null);
    } catch {
      setError("Remove failed");
    } finally {
      setUploading(false);
    }
  };

  if (!profile) return <p>Loading profile...</p>;

  return (
    <div style={{ padding: 12 }}>
      <h2>Welcome {profile.firstName} {profile.lastName}</h2>
      <img src={preview || profile.picture || "/default-avatar.png"} alt="Avatar" width={128} />
      <div style={{ marginTop: 8 }}>
        <input type="file" onChange={handleChange} />
        <button onClick={handleUpload} disabled={uploading}>
          {uploading ? "Uploading..." : "Upload"}
        </button>
        <button onClick={handleRemove}>Remove</button>
      </div>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

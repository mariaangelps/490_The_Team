import { FaUser, FaUpload, FaSpinner } from "react-icons/fa";
import { useState } from "react";

export default function DashboardIcons287() {
  const [loading, setLoading] = useState(false);

  return (
    <div style={{ padding: 12 }}>
      <h2><FaUser size={24} style={{ marginRight: 8 }} /> Dashboard Icons Demo</h2>
      <button style={{ margin: 8 }} onClick={() => setLoading(!loading)}>
        <FaUpload style={{ marginRight: 4 }} /> Toggle Loading
      </button>
      {loading && <FaSpinner className="spin" size={24} />}
    </div>
  );
}

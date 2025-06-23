import { useState, useEffect } from "react";
import Header from "../../components/Header";

function InitialGradesUpload() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [isStudent, setIsStudent] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        if (decoded.role === "student") {
          setIsStudent(true);
        }
      } catch (e) {
        setIsStudent(true);
      }
    } else {
      setIsStudent(true);
    }
  }, []);

  if (isStudent) {
    return (
      <div style={{ padding: "40px", textAlign: "center", fontSize: "1.2em" }}>
        Αυτή η σελίδα δεν είναι διαθέσιμη για φοιτητές
      </div>
    );
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    setFileName(selectedFile.name);
    setMessage("");
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setMessage("");

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("gradesFile", file);

      const res = await fetch("http://localhost:3000/api/grades-update", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Η ανάρτηση απέτυχε");

      setMessage(`✅ Επέτυχε! (${data.inserted} νέα, ${data.updated} ενημερώθηκαν, ${data.skipped} ίδια, ${data.failed} σφάλματα)`);
    } catch (err) {
      console.error("[ΣΦΑΛΜΑ ΑΝΑΡΤΗΣΗΣ]", err);
      setMessage(`❌ Αποτυχία: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setFile(null);
    setFileName("");
    setMessage("");
  };

  return (
    <div style={containerStyle}>
      <Header />
      <h2 style={titleStyle}>Instructor: Αρχική Ανάρτηση Βαθμολογιών</h2>

      <section style={sectionStyle}>
        <h3 style={sectionTitleStyle}>📁 Επιλογή και Υποβολή αρχείου .xlsx</h3>
        <input
          type="file"
          accept=".xlsx"
          onChange={handleFileChange}
          disabled={uploading}
        />

        {fileName && (
          <p style={{ marginTop: "10px" }}>
            Επιλεγμένο αρχείο: <strong>{fileName}</strong>
            <button onClick={handleCancel} style={buttonSecondary}>Ακύρωση</button>
          </p>
        )}

        <button
          onClick={handleUpload}
          style={{
            ...buttonPrimary,
            opacity: file && !uploading ? 1 : 0.5,
            cursor: file && !uploading ? "pointer" : "not-allowed",
            position: "relative",
          }}
          disabled={!file || uploading}
        >
          {uploading ? (
            <>
              <span className="spinner" style={spinnerStyle}></span>
              Υποβολή...
            </>
          ) : (
            "Ανάρτηση"
          )}
        </button>
      </section>

      {message && <div style={messageStyle}>{message}</div>}
    </div>
  );
}

// 💅 Styles
const containerStyle = {
  padding: "30px",
  maxWidth: "800px",
  margin: "40px auto",
  fontFamily: "sans-serif",
};

const titleStyle = {
  marginBottom: "30px",
  color: "#333",
};

const sectionStyle = {
  padding: "20px",
  border: "1px solid #ddd",
  borderRadius: "10px",
  backgroundColor: "#fafafa",
  marginBottom: "24px",
};

const sectionTitleStyle = {
  marginBottom: "12px",
  color: "#444",
};

const buttonPrimary = {
  marginTop: "20px",
  padding: "10px 20px",
  backgroundColor: "#007bff",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  fontWeight: "bold",
  fontSize: "15px",
};

const buttonSecondary = {
  padding: "6px 12px",
  marginLeft: "10px",
  backgroundColor: "#6c757d",
  color: "#fff",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
};

const messageStyle = {
  marginTop: "20px",
  padding: "12px",
  backgroundColor: "#e9ecef",
  border: "1px solid #ccc",
  borderRadius: "8px",
  color: "#333",
};

const spinnerStyle = {
  width: "16px",
  height: "16px",
  marginRight: "8px",
  border: "3px solid #fff",
  borderTop: "3px solid #007bff",
  borderRadius: "50%",
  display: "inline-block",
  animation: "spin 1s linear infinite",
  verticalAlign: "middle",
};

// Spinner animation
const styleSheet = document.styleSheets[0];
const keyframes =
  `@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }`;
styleSheet.insertRule(keyframes, styleSheet.cssRules.length);

export default InitialGradesUpload;

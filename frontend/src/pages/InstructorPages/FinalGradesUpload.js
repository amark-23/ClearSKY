import { useState, useEffect } from "react";
import Header from "../../components/Header";

function FinalGradesUpload() {
  const [fileName, setFileName] = useState("");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
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
        This page is not available to students
      </div>
    );
  }

  const handleFileUpload = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setFileName(selected.name);
      setMessage("");
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      setMessage("❌ Παρακαλώ επιλέξτε αρχείο .xlsx πρώτα");
      return;
    }

    const formData = new FormData();
    formData.append("gradesFile", file);

    try {
      const res = await fetch("http://localhost:3000/api/grades-update", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Upload failed");
      }

      setMessage(`✅ Επιτυχής αποστολή (${data.inserted} νέοι βαθμοί, ${data.updated} ενημερώσεις, ${data.skipped} παραλείφθηκαν)`);
    } catch (err) {
      console.error("[UPLOAD ERROR]", err);
      setMessage(`❌ Αποτυχία: ${err.message}`);
    }
  };

  const handleCancel = () => {
    setFile(null);
    setFileName("");
    setMessage("❌ Ακυρώθηκε");
  };

  return (
    <div style={containerStyle}>
      <Header />

      <h2 style={titleStyle}>Instructor: Τελική Ανάρτηση Βαθμολογιών</h2>

      <section style={sectionStyle}>
        <h3 style={sectionTitleStyle}>📁 Επιλογή και Υποβολή αρχείου .xlsx</h3>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <input type="file" accept=".xlsx" onChange={handleFileUpload} />
          <button onClick={handleSubmit} style={buttonPrimary}>
            Submit FINAL Grades
          </button>
        </div>
        {fileName && (
          <p style={{ marginTop: "10px" }}>
            Επιλεγμένο αρχείο: <strong>{fileName}</strong>{" "}
            <button onClick={handleCancel} style={buttonSecondary}>Ακύρωση</button>
          </p>
        )}
      </section>

      {message && (
        <div style={messageStyle}>{message}</div>
      )}
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
  padding: "10px 20px",
  marginRight: "10px",
  backgroundColor: "#28a745",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};

const buttonSecondary = {
  ...buttonPrimary,
  backgroundColor: "#6c757d",
  padding: "4px 10px",
  fontSize: "13px",
};

const messageStyle = {
  marginTop: "20px",
  padding: "12px",
  backgroundColor: "#e9ecef",
  border: "1px solid #ccc",
  borderRadius: "8px",
  color: "#333",
};

export default FinalGradesUpload;

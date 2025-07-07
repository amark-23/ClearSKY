import { useState, useEffect } from "react";
import Header from "../../components/Header";

function ReviewRequests() {
  const [requests, setRequests] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [responses, setResponses] = useState({});
  const [decisions, setDecisions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isStudent, setIsStudent] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    // Έλεγχος ρόλου
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        if (decoded.role === "student") {
          setIsStudent(true);
          return;
        }
      } catch (e) {
        setIsStudent(true);
        return;
      }
    } else {
      setIsStudent(true);
      return;
    }

    const fetchRequests = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/displayRequests", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Αποτυχία φόρτωσης αιτημάτων.");
        const data = await res.json();

        // Φέρνουμε τα ζευγάρια replied (replyID, requestID) από τον orchestrator
        const repliedRes = await fetch("http://localhost:3000/api/repliedRequests", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!repliedRes.ok) throw new Error("Αποτυχία φόρτωσης απαντημένων αιτημάτων.");
        const repliedData = await repliedRes.json();
        const repliedRequestIDs = new Set((repliedData.replied || []).map(r => r.requestID));

        // Φιλτράρουμε τα requests που έχουν ήδη απαντηθεί
        const filteredRequests = (data.requests || []).filter(r => !repliedRequestIDs.has(r.id));

        setRequests(filteredRequests);
      } catch (err) {
        setError(err.message);
        // Fallback mock
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  if (isStudent) {
    return (
      <div style={{ padding: "40px", textAlign: "center", fontSize: "1.2em" }}>
        This page is not available to students
      </div>
    );
  }

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleDecisionChange = (id, value) => {
    setDecisions((prev) => ({ ...prev, [id]: value }));
  };

  const handleResponseChange = (id, value) => {
    setResponses((prev) => ({ ...prev, [id]: value }));
  };

 const handleSubmit = async (id) => {
  const token = localStorage.getItem("token");
  const text = responses[id];

  if (!text) {
    alert("Παρακαλώ γράψτε ένα μήνυμα πριν την υποβολή.");
    return;
  }

  try {
    const res = await fetch("http://localhost:3000/api/submitReply", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        requestID: id,
        text,
      }),
    });

    if (!res.ok) {
      const errMsg = (await res.json()).message || "Αποτυχία υποβολής.";
      throw new Error(errMsg);
    }

    alert("✅ Η απάντηση υποβλήθηκε επιτυχώς.");
    setExpandedId(null);
    setRequests((prev) => prev.filter((r) => r.id !== id));
  } catch (err) {
    alert("❌ Σφάλμα κατά την υποβολή: " + err.message);
  }
};


  return (
    <div style={containerStyle}>
      <Header />
      <h2 style={titleStyle}>Instructor: Αιτήματα Αναθεώρησης</h2>

      {loading && <p>⏳ Φόρτωση...</p>}
      {error && <p style={{ color: "red" }}>❌ {error}</p>}

      {!loading && !error && requests.length === 0 && <p>Δεν υπάρχουν αιτήματα.</p>}

      {!loading && !error &&
        requests.map((req) => (
          <div key={req.id} style={cardStyle}>
            <div><strong>Φοιτητής:</strong> {req.student}</div>
            <div><strong>Αιτιολόγηση:</strong> {req.reason}</div>
            <div><strong>Τρέχων βαθμός:</strong> {req.grade}</div>
            <button onClick={() => toggleExpand(req.id)} style={buttonStyle}>
              {expandedId === req.id ? "Ακύρωση" : "Απάντηση"}
            </button>

            {expandedId === req.id && (
              <div style={expandBoxStyle}>
                <div style={{ marginBottom: "10px" }}>
                  <label><strong>Απάντηση προς φοιτητή:</strong></label>
                  <textarea
                    placeholder="Γράψτε την απάντησή σας εδώ..."
                    rows={4}
                    style={textareaStyle}
                    value={responses[req.id] || ""}
                    onChange={(e) => handleResponseChange(req.id, e.target.value)}
                  />
                </div>
                <button style={buttonPrimary} onClick={() => handleSubmit(req.id)}>
                  ✅ Υποβολή
                </button>
              </div>
            )}
          </div>
        ))}
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

const cardStyle = {
  border: "1px solid #ccc",
  borderRadius: "10px",
  padding: "15px",
  marginBottom: "20px",
  backgroundColor: "#f9f9f9",
};

const buttonStyle = {
  marginTop: "10px",
  padding: "8px 12px",
  backgroundColor: "#007bff",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};

const expandBoxStyle = {
  marginTop: "16px",
  padding: "15px",
  backgroundColor: "#eef5ff",
  borderRadius: "8px",
};

const buttonPrimary = {
  marginTop: "12px",
  padding: "8px 16px",
  backgroundColor: "#28a745",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};

const textareaStyle = {
  width: "100%",
  padding: "10px",
  borderRadius: "6px",
  border: "1px solid #ccc",
  marginTop: "6px",
  resize: "vertical",
};

export default ReviewRequests;

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function MyCourses() {
  const [courses, setCourses] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [error, setError] = useState("");
  const [statistics, setStatistics] = useState([]);
  const [reviewMessages, setReviewMessages] = useState({});
  const [isProfessor, setIsProfessor] = useState(false); // ΝΕΟ
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        if (decoded.role === "instructor") {
          setIsProfessor(true);
          return;
        }
      } catch (e) {
        // Αν το token είναι invalid, θεώρησέ τον ως καθηγητή για ασφάλεια
        setIsProfessor(true);
        return;
      }
    } else {
      // Αν δεν υπάρχει token, θεώρησέ τον ως καθηγητή για ασφάλεια
      setIsProfessor(true);
      return;
    }

    const fetchGrades = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/grades", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch grades");

        const data = await res.json();
        const grouped = {};

        const statusPromises = Object.entries(data).map(async ([key, grade]) => {
          const [name, semester] = key.split(" - ");

        // Call your submissionInfo API to get grading dates
          const statusRes = await fetch(
            `http://localhost:3000/api/submissionInfo?subjectName=${encodeURIComponent(name)}&period=${encodeURIComponent(semester)}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );

          let gradingStatus = "unknown";

          if (statusRes.ok) {
            const statusData = await statusRes.json();
            // if two grading dates exist => "closed", else "open"
            gradingStatus =
              statusData.lastSubmission && statusData.secondLastSubmission && statusData.lastSubmission != statusData.secondLastSubmission
                ? "closed"
                : statusData.lastSubmission
                ? "open"
                : "unknown";
          }

          grouped[key] = {
            name,
            semester,
            gradingStatus,
            subjectID: grade.subjectID,
            grades: [{ 
              scale: "0-10", 
              grade: grade.grade,
              gradeID: grade.gradeID
            }],
            Q: grade.Q || {}, // <-- Πρόσθεσε αυτό!
          };
        });

        await Promise.all(statusPromises);
        setCourses(Object.values(grouped));
      } catch (err) {
        console.error("❌", err);
        setError("Could not load your courses.");
      }
    };

    const fetchStatistics = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/statistics", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (!res.ok) throw new Error("Failed to fetch statistics");
        const data = await res.json();
        const statsArray = Array.isArray(data.allDistributions)
          ? data.allDistributions
          : [];
        setStatistics(statsArray);
      } catch (err) {
        console.error("📊 Error fetching stats:", err);
      }
    };

    const fetchReplies = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/replies", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch replies");

        const data = await res.json();

        // Organize replies by course name + semester
        const repliesByCourse = {};
        data.replies.forEach((r) => {
          const key = `${r.subjectID} - ${r.gradeID}`;
          repliesByCourse[key] = r;
        });

        setReviewMessages((prev) => ({ ...prev, replies: repliesByCourse }));
      } catch (err) {
        console.error("📩 Error fetching replies:", err);
      }
    };

    fetchReplies();
    fetchGrades();
    fetchStatistics();
  }, [navigate]);

  const handleExpand = (courseKey, section) => {
    setExpanded((prev) => ({
      ...prev,
      [courseKey]: prev[courseKey] === section ? null : section,
    }));
  };

  const normalizeDistribution = (input = []) => {
    const map = new Map(input.map((g) => [g.grade, g.count]));
    return Array.from({ length: 11 }, (_, i) => ({
      grade: i,
      count: map.get(i) || 0,
    }));
  };

  const handleReviewMessageChange = (courseName, message) => {
  setReviewMessages((prev) => ({
    ...prev,
    [courseName]: message,
  }));
  };

  const calculateQuantile = (dist, percentile) => {
    const data = [];
    dist.forEach((d) => {
      for (let i = 0; i < d.count; i++) data.push(d.grade);
    });
    if (data.length === 0) return null;
    data.sort((a, b) => a - b);
    const idx = (data.length - 1) * percentile;
    const lower = Math.floor(idx);
    const upper = Math.ceil(idx);
    if (lower === upper) return data[lower];
    return data[lower] + (data[upper] - data[lower]) * (idx - lower);
  };

  const handleSubmitReviewRequest = async (course) => {
  const message = reviewMessages[course.name];
  if (!message) {
    alert("Please write a message for the review request.");
    return;
  }

  try {
    const res = await fetch("http://localhost:3000/api/submit-request", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        text: message,
        gradeID: course.grades[0].gradeID, // assumes grade object includes gradeID
      }),
    });

    if (!res.ok) {
      const error = await res.json();
      alert("❌ Failed to submit review request: " + error.message);
      return;
    }

    await res.json();
    alert("✅ Review request submitted successfully!");
    // Optionally collapse review section
    setExpanded((prev) => ({ ...prev, [course.name]: null }));
  } catch (err) {
    console.error("❌ Review request error:", err);
    alert("Internal error while submitting review request");
    }
  };


  if (isProfessor) {
    return (
      <div style={{ padding: "40px", textAlign: "center", fontSize: "1.2em" }}>
        Αυτή η σελίδα δεν είναι διαθέσιμη για καθηγητές.
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <Header />
      <h2>Student: My Courses</h2>

      {error && <div style={{ color: "red", marginBottom: "20px" }}>{error}</div>}

      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Course name</th>
            <th style={thStyle}>Exam period</th>
            <th style={thStyle}>Grading status</th>
            <th style={thStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course, i) => {
            const stats = statistics.find(
              (s) => s.subjectName === course.name && s.period === course.semester
            );
            const dist = normalizeDistribution(stats?.distribution);

            // --- ΝΕΟ: Έλεγχος αν υπάρχει reply για το μάθημα ---
            const replyKey = `${course.subjectID} - ${course.grades[0].gradeID}`;
            const hasReply = !!reviewMessages.replies?.[replyKey];
            const courseKey = `${course.name} - ${course.semester}`;
            return (
              <React.Fragment key={i}>
                <tr>
                  <td style={tdStyle}>{course.name}</td>
                  <td style={tdStyle}>{course.semester}</td>
                  <td style={tdStyle}>{course.gradingStatus}</td>
                  <td style={tdStyle}>
                    <button style={button} onClick={() => handleExpand(courseKey, "grades")}>
                      View my grades
                    </button>
                    <button
                      style={{
                        ...button,
                        backgroundColor: course.gradingStatus === "open" && !hasReply ? "#17a2b8" : "#ccc",
                        cursor: course.gradingStatus === "open" && !hasReply ? "pointer" : "not-allowed",
                      }}
                      disabled={course.gradingStatus !== "open" || hasReply}
                      onClick={() => handleExpand(courseKey, "review")}
                    >
                      Ask for review
                    </button>
                    <button style={button} onClick={() => handleExpand(courseKey, "status")}>
                      View review status
                    </button>
                  </td>
                </tr>

                {expanded[courseKey] === "grades" && (
                  <tr>
                    <td colSpan="4" style={expandStyle}>
                      <h4>{course.name} – Grades</h4>
                      <div style={gradesSection}>
                        {course.grades.map((g, idx) => (
                          <div key={idx}>
                            <strong>{g.scale}:</strong> {g.grade}
                            {/* Εμφάνιση αναλυτικών βαθμών Q αν υπάρχουν */}
                            {course.Q && Object.keys(course.Q).length > 0 ? (
                              <>
                                {Object.entries(course.Q).map(([qKey, qVal]) => (
                                  <span key={qKey} style={{ marginLeft: 10 }}>
                                    <strong>{qKey}:</strong> {qVal === null ? "-" : qVal}
                                  </span>
                                ))}
                              </>
                            ) : (
                              <span style={{ marginLeft: 10, color: "red" }}>(no Q data)</span>
                            )}
                          </div>
                        ))}
                      </div>
                      <div style={mainChart}>
                        <ResponsiveContainer width="100%" height={250}>
                          <BarChart data={dist}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="grade" label={{ value: "Grade", position: "insideBottom", offset: -5 }} />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Bar dataKey="count" fill="#007acc" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      {stats?.qDistributions && (
                        <div style={chartsContainer}>
                          {Object.entries(stats.qDistributions).map(([question, qDist], i) => (
                            <div key={i} style={largeChartContainer}>
                              <div style={{ textAlign: "center", marginBottom: 8, fontWeight: "600" }}>{question}</div>
                              <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={normalizeDistribution(qDist)}>
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis
                                    dataKey="grade"
                                    label={{ value: "Grade", position: "insideBottom", offset: -5 }}
                                    tick={{ fontSize: 12 }}
                                  />
                                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                                  <Tooltip />
                                  <Bar dataKey="count" fill="#009688" />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                )}

                {expanded[courseKey] === "review" && (
                  <tr>
                    <td colSpan="4" style={expandStyle}>
                      <h4>New Review Request – {course.name}</h4>
                      <textarea
                        placeholder="Message to instructor..."
                        style={textarea}
                        value={reviewMessages[course.name] || ""}
                        onChange={(e) =>
                          handleReviewMessageChange(course.name, e.target.value)
                        }
                      ></textarea>
                      <br />
                      <button style={submitButton} onClick={() => handleSubmitReviewRequest(course)}>
                        Submit grade review request
                      </button>
                    </td>
                  </tr>
                )}

                {expanded[courseKey] === "status" && (
                  <tr>
                    <td colSpan="4" style={expandStyle}>
                      <h4>Review Request Status – {course.name}</h4>
                      {(() => {
                        const replyKey = `${course.subjectID} - ${course.grades[0].gradeID}`;
                        const reply = reviewMessages.replies?.[replyKey];

                        if (!reply) return <div>No reply received yet.</div>;

                        return (
                          <>
                            <label>Message FROM instructor:</label>
                            <textarea
                              readOnly
                              style={textarea}
                              value={reply.text}
                            />
                            <br />
                            {/* Removed Download and Ack buttons */}
                          </>
                        );
                      })()}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const containerStyle = {
  maxWidth: 900,
  margin: "auto",
  padding: 20,
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  tableLayout: "fixed",
  minWidth: 700,
};

const thStyle = {
  borderBottom: "1px solid #ddd",
  padding: "12px 8px",
  textAlign: "left",
  backgroundColor: "#f2f2f2",
};

const tdStyle = {
  borderBottom: "1px solid #ddd",
  padding: "10px 8px",
  overflowWrap: "break-word",
  verticalAlign: "top",
};

const button = {
  marginRight: 8,
  padding: "6px 12px",
  fontSize: 14,
  cursor: "pointer",
  borderRadius: 4,
  border: "none",
  backgroundColor: "#007acc",
  color: "white",
  transition: "background-color 0.3s ease",
};

const expandStyle = {
  backgroundColor: "#f9f9f9",
  padding: 20,
  borderTop: "1px solid #ddd",
};

const gradesSection = {
  marginBottom: 20,
  fontSize: 16,
};
//
const mainChart = {
  width: "100%",
  height: 250,
  marginBottom: 20,
};

const chartsContainer = {
  display: "flex",
  flexDirection: "row",
  overflowX: "auto",
  gap: 20,
  paddingBottom: 10,
};

const largeChartContainer = {
  minWidth: 240,
  flexShrink: 0,
  backgroundColor: "#fff",
  border: "1px solid #ddd",
  borderRadius: 6,
  padding: 10,
};

const textarea = {
  width: "100%",
  minHeight: 100,
  padding: 10,
  fontSize: 14,
  borderRadius: 4,
  border: "1px solid #ccc",
  resize: "vertical",
};

const submitButton = {
  marginTop: 12,
  padding: "8px 16px",
  fontSize: 14,
  cursor: "pointer",
  borderRadius: 4,
  border: "none",
  backgroundColor: "#28a745",
  color: "white",
};


export default MyCourses;

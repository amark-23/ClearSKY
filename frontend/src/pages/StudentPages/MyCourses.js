// MyCourses.jsx

import { useEffect, useState } from "react";
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

  useEffect(() => {
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
        //
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
              statusData.lastSubmission && statusData.secondLastSubmission
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
          };
        });

      await Promise.all(statusPromises);
        //
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
        setStatistics(data);
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
  }, []);

  const handleExpand = (courseName, section) => {
    setExpanded((prev) => ({
      ...prev,
      [courseName]: prev[courseName] === section ? null : section,
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

            return (
              <React.Fragment key={i}>
                <tr>
                  <td style={tdStyle}>{course.name}</td>
                  <td style={tdStyle}>{course.semester}</td>
                  <td style={tdStyle}>{course.gradingStatus}</td>
                  <td style={tdStyle}>
                    <button style={button} onClick={() => handleExpand(course.name, "grades")}>
                      View my grades
                    </button>
                    <button
                      style={{
                        ...button,
                        backgroundColor: course.gradingStatus === "open" ? "#17a2b8" : "#ccc",
                        cursor: course.gradingStatus === "open" ? "pointer" : "not-allowed",
                      }}
                      disabled={course.gradingStatus !== "open"}
                      onClick={() => handleExpand(course.name, "review")}
                    >
                      Ask for review
                    </button>
                    <button style={button} onClick={() => handleExpand(course.name, "status")}>
                      View review status
                    </button>
                  </td>
                </tr>

                {expanded[course.name] === "grades" && (
                  <tr>
                    <td colSpan="4" style={expandStyle}>
                      <h4>{course.name} – Grades</h4>
                      <div style={gradesSection}>
                        {course.grades.map((g, idx) => (
                          <div key={idx}>
                            <strong>{g.scale}:</strong> {g.grade}
                          </div>
                        ))}
                      </div>
                      <div style={chartRow}>
                        <div style={chartBox}>
                          <ResponsiveContainer width="100%" height={150}>
                            <BarChart data={dist}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="grade" />
                              <YAxis allowDecimals={false} />
                              <Tooltip />
                              <Bar dataKey="count" fill="#007acc" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                        <div style={chartBox}>Q1 Chart</div>
                        <div style={chartBox}>Q2 Chart</div>
                      </div>
                    </td>
                  </tr>
                )}

                {expanded[course.name] === "review" && (
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

                {expanded[course.name] === "status" && (
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

// Styles
const containerStyle = {
  padding: "30px",
  maxWidth: "1000px",
  margin: "0 auto",
  fontFamily: "sans-serif",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
};

const thStyle = {
  padding: "12px",
  backgroundColor: "#f5f5f5",
  borderBottom: "2px solid #ccc",
  textAlign: "left",
};

const tdStyle = {
  padding: "12px",
  borderBottom: "1px solid #ddd",
};

const button = {
  marginRight: "6px",
  padding: "6px 10px",
  borderRadius: "5px",
  border: "none",
  backgroundColor: "#007bff",
  color: "#fff",
  cursor: "pointer",
};

const expandStyle = {
  backgroundColor: "#f9f9f9",
  padding: "20px",
};

const gradesSection = {
  display: "flex",
  gap: "20px",
  marginBottom: "20px",
};

const chartRow = {
  display: "flex",
  gap: "20px",
};

const chartBox = {
  flex: "1",
  height: "150px",
  backgroundColor: "#e6e6e6",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "6px",
};

const textarea = {
  width: "100%",
  height: "80px",
  padding: "10px",
  borderRadius: "6px",
  border: "1px solid #ccc",
  marginTop: "10px",
};

const submitButton = {
  marginTop: "10px",
  padding: "8px 16px",
  backgroundColor: "#28a745",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
};


export default MyCourses;

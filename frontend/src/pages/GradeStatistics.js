import { useEffect, useState } from "react";
import Header from "../components/Header";
import GoToMyCoursesButton from "../components/GoToMyCoursesButton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function GradeStatistics() {
  const [courseStats, setCourseStats] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [distribution, setDistribution] = useState([]);
  const [submissionDatesMap, setSubmissionDatesMap] = useState({});
  const [error, setError] = useState(null);

  // ✅ Helper για ημερομηνία και ώρα
  const formatDate = (dateStr) => {
    if (!dateStr) return { short: "—", full: "—" };
    const date = new Date(dateStr);
    return {
      short: date.toLocaleDateString("el-GR"),
      full: date.toLocaleString("el-GR", { hour12: false }),
    };
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/statistics");
        if (!res.ok) throw new Error("Failed to fetch course statistics");
        const data = await res.json();
        setCourseStats(data);

        const promises = data.map(async (course) => {
          const key = `${course.subjectName}_${course.period}`;
          try {
            const url = new URL("http://localhost:3000/api/submissionInfo");
            url.searchParams.append("subjectName", course.subjectName);
            url.searchParams.append("period", course.period);

            const res = await fetch(url);
            if (!res.ok) throw new Error("Failed submission fetch");

            const submissionData = await res.json();

            return {
              key,
              ...(submissionData.secondLastSubmission && submissionData.lastSubmission
                ? {
                    first: formatDate(submissionData.secondLastSubmission),
                    second: formatDate(submissionData.lastSubmission),
                  }
                : {
                    first: formatDate(submissionData.lastSubmission),
                    second: { short: "—", full: "—" },
                  }),
            };
          } catch {
            return { key, first: { short: "—", full: "—" }, second: { short: "—", full: "—" } };
          }
        });

        const allDates = await Promise.all(promises);
        const map = {};
        allDates.forEach((d) => {
          map[d.key] = { first: d.first, second: d.second };
        });
        setSubmissionDatesMap(map);
      } catch (err) {
        console.error("[FETCH ERROR]", err);
        setError("Could not load your courses.");
      }
    };
    fetchCourses();
  }, []);

  const normalizeDistribution = (input = []) => {
    const map = new Map(input.map((g) => [g.grade, g.count]));
    return Array.from({ length: 11 }, (_, i) => ({
      grade: i,
      count: map.get(i) || 0,
    }));
  };

  const fetchDistribution = async (subjectName, period) => {
    try {
      const url = new URL("http://localhost:3000/api/statistics");
      url.searchParams.append("subjectName", subjectName);
      url.searchParams.append("period", period);

      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch distribution");
      const data = await res.json();

      const normalized = normalizeDistribution(data.distribution || []);
      setDistribution(normalized);
    } catch (err) {
      console.error("[DISTRIBUTION FETCH ERROR]", err);
      setDistribution([]);
    }
  };

  const handleCourseClick = (course) => {
    setSelectedCourse(course);
    fetchDistribution(course.subjectName, course.period);
  };

  const userRole = (() => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
      const decoded = JSON.parse(atob(token.split(".")[1]));
      return decoded.role;
    } catch (err) {
      console.error("Token decode error:", err);
      return null;
    }
  })();

  return (
    <div style={{ padding: "30px", fontFamily: "sans-serif", maxWidth: "1000px", margin: "0 auto" }}>
      <Header />
      <h2 style={{ marginBottom: "20px", color: "#333" }}>📚 My Course Statistics</h2>

      {error ? (
        <div style={{ color: "red", marginBottom: "20px" }}>{error}</div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "30px" }}>
          <thead style={{ backgroundColor: "#f5f5f5" }}>
            <tr>
              <th style={thStyle}>📘 Course</th>
              <th style={thStyle}>📅 Period</th>
              <th style={thStyle}>1η Υποβολή</th>
              <th style={thStyle}>2η Υποβολή</th>
            </tr>
          </thead>
          <tbody>
            {courseStats.map((course, i) => {
              const key = `${course.subjectName}_${course.period}`;
              const isSelected =
                selectedCourse &&
                selectedCourse.subjectName === course.subjectName &&
                selectedCourse.period === course.period;

              return (
                <tr
                  key={i}
                  style={{
                    textAlign: "center",
                    borderBottom: "1px solid #ddd",
                    cursor: "pointer",
                    backgroundColor: isSelected ? "#e0f7fa" : "transparent",
                  }}
                  onClick={() => handleCourseClick(course)}
                >
                  <td style={tdStyle}>{course.subjectName || "-"}</td>
                  <td style={tdStyle}>{course.period || "—"}</td>
                  <td style={tdStyle} title={submissionDatesMap[key]?.first.full || "—"}>
                    {submissionDatesMap[key]?.first.short || "—"}
                  </td>
                  <td style={tdStyle} title={submissionDatesMap[key]?.second.full || "—"}>
                    {submissionDatesMap[key]?.second.short || "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      <GoToMyCoursesButton userRole={userRole} />

      <div style={mainChart}>
        {selectedCourse ? (
          distribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={distribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="grade" label={{ value: "Grade", position: "insideBottom", offset: -5 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#007acc" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <em>No distribution data available.</em>
          )
        ) : (
          <em>Select a course to view distribution.</em>
        )}
      </div>
    </div>
  );
}

// Styles
const thStyle = {
  padding: "12px",
  borderBottom: "2px solid #ccc",
  textAlign: "left",
  color: "#555",
};

const tdStyle = {
  padding: "12px",
};

const mainChart = {
  height: "280px",
  background: "#e6f2ff",
  marginTop: "40px",
  borderRadius: "8px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "20px",
};

export default GradeStatistics;

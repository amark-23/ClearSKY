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
  const [questionDistributions, setQuestionDistributions] = useState([]);
  const [submissionDatesMap, setSubmissionDatesMap] = useState({});
  const [error, setError] = useState(null);

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
        const resJson = await res.json();
        const data = Array.isArray(resJson.allDistributions) ? resJson.allDistributions : [];
        setCourseStats(data);

        const promises = data.map(async (course) => {
          const key = `${course.subjectName}_${course.period}`;
          try {
            const url = new URL("http://localhost:3000/api/submissionInfo");
            url.searchParams.append("subjectName", course.subjectName);
            url.searchParams.append("period", course.period.replace("+", " "));

            const res = await fetch(url);
            if (!res.ok) throw new Error("Failed submission fetch");

            const submissionData = await res.json();

            return {
              key,
              ...(() => {
                // Sort ώστε η first να είναι η παλαιότερη
                const [firstDate, secondDate] =
                  submissionData.lastSubmission < submissionData.secondLastSubmission
                    ? [submissionData.lastSubmission, submissionData.secondLastSubmission]
                    : [submissionData.secondLastSubmission, submissionData.lastSubmission];

                const isSame = firstDate === secondDate;

                return {
                  first: formatDate(firstDate),
                  second: isSame ? { short: "—", full: "—" } : formatDate(secondDate),
                };
              })(),
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

  const handleCourseClick = (course) => {
    setSelectedCourse(course);
    setDistribution(normalizeDistribution(course.distribution || []));
    if (course.qDistributions) {
      const qArray = Object.entries(course.qDistributions).map(([question, dist]) => ({
        question,
        distribution: normalizeDistribution(dist),
      }));
      setQuestionDistributions(qArray);
    } else {
      setQuestionDistributions([]);
    }
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

      {selectedCourse && questionDistributions.length > 0 && (
        <div style={questionSliderStyle}>
          {questionDistributions.map(({ question, distribution }, i) => (
            <div key={i} style={largeChartContainer}>
              <div style={{ textAlign: "center", marginBottom: 8, fontWeight: "600" }}>{question}</div>
              <ResponsiveContainer width={240} height={200}>
                <BarChart data={distribution}>
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

const questionSliderStyle = {
  display: "flex",
  overflowX: "auto",
  marginTop: 24,
  paddingBottom: 12,
  gap: 12,
  scrollbarWidth: "thin",
  scrollbarColor: "#007acc #e0e0e0",
};

const largeChartContainer = {
  flex: "0 0 auto",
  width: 260,
  background: "#f0f9f9",
  borderRadius: 8,
  padding: 12,
  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
};

export default GradeStatistics;

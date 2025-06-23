import { useNavigate } from "react-router-dom";

function GoToMyCoursesButton({ userRole }) {
  const navigate = useNavigate();

  if (userRole !== "student") return null;

  return (
    <button
      onClick={() => navigate("/student/courses")}
      style={{
        marginTop: "20px",
        padding: "10px 16px",
        borderRadius: "6px",
        backgroundColor: "#007bff",
        color: "#fff",
        border: "none",
        cursor: "pointer",
      }}
    >
      🎓 Go to my courses
    </button>
  );
}

export default GoToMyCoursesButton;

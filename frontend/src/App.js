import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import GradeStatistics from "./pages/GradeStatistics";
import InitialGradesUpload from "./pages/InstructorPages/InitialGradesUpload";
import FinalGradesUpload from "./pages/InstructorPages/FinalGradesUpload";
import ReviewRequests from "./pages/InstructorPages/ReviewRequests";
import MyCourses from "./pages/StudentPages/MyCourses";



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/statistics" element={<GradeStatistics />} />
        <Route path="/upload" element={<InitialGradesUpload />} />
        <Route path="/upload-final" element={<FinalGradesUpload />} />
        <Route path="/review-requests" element={<ReviewRequests />} />
        <Route path="/student/courses" element={<MyCourses />} />
      </Routes>
    </Router>
  );
}

export default App;

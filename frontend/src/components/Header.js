import { Link, useNavigate } from "react-router-dom";

function Header() {
  let user = null;
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  if (token) {
    try {
      const decoded = JSON.parse(atob(token.split(".")[1]));
      user = decoded;
    } catch (err) {
      console.error("Failed to decode token", err);
    }
  }

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <header
      style={{
        background: "#f5f5f5",
        padding: "12px 24px",
        marginBottom: "24px",
        borderRadius: "8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontFamily: "sans-serif",
        boxShadow: "0 2px 6px rgba(0, 0, 0, 0.05)",
      }}
    >
      {/* Logo */}
      <div style={{ fontWeight: "bold", fontSize: "20px", color: "#333" }}>
        clear<span style={{ color: "#007bff" }}>SKY</span>
      </div>

      {/* Status */}
      <div style={{ flex: 1, textAlign: "center", fontSize: "14px", color: "#555" }}>
        {user ? `${user.username || user.email} – ${user.role}` : ""}
      </div>

      {/* Navigation + Logout */}
      <nav style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        {user?.role === "instructor" && (
          <>
            <StyledLink to="/upload">Ανάρτηση</StyledLink>
            <StyledLink to="/upload-final">Τελική</StyledLink>
            <StyledLink to="/review-requests">Αιτήματα</StyledLink>
            <StyledLink to="/statistics">Στατιστικά</StyledLink>
          </>
        )}
        {user?.role === "student" && (
          <>
            <StyledLink to="/statistics">Στατιστικά</StyledLink>
            <StyledLink to="/student/courses">Τα Μαθήματά μου</StyledLink>
          </>
        )}
        {user && (
          <button
            onClick={handleLogout}
            style={{
              marginLeft: "16px",
              padding: "6px 12px",
              borderRadius: "6px",
              backgroundColor: "#dc3545",
              color: "#fff",
              border: "none",
              fontSize: "14px",
              cursor: "pointer",
              transition: "0.2s ease",
            }}
            onMouseOver={e => (e.currentTarget.style.backgroundColor = "#b52a37")}
            onMouseOut={e => (e.currentTarget.style.backgroundColor = "#dc3545")}
          >
            Logout
          </button>
        )}
      </nav>
    </header>
  );
}

function StyledLink({ to, children }) {
  return (
    <Link
      to={to}
      style={{
        textDecoration: "none",
        padding: "6px 12px",
        borderRadius: "6px",
        backgroundColor: "#007bff",
        color: "#fff",
        fontSize: "14px",
        transition: "0.2s ease",
      }}
      onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#0056b3")}
      onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#007bff")}
    >
      {children}
    </Link>
  );
}

export default Header;

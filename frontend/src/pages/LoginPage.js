import { useState } from "react";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("student");
  const [AMnumber, setAMnumber] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [isRegister, setIsRegister] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const endpoint = isRegister ? "register" : "login";

    const payload = isRegister
      ? {
          username,
          email,
          password,
          role,
          ...(role === "student" && { AMnumber }),
        }
      : { email, password };

    // Validation για register
    if (isRegister) {
      if (!username || !email || !password || !role) {
        setError(true);
        setMessage("Please fill in all required fields.");
        return;
      }
      if (role === "student" && !AMnumber) {
        setError(true);
        setMessage("Please provide your AM number.");
        return;
      }
      if (role !== "student" && role !== "instructor") {
        setError(true);
        setMessage("Role must be either 'student' or 'instructor'.");
        return;
      }
    }

    try {
      const response = await fetch(`http://localhost:3000/api/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(true);
        setMessage(data.message || `${isRegister ? "Registration" : "Login"} failed`);
        return;
      }

      setError(false);
      setMessage(isRegister ? "Registration successful" : "Login successful");

      if (!isRegister) {
        localStorage.setItem("token", data.token);

        const decoded = JSON.parse(atob(data.token.split('.')[1]));
        const userRole = decoded.role;

        switch (userRole) {
          case "student":
            window.location.href = "/statistics";
            break;
          case "instructor":
            window.location.href = "/upload";
            break;
          default:
            setMessage("Unknown role");
        }
      }
    } catch (err) {
      console.error("Error:", err);
      setError(true);
      setMessage("Network error or server unreachable");
    }
  };

  return (
    <div
      style={{
        maxWidth: "500px",
        margin: "60px auto",
        padding: "30px",
        fontFamily: "sans-serif",
        border: "1px solid #ddd",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        backgroundColor: "#fff",
      }}
    >
      <h2 style={{ marginBottom: "24px", color: "#333" }}>
        {isRegister ? "Register on clearSKY" : "Welcome to clearSKY"}
      </h2>

      <form onSubmit={handleSubmit}>
        {isRegister && (
          <>
            <div style={{ marginBottom: "14px" }}>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                }}
              />
            </div>
            <div style={{ marginBottom: "14px" }}>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                }}
              >
                <option value="student">Student</option>
                <option value="instructor">Instructor</option>
              </select>
            </div>
            {role === "student" && (
              <div style={{ marginBottom: "14px" }}>
                <input
                  type="text"
                  placeholder="AM Number"
                  value={AMnumber}
                  onChange={(e) => setAMnumber(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "6px",
                    border: "1px solid #ccc",
                  }}
                />
              </div>
            )}
          </>
        )}
        <div style={{ marginBottom: "14px" }}>
          <input
            type="text"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #ccc",
            }}
          />
        </div>
        <div style={{ marginBottom: "14px" }}>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #ccc",
            }}
          />
        </div>
        <button
          type="submit"
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "6px",
            border: "none",
            backgroundColor: "#007bff",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          {isRegister ? "Register" : "Login"}
        </button>
      </form>

      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <span>
          {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setMessage("");
              setError(false);
              // reset extra fields
              setUsername("");
              setAMnumber("");
              setRole("student");
            }}
            style={{
              background: "none",
              border: "none",
              color: "#007bff",
              textDecoration: "underline",
              cursor: "pointer",
              padding: 0,
              fontSize: "1em",
            }}
          >
            {isRegister ? "Login here" : "Register here"}
          </button>
        </span>
      </div>

      {message && (
        <div
          style={{
            marginTop: "20px",
            padding: "12px",
            borderRadius: "8px",
            background: error ? "#f8d7da" : "#e9ecef",
            color: error ? "#842029" : "#333",
            border: error ? "1px solid #f5c2c7" : "1px solid #ccc",
          }}
        >
          {message}
        </div>
      )}
    </div>
  );
}

export default LoginPage;

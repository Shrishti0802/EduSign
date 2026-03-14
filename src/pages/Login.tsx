import { useNavigate, Link } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const handleLogin = (e: any) => {
    e.preventDefault();
    localStorage.setItem("edusign_loggedIn", "true");
    navigate("/dashboard");
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "13px 16px",
    marginBottom: "16px",
    borderRadius: "10px",
    border: "1px solid rgba(83,125,150,0.3)",
    outline: "none",
    background: "rgba(255,255,255,0.05)",
    color: "#F4F0E4",
    fontSize: "0.95rem",
    fontFamily: "Inter, sans-serif",
    boxSizing: "border-box",
    transition: "border-color 0.2s ease",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#0f1117",
        fontFamily: "Inter, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background blobs */}
      <div style={{ position: "absolute", top: "10%", left: "10%", width: "380px", height: "380px", background: "radial-gradient(circle, #44A194 0%, transparent 70%)", opacity: 0.13, borderRadius: "50%" }} />
      <div style={{ position: "absolute", bottom: "10%", right: "10%", width: "340px", height: "340px", background: "radial-gradient(circle, #EC8F8D 0%, transparent 70%)", opacity: 0.12, borderRadius: "50%" }} />

      {/* Card */}
      <div
        style={{
          width: "400px",
          padding: "48px 40px",
          borderRadius: "20px",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(83,125,150,0.25)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
          backdropFilter: "blur(16px)",
          textAlign: "center",
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "32px" }}>
          <div style={{ width: "34px", height: "34px", borderRadius: "9px", background: "linear-gradient(135deg, #44A194, #537D96)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#F4F0E4", fontWeight: "900", fontSize: "0.95rem", fontFamily: "Poppins, sans-serif" }}>E</span>
          </div>
          <span style={{ color: "#F4F0E4", fontWeight: "700", fontSize: "1.1rem", fontFamily: "Poppins, sans-serif", letterSpacing: "2px" }}>EDUSIGN</span>
        </div>

        <h2 style={{ color: "#F4F0E4", fontSize: "1.5rem", fontWeight: "700", margin: "0 0 6px 0", fontFamily: "Poppins, sans-serif" }}>Welcome back</h2>
        <p style={{ color: "#a8c4d0", fontSize: "0.88rem", marginBottom: "32px" }}>Sign in to your account</p>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email address"
            required
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = "#44A194")}
            onBlur={(e) => (e.target.style.borderColor = "rgba(83,125,150,0.3)")}
          />
          <input
            type="password"
            placeholder="Password"
            required
            style={{ ...inputStyle, marginBottom: "28px" }}
            onFocus={(e) => (e.target.style.borderColor = "#44A194")}
            onBlur={(e) => (e.target.style.borderColor = "rgba(83,125,150,0.3)")}
          />

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "13px",
              borderRadius: "50px",
              border: "none",
              cursor: "pointer",
              fontSize: "0.97rem",
              fontWeight: "700",
              color: "#F4F0E4",
              fontFamily: "Poppins, sans-serif",
              background: "linear-gradient(135deg, #44A194 0%, #537D96 100%)",
              boxShadow: "0 6px 20px rgba(68,161,148,0.35)",
              transition: "all 0.3s ease",
              letterSpacing: "0.5px",
            }}
            onMouseEnter={(e: any) => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 10px 28px rgba(68,161,148,0.45)"; }}
            onMouseLeave={(e: any) => { e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = "0 6px 20px rgba(68,161,148,0.35)"; }}
          >
            Log In
          </button>
        </form>

        <p style={{ color: "#a8c4d0", marginTop: "24px", fontSize: "0.88rem" }}>
          Don't have an account?{" "}
          <Link to="/signup" style={{ color: "#EC8F8D", textDecoration: "none", fontWeight: "600" }}>
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;

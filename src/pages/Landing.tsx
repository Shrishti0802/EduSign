import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function Landing() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const loggedIn = localStorage.getItem("edusign_loggedIn") === "true";
    setIsLoggedIn(loggedIn);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("edusign_loggedIn");
    setIsLoggedIn(false);
  };

  const navBtnStyle: React.CSSProperties = {
    padding: "10px 26px",
    fontSize: "0.9rem",
    fontWeight: "600",
    borderRadius: "50px",
    border: "2px solid #44A194",
    cursor: "pointer",
    color: "#44A194",
    fontFamily: "Inter, sans-serif",
    background: "rgba(68,161,148,0.08)",
    transition: "all 0.3s ease",
    letterSpacing: "0.5px",
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        height: "100vh",
        width: "100vw",
        background: "#0f1117",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        zIndex: 9999,
        overflow: "hidden",
      }}
    >
      {/* Decorative blobs */}
      <div style={{ position: "absolute", top: "-80px", left: "-80px", width: "500px", height: "500px", background: "radial-gradient(circle, #44A194 0%, transparent 70%)", opacity: 0.28, borderRadius: "50%", zIndex: 0 }} />
      <div style={{ position: "absolute", bottom: "-100px", right: "-80px", width: "580px", height: "580px", background: "radial-gradient(circle, #EC8F8D 0%, transparent 70%)", opacity: 0.22, borderRadius: "50%", zIndex: 0 }} />
      <div style={{ position: "absolute", top: "30%", right: "5%", width: "340px", height: "340px", background: "radial-gradient(circle, #537D96 0%, transparent 70%)", opacity: 0.3, borderRadius: "50%", zIndex: 0 }} />
      <div style={{ position: "absolute", bottom: "15%", left: "4%", width: "260px", height: "260px", background: "radial-gradient(circle, #F4F0E4 0%, transparent 70%)", opacity: 0.06, borderRadius: "50%", zIndex: 0 }} />

      {/* Navbar */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, padding: "22px 48px", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg, #44A194, #537D96)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#F4F0E4", fontWeight: "900", fontSize: "1rem", fontFamily: "Poppins, sans-serif" }}>E</span>
          </div>
          <span style={{ color: "#F4F0E4", fontWeight: "700", fontSize: "1rem", fontFamily: "Poppins, sans-serif", letterSpacing: "2px" }}>EDUSIGN</span>
        </div>

        {isLoggedIn && (
          <button
            onClick={handleLogout}
            style={navBtnStyle}
            onMouseEnter={(e: any) => { e.target.style.background = "#44A194"; e.target.style.color = "#F4F0E4"; }}
            onMouseLeave={(e: any) => { e.target.style.background = "transparent"; e.target.style.color = "#44A194"; }}
          >
            Log Out
          </button>
        )}
      </div>

      {/* Main Content */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", maxWidth: "860px", width: "90%", padding: "20px", position: "relative", zIndex: 2 }}>
        <h1 style={{ fontSize: "7rem", fontWeight: "900", letterSpacing: "6px", fontFamily: "Poppins, sans-serif", margin: "0 0 8px 0", lineHeight: 1, color: "#F4F0E4" }}>
          EDU<span style={{ color: "#44A194" }}>SIGN</span>
        </h1>

        <div style={{ width: "80px", height: "5px", borderRadius: "99px", background: "linear-gradient(90deg, #44A194, #EC8F8D)", marginBottom: "36px" }} />

        <p style={{ fontSize: "1.2rem", lineHeight: "1.85", fontFamily: "Inter, Lato, sans-serif", color: "#a8c4d0", fontWeight: "400", marginBottom: "52px", maxWidth: "680px", opacity: 0.9 }}>
          Bridging the communication gap between hearing and deaf communities.
          EduSign empowers everyone to learn sign language through intuitive
          lessons, real-time AI feedback, and interactive practice experiences.
        </p>

        <div style={{ display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
          <button
            onClick={() => navigate(isLoggedIn ? "/dashboard" : "/login")}
            style={{ padding: "15px 46px", fontSize: "1.05rem", fontWeight: "700", borderRadius: "50px", border: "none", cursor: "pointer", color: "#F4F0E4", fontFamily: "Poppins, sans-serif", background: "linear-gradient(135deg, #44A194 0%, #537D96 100%)", transition: "all 0.3s ease", boxShadow: "0 6px 24px rgba(68,161,148,0.35)", letterSpacing: "0.5px" }}
            onMouseEnter={(e: any) => { e.target.style.transform = "translateY(-3px)"; e.target.style.boxShadow = "0 12px 32px rgba(68,161,148,0.45)"; }}
            onMouseLeave={(e: any) => { e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = "0 6px 24px rgba(68,161,148,0.35)"; }}
          >
            Get Started →
          </button>
        </div>
      </div>
    </div>
  );
}

export default Landing;

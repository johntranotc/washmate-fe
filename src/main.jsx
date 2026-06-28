import React from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import AppRoutes from "./routes/AppRoutes.jsx";
import { AppStoreProvider } from "./state/AppStore.jsx";
import "./styles/theme.css";
import "./index.css";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "833728967316-qe96dimj7jlcr07asavus1rb109shv67.apps.googleusercontent.com";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "40px", fontFamily: "sans-serif", backgroundColor: "#fff0f0", minHeight: "100vh", color: "#900" }}>
          <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "16px" }}>🚨 Phát hiện lỗi hiển thị giao diện (React Error Crash)</h1>
          <p style={{ marginBottom: "12px", fontSize: "16px" }}>Vui lòng chụp lại màn hình lỗi này gửi cho tôi để tôi khắc phục chính xác 100%:</p>
          <div style={{ backgroundColor: "#ffe0e0", padding: "16px", borderRadius: "8px", overflow: "auto", border: "1px solid #ffb0b0", marginBottom: "20px" }}>
            <strong>{this.state.error && this.state.error.toString()}</strong>
          </div>
          {this.state.errorInfo && (
            <pre style={{ fontSize: "13px", backgroundColor: "#333", color: "#0f0", padding: "16px", borderRadius: "8px", overflow: "auto" }}>
              {this.state.errorInfo.componentStack}
            </pre>
          )}
          <button
            onClick={() => { localStorage.clear(); sessionStorage.clear(); window.location.href = "/dang-nhap"; }}
            style={{ marginTop: "20px", padding: "12px 24px", backgroundColor: "#d00", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}
          >
            Xóa dữ liệu bị lỗi & Đăng nhập lại
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById("root")).render(
  <ErrorBoundary>
    <GoogleOAuthProvider clientId={googleClientId}>
      <AppStoreProvider>
        <AppRoutes />
      </AppStoreProvider>
    </GoogleOAuthProvider>
  </ErrorBoundary>,
);

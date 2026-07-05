import React from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import AppRoutes from "./routes/AppRoutes.jsx";
import { ToastHost } from "./components/ui/toast.jsx";
import { ConfirmDialogHost } from "./components/shared/ConfirmDialog.jsx";
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
        <div style={{ padding: "40px", fontFamily: "var(--font-sans)", backgroundColor: "var(--critical-container)", minHeight: "100vh", color: "var(--critical)" }}>
          <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "16px" }}>Phát hiện lỗi hiển thị giao diện (React Error Crash)</h1>
          <p style={{ marginBottom: "12px", fontSize: "16px" }}>Vui lòng chụp lại màn hình lỗi này và gửi cho đội phát triển:</p>
          <div style={{ backgroundColor: "var(--background)", padding: "16px", borderRadius: "var(--radius)", overflow: "auto", border: "1px solid var(--border)", marginBottom: "20px" }}>
            <strong>{this.state.error && this.state.error.toString()}</strong>
          </div>
          {this.state.errorInfo && (
            <pre style={{ fontSize: "13px", backgroundColor: "var(--foreground)", color: "var(--background)", padding: "16px", borderRadius: "var(--radius)", overflow: "auto" }}>
              {this.state.errorInfo.componentStack}
            </pre>
          )}
          <button
            onClick={() => { localStorage.clear(); sessionStorage.clear(); window.location.href = "/dang-nhap"; }}
            style={{ marginTop: "20px", padding: "12px 24px", backgroundColor: "var(--critical)", color: "var(--primary-foreground)", border: "none", borderRadius: "var(--radius)", fontWeight: "bold", cursor: "pointer" }}
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
      <ToastHost>
        <AppRoutes />
        <ConfirmDialogHost />
      </ToastHost>
    </GoogleOAuthProvider>
  </ErrorBoundary>,
);

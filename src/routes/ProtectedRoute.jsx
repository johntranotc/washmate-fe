import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppStore } from "../state/AppStore";

const homeByRole = {
  CUSTOMER: "/customer",
  STAFF: "/staff/queue",
  ADMIN: "/admin/dashboard",
};

function ProtectedRoute({ roles }) {
  const { state } = useAppStore();
  const location = useLocation();

  if (!state.session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (roles && !roles.includes(state.session.role)) {
    return <Navigate to={homeByRole[state.session.role]} replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;

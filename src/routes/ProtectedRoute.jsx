import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");


  console.log("🛡 ProtectedRoute");
  console.log("Token:", token);
  console.log("Role:", role);
  console.log("Allowed:", allowedRoles);

  if (!token) {
    // REPLACE history instead of pushing
    return <Navigate to="/auth" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};

export default ProtectedRoute;

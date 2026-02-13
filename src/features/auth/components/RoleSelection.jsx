import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { selectRole } from "../../../store/authSlice";
import { fetchDriverProfile } from "../../../store/driverSlice";
import "./RoleSelection.css";

const RoleSelection = ({ onBack }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { roles, user, loading } = useSelector((state) => state.auth);

  const handleRoleClick = async (role) => {
    const result = await dispatch(
      selectRole({ user_id: user.user_id, role })
    );

    if (selectRole.fulfilled.match(result)) {
      
      localStorage.setItem("access_token", result.payload.token);
      localStorage.setItem("role", role);
    }

    if (role === "FLEET_OWNER") {
      navigate("/dashboard", { replace: true });
      return;
    }

    if (role === "DRIVER") {
      const result = await dispatch(fetchDriverProfile());

      if (fetchDriverProfile.fulfilled.match(result)) {
        const profile = result.payload;
        navigate(
          profile.approval_status === "APPROVED"
            ? "/driver/dashboard"
            : "/driver/docs"
        , { replace: true });
      }
      return;
    }

    if(role === "TENANT_ADMIN") {
      navigate("/tenant-admin-dashboard", { replace: true });
      return;
    }

    if (role === "RIDER") {
      navigate("/rider", { replace: true });
    }
  };

  return (
    <>
      <h1 className="role-selection-heading">Select Your Role</h1>
      <p className="role-selection-subheading">
        Choose the role that best fits your needs
      </p>

      <div className="role-selection-grid">
        {roles.map((role) => (
          <button
            key={role}
            className="role-card"
            onClick={() => handleRoleClick(role)}
            disabled={loading}
          >
            <span className="role-name">{role}</span>
            <span className="role-arrow">→</span>
          </button>
        ))}

        <button className="back-link" onClick={onBack}>
          Use a different account
        </button>
      </div>
    </>
  );
};

export default RoleSelection;

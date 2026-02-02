import { useDispatch, useSelector } from 'react-redux';
import { selectRole } from '../../../store/authSlice.js';
import './RoleSelection.css';

const Roles = ({ onFleetSelect, onBack }) => {
  const dispatch = useDispatch();
  const { roles, user, loading } = useSelector(state => state.auth);

  const handleRoleClick = (role) => {
    dispatch(selectRole({ user_id: user.user_id, role }));

    if (role === 'FLEET_OWNER') {
      onFleetSelect();
    }
  };

  const hasFleetOwner = roles.includes('FLEET_OWNER');

  return (
    <>
      <h1 className="role-selection-heading">Select Your Role</h1>
      <p className="role-selection-subheading">Choose the role that best fits your needs</p>

      <div className="role-selection-grid">
        {roles.map(role => (
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

        {!hasFleetOwner && (
          <button className="role-card fleet-promo" onClick={onFleetSelect}>
            <div className="fleet-promo-content">
              <span className="role-name">Become a Fleet Owner</span>
              <span className="role-desc">Manage vehicles & drivers</span>
            </div>
            <span className="role-arrow">↗</span>
          </button>
        )}

        <button className="back-link" onClick={onBack}>
          Use a different account
        </button>
      </div>
    </>
  );
};


export default Roles;

import "./FleetOwnerDialog.css";

const FleetOwnerDialog = ({ open, onClose }) => {
  if (!open) return null;

  return (
    <div className="dialog-backdrop">
      <div className="dialog-box">
        <h3>Fleet Already Registered</h3>
        <p>You are already registered as a Fleet Owner.</p>

        <button className="submit-btn" onClick={onClose}>
          OK
        </button>
      </div>
    </div>
  );
};

export default FleetOwnerDialog;

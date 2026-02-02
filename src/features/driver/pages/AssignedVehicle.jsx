import React from "react";

const AssignedVehicle = () => {
  return (
    <div style={{ padding: "2rem" }}>
      <h1>Assigned Vehicle</h1>
      <p>Vehicle assignment details from <code>GET /driver/vehicle/assignment/current</code>.</p>
    </div>
  );
};

export default AssignedVehicle;

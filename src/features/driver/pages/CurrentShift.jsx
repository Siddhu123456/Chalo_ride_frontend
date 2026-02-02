import React from "react";

const CurrentShift = () => {
  return (
    <div style={{ padding: "2rem" }}>
      <h1>Current Shift</h1>
      <p>Read-only view of the current shift from <code>GET /drivers/shift/current</code>.</p>
    </div>
  );
};

export default CurrentShift;

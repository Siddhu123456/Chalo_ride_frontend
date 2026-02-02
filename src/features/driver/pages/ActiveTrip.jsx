import React from "react";

const ActiveTrip = () => {
  return (
    <div style={{ padding: "2rem" }}>
      <h1>Active Trip</h1>
      <p>Details of the current active trip from <code>GET /driver/trips/active</code>.</p>
    </div>
  );
};

export default ActiveTrip;

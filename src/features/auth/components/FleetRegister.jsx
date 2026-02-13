import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchFleetTenants,
    applyForFleet,
    clearFleetError
} from "../../../store/fleetSlice.js";
import "./FleetRegister.css";

const FleetRegistrationForm = () => {
    const dispatch = useDispatch();

    const { user } = useSelector(state => state.auth);

    const {
        availableTenants,
        hasExistingFleet,
        loading,
        error,
        successMsg,
    } = useSelector((state) => state.fleet);

    const [formData, setFormData] = useState({
        tenant_id: "",
        fleet_name: "",
    });

    
    
    useEffect(() => {
        if (hasExistingFleet === false || hasExistingFleet === null) {
            dispatch(fetchFleetTenants(user.user_id));
        }
    }, [hasExistingFleet, dispatch, user.user_id]);

    
    useEffect(() => {
        return () => {
            dispatch(clearFleetError());
        };
    }, [dispatch]);

    

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.tenant_id) return;

        dispatch(
            applyForFleet({
                tenant_id: Number(formData.tenant_id),
                fleet_name: formData.fleet_name.trim(),
            })
        );
    };

    

    return (
        <div className="form-content-box">
            <header className="form-intro">
                <h2>Partner Application</h2>
                <p>Start your journey as a Fleet Owner.</p>
            </header>

            
            {error && <div className="auth-alert error">{error}</div>}

            
            {successMsg && <div className="auth-alert success">{successMsg}</div>}

            
            {hasExistingFleet && (
                <div className="auth-alert success">
                    You already have a fleet registered.
                </div>
            )}

            {!hasExistingFleet && (
                <form className="registration-form" onSubmit={handleSubmit}>
                    <div className="form-row">
                        <label>Available Tenants</label>
                        <select
                            name="tenant_id"
                            value={formData.tenant_id}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select Tenant...</option>

                            {availableTenants.map((tenant) => (
                                <option key={tenant.tenant_id} value={tenant.tenant_id}>
                                    {tenant.name} ({tenant.default_currency})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-row">
                        <label>Fleet / Business Name</label>
                        <input
                            name="fleet_name"
                            type="text"
                            placeholder="e.g. Metro Cabs LLC"
                            value={formData.fleet_name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button className="submit-btn" disabled={loading}>
                        {loading ? "Processing..." : "Submit Application"}
                    </button>
                </form>
            )}
        </div>
    );
};

export default FleetRegistrationForm;

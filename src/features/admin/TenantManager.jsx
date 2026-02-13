import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCountries } from '../../store/authSlice';
import {
  fetchTenants,
  createTenant,
  fetchTenantCountries,
  addTenantCountry,
  fetchTenantAdmins,
  assignTenantAdmin,
  removeTenantAdmin,
  clearAdminState,
} from '../../store/adminSlice';
import './TenantManager.css';

const TenantManager = () => {
  const dispatch = useDispatch();

  const {
    tenants,
    currentTenantCountries,
    currentTenantAdmins,
    loading,
    error,
    successMsg,
  } = useSelector((state) => state.admin);

  const { countries: globalCountries } = useSelector(
    (state) => state.auth
  );

  const [view, setView] = useState('LIST');
  const [selectedTenant, setSelectedTenant] = useState(null);

  const [newTenant, setNewTenant] = useState({
    name: '',
    default_currency: '',
    default_timezone: '',
  });

  const [newCountry, setNewCountry] = useState({
    country_code: '',
    launched_on: new Date().toISOString().split('T')[0],
  });

  const [newAdmin, setNewAdmin] = useState({
    user_id: '',
    is_primary: false,
  });

  
  useEffect(() => {
    console.log('✅ TenantManager mounted');
  }, []);

  useEffect(() => {
    dispatch(fetchTenants());
    dispatch(fetchCountries());
  }, [dispatch]);

  const handleCreateTenant = async (e) => {
    e.preventDefault();
    await dispatch(createTenant(newTenant));
    setNewTenant({
      name: '',
      default_currency: '',
      default_timezone: '',
    });
  };

  const handleSelectTenant = (tenant) => {
    setSelectedTenant(tenant);
    dispatch(fetchTenantCountries(tenant.tenant_id));
    dispatch(fetchTenantAdmins(tenant.tenant_id));
    setView('DETAIL');
  };

  const handleAddCountry = async (e) => {
    e.preventDefault();
    if (!selectedTenant) return;

    await dispatch(
      addTenantCountry({
        tenantId: selectedTenant.tenant_id,
        countryData: newCountry,
      })
    );

    setNewCountry({
      country_code: '',
      launched_on: new Date().toISOString().split('T')[0],
    });
  };

  const handleAssignAdmin = async (e) => {
    e.preventDefault();
    if (!selectedTenant) return;

    await dispatch(
      assignTenantAdmin({
        tenantId: selectedTenant.tenant_id,
        payload: {
          user_id: parseInt(newAdmin.user_id),
          is_primary: newAdmin.is_primary,
        },
      })
    );

    setNewAdmin({ user_id: '', is_primary: false });
  };

  const handleRemoveAdmin = async (userId) => {
    if (!window.confirm('Remove this admin?')) return;
    await dispatch(
      removeTenantAdmin({
        tenantId: selectedTenant.tenant_id,
        userId,
      })
    );
  };

  const handleBack = () => {
    setView('LIST');
    setSelectedTenant(null);
    dispatch(clearAdminState());
  };

  return (
    <div className="tm-container">
      {(error || successMsg) && (
        <div className={`tm-notification ${error ? 'error' : 'success'}`}>
          {error || successMsg}
        </div>
      )}

      {view === 'LIST' && (
        <>
          <div className="tm-header">
            <h1>Tenant Overview</h1>
            <p>Manage platform instances and regional configurations.</p>
          </div>

          <div className="tm-dashboard-layout">
            <div className="tm-card">
              <h3>Register New Tenant</h3>
              <form onSubmit={handleCreateTenant}>
                <input
                  placeholder="Tenant Name"
                  value={newTenant.name}
                  onChange={(e) =>
                    setNewTenant({ ...newTenant, name: e.target.value })
                  }
                  required
                />
                <input
                  placeholder="Currency"
                  value={newTenant.default_currency}
                  onChange={(e) =>
                    setNewTenant({
                      ...newTenant,
                      default_currency: e.target.value,
                    })
                  }
                  required
                />
                <input
                  placeholder="Timezone"
                  value={newTenant.default_timezone}
                  onChange={(e) =>
                    setNewTenant({
                      ...newTenant,
                      default_timezone: e.target.value,
                    })
                  }
                  required
                />
                <button disabled={loading}>Create</button>
              </form>
            </div>

            <div className="tm-card">
              <h3>Existing Tenants</h3>
              <table>
                <tbody>
                  {tenants.map((t) => (
                    <tr key={t.tenant_id}>
                      <td>{t.name}</td>
                      <td>
                        <button onClick={() => handleSelectTenant(t)}>
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {view === 'DETAIL' && selectedTenant && (
        <>
          <button onClick={handleBack}>← Back</button>
          <h2>{selectedTenant.name}</h2>

          <section>
            <h3>Regions</h3>
            <form onSubmit={handleAddCountry}>
              <select
                value={newCountry.country_code}
                onChange={(e) =>
                  setNewCountry({
                    ...newCountry,
                    country_code: e.target.value,
                  })
                }
              >
                <option value="">Select</option>
                {globalCountries.map((c) => (
                  <option key={c.country_code} value={c.country_code}>
                    {c.name}
                  </option>
                ))}
              </select>
              <button>Add</button>
            </form>
          </section>

          <section>
            <h3>Admins</h3>
            <form onSubmit={handleAssignAdmin}>
              <input
                placeholder="User ID"
                value={newAdmin.user_id}
                onChange={(e) =>
                  setNewAdmin({ ...newAdmin, user_id: e.target.value })
                }
              />
              <label>
                <input
                  type="checkbox"
                  checked={newAdmin.is_primary}
                  onChange={(e) =>
                    setNewAdmin({
                      ...newAdmin,
                      is_primary: e.target.checked,
                    })
                  }
                />
                Primary
              </label>
              <button>Assign</button>
            </form>

            <ul>
              {currentTenantAdmins.map((a) => (
                <li key={a.user_id}>
                  #{a.user_id}
                  <button onClick={() => handleRemoveAdmin(a.user_id)}>
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  );
};

export default TenantManager;

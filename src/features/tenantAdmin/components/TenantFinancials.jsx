import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchTenantWallet,
  fetchTenantWalletTransactions,
  fetchVerifiedFleets,
  fetchFleetPendingCommission,
  fetchFleetUnsettledTrips,
  createFleetSettlement,
  fetchFleetSettlementHistory,
  fetchSettlementTrips,
  setSelectedFleetId,
  clearSettlementDetails,
} from '../../../store/tenantAdminSlice';
import './TenantFinancials.css';

const TenantFinancials = () => {
  const dispatch = useDispatch();
  const {
    wallet,
    transactions,
    transactionsPagination,
    verifiedFleets,  // Using verifiedFleets from API
    selectedFleetId,
    fleetPendingCommission,
    fleetUnsettledTrips,
    fleetSettlementHistory,
    selectedSettlementTrips,
    loading,
  } = useSelector((state) => state.tenantAdmin);

  const [activeTab, setActiveTab] = useState('WALLET');
  const [txPage, setTxPage] = useState(1);
  const [viewingTrips, setViewingTrips] = useState(null);

  // Fetch wallet and verified fleets on mount
  useEffect(() => {
    console.log('TenantFinancials: Fetching wallet and verified fleets');
    dispatch(fetchTenantWallet());
    dispatch(fetchVerifiedFleets());
  }, [dispatch]);

  // Fetch transactions when wallet is available or page changes
  useEffect(() => {
    if (!wallet) return;
    console.log('TenantFinancials: Fetching transactions - page:', txPage);
    dispatch(fetchTenantWalletTransactions({ page: txPage, limit: 20 }));
  }, [wallet, txPage, dispatch]);

  // Fetch settlement data when a fleet is selected and on settlements tab
  useEffect(() => {
    if (selectedFleetId && activeTab === 'SETTLEMENTS') {
      console.log('TenantFinancials: Fetching settlement data for fleet:', selectedFleetId);
      dispatch(fetchFleetPendingCommission(selectedFleetId));
      dispatch(fetchFleetUnsettledTrips(selectedFleetId));
      dispatch(fetchFleetSettlementHistory(selectedFleetId));
    }
  }, [selectedFleetId, activeTab, dispatch]);

  const formatCurrency = (value) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(parseFloat(value || 0));

  const formatDate = (date) => {
    if (!date) return '—';
    return new Intl.DateTimeFormat('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(date));
  };

  const totalPages = Math.ceil(
    (transactionsPagination?.total || 0) / (transactionsPagination?.limit || 1)
  );

  const handleFleetSelect = (fleetId) => {
    console.log('TenantFinancials: Fleet selected:', fleetId);
    dispatch(setSelectedFleetId(fleetId));
  };

  const handleCreateSettlement = async () => {
    if (!selectedFleetId) return;
    if (
      window.confirm(
        `Create settlement for ${formatCurrency(
          fleetPendingCommission?.total_commission
        )}?`
      )
    ) {
      console.log('TenantFinancials: Creating settlement for fleet:', selectedFleetId);
      await dispatch(createFleetSettlement(selectedFleetId));
    }
  };

  const handleViewSettlementTrips = (settlementId) => {
    console.log('TenantFinancials: Viewing trips for settlement:', settlementId);
    setViewingTrips(settlementId);
    dispatch(fetchSettlementTrips(settlementId));
  };

  const closeTripsModal = () => {
    setViewingTrips(null);
    dispatch(clearSettlementDetails());
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      PENDING: { label: 'Pending', className: 'status-pending' },
      COMPLETED: { label: 'Paid', className: 'status-completed' },
      CANCELLED: { label: 'Cancelled', className: 'status-cancelled' },
    };
    const config = statusMap[status] || { label: status, className: '' };
    return <span className={`tfin-status-badge ${config.className}`}>{config.label}</span>;
  };

  const getDirectionBadge = (direction) => {
    return (
      <span className={`tfin-direction-badge ${direction.toLowerCase()}`}>
        {direction === 'CREDIT' ? '+' : '−'}
      </span>
    );
  };

  console.log('TenantFinancials: Render state', {
    activeTab,
    hasWallet: !!wallet,
    verifiedFleetsCount: verifiedFleets?.length || 0,
    selectedFleetId,
    hasPendingCommission: !!fleetPendingCommission,
  });

  return (
    <div className="tfin-container">
      {/* Header */}
      <div className="tfin-header">
        <div>
          <h1 className="tfin-title">Financial Management</h1>
          <p className="tfin-subtitle">Wallet & Fleet Commissions</p>
        </div>
      </div>

      {/* Wallet Balance Card */}
      <div className="tfin-balance-card">
        <div className="tfin-balance-content">
          <span className="tfin-balance-label">Tenant Wallet Balance</span>
          <h2 className="tfin-balance-value">{formatCurrency(wallet?.balance)}</h2>
          <span className="tfin-wallet-id">Wallet ID: {wallet?.wallet_id ?? '—'}</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tfin-tabs">
        {['WALLET', 'SETTLEMENTS'].map((tab) => (
          <button
            key={tab}
            className={`tfin-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'WALLET' && '💳'}
            {tab === 'SETTLEMENTS' && '📊'}
            <span>{tab}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="tfin-content">
        {/* WALLET TAB */}
        {activeTab === 'WALLET' && (
          <div className="tfin-section">
            <h2 className="tfin-section-title">Transaction History</h2>
            {loading && (!transactions || transactions.length === 0) ? (
              <div className="tfin-loading">Loading transactions…</div>
            ) : !transactions || transactions.length === 0 ? (
              <div className="tfin-empty">
                <div className="tfin-empty-icon">💳</div>
                <p>No transactions yet</p>
              </div>
            ) : (
              <>
                <div className="tfin-table-wrapper">
                  <table className="tfin-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Type</th>
                        <th>Amount</th>
                        <th>Reason</th>
                        <th>Trip</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx) => (
                        <tr key={tx.transaction_id}>
                          <td>
                            <span className="tfin-id">#{tx.transaction_id}</span>
                          </td>
                          <td>{getDirectionBadge(tx.direction)}</td>
                          <td className="tfin-amount">
                            <strong>{formatCurrency(tx.amount)}</strong>
                          </td>
                          <td>
                            <span className="tfin-reason">{tx.reason}</span>
                          </td>
                          <td>{tx.trip_id ? `#${tx.trip_id}` : '—'}</td>
                          <td className="tfin-date">{formatDate(tx.created_on)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="tfin-pagination">
                    <button
                      className="tfin-page-btn"
                      disabled={txPage === 1}
                      onClick={() => setTxPage(txPage - 1)}
                    >
                      ← Previous
                    </button>
                    <span className="tfin-page-info">
                      Page {txPage} of {totalPages}
                    </span>
                    <button
                      className="tfin-page-btn"
                      disabled={txPage === totalPages}
                      onClick={() => setTxPage(txPage + 1)}
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* SETTLEMENTS TAB */}
        {activeTab === 'SETTLEMENTS' && (
          <div className="tfin-section">
            {/* Fleet Selector */}
            <div className="tfin-fleet-selector">
              <h3 className="tfin-selector-label">Select Fleet</h3>
              {!verifiedFleets || verifiedFleets.length === 0 ? (
                <div className="tfin-empty">
                  <div className="tfin-empty-icon">🏢</div>
                  <p>No verified fleets available</p>
                  <small style={{ color: '#6c757d', marginTop: '0.5rem' }}>
                    Fleets must be verified before they appear here
                  </small>
                </div>
              ) : (
                <div className="tfin-fleet-grid">
                  {verifiedFleets.map((fleet) => (
                    <button
                      key={fleet.fleet_id}
                      className={`tfin-fleet-card ${
                        selectedFleetId === fleet.fleet_id ? 'active' : ''
                      }`}
                      onClick={() => handleFleetSelect(fleet.fleet_id)}
                    >
                      <div className="tfin-fleet-icon">🏢</div>
                      <div className="tfin-fleet-info">
                        <span className="tfin-fleet-name">{fleet.fleet_name}</span>
                        <span className="tfin-fleet-meta">ID: {fleet.fleet_id}</span>
                      </div>
                      {selectedFleetId === fleet.fleet_id && (
                        <div className="tfin-fleet-check">✓</div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fleet Settlement Management */}
            {selectedFleetId && (
              <>
                {/* Pending Commission Card */}
                {fleetPendingCommission && (
                  <div className="tfin-commission-card">
                    <div className="tfin-commission-header">
                      <h3>Unsettled Commission</h3>
                      {fleetPendingCommission.total_unsettled_trips > 0 && (
                        <button
                          className="tfin-btn-create"
                          onClick={handleCreateSettlement}
                          disabled={loading}
                        >
                          Create Settlement
                        </button>
                      )}
                    </div>
                    <div className="tfin-commission-stats">
                      <div className="tfin-stat-box">
                        <span className="tfin-stat-label">Total Trips</span>
                        <span className="tfin-stat-value">
                          {fleetPendingCommission.total_unsettled_trips}
                        </span>
                      </div>
                      <div className="tfin-stat-box highlight">
                        <span className="tfin-stat-label">Total Commission</span>
                        <span className="tfin-stat-value">
                          {formatCurrency(fleetPendingCommission.total_commission)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Unsettled Trips Table */}
                {fleetUnsettledTrips && fleetUnsettledTrips.length > 0 && (
                  <div className="tfin-trips-section">
                    <h3 className="tfin-section-subtitle">Unsettled Trips</h3>
                    <div className="tfin-table-wrapper">
                      <table className="tfin-table">
                        <thead>
                          <tr>
                            <th>Trip ID</th>
                            <th>Commission</th>
                            <th>Completed At</th>
                          </tr>
                        </thead>
                        <tbody>
                          {fleetUnsettledTrips.map((trip) => (
                            <tr key={trip.trip_id}>
                              <td>
                                <span className="tfin-id">#{trip.trip_id}</span>
                              </td>
                              <td className="tfin-amount">
                                <strong>{formatCurrency(trip.platform_fee)}</strong>
                              </td>
                              <td className="tfin-date">
                                {formatDate(trip.completed_at)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Settlement History */}
                <div className="tfin-history-section">
                  <h3 className="tfin-section-subtitle">Settlement History</h3>
                  {loading && (!fleetSettlementHistory || fleetSettlementHistory.length === 0) ? (
                    <div className="tfin-loading">Loading history…</div>
                  ) : !fleetSettlementHistory || fleetSettlementHistory.length === 0 ? (
                    <div className="tfin-empty">
                      <div className="tfin-empty-icon">📜</div>
                      <p>No settlement history</p>
                    </div>
                  ) : (
                    <div className="tfin-table-wrapper">
                      <table className="tfin-table">
                        <thead>
                          <tr>
                            <th>Settlement ID</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Created</th>
                            <th>Paid On</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {fleetSettlementHistory.map((settlement) => (
                            <tr key={settlement.settlement_id}>
                              <td>
                                <span className="tfin-id">#{settlement.settlement_id}</span>
                              </td>
                              <td className="tfin-amount">
                                <strong>{formatCurrency(settlement.total_commission)}</strong>
                              </td>
                              <td>{getStatusBadge(settlement.status)}</td>
                              <td className="tfin-date">
                                {formatDate(settlement.created_on)}
                              </td>
                              <td className="tfin-date">
                                {formatDate(settlement.paid_on)}
                              </td>
                              <td>
                                <button
                                  className="tfin-btn-link"
                                  onClick={() =>
                                    handleViewSettlementTrips(settlement.settlement_id)
                                  }
                                >
                                  View Trips
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Trips Modal */}
      {viewingTrips && (
        <div className="tfin-modal-overlay" onClick={closeTripsModal}>
          <div className="tfin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="tfin-modal-header">
              <h2>Settlement Trips - #{viewingTrips}</h2>
              <button className="tfin-modal-close" onClick={closeTripsModal}>
                ✕
              </button>
            </div>

            <div className="tfin-modal-content">
              {!selectedSettlementTrips || selectedSettlementTrips.length === 0 ? (
                <p className="tfin-empty-text">No trips found</p>
              ) : (
                <div className="tfin-table-wrapper">
                  <table className="tfin-table">
                    <thead>
                      <tr>
                        <th>Trip ID</th>
                        <th>Commission Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedSettlementTrips.map((trip) => (
                        <tr key={trip.trip_id}>
                          <td>
                            <span className="tfin-id">#{trip.trip_id}</span>
                          </td>
                          <td className="tfin-amount">
                            <strong>{formatCurrency(trip.commission_amount)}</strong>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantFinancials;
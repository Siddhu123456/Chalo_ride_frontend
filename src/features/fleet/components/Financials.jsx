import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchWalletDetails,
  fetchWalletTransactions,
  fetchPendingSettlements,
  fetchSettlementHistory,
  fetchSettlementTrips,
  fetchSettlementTransactions,
  paySettlement,
} from "../../../store/fleetSlice";
import "./Financials.css";
import { FaCreditCard, FaBolt, FaFileAlt, FaChevronLeft, FaChevronRight, FaTimes } from 'react-icons/fa';

const Financials = () => {
  const dispatch = useDispatch();
  const {
    wallet,
    transactions,
    transactionsPagination,
    pendingSettlements,
    settlementHistory,
    selectedSettlementTrips,
    selectedSettlementTransactions,
    loading,
  } = useSelector((state) => state.fleet);

  const [activeTab, setActiveTab] = useState("WALLET");
  const [txPage, setTxPage] = useState(1);
  const [expandedSettlement, setExpandedSettlement] = useState(null);
  const [viewingDetails, setViewingDetails] = useState(null);

  
  useEffect(() => {
    dispatch(fetchWalletDetails());
  }, [dispatch]);

  
  useEffect(() => {
    if (!wallet) return;
    dispatch(fetchWalletTransactions({ page: txPage, limit: 20 }));
  }, [wallet, txPage, dispatch]);

  
  useEffect(() => {
    if (activeTab === "SETTLEMENTS") {
      dispatch(fetchPendingSettlements());
    } else if (activeTab === "HISTORY") {
      dispatch(fetchSettlementHistory());
    }
  }, [activeTab, dispatch]);

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(parseFloat(value || 0));

  const formatDate = (date) =>
    new Intl.DateTimeFormat("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(date));

  const totalPages = Math.ceil(
    (transactionsPagination?.total || 0) / (transactionsPagination?.limit || 1)
  );

  const handlePaySettlement = async (settlementId) => {
    if (window.confirm("Confirm payment for this settlement?")) {
      await dispatch(paySettlement(settlementId));
    }
  };

  const handleViewDetails = (settlementId, type) => {
    setViewingDetails({ settlementId, type });
    if (type === "trips") {
      dispatch(fetchSettlementTrips(settlementId));
    } else if (type === "transactions") {
      dispatch(fetchSettlementTransactions(settlementId));
    }
  };

  const closeDetails = () => {
    setViewingDetails(null);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      PENDING: { label: "Pending", className: "status-pending" },
      COMPLETED: { label: "Paid", className: "status-completed" },
      CANCELLED: { label: "Cancelled", className: "status-cancelled" },
    };
    const config = statusMap[status] || { label: status, className: "" };
    return <span className={`fin-status-badge ${config.className}`}>{config.label}</span>;
  };

  const getDirectionBadge = (direction) => {
    return (
      <span className={`fin-direction-badge ${direction.toLowerCase()}`}>
        {direction === "CREDIT" ? "+" : "−"}
      </span>
    );
  };

  return (
    <div className="fin-container">
      
      <div className="fin-header">
        <div>
          <h1 className="fin-title">Financials</h1>
          <p className="fin-subtitle">Wallet & Commission Settlements</p>
        </div>
      </div>

      
      <div className="fin-balance-card">
        <div className="fin-balance-content">
          <span className="fin-balance-label">Current Balance</span>
          <h2 className="fin-balance-value">{formatCurrency(wallet?.balance)}</h2>
          <span className="fin-wallet-id">Wallet ID: {wallet?.wallet_id ?? "—"}</span>
        </div>
      </div>

      
      <div className="fin-tabs">
        {["WALLET", "SETTLEMENTS", "HISTORY"].map((tab) => (
          <button
            key={tab}
            className={`fin-tab ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "WALLET" && <FaCreditCard className="icon-inline" />}
            {tab === "SETTLEMENTS" && <FaBolt className="icon-inline" />}
            {tab === "HISTORY" && <FaFileAlt className="icon-inline" />}
            <span>{tab.replace("_", " ")}</span>
          </button>
        ))}
      </div>

      
      <div className="fin-content">
        
        {activeTab === "WALLET" && (
          <div className="fin-section">
            <h2 className="fin-section-title">Transaction History</h2>
            {loading && transactions.length === 0 ? (
              <div className="fin-loading">Loading transactions…</div>
            ) : transactions.length === 0 ? (
              <div className="fin-empty">
                <div className="fin-empty-icon"><FaCreditCard className="icon-inline" /></div>
                <p>No transactions yet</p>
              </div>
            ) : (
              <>
                <div className="fin-table-wrapper">
                  <table className="fin-table">
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
                            <span className="fin-id">#{tx.transaction_id}</span>
                          </td>
                          <td>{getDirectionBadge(tx.direction)}</td>
                          <td className="fin-amount">
                            <strong>{formatCurrency(tx.amount)}</strong>
                          </td>
                          <td>
                            <span className="fin-reason">{tx.reason}</span>
                          </td>
                          <td>{tx.trip_id ? `#${tx.trip_id}` : "—"}</td>
                          <td className="fin-date">{formatDate(tx.created_on)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                
                {totalPages > 1 && (
                  <div className="fin-pagination">
                    <button
                      className="fin-page-btn"
                      disabled={txPage === 1}
                      onClick={() => setTxPage(txPage - 1)}
                    >
                      <FaChevronLeft className="icon-inline" /> Previous
                    </button>
                    <span className="fin-page-info">
                      Page {txPage} of {totalPages}
                    </span>
                    <button
                      className="fin-page-btn"
                      disabled={txPage === totalPages}
                      onClick={() => setTxPage(txPage + 1)}
                    >
                      Next <FaChevronRight className="icon-inline" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        
        {activeTab === "SETTLEMENTS" && (
          <div className="fin-section">
            <h2 className="fin-section-title">Pending Commission Settlements</h2>
            {loading && pendingSettlements.length === 0 ? (
              <div className="fin-loading">Loading settlements…</div>
            ) : pendingSettlements.length === 0 ? (
              <div className="fin-empty">
                <div className="fin-empty-icon"><FaBolt className="icon-inline" /></div>
                <p>No pending settlements</p>
              </div>
            ) : (
              <div className="fin-settlements-grid">
                {pendingSettlements.map((settlement) => (
                  <div key={settlement.settlement_id} className="fin-settlement-card">
                    <div className="fin-settlement-header">
                      <div>
                        <h3 className="fin-settlement-id">
                          Settlement #{settlement.settlement_id}
                        </h3>
                        <span className="fin-settlement-date">
                          {formatDate(settlement.created_on)}
                        </span>
                      </div>
                      {getStatusBadge(settlement.status)}
                    </div>

                    <div className="fin-settlement-amount">
                      <span className="fin-label">Total Commission</span>
                      <h2 className="fin-value">{formatCurrency(settlement.total_commission)}</h2>
                    </div>

                    <div className="fin-settlement-trips">
                      <span className="fin-label">
                        {settlement.trips?.length || 0} trip(s) included
                      </span>
                    </div>

                    <div className="fin-settlement-actions">
                      <button
                        className="fin-btn-secondary"
                        onClick={() => handleViewDetails(settlement.settlement_id, "trips")}
                      >
                        View Trips
                      </button>
                      <button
                        className="fin-btn-primary"
                        onClick={() => handlePaySettlement(settlement.settlement_id)}
                      >
                        Pay Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        
        {activeTab === "HISTORY" && (
          <div className="fin-section">
            <h2 className="fin-section-title">Settlement History</h2>
            {loading && settlementHistory.length === 0 ? (
              <div className="fin-loading">Loading history…</div>
            ) : settlementHistory.length === 0 ? (
              <div className="fin-empty">
                <div className="fin-empty-icon"><FaFileAlt className="icon-inline" /></div>
                <p>No settlement history</p>
              </div>
            ) : (
              <div className="fin-table-wrapper">
                <table className="fin-table">
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
                    {settlementHistory.map((settlement) => (
                      <tr key={settlement.settlement_id}>
                        <td>
                          <span className="fin-id">#{settlement.settlement_id}</span>
                        </td>
                        <td className="fin-amount">
                          <strong>{formatCurrency(settlement.total_commission)}</strong>
                        </td>
                        <td>{getStatusBadge(settlement.status)}</td>
                        <td className="fin-date">{formatDate(settlement.created_on)}</td>
                        <td className="fin-date">
                          {settlement.paid_on ? formatDate(settlement.paid_on) : "—"}
                        </td>
                        <td>
                          <button
                            className="fin-btn-link"
                            onClick={() => handleViewDetails(settlement.settlement_id, "trips")}
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      
      {viewingDetails && (
        <div className="fin-modal-overlay" onClick={closeDetails}>
          <div className="fin-modal" onClick={(e) => e.stopPropagation()}>
              <div className="fin-modal-header">
              <h2>
                {viewingDetails.type === "trips"
                  ? "Settlement Trips"
                  : "Settlement Transactions"}
              </h2>
              <button className="fin-modal-close" onClick={closeDetails}>
                <FaTimes className="icon-inline" />
              </button>
            </div>

            <div className="fin-modal-content">
              {viewingDetails.type === "trips" && (
                <>
                  {selectedSettlementTrips.length === 0 ? (
                    <p className="fin-empty-text">No trips found</p>
                  ) : (
                    <div className="fin-table-wrapper">
                      <table className="fin-table">
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
                                <span className="fin-id">#{trip.trip_id}</span>
                              </td>
                              <td className="fin-amount">
                                <strong>{formatCurrency(trip.commission_amount)}</strong>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}

              {viewingDetails.type === "transactions" && (
                <>
                  {selectedSettlementTransactions.length === 0 ? (
                    <p className="fin-empty-text">No transactions found</p>
                  ) : (
                    <div className="fin-table-wrapper">
                      <table className="fin-table">
                        <thead>
                          <tr>
                            <th>Transaction ID</th>
                            <th>Wallet ID</th>
                            <th>Amount</th>
                            <th>Direction</th>
                            <th>Reason</th>
                            <th>Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedSettlementTransactions.map((tx) => (
                            <tr key={tx.transaction_id}>
                              <td>
                                <span className="fin-id">#{tx.transaction_id}</span>
                              </td>
                              <td>{tx.wallet_id}</td>
                              <td className="fin-amount">
                                <strong>{formatCurrency(tx.amount)}</strong>
                              </td>
                              <td>{getDirectionBadge(tx.direction)}</td>
                              <td>
                                <span className="fin-reason">{tx.reason}</span>
                              </td>
                              <td className="fin-date">{formatDate(tx.created_on)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Financials;
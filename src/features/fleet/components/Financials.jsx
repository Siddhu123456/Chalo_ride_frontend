import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchWalletDetails, fetchWalletTransactions } from "../../../store/fleetSlice";
import "./Financials.css";

const Financials = () => {
  const dispatch = useDispatch();
  const { wallet, transactions, transactionsPagination, loading } = useSelector(
    (state) => state.fleet
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFilter, setSelectedFilter] = useState("ALL");
  const [timeRange, setTimeRange] = useState("30"); // days

  useEffect(() => {
    dispatch(fetchWalletDetails());
    dispatch(fetchWalletTransactions({ page: 1, limit: 20 }));
  }, [dispatch]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    dispatch(fetchWalletTransactions({ page: newPage, limit: 20 }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getTransactionIcon = (type) => {
    const icons = {
      CREDIT: "↓",
      DEBIT: "↑",
      REFUND: "↺",
      COMMISSION: "⊕",
      WITHDRAWAL: "⊖",
    };
    return icons[type] || "•";
  };

  const getTransactionColor = (type) => {
    const colors = {
      CREDIT: "credit",
      DEBIT: "debit",
      REFUND: "refund",
      COMMISSION: "commission",
      WITHDRAWAL: "withdrawal",
    };
    return colors[type] || "default";
  };

  // Filter transactions
  const filteredTransactions = transactions.filter((tx) => {
    if (selectedFilter === "ALL") return true;
    return tx.transaction_type === selectedFilter;
  });

  // Calculate stats
  const stats = {
    totalEarnings: transactions
      .filter((tx) => tx.transaction_type === "CREDIT")
      .reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0),
    totalWithdrawals: transactions
      .filter((tx) => tx.transaction_type === "WITHDRAWAL")
      .reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0),
    totalCommissions: transactions
      .filter((tx) => tx.transaction_type === "COMMISSION")
      .reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0),
    transactionCount: transactions.length,
  };

  const totalPages = Math.ceil(transactionsPagination.total / transactionsPagination.limit);

  return (
    <div className="financials-container">
      {/* Header */}
      <div className="fin-header">
        <div className="fin-header-content">
          <h1 className="fin-title">Financial Overview</h1>
          <p className="fin-subtitle">Track your fleet's financial performance</p>
        </div>
        <div className="fin-header-actions">
          <select
            className="fin-time-select"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
        </div>
      </div>

      {/* Wallet Balance Card */}
      <div className="fin-balance-section">
        <div className="fin-balance-card">
          <div className="fin-balance-header">
            <span className="fin-balance-label">Current Balance</span>
            <div className="fin-balance-status">
              <span className="fin-status-dot"></span>
              <span className="fin-status-text">Active</span>
            </div>
          </div>
          <div className="fin-balance-amount">
            {formatCurrency(wallet?.balance)}
          </div>
          <div className="fin-balance-footer">
            <span className="fin-wallet-id">
              Wallet ID: {wallet?.wallet_id?.slice(0, 8) || "N/A"}
            </span>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="fin-stats-grid">
          <div className="fin-stat-card earnings">
            <div className="fin-stat-icon">↓</div>
            <div className="fin-stat-content">
              <span className="fin-stat-label">Total Earnings</span>
              <span className="fin-stat-value">{formatCurrency(stats.totalEarnings)}</span>
            </div>
          </div>

          <div className="fin-stat-card withdrawals">
            <div className="fin-stat-icon">↑</div>
            <div className="fin-stat-content">
              <span className="fin-stat-label">Withdrawals</span>
              <span className="fin-stat-value">{formatCurrency(stats.totalWithdrawals)}</span>
            </div>
          </div>

          <div className="fin-stat-card commissions">
            <div className="fin-stat-icon">⊕</div>
            <div className="fin-stat-content">
              <span className="fin-stat-label">Commissions</span>
              <span className="fin-stat-value">{formatCurrency(stats.totalCommissions)}</span>
            </div>
          </div>

          <div className="fin-stat-card transactions">
            <div className="fin-stat-icon">#</div>
            <div className="fin-stat-content">
              <span className="fin-stat-label">Transactions</span>
              <span className="fin-stat-value">{stats.transactionCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Section */}
      <div className="fin-transactions-section">
        <div className="fin-transactions-header">
          <h2 className="fin-transactions-title">Transaction History</h2>
          <div className="fin-filter-tabs">
            {["ALL", "CREDIT", "DEBIT", "WITHDRAWAL", "COMMISSION"].map((filter) => (
              <button
                key={filter}
                className={`fin-filter-tab ${selectedFilter === filter ? "active" : ""}`}
                onClick={() => setSelectedFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="fin-transactions-list">
          {loading && transactions.length === 0 ? (
            <div className="fin-loading">
              <div className="fin-loader"></div>
              <span>Loading transactions...</span>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="fin-empty-state">
              <div className="fin-empty-icon">📊</div>
              <p className="fin-empty-text">No transactions found</p>
              <p className="fin-empty-subtext">
                Transactions will appear here once your fleet starts earning
              </p>
            </div>
          ) : (
            <div className="fin-table-wrapper">
              <table className="fin-table">
                <thead className="fin-table-head">
                  <tr>
                    <th>Type</th>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Balance After</th>
                    <th>Date & Time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody className="fin-table-body">
                  {filteredTransactions.map((tx) => (
                    <tr key={tx.transaction_id} className="fin-table-row">
                      <td>
                        <div className={`fin-tx-type ${getTransactionColor(tx.transaction_type)}`}>
                          <span className="fin-tx-icon">
                            {getTransactionIcon(tx.transaction_type)}
                          </span>
                          <span className="fin-tx-label">{tx.transaction_type}</span>
                        </div>
                      </td>
                      <td>
                        <div className="fin-tx-description">
                          {tx.description || tx.transaction_type}
                        </div>
                      </td>
                      <td>
                        <div
                          className={`fin-tx-amount ${
                            tx.transaction_type === "CREDIT" ? "positive" : "negative"
                          }`}
                        >
                          {tx.transaction_type === "CREDIT" ? "+" : "-"}
                          {formatCurrency(Math.abs(tx.amount))}
                        </div>
                      </td>
                      <td>
                        <div className="fin-tx-balance">
                          {formatCurrency(tx.balance_after)}
                        </div>
                      </td>
                      <td>
                        <div className="fin-tx-date">{formatDate(tx.created_on)}</div>
                      </td>
                      <td>
                        <span className="fin-tx-status completed">Completed</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredTransactions.length > 0 && (
          <div className="fin-pagination">
            <button
              className="fin-page-btn"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              ← Previous
            </button>
            <div className="fin-page-info">
              Page {currentPage} of {totalPages}
            </div>
            <button
              className="fin-page-btn"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Financials;
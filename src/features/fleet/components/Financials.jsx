import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchWalletDetails,
  fetchWalletTransactions,
} from "../../../store/fleetSlice";
import "./Financials.css";

const Financials = () => {
  const dispatch = useDispatch();

  const {
    wallet,
    transactions,
    transactionsPagination,
    loading,
  } = useSelector((state) => state.fleet);

  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchWalletDetails());
  }, [dispatch]);

  useEffect(() => {
    if (!wallet) return;
    dispatch(fetchWalletTransactions({ page, limit: 20 }));
  }, [wallet, page, dispatch]);

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
    (transactionsPagination?.total || 0) /
      (transactionsPagination?.limit || 1)
  );

  return (
    <div className="wallet-container">
      {/* Wallet Header */}
      <div className="wallet-header">
        <h1 className="wallet-title">Wallet</h1>
        <p className="wallet-subtitle">Fleet financial summary</p>
      </div>

      {/* Wallet Balance */}
      <div className="wallet-balance-card">
        <span className="wallet-balance-label">Current Balance</span>
        <h2 className="wallet-balance-value">
          {formatCurrency(wallet?.balance)}
        </h2>
        <span className="wallet-id">
          Wallet ID: {wallet?.wallet_id ?? "—"}
        </span>
      </div>

      {/* Transactions */}
      <div className="wallet-transactions">
        <h2 className="wallet-section-title">Transactions</h2>

        {loading && transactions.length === 0 ? (
          <p className="wallet-loading">Loading transactions…</p>
        ) : transactions.length === 0 ? (
          <p className="wallet-empty">No transactions found</p>
        ) : (
          <table className="wallet-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Trip</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.transaction_id}>
                  <td>{tx.transaction_id}</td>
                  <td>{tx.transaction_type}</td>
                  <td>{formatCurrency(tx.amount)}</td>
                  <td>{tx.trip_id ?? "—"}</td>
                  <td>{formatDate(tx.created_on)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="wallet-pagination">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </button>

            <span>
              Page {page} of {totalPages}
            </span>

            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Financials;

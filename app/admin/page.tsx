"use client";

import { useEffect, useState } from "react";
import "./admin.css";

interface WheelSpinRecord {
  id: string;
  sessionId: string;
  gift: string;
  giftId: string;
  createdAt: string;
  country: string;
  device: string;
  browser: string;
  claimed: boolean;
  status: string;
}

interface StatsData {
  visitors: number;
  uniqueVisitors: number;
  wheelOpens: number;
  wheelSpins: number;
  claimButtonClicks: number;
  claimsSubmitted: number;
  todayVisitors: number;
  thisMonthVisitors: number;
}

interface GiftSummary {
  label: string;
  won: number;
  claimed: number;
}

interface GiftClaimRecord {
  id: string;
  date: string;
  giftId: string;
  gift: string;
  email: string;
  name: string;
  status: string;
  notes: string;
}

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  const [loginError, setLoginError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [giftSummaries, setGiftSummaries] = useState<GiftSummary[]>([]);
  const [allWheelSpins, setAllWheelSpins] = useState<WheelSpinRecord[]>([]);
  const [filteredWheelSpins, setFilteredWheelSpins] = useState<WheelSpinRecord[]>([]);
  const [giftClaims, setGiftClaims] = useState<GiftClaimRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<"today" | "7days" | "30days" | "all">("all");
  const [selectedClaim, setSelectedClaim] = useState<GiftClaimRecord | null>(null);

  useEffect(() => {
    const isAuth = sessionStorage.getItem("isAdmin") === "true";
    const savedPassword = sessionStorage.getItem("adminPassword");
    if (isAuth && savedPassword) {
      setIsAuthenticated(true);
      fetchStats(savedPassword);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchStats = async (authPassword: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/stats", {
        headers: {
          Authorization: `Bearer ${authPassword}`,
        },
      });
      if (res.status === 401) {
        handleLogout();
        setLoginError("Session expired. Please log in again.");
      } else {
        const data = await res.json();
        if (data.success) {
          setStats(data.stats);
          setGiftSummaries(data.giftSummaries);
          setAllWheelSpins(data.wheelSpins);
          setFilteredWheelSpins(data.wheelSpins);
          setGiftClaims(data.giftClaims || []);
        }
      }
    } catch (err) {
      console.error("Failed to fetch dashboard statistics:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        sessionStorage.setItem("isAdmin", "true");
        sessionStorage.setItem("adminPassword", password);
        setIsAuthenticated(true);
        fetchStats(password);
      } else {
        setLoginError(data.error || "Incorrect password");
        setLoading(false);
      }
    } catch (err) {
      setLoginError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("isAdmin");
    sessionStorage.removeItem("adminPassword");
    setIsAuthenticated(false);
    setPassword("");
    setStats(null);
    setAllWheelSpins([]);
    setFilteredWheelSpins([]);
    setGiftClaims([]);
  };

  useEffect(() => {
    let result = [...allWheelSpins];

    if (dateFilter !== "all") {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      const sevenDaysAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;
      const thirtyDaysAgo = now.getTime() - 30 * 24 * 60 * 60 * 1000;

      result = result.filter((spin) => {
        const spinTime = new Date(spin.createdAt).getTime();
        if (dateFilter === "today") return spinTime >= startOfToday;
        if (dateFilter === "7days") return spinTime >= sevenDaysAgo;
        if (dateFilter === "30days") return spinTime >= thirtyDaysAgo;
        return true;
      });
    }

    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      result = result.filter((spin) => {
        return (
          spin.gift.toLowerCase().includes(term) ||
          spin.sessionId.toLowerCase().includes(term) ||
          spin.country.toLowerCase().includes(term) ||
          spin.device.toLowerCase().includes(term) ||
          spin.browser.toLowerCase().includes(term) ||
          spin.status.toLowerCase().includes(term)
        );
      });
    }

    setFilteredWheelSpins(result);
  }, [searchTerm, dateFilter, allWheelSpins]);

  if (loading && !isAuthenticated) {
    return (
      <div className="admin-login-container">
        <div style={{ color: "var(--text-color)", fontSize: "14px", letterSpacing: "0.05em" }}>
          Loading Dashboard...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="admin-login-container">
        <div className="admin-login-card">
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <h1 className="admin-login-title">Faiz Rahim</h1>
            <p className="admin-login-subtitle">Internal Analytics Portal</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="admin-input-group">
              <label htmlFor="password" className="admin-label">
                Access Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="admin-input"
                placeholder="Enter password"
                required
                autoFocus
              />
              {loginError && <p className="admin-error">{loginError}</p>}
            </div>

            <button type="submit" disabled={loading} className="admin-btn">
              {loading ? "Authenticating..." : "Unlock Dashboard"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-wrapper">
      <header className="admin-header">
        <div>
          <h1 className="admin-header-title">Analytics Dashboard</h1>
          <p className="admin-header-subtitle">Internal Operations</p>
        </div>
        <button onClick={handleLogout} className="admin-signout-btn">
          Sign Out
        </button>
      </header>

      <main className="admin-main">
        {/* SECTION: Overview */}
        <section className="admin-section">
          <div className="admin-section-header">
            <h2 className="admin-section-title">Overview Stats</h2>
            <button
              onClick={() => fetchStats(sessionStorage.getItem("adminPassword") || "")}
              className="admin-link-btn"
            >
              Refresh Data
            </button>
          </div>

          <div className="admin-overview-grid">
            <div className="admin-card">
              <span className="admin-card-label">Total Visitors</span>
              <span className="admin-card-value">{stats?.visitors ?? 0}</span>
            </div>
            <div className="admin-card">
              <span className="admin-card-label">Unique Visitors</span>
              <span className="admin-card-value">{stats?.uniqueVisitors ?? 0}</span>
            </div>
            <div className="admin-card">
              <span className="admin-card-label">Wheel Opens</span>
              <span className="admin-card-value">{stats?.wheelOpens ?? 0}</span>
            </div>
            <div className="admin-card">
              <span className="admin-card-label">Wheel Spins</span>
              <span className="admin-card-value">{stats?.wheelSpins ?? 0}</span>
            </div>
            <div className="admin-card">
              <span className="admin-card-label">Today's Visitors</span>
              <span className="admin-card-value">{stats?.todayVisitors ?? 0}</span>
            </div>
            <div className="admin-card">
              <span className="admin-card-label">This Month</span>
              <span className="admin-card-value">{stats?.thisMonthVisitors ?? 0}</span>
            </div>
            <div className="admin-card">
              <span className="admin-card-label">Claim Clicks</span>
              <span className="admin-card-value">{stats?.claimButtonClicks ?? 0}</span>
            </div>
            <div className="admin-card">
              <span className="admin-card-label">Claims Submitted</span>
              <span className="admin-card-value">{stats?.claimsSubmitted ?? 0}</span>
            </div>
          </div>
        </section>

        {/* SECTION: Gift Claims */}
        <section className="admin-section">
          <h2 className="admin-section-title" style={{ marginBottom: "24px" }}>
            Gift Claims
          </h2>

          <div className="admin-table-wrapper rounded-all">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Gift</th>
                  <th>Email</th>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Notes</th>
                  <th style={{ width: "80px", textAlign: "center" }}>Details</th>
                </tr>
              </thead>
              <tbody>
                {giftClaims.length > 0 ? (
                  giftClaims.map((claim) => (
                    <tr key={claim.id}>
                      <td className="admin-mono-cell">
                        {new Date(claim.date).toLocaleDateString(undefined, {
                          dateStyle: "medium",
                        })}
                      </td>
                      <td className="admin-gift-cell">{claim.gift}</td>
                      <td>{claim.email}</td>
                      <td>{claim.name}</td>
                      <td className="admin-status-cell">
                        <span className={claim.status === "approved" ? "status-completed" : "status-active"}>
                          {claim.status}
                        </span>
                      </td>
                      <td style={{ whiteSpace: "pre-wrap", maxWidth: "300px" }}>
                        {claim.notes.length > 50 ? `${claim.notes.substring(0, 50)}...` : claim.notes || "—"}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <button
                          onClick={() => setSelectedClaim(claim)}
                          className="admin-link-btn"
                          style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="admin-empty-state">
                      No gift claims yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* SECTION: Wheel Results */}
        <section className="admin-section">
          <h2 className="admin-section-title" style={{ marginBottom: "24px" }}>
            Wheel Results
          </h2>

          {/* Gift Summary Cards */}
          <div className="admin-gifts-grid">
            {giftSummaries.map((gift, idx) => (
              <div key={idx} className="admin-gift-card">
                <span className="admin-gift-name" title={gift.label}>
                  {gift.label}
                </span>
                <div className="admin-gift-stats">
                  <div className="admin-gift-stat-item">
                    <span className="admin-gift-stat-label">Won</span>
                    <span className="admin-gift-stat-value">{gift.won}</span>
                  </div>
                  <div className="admin-gift-stat-item">
                    <span className="admin-gift-stat-label">Claimed</span>
                    <span className="admin-gift-stat-value claimed-color">{gift.claimed}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Controls */}
          <div className="admin-table-controls">
            <div className="admin-search-wrapper">
              <input
                type="text"
                placeholder="Search spins..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="admin-search-input"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm("")} className="admin-search-clear">
                  ✕
                </button>
              )}
            </div>

            <div className="admin-filters">
              {(["all", "today", "7days", "30days"] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setDateFilter(filter)}
                  className={`admin-filter-btn ${dateFilter === filter ? "active" : ""}`}
                >
                  {filter === "all" ? "All Time" : filter === "7days" ? "7 Days" : filter === "30days" ? "30 Days" : "Today"}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: "160px" }}>Date & Time</th>
                  <th>Gift Won</th>
                  <th style={{ width: "150px" }}>Session ID</th>
                  <th style={{ width: "130px" }}>Country</th>
                  <th style={{ width: "100px" }}>Device</th>
                  <th style={{ width: "120px" }}>Browser</th>
                  <th style={{ width: "80px", textAlign: "center" }}>Claimed</th>
                  <th style={{ width: "100px" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredWheelSpins.length > 0 ? (
                  filteredWheelSpins.map((spin) => (
                    <tr key={spin.id}>
                      <td className="admin-mono-cell">
                        {new Date(spin.createdAt).toLocaleString(undefined, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </td>
                      <td className="admin-gift-cell">{spin.gift}</td>
                      <td className="admin-mono-cell" title={spin.sessionId}>
                        {spin.sessionId.substring(0, 15)}...
                      </td>
                      <td>{spin.country}</td>
                      <td>{spin.device}</td>
                      <td>{spin.browser}</td>
                      <td style={{ textAlign: "center" }}>
                        <span
                          className={`admin-indicator ${
                            spin.claimed ? "indicator-yes" : "indicator-no"
                          }`}
                        />
                      </td>
                      <td className="admin-status-cell">
                        <span className={spin.status === "claimed" ? "status-completed" : "status-active"}>
                          {spin.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="admin-empty-state">
                      No matching wheel results found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

      </main>

      {/* Details Modal */}
      {selectedClaim && (
        <div
          className="admin-modal-overlay"
          onClick={() => setSelectedClaim(null)}
        >
          <div
            className="admin-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="admin-modal-title">
              Claim Submission Details
            </h3>

            <div className="admin-modal-content">
              <div className="admin-modal-field">
                <strong className="admin-modal-field-label">Gift Type</strong>
                <span>{selectedClaim.gift}</span>
              </div>

              <div className="admin-modal-field">
                <strong className="admin-modal-field-label">Name</strong>
                <span>{selectedClaim.name || "Anonymous"}</span>
              </div>

              <div className="admin-modal-field">
                <strong className="admin-modal-field-label">Email</strong>
                <span>{selectedClaim.email || "N/A"}</span>
              </div>

              <div className="admin-modal-field">
                <strong className="admin-modal-field-label">Submission Date</strong>
                <span>{new Date(selectedClaim.date).toLocaleString()}</span>
              </div>

              <div className="admin-modal-field">
                <strong className="admin-modal-field-label">Form Details</strong>
                <pre className="admin-modal-pre">
                  {selectedClaim.notes || "No extra details submitted."}
                </pre>
              </div>
            </div>

            <button
              onClick={() => setSelectedClaim(null)}
              className="admin-btn"
              style={{ marginTop: "24px" }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

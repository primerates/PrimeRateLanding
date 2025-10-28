import { useState } from 'react';
import './loan-status-dashboard.css';
import { Mail, Monitor, Eye, FileText, Lock, DollarSign, Users, Home, Activity, FileEdit } from 'lucide-react';

export default function AdminDraftLoanStatus() {
  const [activeTab, setActiveTab] = useState('documents');
  const [docsDropdownOpen, setDocsDropdownOpen] = useState(false);

  return (
    <div className="loan-status-dashboard">
      <div className="dashboard-container">
        
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1>Loan Status</h1>
            <div style={{ color: '#94a3b8', fontSize: '1rem', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>John Doe • Mary Doe</span>
              <span title="Back to Dashboard" style={{ display: 'inline-flex', alignItems: 'center' }}>
                <Eye 
                  size={18}
                  style={{ cursor: 'pointer', color: '#a78bfa', transition: 'all 0.3s' }}
                  onMouseOver={(e) => e.currentTarget.style.color = '#d8b4fe'}
                  onMouseOut={(e) => e.currentTarget.style.color = '#a78bfa'}
                  onClick={() => console.log('Back to Dashboard - feature coming soon')}
                />
              </span>
            </div>
          </div>
          <div className="header-buttons">
            <button className="email-btn" title="Email Inbox">
              <Mail size={16} />
              Email
              <span className="badge">5</span>
            </button>
            <button className="screen-share-btn" title="Screen Share">
              <Monitor size={16} />
              Screen Share
            </button>
            <div className="live-indicator" title="Loan Timeline" style={{ cursor: 'pointer' }}>
              <div className="live-dot"></div>
              Live
            </div>
          </div>
        </div>

        {/* Performance Card */}
        <div className="performance-card">
          {/* 1. COMPLETION */}
          <div className="metric-item">
            <div className="metric-label">Completion</div>
            <div className="metric-value">
              72<span className="metric-unit">%</span>
            </div>
          </div>
          
          {/* 2. DOCS */}
          <div className="metric-item">
            <div className="metric-label">Docs</div>
            <div className="metric-value">
              3
              <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 600, marginLeft: '0.25rem' }}>Pending</span>
            </div>
          </div>
          
          {/* 3. SERVICES */}
          <div className="metric-item">
            <div className="metric-label">Services</div>
            <div className="metric-value">
              2
              <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 600, marginLeft: '0.25rem' }}>Pending</span>
            </div>
          </div>
          
          {/* 4. CATEGORY */}
          <div className="metric-item">
            <div className="metric-label">Category</div>
            <div className="metric-value">
              VA
            </div>
          </div>
          
          {/* 5. LOAN AMOUNT */}
          <div className="metric-item">
            <div className="metric-label">Loan Amount</div>
            <div className="metric-value">
              $425,000
            </div>
          </div>
          
          {/* 6. INTEREST RATE */}
          <div className="metric-item">
            <div className="metric-label">Interest Rate</div>
            <div className="metric-value">
              6.75<span className="metric-unit">%</span>
              <Lock size={16} style={{ color: '#10b981', marginLeft: '0.25rem' }} />
            </div>
          </div>
          
          {/* 7. LOCKED YIELD */}
          <div className="metric-item">
            <div className="metric-label">Locked Yield</div>
            <div className="metric-value">
              3.95
              <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                ↑ 10 yr
              </span>
            </div>
          </div>
          
          {/* 8. LOCK EXPIRES */}
          <div className="metric-item">
            <div className="metric-label">Lock Expires</div>
            <div className="metric-value">
              18 days
            </div>
          </div>
        </div>

        {/* Navigation Pills */}
        <div className="nav-card">
          <div className="nav-container">
            <div className="nav-pills">
              
              {/* Documents Dropdown */}
              <div className={`nav-pill-dropdown ${docsDropdownOpen ? 'open' : ''}`}>
                <button 
                  className={`nav-pill ${activeTab === 'documents' ? 'active' : ''}`}
                  onClick={() => {
                    setDocsDropdownOpen(!docsDropdownOpen);
                    setActiveTab('documents');
                  }}
                >
                  <div className="nav-pill-icon">
                    <FileText size={11} />
                  </div>
                  Documents
                  <svg className="dropdown-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m6 9 6 6 6-6"/>
                  </svg>
                </button>
                <div className={`dropdown-menu ${docsDropdownOpen ? 'show' : ''}`}>
                  <div className="dropdown-option">Pending</div>
                  <div className="dropdown-option">Under Review</div>
                  <div className="dropdown-option">Cleared</div>
                  <div className="dropdown-option">Show All</div>
                  <div className="dropdown-option">Search</div>
                  <div className="dropdown-option">Update Docs</div>
                </div>
              </div>

              {/* Vendors */}
              <button 
                className={`nav-pill ${activeTab === 'vendors' ? 'active' : ''}`}
                onClick={() => setActiveTab('vendors')}
              >
                <div className="nav-pill-icon">
                  <Lock size={11} />
                </div>
                Vendors
              </button>

              {/* Rate Lock */}
              <button 
                className={`nav-pill ${activeTab === 'ratelock' ? 'active' : ''}`}
                onClick={() => setActiveTab('ratelock')}
              >
                <div className="nav-pill-icon">
                  <Lock size={11} />
                </div>
                Rate Lock
              </button>

              {/* Figures */}
              <button 
                className={`nav-pill ${activeTab === 'figures' ? 'active' : ''}`}
                onClick={() => setActiveTab('figures')}
              >
                <div className="nav-pill-icon">
                  <DollarSign size={11} />
                </div>
                Figures
              </button>

              {/* Team */}
              <button 
                className={`nav-pill ${activeTab === 'team' ? 'active' : ''}`}
                onClick={() => setActiveTab('team')}
              >
                <div className="nav-pill-icon">
                  <Users size={11} />
                </div>
                Team
              </button>

              {/* Loan Details */}
              <button 
                className={`nav-pill ${activeTab === 'loan' ? 'active' : ''}`}
                onClick={() => setActiveTab('loan')}
              >
                <div className="nav-pill-icon">
                  <Home size={11} />
                </div>
                Loan
              </button>

              {/* Activity */}
              <button 
                className={`nav-pill ${activeTab === 'activity' ? 'active' : ''}`}
                onClick={() => setActiveTab('activity')}
              >
                <div className="nav-pill-icon">
                  <Activity size={11} />
                </div>
                Activity
              </button>

              {/* Notes */}
              <button 
                className={`nav-pill ${activeTab === 'notes' ? 'active' : ''}`}
                onClick={() => setActiveTab('notes')}
              >
                <div className="nav-pill-icon">
                  <FileEdit size={11} />
                </div>
                Notes
              </button>

            </div>
          </div>
        </div>

        {/* Content Area - Placeholder for now */}
        <div className="content-card">
          <h2 className="card-title">
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </h2>
          <div className="placeholder-text">
            <p>Content for {activeTab} will be displayed here</p>
            <p style={{ marginTop: '1rem', fontSize: '0.875rem' }}>
              This is a working React sandbox - easy to edit and develop!
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

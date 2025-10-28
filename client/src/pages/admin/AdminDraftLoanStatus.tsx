export default function AdminDraftLoanStatus() {
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      margin: 0,
      padding: 0,
      position: 'fixed',
      top: 0,
      left: 0,
      overflow: 'hidden'
    }}>
      <iframe
        src="/loan-status-dashboard.html"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          margin: 0,
          padding: 0,
          display: 'block'
        }}
        title="Loan Status Dashboard"
        data-testid="iframe-loan-status-dashboard"
      />
    </div>
  );
}

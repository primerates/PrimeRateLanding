import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { LayoutDashboard } from 'lucide-react';

export default function AdminDraftLoanStatus() {
  const [, setLocation] = useLocation();

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
      {/* Live Button - Fixed in top-right corner */}
      <Button
        onClick={() => setLocation('/admin/dashboard')}
        className="fixed top-4 right-4 z-50 shadow-lg"
        variant="default"
        size="default"
        data-testid="button-back-to-dashboard"
      >
        <LayoutDashboard className="mr-2 h-4 w-4" />
        Dashboard
      </Button>

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

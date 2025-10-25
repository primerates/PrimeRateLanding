import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  Eye, ChevronDown, X, FileText, CheckCircle, Activity, 
  BarChart, ChevronUp
} from 'lucide-react';

// Document colors for stacking
const documentColors = [
  { name: 'blue', gradient: 'linear-gradient(to bottom, #3b82f6, #2563eb)', color: '#3b82f6', shadow: 'rgba(59, 130, 246, 0.5)' },
  { name: 'purple', gradient: 'linear-gradient(to bottom, #8b5cf6, #7c3aed)', color: '#8b5cf6', shadow: 'rgba(168, 85, 247, 0.5)' },
  { name: 'emerald', gradient: 'linear-gradient(to bottom, #10b981, #059669)', color: '#10b981', shadow: 'rgba(16, 185, 129, 0.5)' },
  { name: 'amber', gradient: 'linear-gradient(to bottom, #f59e0b, #d97706)', color: '#f59e0b', shadow: 'rgba(245, 158, 11, 0.5)' },
  { name: 'rose', gradient: 'linear-gradient(to bottom, #f43f5e, #e11d48)', color: '#f43f5e', shadow: 'rgba(244, 63, 94, 0.5)' },
  { name: 'cyan', gradient: 'linear-gradient(to bottom, #06b6d4, #0891b2)', color: '#06b6d4', shadow: 'rgba(6, 182, 212, 0.5)' },
  { name: 'orange', gradient: 'linear-gradient(to bottom, #fb923c, #f97316)', color: '#fb923c', shadow: 'rgba(251, 146, 60, 0.5)' },
  { name: 'pink', gradient: 'linear-gradient(to bottom, #ec4899, #db2777)', color: '#ec4899', shadow: 'rgba(236, 72, 153, 0.5)' },
  { name: 'lime', gradient: 'linear-gradient(to bottom, #84cc16, #65a30d)', color: '#84cc16', shadow: 'rgba(132, 204, 22, 0.5)' },
  { name: 'indigo', gradient: 'linear-gradient(to bottom, #6366f1, #4f46e5)', color: '#6366f1', shadow: 'rgba(99, 102, 241, 0.5)' }
];

type TabType = 'docs' | 'services' | 'ratelock' | 'team' | 'loandetails' | 'email' | 'notes' | 'activity';

interface TableDataRow {
  requestDate: string;
  documentRequested: string;
  loanCategory: string;
  loanPurpose: string;
  loanStage: string;
  requestedBy: string;
  clearedBy: string;
  attachedDoc: string;
}

interface DocumentItem {
  name: string;
  subtitle: string;
  colorIndex: number;
  customLabel?: string;
  tableData: TableDataRow[];
}

export function LoanStatusDashboard() {
  const [currentTab, setCurrentTab] = useState<TabType>('docs');
  const [isOverviewMode, setIsOverviewMode] = useState(false);
  const [expandedTable, setExpandedTable] = useState<number | null>(null);
  const [modalMode, setModalMode] = useState<'choice' | 'request' | 'clear' | 'activity' | null>(null);
  const [showServiceTracker, setShowServiceTracker] = useState(false);
  const [showLoanTimeline, setShowLoanTimeline] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string>('');

  // Data for all tabs
  const [documents] = useState<DocumentItem[]>([
    { 
      name: 'Pay Stubs', 
      subtitle: 'Requested By: Perry Paul', 
      colorIndex: 0, 
      tableData: [
        { requestDate: '10/15/2025', documentRequested: 'Pay Stub Oct 2025', loanCategory: 'Income', loanPurpose: 'Purchase', loanStage: 'Pre-Approval', requestedBy: 'Perry Paul', clearedBy: 'Sarah Johnson', attachedDoc: 'paystub_oct.pdf' },
        { requestDate: '10/01/2025', documentRequested: 'Pay Stub Sep 2025', loanCategory: 'Income', loanPurpose: 'Purchase', loanStage: 'Pre-Approval', requestedBy: 'Perry Paul', clearedBy: '-', attachedDoc: '-' },
        { requestDate: '09/15/2025', documentRequested: 'Pay Stub Aug 2025', loanCategory: 'Income', loanPurpose: 'Purchase', loanStage: 'Pre-Approval', requestedBy: 'Perry Paul', clearedBy: 'Sarah Johnson', attachedDoc: 'paystub_aug.pdf' }
      ]
    },
    { 
      name: 'Income Verification', 
      subtitle: 'Requested By: Perry Paul', 
      colorIndex: 1, 
      tableData: [
        { requestDate: '10/16/2025', documentRequested: 'W2 Form 2024', loanCategory: 'Income', loanPurpose: 'Purchase', loanStage: 'Initial Approval', requestedBy: 'Perry Paul', clearedBy: 'Michael Chen', attachedDoc: 'w2_2024.pdf' },
        { requestDate: '10/16/2025', documentRequested: 'Employment Letter', loanCategory: 'Income', loanPurpose: 'Purchase', loanStage: 'Initial Approval', requestedBy: 'Perry Paul', clearedBy: '-', attachedDoc: '-' }
      ]
    },
    { 
      name: 'Ins. Replace Cost', 
      subtitle: 'Requested By: Perry Paul', 
      colorIndex: 2, 
      tableData: [
        { requestDate: '10/17/2025', documentRequested: 'Home Insurance Quote', loanCategory: 'Insurance', loanPurpose: 'Purchase', loanStage: 'Final Approval', requestedBy: 'Perry Paul', clearedBy: 'Emily Davis', attachedDoc: 'insurance_quote.pdf' }
      ]
    }
  ]);

  const [services] = useState<DocumentItem[]>([
    { 
      name: 'Appraisal', 
      subtitle: 'Requested By: Perry Paul', 
      colorIndex: 0, 
      tableData: [
        { requestDate: '10/10/2025', documentRequested: 'Property Appraisal', loanCategory: 'Appraisal', loanPurpose: 'Purchase', loanStage: 'Initial Approval', requestedBy: 'Perry Paul', clearedBy: 'Tom Anderson', attachedDoc: 'appraisal_report.pdf' }
      ]
    },
    { 
      name: 'WDO Inspection', 
      subtitle: 'Requested By: Perry Paul', 
      colorIndex: 1, 
      tableData: [
        { requestDate: '10/12/2025', documentRequested: 'Termite Inspection', loanCategory: 'Inspection', loanPurpose: 'Purchase', loanStage: 'Final Approval', requestedBy: 'Perry Paul', clearedBy: 'Lisa Brown', attachedDoc: 'wdo_report.pdf' }
      ]
    },
    { 
      name: 'Water Test Inspection', 
      subtitle: 'Requested By: Perry Paul', 
      colorIndex: 2, 
      tableData: [
        { requestDate: '10/14/2025', documentRequested: 'Water Quality Test', loanCategory: 'Inspection', loanPurpose: 'Purchase', loanStage: 'Final Approval', requestedBy: 'Perry Paul', clearedBy: 'John Smith', attachedDoc: 'water_test.pdf' }
      ]
    }
  ]);

  const [rateLock] = useState<DocumentItem[]>([
    { 
      name: 'Locked', 
      subtitle: 'Rate Lock Status', 
      colorIndex: 0,
      customLabel: 'Lock Date',
      tableData: [
        { requestDate: '10/10/2025', documentRequested: 'Rate Lock Confirmation', loanCategory: 'Rate Lock', loanPurpose: 'Purchase', loanStage: 'Initial Approval', requestedBy: 'Perry Paul', clearedBy: 'System', attachedDoc: 'rate_lock.pdf' }
      ]
    },
    { 
      name: '18 days', 
      subtitle: 'Lock Expires', 
      colorIndex: 1,
      customLabel: 'Locked Expiration',
      tableData: [
        { requestDate: '11/11/2025', documentRequested: 'Rate Lock Expiration', loanCategory: 'Rate Lock', loanPurpose: 'Purchase', loanStage: 'Initial Approval', requestedBy: 'Perry Paul', clearedBy: '-', attachedDoc: '-' }
      ]
    }
  ]);

  const [team] = useState<DocumentItem[]>([
    { name: 'Perry Paul', subtitle: 'Loan Agent', colorIndex: 0, customLabel: 'Loan Initiation', tableData: [{ requestDate: '10/10/2025', documentRequested: 'Loan Application', loanCategory: 'Origination', loanPurpose: 'Purchase', loanStage: 'Loan Prep', requestedBy: 'Perry Paul', clearedBy: 'Approved', attachedDoc: 'application.pdf' }] },
    { name: 'Tina Jones', subtitle: 'Processor', colorIndex: 1, customLabel: 'Submit to UW', tableData: [{ requestDate: '10/15/2025', documentRequested: 'Processing Complete', loanCategory: 'Processing', loanPurpose: 'Purchase', loanStage: 'Initial Approval', requestedBy: 'Tina Jones', clearedBy: '-', attachedDoc: '-' }] },
    { name: 'Frank Moss', subtitle: 'Underwriter', colorIndex: 2, customLabel: 'Initial Approval', tableData: [{ requestDate: '10/20/2025', documentRequested: 'Underwriting Review', loanCategory: 'Underwriting', loanPurpose: 'Purchase', loanStage: 'Initial Approval', requestedBy: 'Frank Moss', clearedBy: 'Approved', attachedDoc: 'uw_report.pdf' }] }
  ]);

  const [loandetails] = useState<DocumentItem[]>([
    { name: 'Loan Amount', subtitle: '$450,000', colorIndex: 0, customLabel: 'Detail', tableData: [{ requestDate: '10/10/2025', documentRequested: 'Loan Amount', loanCategory: 'Loan Info', loanPurpose: 'Purchase', loanStage: 'Active', requestedBy: 'System', clearedBy: 'Confirmed', attachedDoc: '-' }] },
    { name: 'Interest Rate', subtitle: '6.5%', colorIndex: 1, customLabel: 'Detail', tableData: [{ requestDate: '10/10/2025', documentRequested: 'Interest Rate', loanCategory: 'Loan Info', loanPurpose: 'Purchase', loanStage: 'Active', requestedBy: 'System', clearedBy: 'Confirmed', attachedDoc: '-' }] },
    { name: 'Down Payment', subtitle: '$90,000', colorIndex: 2, customLabel: 'Detail', tableData: [{ requestDate: '10/10/2025', documentRequested: 'Down Payment', loanCategory: 'Loan Info', loanPurpose: 'Purchase', loanStage: 'Active', requestedBy: 'System', clearedBy: 'Confirmed', attachedDoc: '-' }] }
  ]);

  const [activity] = useState<DocumentItem[]>([
    { name: 'Pay Stub Uploaded', subtitle: 'Perry Paul', colorIndex: 0, customLabel: 'Activity Date', tableData: [{ requestDate: '10/24/2025', documentRequested: 'Pay Stub Upload', loanCategory: 'Activity', loanPurpose: 'Purchase', loanStage: 'Loan Prep', requestedBy: 'Perry Paul', clearedBy: 'Uploaded', attachedDoc: 'paystub.pdf' }] },
    { name: 'Appraisal Reviewed', subtitle: 'Tina Jones', colorIndex: 1, customLabel: 'Activity Date', tableData: [{ requestDate: '10/24/2025', documentRequested: 'Appraisal Review', loanCategory: 'Activity', loanPurpose: 'Purchase', loanStage: 'Initial Approval', requestedBy: 'Tina Jones', clearedBy: 'Reviewed', attachedDoc: 'appraisal.pdf' }] }
  ]);

  const [email] = useState<DocumentItem[]>([
    { name: 'Pre-Approval Email', subtitle: 'Sent to: John & Mary Doe', colorIndex: 0, customLabel: 'Sent Date', tableData: [{ requestDate: '10/12/2025', documentRequested: 'Pre-Approval Letter', loanCategory: 'Communication', loanPurpose: 'Purchase', loanStage: 'Pre-Approval', requestedBy: 'Perry Paul', clearedBy: 'Sent', attachedDoc: 'preapproval.pdf' }] }
  ]);

  const [notes] = useState<DocumentItem[]>([
    { name: 'Initial Call Notes', subtitle: 'Created by: Perry Paul', colorIndex: 0, customLabel: 'Note Date', tableData: [{ requestDate: '10/10/2025', documentRequested: 'Client wants quick close', loanCategory: 'Notes', loanPurpose: 'Purchase', loanStage: 'Loan Prep', requestedBy: 'Perry Paul', clearedBy: 'Active', attachedDoc: '-' }] }
  ]);

  // Get current data based on tab
  const getCurrentData = (): DocumentItem[] => {
    switch (currentTab) {
      case 'docs': return documents;
      case 'services': return services;
      case 'ratelock': return rateLock;
      case 'team': return team;
      case 'loandetails': return loandetails;
      case 'email': return email;
      case 'notes': return notes;
      case 'activity': return activity;
      default: return documents;
    }
  };

  const currentData = getCurrentData();

  const getUpdateButtonText = () => {
    switch (currentTab) {
      case 'docs': return 'Update Docs';
      case 'services': return 'Update Services';
      case 'ratelock': return 'Update Rate Lock';
      case 'team': return 'Update Team';
      case 'loandetails': return 'Update Loan Details';
      case 'email': return 'Send Email';
      case 'notes': return 'Add Note';
      case 'activity': return 'Update Activity';
      default: return 'Update Docs';
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #0f172a 0%, #581c87 50%, #0f172a 100%)',
      minHeight: '100vh',
      color: 'white',
      padding: '2rem',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start', 
          marginBottom: '2rem' 
        }}>
          <div>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Loan Status</h1>
            <div style={{ color: '#94a3b8', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>John Doe • Mary Doe</span>
              <Eye 
                size={18} 
                style={{ color: '#a78bfa', cursor: 'pointer', transition: 'color 0.3s' }}
                onMouseOver={(e) => e.currentTarget.style.color = '#d8b4fe'}
                onMouseOut={(e) => e.currentTarget.style.color = '#a78bfa'}
                onClick={() => setShowLoanTimeline(true)}
                data-testid="button-loan-timeline"
              />
            </div>
          </div>
          <button
            onClick={() => setModalMode('choice')}
            style={{
              background: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              border: 'none',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s'
            }}
            data-testid="button-update"
          >
            {getUpdateButtonText()}
          </button>
        </div>

        {/* Performance Card */}
        <div style={{
          background: 'rgba(30, 41, 59, 0.5)',
          backdropFilter: 'blur(10px)',
          borderRadius: '1rem',
          padding: '1.5rem',
          marginBottom: '2rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '2rem',
          border: '1px solid rgba(148, 163, 184, 0.1)'
        }}>
          <MetricItem label="Category" value="VA" />
          <MetricItem label="Loan Amount" value="$425,000" />
          <MetricItem label="Interest Rate" value="6.75" unit="%" change="+0.25%" positive />
          <MetricItem label="Days to Close" value="23" change="3 days" positive={false} />
          <MetricItem label="Completion" value="72" unit="%" change="+12%" positive />
        </div>

        {/* Navigation Pills */}
        <div style={{ 
          overflowX: 'auto', 
          marginBottom: '2rem',
          display: 'flex',
          gap: '0.5rem',
          paddingBottom: '0.5rem'
        }}>
          <NavPill label="Docs Pending" active={currentTab === 'docs'} onClick={() => setCurrentTab('docs')} />
          <NavPill label="Services" active={currentTab === 'services'} onClick={() => setCurrentTab('services')} />
          <NavPill label="Rate Lock" active={currentTab === 'ratelock'} onClick={() => setCurrentTab('ratelock')} />
          <NavPill label="Team" active={currentTab === 'team'} onClick={() => setCurrentTab('team')} />
          <NavPill label="Loan Details" active={currentTab === 'loandetails'} onClick={() => setCurrentTab('loandetails')} />
          <NavPill label="Email" active={currentTab === 'email'} onClick={() => setCurrentTab('email')} />
          <NavPill label="Notes" active={currentTab === 'notes'} onClick={() => setCurrentTab('notes')} />
          <NavPill label="Activity" active={currentTab === 'activity'} onClick={() => setCurrentTab('activity')} />
        </div>

        {/* Two Card Layout */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 300px', 
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          {/* Left Card - Documents */}
          <div style={{
            background: 'rgba(30, 41, 59, 0.5)',
            backdropFilter: 'blur(10px)',
            borderRadius: '1rem',
            padding: '1.5rem',
            border: '1px solid rgba(148, 163, 184, 0.1)',
            minHeight: '400px'
          }}>
            {!isOverviewMode ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {currentData.map((doc, index) => (
                  <DocumentCard
                    key={index}
                    doc={doc}
                    index={index}
                    onToggle={() => setExpandedTable(expandedTable === index ? null : index)}
                  />
                ))}
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                <StageCard title="Loan Prep" count="8 Docs Requested" color="#3b82f6" />
                <StageCard title="Initial Approval" count="4 Docs Requested" color="#8b5cf6" />
                <StageCard title="Final Approval" count="2 Docs Requested" color="#10b981" />
              </div>
            )}
          </div>

          {/* Right Card - Icon */}
          <div style={{
            background: 'rgba(30, 41, 59, 0.5)',
            backdropFilter: 'blur(10px)',
            borderRadius: '1rem',
            padding: '1.5rem',
            border: '1px solid rgba(148, 163, 184, 0.1)',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {/* Toggle Button */}
            <button
              onClick={() => setIsOverviewMode(!isOverviewMode)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'rgba(139, 92, 246, 0.2)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                borderRadius: '0.5rem',
                padding: '0.5rem',
                cursor: 'pointer',
                color: '#a78bfa',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s'
              }}
              data-testid="button-view-toggle"
            >
              <BarChart size={20} />
            </button>

            {/* Icon Boxes for Loan Details Tab */}
            {currentTab === 'loandetails' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', marginBottom: '1rem' }}>
                <IconBox icon="percentage" color="#8b5cf6" />
                <IconBox icon="dollar" color="#10b981" />
                <IconBox icon="home" color="#3b82f6" />
              </div>
            )}

            {/* Stacked Icon or Pie Chart */}
            {!isOverviewMode ? (
              <StackedIcon currentTab={currentTab} count={currentData.length} colors={currentData.map(d => documentColors[d.colorIndex])} />
            ) : (
              <PieChart data={currentData} />
            )}
          </div>
        </div>

        {/* Expandable Tables */}
        <AnimatePresence>
          {expandedTable !== null && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.5 }}
              style={{
                background: 'rgba(30, 41, 59, 0.5)',
                backdropFilter: 'blur(10px)',
                borderRadius: '1rem',
                overflow: 'hidden',
                border: '1px solid rgba(148, 163, 184, 0.1)',
                marginBottom: '2rem'
              }}
            >
              <ExpandedTable
                data={currentData[expandedTable]}
                onClose={() => setExpandedTable(null)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Service Tracker */}
        <AnimatePresence>
          {showServiceTracker && (
            <ServiceTracker onClose={() => setShowServiceTracker(false)} />
          )}
        </AnimatePresence>

        {/* Loan Timeline */}
        <AnimatePresence>
          {showLoanTimeline && (
            <LoanTimeline onClose={() => setShowLoanTimeline(false)} />
          )}
        </AnimatePresence>

        {/* Modals */}
        <AnimatePresence>
          {modalMode && (
            <ModalOverlay
              mode={modalMode}
              currentTab={currentTab}
              onClose={() => setModalMode(null)}
              onSelectRequest={() => setModalMode('request')}
              onSelectClear={() => setModalMode('clear')}
              onSelectActivity={() => setModalMode('activity')}
              onBack={() => setModalMode('choice')}
              selectedFile={selectedFile}
              onFileChange={setSelectedFile}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Helper Components
function MetricItem({ label, value, unit, change, positive }: { 
  label: string; 
  value: string; 
  unit?: string; 
  change?: string; 
  positive?: boolean;
}) {
  return (
    <div>
      <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.5rem' }}>{label}</div>
      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
        {value}
        {unit && <span style={{ fontSize: '0.875rem', fontWeight: 'normal', color: '#94a3b8' }}>{unit}</span>}
        {change && (
          <span style={{ 
            fontSize: '0.75rem', 
            color: positive ? '#10b981' : '#ef4444',
            marginLeft: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.125rem'
          }}>
            {positive ? '↑' : '↓'} {change}
          </span>
        )}
      </div>
    </div>
  );
}

function NavPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)' : 'rgba(30, 41, 59, 0.5)',
        color: active ? 'white' : '#94a3b8',
        padding: '0.75rem 1.5rem',
        borderRadius: '2rem',
        border: active ? 'none' : '1px solid rgba(148, 163, 184, 0.2)',
        fontSize: '0.875rem',
        fontWeight: '500',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        transition: 'all 0.3s',
        boxShadow: active ? '0 4px 6px rgba(139, 92, 246, 0.3)' : 'none'
      }}
      data-testid={`nav-${label.toLowerCase().replace(' ', '-')}`}
    >
      {label}
    </button>
  );
}

function DocumentCard({ doc, index, onToggle }: { doc: DocumentItem; index: number; onToggle: () => void }) {
  const color = documentColors[doc.colorIndex];
  
  return (
    <div
      onClick={onToggle}
      style={{
        background: 'rgba(15, 23, 42, 0.6)',
        borderRadius: '0.75rem',
        padding: '1rem',
        cursor: 'pointer',
        border: '1px solid rgba(148, 163, 184, 0.1)',
        transition: 'all 0.3s',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
      }}
      data-testid={`doc-card-${index}`}
    >
      <Eye size={20} style={{ color: '#a78bfa', flexShrink: 0 }} />
      <div style={{
        width: '4px',
        height: '100%',
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        background: color.gradient,
        borderRadius: '0.75rem 0 0 0.75rem',
        boxShadow: `0 0 10px ${color.shadow}`
      }} />
      <div style={{ flex: 1, marginLeft: '0.5rem' }}>
        <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>{doc.name}</div>
        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{doc.subtitle}</div>
      </div>
      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
        {doc.customLabel || 'Requested'}: 10/24/2025
      </div>
      <div style={{
        background: 'rgba(139, 92, 246, 0.2)',
        color: '#a78bfa',
        padding: '0.25rem 0.75rem',
        borderRadius: '1rem',
        fontSize: '0.75rem',
        fontWeight: '500',
        border: '1px solid rgba(139, 92, 246, 0.3)'
      }}>
        {doc.tableData.length}
      </div>
    </div>
  );
}

function StageCard({ title, count, color }: { title: string; count: string; color: string }) {
  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.6)',
      borderRadius: '0.75rem',
      padding: '1.5rem',
      border: `2px solid ${color}`,
      boxShadow: `0 0 20px ${color}40`
    }}>
      <div style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem', color }}>{title}</div>
      <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>{count}</div>
    </div>
  );
}

function IconBox({ icon, color }: { icon: string; color: string }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '60px',
      height: '60px',
      alignSelf: 'center'
    }}>
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
        <circle cx="12" cy="12" r="9" fill="none" stroke={color} strokeWidth="2"/>
        {icon === 'percentage' && (
          <>
            <circle cx="9" cy="9" r="1.5" fill={color}/>
            <circle cx="15" cy="15" r="1.5" fill={color}/>
            <line x1="8" y1="16" x2="16" y2="8" stroke={color} strokeWidth="2" strokeLinecap="round"/>
          </>
        )}
        {icon === 'dollar' && (
          <path d="M12 5 L12 19 M8 9 Q8 7 12 7 Q16 7 16 9 Q16 11 12 11 Q8 11 8 13 Q8 15 12 15 Q16 15 16 13" 
                stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        )}
        {icon === 'home' && (
          <>
            <path d="M6 12 L12 7 L18 12" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M7 12 L7 17 L17 17 L17 12" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            <rect x="10" y="14" width="4" height="3" stroke={color} strokeWidth="1.5" fill="none"/>
          </>
        )}
      </svg>
    </div>
  );
}

function StackedIcon({ currentTab, count, colors }: { currentTab: TabType; count: number; colors: any[] }) {
  if (currentTab === 'ratelock') {
    return (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '120px', height: '120px' }}>
        <path d="M8.5 13V9.5C8.5 7.5 9.8 6 12 6C14.2 6 15.5 7.5 15.5 9.5V13" stroke="#475569" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <rect x="5" y="13" width="14" height="10" rx="2" fill="#10b981" stroke="#475569" strokeWidth="1.5"/>
        <circle cx="12" cy="17" r="1.5" fill="#475569"/>
        <rect x="11.3" y="17.5" width="1.4" height="2.5" rx="0.3" fill="#475569"/>
      </svg>
    );
  }

  if (currentTab === 'services') {
    return (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '120px', height: '120px' }}>
        <rect x="4" y="6" width="16" height="16" rx="2" fill="none" stroke="#3b82f6" strokeWidth="1.5"/>
        <rect x="9" y="4" width="6" height="3" rx="1" fill="#f59e0b" stroke="#3b82f6" strokeWidth="1.5"/>
        <path d="M7 11L9 13L13 9" stroke="#3b82f6" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M7 15L9 17L13 13" stroke="#3b82f6" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="14" y1="11" x2="17" y2="11" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="14" y1="15" x2="17" y2="15" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    );
  }

  // Default stacked papers icon
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '120px', height: '120px' }}>
      {colors.slice(0, Math.min(count, 5)).map((color, i) => (
        <g key={i} style={{ transform: `translate(${i * 2}px, ${i * 2}px)` }}>
          <rect
            x={4 - i * 0.5}
            y={6 - i * 0.5}
            width="14"
            height="16"
            rx="1"
            fill={color.color}
            fillOpacity="0.3"
            stroke={color.color}
            strokeWidth="1.5"
          />
        </g>
      ))}
    </svg>
  );
}

function PieChart({ data }: { data: DocumentItem[] }) {
  const total = data.reduce((sum, item) => sum + item.tableData.length, 0);
  let currentAngle = 0;

  return (
    <svg viewBox="0 0 280 280" style={{ width: '200px', height: '200px' }}>
      {data.map((item, index) => {
        const color = documentColors[item.colorIndex];
        const percentage = (item.tableData.length / total) * 100;
        const angle = (percentage / 100) * 360;
        
        const startX = 140 + 100 * Math.cos((currentAngle - 90) * Math.PI / 180);
        const startY = 140 + 100 * Math.sin((currentAngle - 90) * Math.PI / 180);
        
        currentAngle += angle;
        
        const endX = 140 + 100 * Math.cos((currentAngle - 90) * Math.PI / 180);
        const endY = 140 + 100 * Math.sin((currentAngle - 90) * Math.PI / 180);
        
        const largeArcFlag = angle > 180 ? 1 : 0;
        
        const pathData = [
          `M 140 140`,
          `L ${startX} ${startY}`,
          `A 100 100 0 ${largeArcFlag} 1 ${endX} ${endY}`,
          `Z`
        ].join(' ');

        return (
          <path
            key={index}
            d={pathData}
            fill={color.color}
            stroke="rgba(15, 23, 42, 0.8)"
            strokeWidth="2"
          />
        );
      })}
      <circle cx="140" cy="140" r="60" fill="rgba(15, 23, 42, 0.9)" />
    </svg>
  );
}

function ExpandedTable({ data, onClose }: { data: DocumentItem; onClose: () => void }) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [tableFilter, setTableFilter] = useState<'pending' | 'received' | 'all'>('pending');
  const [showDropdown, setShowDropdown] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollIndicatorWidth, setScrollIndicatorWidth] = useState(30);
  const [scrollIndicatorPosition, setScrollIndicatorPosition] = useState(0);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const sortedData = sortKey
    ? [...data.tableData].sort((a, b) => {
        const aVal = a[sortKey as keyof TableDataRow];
        const bVal = b[sortKey as keyof TableDataRow];
        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      })
    : data.tableData;

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      const scrollPercentage = scrollLeft / (scrollWidth - clientWidth);
      const thumbWidth = (clientWidth / scrollWidth) * 100;
      setScrollIndicatorWidth(Math.max(thumbWidth, 10));
      setScrollIndicatorPosition(scrollPercentage * (100 / Math.max(thumbWidth, 10) - 1) * 100);
    }
  };

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll);
      handleScroll(); // Initial calculation
      return () => scrollElement.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const getDropdownTitle = () => {
    if (tableFilter === 'pending') return 'Documents Pending';
    if (tableFilter === 'received') return 'Documents Received';
    return 'Show All';
  };

  return (
    <div style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ position: 'relative' }}>
          <h3 
            onClick={() => setShowDropdown(!showDropdown)}
            style={{ 
              fontSize: '1.125rem', 
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            data-testid="table-title-dropdown"
          >
            {getDropdownTitle()}
            <ChevronDown size={20} style={{ color: '#94a3b8' }} />
          </h3>
          {showDropdown && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              background: 'rgba(15, 23, 42, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: '0.5rem',
              marginTop: '0.5rem',
              minWidth: '200px',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              zIndex: 10,
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
            }}>
              <div 
                onClick={() => { setTableFilter('pending'); setShowDropdown(false); }}
                style={{
                  padding: '0.75rem 1rem',
                  cursor: 'pointer',
                  borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
              >
                Documents Pending
              </div>
              <div 
                onClick={() => { setTableFilter('received'); setShowDropdown(false); }}
                style={{
                  padding: '0.75rem 1rem',
                  cursor: 'pointer',
                  borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
              >
                Documents Received
              </div>
              <div 
                onClick={() => { setTableFilter('all'); setShowDropdown(false); }}
                style={{
                  padding: '0.75rem 1rem',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
              >
                Show All
              </div>
            </div>
          )}
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            fontSize: '1.5rem',
            cursor: 'pointer',
            padding: '0.25rem'
          }}
          data-testid="button-close-table"
        >
          ×
        </button>
      </div>
      
      {/* Custom Scroll Indicator */}
      <div style={{
        width: '100%',
        height: '6px',
        background: 'rgba(148, 163, 184, 0.1)',
        borderRadius: '3px',
        marginBottom: '1rem',
        position: 'relative'
      }}>
        <div style={{
          width: `${scrollIndicatorWidth}%`,
          height: '100%',
          background: 'linear-gradient(90deg, #a78bfa 0%, #8b5cf6 100%)',
          borderRadius: '3px',
          transform: `translateX(${scrollIndicatorPosition}%)`,
          transition: 'all 0.1s',
          boxShadow: '0 0 8px rgba(139, 92, 246, 0.5)'
        }} />
      </div>
      
      <div ref={scrollRef} style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.2)' }}>
              {['Request Date', 'Status', 'Document Requested', 'Loan Category', 'Loan Purpose', 'Loan Stage', 'Requested By', 'Cleared By', 'Attached Doc'].map((header) => (
                <th
                  key={header}
                  onClick={() => handleSort(header.toLowerCase().replace(' ', ''))}
                  style={{
                    padding: '0.75rem',
                    textAlign: 'left',
                    color: '#94a3b8',
                    fontWeight: '500',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {header} {sortKey === header.toLowerCase().replace(' ', '') && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, index) => (
              <tr key={index} style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}>
                <td style={{ padding: '0.75rem', whiteSpace: 'nowrap' }}>{row.requestDate}</td>
                <td style={{ padding: '0.75rem' }}>
                  <span style={{
                    background: 'rgba(245, 158, 11, 0.2)',
                    color: '#f59e0b',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '1rem',
                    fontSize: '0.75rem',
                    border: '1px solid rgba(245, 158, 11, 0.3)'
                  }}>
                    Pending
                  </span>
                </td>
                <td style={{ padding: '0.75rem', whiteSpace: 'nowrap' }}>{row.documentRequested}</td>
                <td style={{ padding: '0.75rem', whiteSpace: 'nowrap' }}>{row.loanCategory}</td>
                <td style={{ padding: '0.75rem', whiteSpace: 'nowrap' }}>{row.loanPurpose}</td>
                <td style={{ padding: '0.75rem', whiteSpace: 'nowrap' }}>{row.loanStage}</td>
                <td style={{ padding: '0.75rem', whiteSpace: 'nowrap' }}>{row.requestedBy}</td>
                <td style={{ padding: '0.75rem', whiteSpace: 'nowrap' }}>{row.clearedBy}</td>
                <td style={{ padding: '0.75rem', whiteSpace: 'nowrap' }}>{row.attachedDoc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ServiceTracker({ onClose }: { onClose: () => void }) {
  const [trackerFilter, setTrackerFilter] = useState<'pending' | 'completed' | 'all'>('pending');
  const [showTrackerDropdown, setShowTrackerDropdown] = useState(false);

  const services = [
    { name: 'Appraisal', status: 'Completed', progress: 100, startDate: '10/10/2025', endDate: '10/15/2025' },
    { name: 'Title Search', status: 'In Progress', progress: 65, startDate: '10/12/2025', endDate: '10/18/2025' },
    { name: 'Home Inspection', status: 'Pending', progress: 0, startDate: '10/16/2025', endDate: '10/20/2025' }
  ];

  const getTrackerTitle = () => {
    if (trackerFilter === 'pending') return 'Pending Services';
    if (trackerFilter === 'completed') return 'Completed Services';
    return 'See All';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        style={{
          background: 'rgba(30, 41, 59, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '1rem',
          padding: '2rem',
          maxWidth: '800px',
          width: '90%',
          border: '1px solid rgba(148, 163, 184, 0.2)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ position: 'relative' }}>
            <h2 
              onClick={() => setShowTrackerDropdown(!showTrackerDropdown)}
              style={{ 
                fontSize: '1.5rem', 
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              {getTrackerTitle()}
              <ChevronDown size={20} style={{ color: '#94a3b8' }} />
            </h2>
            {showTrackerDropdown && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                background: 'rgba(15, 23, 42, 0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: '0.5rem',
                marginTop: '0.5rem',
                minWidth: '200px',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                zIndex: 10,
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
              }}>
                <div 
                  onClick={() => { setTrackerFilter('pending'); setShowTrackerDropdown(false); }}
                  style={{
                    padding: '0.75rem 1rem',
                    cursor: 'pointer',
                    borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
                    transition: 'background 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  Pending Services
                </div>
                <div 
                  onClick={() => { setTrackerFilter('completed'); setShowTrackerDropdown(false); }}
                  style={{
                    padding: '0.75rem 1rem',
                    cursor: 'pointer',
                    borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
                    transition: 'background 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  Completed Services
                </div>
                <div 
                  onClick={() => { setTrackerFilter('all'); setShowTrackerDropdown(false); }}
                  style={{
                    padding: '0.75rem 1rem',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  See All
                </div>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '2rem', cursor: 'pointer' }}
            data-testid="button-close-tracker"
          >
            ×
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {services.map((service, index) => (
            <div key={index} style={{ position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div style={{ fontWeight: '600', fontSize: '1.125rem' }}>{service.name}</div>
                <div style={{ 
                  fontSize: '0.875rem', 
                  fontWeight: 'bold',
                  color: service.progress === 100 ? '#10b981' : '#94a3b8'
                }}>
                  {service.progress}%
                </div>
              </div>
              
              <div style={{ 
                fontSize: '0.75rem', 
                color: '#94a3b8', 
                marginBottom: '1rem',
                display: 'flex',
                justifyContent: 'space-between'
              }}>
                <span>{service.startDate}</span>
                <span style={{ color: service.progress === 100 ? '#10b981' : '#94a3b8' }}>{service.status}</span>
                <span>{service.endDate}</span>
              </div>

              {/* Progress Bar */}
              <div style={{
                width: '100%',
                height: '8px',
                background: 'rgba(148, 163, 184, 0.2)',
                borderRadius: '4px',
                position: 'relative',
                overflow: 'visible'
              }}>
                <div style={{
                  width: `${service.progress}%`,
                  height: '100%',
                  background: service.progress === 100 ? '#10b981' : 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)',
                  borderRadius: '4px',
                  boxShadow: `0 0 10px ${service.progress === 100 ? 'rgba(16, 185, 129, 0.5)' : 'rgba(139, 92, 246, 0.5)'}`,
                  transition: 'all 0.5s'
                }} />
                
                {/* Milestones */}
                <div style={{
                  position: 'absolute',
                  left: '0%',
                  top: '-4px',
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: '#3b82f6',
                  boxShadow: '0 0 10px rgba(59, 130, 246, 0.7)',
                  zIndex: 1
                }} />
                <div style={{
                  position: 'absolute',
                  left: '50%',
                  top: '-4px',
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: service.progress >= 50 ? '#8b5cf6' : 'rgba(148, 163, 184, 0.3)',
                  boxShadow: service.progress >= 50 ? '0 0 10px rgba(139, 92, 246, 0.7)' : 'none',
                  zIndex: 1,
                  transform: 'translateX(-50%)'
                }} />
                <div style={{
                  position: 'absolute',
                  left: '100%',
                  top: '-4px',
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: service.progress === 100 ? '#10b981' : 'rgba(148, 163, 184, 0.3)',
                  boxShadow: service.progress === 100 ? '0 0 10px rgba(16, 185, 129, 0.7)' : 'none',
                  zIndex: 1,
                  transform: 'translateX(-10px)'
                }} />
              </div>

              {/* Milestone Labels */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '1rem',
                fontSize: '0.75rem',
                color: '#94a3b8'
              }}>
                <span>Start</span>
                <span>In Progress</span>
                <span style={{ color: service.progress === 100 ? '#10b981' : '#94a3b8' }}>Complete</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

function LoanTimeline({ onClose }: { onClose: () => void }) {
  const timelineEvents = [
    { date: '10/10/2025', title: 'Loan Application Submitted', status: 'Completed', color: '#10b981' },
    { date: '10/12/2025', title: 'Credit Report Pulled', status: 'Completed', color: '#3b82f6' },
    { date: '10/15/2025', title: 'Appraisal Ordered', status: 'Completed', color: '#8b5cf6' },
    { date: '10/18/2025', title: 'Processing Started', status: 'In Progress', color: '#f59e0b' },
    { date: '10/22/2025', title: 'Underwriting Review', status: 'Pending', color: '#94a3b8' },
    { date: '10/28/2025', title: 'Clear to Close', status: 'Pending', color: '#94a3b8' },
    { date: '11/05/2025', title: 'Closing', status: 'Pending', color: '#94a3b8' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        style={{
          background: 'rgba(30, 41, 59, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '1rem',
          padding: '2rem',
          maxWidth: '800px',
          width: '90%',
          maxHeight: '80vh',
          overflowY: 'auto',
          border: '1px solid rgba(148, 163, 184, 0.2)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Loan Timeline</h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '2rem', cursor: 'pointer' }}
            data-testid="button-close-timeline"
          >
            ×
          </button>
        </div>

        <div style={{ position: 'relative', paddingLeft: '2rem' }}>
          {/* Vertical Timeline Line */}
          <div style={{
            position: 'absolute',
            left: '0.625rem',
            top: '0.5rem',
            bottom: '0.5rem',
            width: '2px',
            background: 'linear-gradient(180deg, #10b981 0%, #3b82f6 30%, #8b5cf6 60%, #94a3b8 100%)'
          }} />

          {timelineEvents.map((event, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              style={{ 
                position: 'relative',
                paddingBottom: index === timelineEvents.length - 1 ? '0' : '2rem'
              }}
            >
              {/* Timeline Dot */}
              <div style={{
                position: 'absolute',
                left: '-1.625rem',
                top: '0.25rem',
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                background: event.color,
                boxShadow: `0 0 10px ${event.color}`,
                border: '2px solid rgba(30, 41, 59, 0.8)',
                zIndex: 1
              }} />

              {/* Event Card */}
              <div style={{
                background: 'rgba(15, 23, 42, 0.6)',
                borderRadius: '0.75rem',
                padding: '1rem 1.5rem',
                border: `1px solid ${event.color}40`,
                boxShadow: `0 0 20px ${event.color}20`
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div style={{ fontWeight: '600', fontSize: '1.125rem' }}>{event.title}</div>
                  <div style={{
                    background: `${event.color}20`,
                    color: event.color,
                    padding: '0.25rem 0.75rem',
                    borderRadius: '1rem',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    border: `1px solid ${event.color}40`
                  }}>
                    {event.status}
                  </div>
                </div>
                <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>{event.date}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

function ModalOverlay({ 
  mode, 
  currentTab, 
  onClose, 
  onSelectRequest, 
  onSelectClear, 
  onSelectActivity,
  onBack,
  selectedFile,
  onFileChange
}: {
  mode: 'choice' | 'request' | 'clear' | 'activity';
  currentTab: TabType;
  onClose: () => void;
  onSelectRequest: () => void;
  onSelectClear: () => void;
  onSelectActivity: () => void;
  onBack: () => void;
  selectedFile: string;
  onFileChange: (file: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'rgba(30, 41, 59, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '1rem',
          padding: '2rem',
          maxWidth: '500px',
          width: '90%',
          border: '1px solid rgba(148, 163, 184, 0.2)'
        }}
      >
        {mode === 'choice' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Update Documents</h2>
              <button
                onClick={onClose}
                style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '2rem', cursor: 'pointer' }}
                data-testid="button-close-modal"
              >
                ×
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <button
                onClick={onSelectRequest}
                style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  color: 'white',
                  padding: '2rem 1rem',
                  borderRadius: '0.75rem',
                  border: 'none',
                  fontSize: '1rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  textAlign: 'center'
                }}
                data-testid="button-request-docs"
              >
                📝<br />Request Docs
              </button>
              <button
                onClick={onSelectClear}
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  padding: '2rem 1rem',
                  borderRadius: '0.75rem',
                  border: 'none',
                  fontSize: '1rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  textAlign: 'center'
                }}
                data-testid="button-clear-docs"
              >
                ✓<br />Clear Docs
              </button>
            </div>
          </>
        )}

        {mode === 'request' && (
          <RequestForm onClose={onClose} onBack={onBack} />
        )}

        {mode === 'clear' && (
          <ClearForm onClose={onClose} onBack={onBack} selectedFile={selectedFile} onFileChange={onFileChange} />
        )}

        {mode === 'activity' && (
          <ActivityForm onClose={onClose} onBack={onBack} />
        )}
      </motion.div>
    </motion.div>
  );
}

function RequestForm({ onClose, onBack }: { onClose: () => void; onBack: () => void }) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Document requested successfully!');
    onClose();
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Request Documents</h2>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '2rem', cursor: 'pointer' }}>×</button>
      </div>
      <div style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '1.5rem' }}>
        {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      </div>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <FormField label="Loan Stage" type="select" options={['Loan Prep', 'Pre-Approval Purchase', 'Initial Approval', 'Final Approval']} />
        <FormField label="Category" type="select" options={['Mortgage', 'Income', 'Insurance', 'Taxes', 'ID', 'Property', 'Other']} />
        <FormField label="Document" type="text" placeholder="Enter document name" />
        <FormField label="Document From" type="select" options={['John Doe', 'Mary Doe', 'Both']} />
        <FormField label="Request Method" type="select" options={['Email', 'Text', 'Call']} />
        <button
          type="button"
          onClick={onBack}
          style={{
            background: 'rgba(148, 163, 184, 0.2)',
            color: '#94a3b8',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem',
            border: '1px solid rgba(148, 163, 184, 0.3)',
            cursor: 'pointer'
          }}
        >
          ← Back
        </button>
        <button
          type="submit"
          style={{
            background: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)',
            color: 'white',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem',
            border: 'none',
            cursor: 'pointer',
            fontWeight: '500'
          }}
          data-testid="button-save"
        >
          Save
        </button>
      </form>
    </>
  );
}

function ClearForm({ onClose, onBack, selectedFile, onFileChange }: { 
  onClose: () => void; 
  onBack: () => void;
  selectedFile: string;
  onFileChange: (file: string) => void;
}) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Documents cleared successfully!');
    onClose();
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Clear Received Documents</h2>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '2rem', cursor: 'pointer' }}>×</button>
      </div>
      <div style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '1.5rem' }}>
        {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      </div>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <FormField label="Request Date" type="date" />
        <FormField label="Received Method" type="select" options={['Upload', 'Email', 'Text', 'Mail']} />
        <div>
          <label style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.5rem', display: 'block' }}>Document</label>
          <input
            type="file"
            onChange={(e) => onFileChange(e.target.files?.[0]?.name || '')}
            style={{ display: 'none' }}
            id="file-input"
          />
          <button
            type="button"
            onClick={() => document.getElementById('file-input')?.click()}
            style={{
              background: 'rgba(139, 92, 246, 0.2)',
              color: '#a78bfa',
              padding: '0.75rem 1rem',
              borderRadius: '0.5rem',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              cursor: 'pointer',
              width: '100%',
              textAlign: 'left'
            }}
            data-testid="button-attach-file"
          >
            📎 Click to Attach Document
          </button>
          {selectedFile && <div style={{ fontSize: '0.75rem', color: '#d8b4fe', marginTop: '0.5rem' }}>✓ {selectedFile}</div>}
        </div>
        <button
          type="button"
          onClick={onBack}
          style={{
            background: 'rgba(148, 163, 184, 0.2)',
            color: '#94a3b8',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem',
            border: '1px solid rgba(148, 163, 184, 0.3)',
            cursor: 'pointer'
          }}
        >
          ← Back
        </button>
        <button
          type="submit"
          style={{
            background: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)',
            color: 'white',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem',
            border: 'none',
            cursor: 'pointer',
            fontWeight: '500'
          }}
          data-testid="button-save"
        >
          Save
        </button>
      </form>
    </>
  );
}

function ActivityForm({ onClose, onBack }: { onClose: () => void; onBack: () => void }) {
  const [showCustomRange, setShowCustomRange] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Activity filter applied!');
    onClose();
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Filter Activity</h2>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '2rem', cursor: 'pointer' }}>×</button>
      </div>
      <div style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '1.5rem' }}>
        {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      </div>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.5rem', display: 'block' }}>Time Period</label>
          <select
            onChange={(e) => setShowCustomRange(e.target.value === 'custom')}
            style={{
              background: 'rgba(15, 23, 42, 0.8)',
              color: 'white',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              width: '100%'
            }}
            required
          >
            <option value="">Select Period</option>
            <option value="today">Today</option>
            <option value="recent10">Most Recent 10</option>
            <option value="mtd">MTD (Month to Date)</option>
            <option value="custom">Custom Date Range</option>
          </select>
        </div>
        {showCustomRange && (
          <>
            <FormField label="From Date" type="date" />
            <FormField label="To Date" type="date" />
          </>
        )}
        <button
          type="submit"
          style={{
            background: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)',
            color: 'white',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem',
            border: 'none',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          Show Activity
        </button>
      </form>
    </>
  );
}

function FormField({ label, type, placeholder, options }: { 
  label: string; 
  type: 'text' | 'select' | 'date'; 
  placeholder?: string;
  options?: string[];
}) {
  return (
    <div>
      <label style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.5rem', display: 'block' }}>{label}</label>
      {type === 'select' ? (
        <select
          style={{
            background: 'rgba(15, 23, 42, 0.8)',
            color: 'white',
            padding: '0.75rem',
            borderRadius: '0.5rem',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            width: '100%'
          }}
          required
        >
          <option value="">Select</option>
          {options?.map((opt) => (
            <option key={opt} value={opt.toLowerCase().replace(' ', '-')}>{opt}</option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          placeholder={placeholder}
          style={{
            background: 'rgba(15, 23, 42, 0.8)',
            color: 'white',
            padding: '0.75rem',
            borderRadius: '0.5rem',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            width: '100%'
          }}
          required
        />
      )}
    </div>
  );
}

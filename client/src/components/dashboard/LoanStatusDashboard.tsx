import { useState, useEffect, useRef } from 'react';

export function LoanStatusDashboard() {
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [isLoanTimelineOpen, setIsLoanTimelineOpen] = useState(false);
  
  // Tab state
  const [currentTab, setCurrentTab] = useState<'docs' | 'services' | 'ratelock' | 'team' | 'loandetails' | 'activity'>('docs');
  
  // View toggle state
  const [isOverviewMode, setIsOverviewMode] = useState(false);
  
  // Document/Service/etc details state
  const [expandedDetailsIndex, setExpandedDetailsIndex] = useState<number | null>(null);
  const [currentOpenTable, setCurrentOpenTable] = useState<number | null>(null);
  const [titleDropdownOpen, setTitleDropdownOpen] = useState<number | null>(null);
  
  // Service tracker state
  const [showServiceTracker, setShowServiceTracker] = useState(false);
  const [serviceTrackerDropdownOpen, setServiceTrackerDropdownOpen] = useState(false);
  
  // Sort state for tables
  const [sortConfigs, setSortConfigs] = useState<{[key: number]: {key: string | null, direction: 'asc' | 'desc'}}>({});
  
  // File input state
  const [selectedFileName, setSelectedFileName] = useState('');
  
  // Document colors
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
  
  // Data arrays
  const documents = [
    { 
      name: 'Pay Stubs', 
      subtitle: 'Requested By: Perry Paul', 
      colorIndex: 0, 
      tableData: [
        { requestDate: '10/15/2025', documentRequested: 'Pay Stub Oct 2025', loanCategory: 'Income', loanPurpose: 'Purchase', loanStage: 'Pre-Approval', requestedBy: 'Perry Paul', clearedBy: 'Sarah Johnson', attachedDoc: 'paystub_oct.pdf' },
        { requestDate: '10/01/2025', documentRequested: 'Pay Stub Sep 2025', loanCategory: 'Income', loanPurpose: 'Purchase', loanStage: 'Pre-Approval', requestedBy: 'Perry Paul', clearedBy: '-', attachedDoc: '-' },
        { requestDate: '09/15/2025', documentRequested: 'Pay Stub Aug 2025', loanCategory: 'Income', loanPurpose: 'Purchase', loanStage: 'Pre-Approval', requestedBy: 'Perry Paul', clearedBy: 'Sarah Johnson', attachedDoc: 'paystub_aug.pdf' },
        { requestDate: '09/01/2025', documentRequested: 'Pay Stub Jul 2025', loanCategory: 'Income', loanPurpose: 'Purchase', loanStage: 'Pre-Approval', requestedBy: 'Perry Paul', clearedBy: 'Sarah Johnson', attachedDoc: 'paystub_jul.pdf' },
        { requestDate: '08/15/2025', documentRequested: 'Pay Stub Jun 2025', loanCategory: 'Income', loanPurpose: 'Purchase', loanStage: 'Pre-Approval', requestedBy: 'Perry Paul', clearedBy: '-', attachedDoc: '-' }
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
  ];

  const services = [
    { 
      name: 'Appraisal', 
      subtitle: 'Requested By: Perry Paul', 
      colorIndex: 0, 
      tableData: [
        { requestDate: '10/10/2025', documentRequested: 'Property Appraisal', loanCategory: 'Appraisal', loanPurpose: 'Purchase', loanStage: 'Initial Approval', requestedBy: 'Perry Paul', clearedBy: 'Tom Anderson', attachedDoc: 'appraisal_report.pdf' },
        { requestDate: '09/28/2025', documentRequested: 'Appraisal Review', loanCategory: 'Appraisal', loanPurpose: 'Purchase', loanStage: 'Initial Approval', requestedBy: 'Perry Paul', clearedBy: '-', attachedDoc: '-' }
      ]
    },
    { 
      name: 'WDO Inspection', 
      subtitle: 'Requested By: Perry Paul', 
      colorIndex: 1, 
      tableData: [
        { requestDate: '10/12/2025', documentRequested: 'Termite Inspection', loanCategory: 'Inspection', loanPurpose: 'Purchase', loanStage: 'Final Approval', requestedBy: 'Perry Paul', clearedBy: 'Lisa Brown', attachedDoc: 'wdo_report.pdf' },
        { requestDate: '10/12/2025', documentRequested: 'WDO Certification', loanCategory: 'Inspection', loanPurpose: 'Purchase', loanStage: 'Final Approval', requestedBy: 'Perry Paul', clearedBy: '-', attachedDoc: '-' }
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
  ];

  const rateLock = [
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
    },
    { 
      name: 'Perry Paul', 
      subtitle: 'Locked By', 
      colorIndex: 2,
      customLabel: 'Lock Request',
      tableData: [
        { requestDate: '10/10/2025', documentRequested: 'Rate Lock Request', loanCategory: 'Rate Lock', loanPurpose: 'Purchase', loanStage: 'Initial Approval', requestedBy: 'Perry Paul', clearedBy: 'Approved', attachedDoc: 'lock_request.pdf' }
      ]
    }
  ];

  const team = [
    { name: 'Perry Paul', subtitle: 'Loan Agent', colorIndex: 0, customLabel: 'Loan Initiation', tableData: [{ requestDate: '10/10/2025', documentRequested: 'Loan Application', loanCategory: 'Origination', loanPurpose: 'Purchase', loanStage: 'Loan Prep', requestedBy: 'Perry Paul', clearedBy: 'Approved', attachedDoc: 'application.pdf' }] },
    { name: 'Tina Jones', subtitle: 'Processor', colorIndex: 1, customLabel: 'Submit to UW', tableData: [{ requestDate: '10/15/2025', documentRequested: 'Processing Complete', loanCategory: 'Processing', loanPurpose: 'Purchase', loanStage: 'Initial Approval', requestedBy: 'Tina Jones', clearedBy: '-', attachedDoc: '-' }] },
    { name: 'Frank Moss', subtitle: 'Underwriter', colorIndex: 2, customLabel: 'Initial Approval', tableData: [{ requestDate: '10/20/2025', documentRequested: 'Underwriting Review', loanCategory: 'Underwriting', loanPurpose: 'Purchase', loanStage: 'Initial Approval', requestedBy: 'Frank Moss', clearedBy: 'Approved', attachedDoc: 'uw_report.pdf' }] },
    { name: 'Sarah Chen', subtitle: 'Closing Coordinator', colorIndex: 3, customLabel: 'Clear to Close', tableData: [{ requestDate: '10/22/2025', documentRequested: 'Closing Docs Prep', loanCategory: 'Closing', loanPurpose: 'Purchase', loanStage: 'Final Approval', requestedBy: 'Sarah Chen', clearedBy: 'In Progress', attachedDoc: '-' }] },
    { name: 'Marcus Williams', subtitle: 'Compliance Officer', colorIndex: 4, customLabel: 'Compliance Review', tableData: [{ requestDate: '10/12/2025', documentRequested: 'Compliance Check', loanCategory: 'Compliance', loanPurpose: 'Purchase', loanStage: 'Loan Prep', requestedBy: 'Marcus Williams', clearedBy: 'Approved', attachedDoc: 'compliance.pdf' }] },
    { name: 'Jennifer Lee', subtitle: 'Title Officer', colorIndex: 5, customLabel: 'Title Search', tableData: [{ requestDate: '10/14/2025', documentRequested: 'Title Report', loanCategory: 'Title', loanPurpose: 'Purchase', loanStage: 'Initial Approval', requestedBy: 'Jennifer Lee', clearedBy: 'Complete', attachedDoc: 'title_report.pdf' }] },
    { name: 'David Martinez', subtitle: 'Appraisal Coordinator', colorIndex: 6, customLabel: 'Appraisal Order', tableData: [{ requestDate: '10/11/2025', documentRequested: 'Appraisal Report', loanCategory: 'Appraisal', loanPurpose: 'Purchase', loanStage: 'Loan Prep', requestedBy: 'David Martinez', clearedBy: 'Complete', attachedDoc: 'appraisal.pdf' }] },
    { name: 'Amanda Rodriguez', subtitle: 'Quality Control', colorIndex: 7, customLabel: 'QC Review', tableData: [{ requestDate: '10/18/2025', documentRequested: 'QC Audit', loanCategory: 'Quality Control', loanPurpose: 'Purchase', loanStage: 'Initial Approval', requestedBy: 'Amanda Rodriguez', clearedBy: 'Passed', attachedDoc: 'qc_report.pdf' }] },
    { name: 'Robert Taylor', subtitle: 'Funder', colorIndex: 8, customLabel: 'Funding Date', tableData: [{ requestDate: '10/25/2025', documentRequested: 'Funding Package', loanCategory: 'Funding', loanPurpose: 'Purchase', loanStage: 'Clear to Close', requestedBy: 'Robert Taylor', clearedBy: 'Pending', attachedDoc: '-' }] },
    { name: 'Lisa Anderson', subtitle: 'Post-Closing Specialist', colorIndex: 9, customLabel: 'Post-Close', tableData: [{ requestDate: '10/26/2025', documentRequested: 'Post-Closing Review', loanCategory: 'Post-Closing', loanPurpose: 'Purchase', loanStage: 'Funded', requestedBy: 'Lisa Anderson', clearedBy: 'Pending', attachedDoc: '-' }] }
  ];

  const activity = [
    { name: 'Pay Stub Uploaded', subtitle: 'Perry Paul', colorIndex: 0, customLabel: 'Activity Date', tableData: [{ requestDate: '10/24/2025', documentRequested: 'Pay Stub Upload', loanCategory: 'Activity', loanPurpose: 'Purchase', loanStage: 'Loan Prep', requestedBy: 'Perry Paul', clearedBy: 'Uploaded', attachedDoc: 'paystub.pdf' }] },
    { name: 'Appraisal Reviewed', subtitle: 'Tina Jones', colorIndex: 1, customLabel: 'Activity Date', tableData: [{ requestDate: '10/24/2025', documentRequested: 'Appraisal Review', loanCategory: 'Activity', loanPurpose: 'Purchase', loanStage: 'Initial Approval', requestedBy: 'Tina Jones', clearedBy: 'Reviewed', attachedDoc: 'appraisal.pdf' }] },
    { name: 'WDO Uploaded', subtitle: 'Frank Moss', colorIndex: 2, customLabel: 'Activity Date', tableData: [{ requestDate: '10/24/2025', documentRequested: 'WDO Report Upload', loanCategory: 'Activity', loanPurpose: 'Purchase', loanStage: 'Initial Approval', requestedBy: 'Frank Moss', clearedBy: 'Uploaded', attachedDoc: 'wdo.pdf' }] },
    { name: 'Pay Stub Uploaded', subtitle: 'Perry Paul', colorIndex: 3, customLabel: 'Activity Date', tableData: [{ requestDate: '10/23/2025', documentRequested: 'Pay Stub Upload', loanCategory: 'Activity', loanPurpose: 'Purchase', loanStage: 'Loan Prep', requestedBy: 'Perry Paul', clearedBy: 'Uploaded', attachedDoc: 'paystub.pdf' }] },
    { name: 'Appraisal Reviewed', subtitle: 'Tina Jones', colorIndex: 4, customLabel: 'Activity Date', tableData: [{ requestDate: '10/23/2025', documentRequested: 'Appraisal Review', loanCategory: 'Activity', loanPurpose: 'Purchase', loanStage: 'Initial Approval', requestedBy: 'Tina Jones', clearedBy: 'Reviewed', attachedDoc: 'appraisal.pdf' }] },
    { name: 'WDO Uploaded', subtitle: 'Frank Moss', colorIndex: 5, customLabel: 'Activity Date', tableData: [{ requestDate: '10/23/2025', documentRequested: 'WDO Report Upload', loanCategory: 'Activity', loanPurpose: 'Purchase', loanStage: 'Initial Approval', requestedBy: 'Frank Moss', clearedBy: 'Uploaded', attachedDoc: 'wdo.pdf' }] }
  ];

  const loandetails = [
    { name: 'Loan Amount', subtitle: '$450,000', colorIndex: 0, customLabel: 'Detail', tableData: [{ requestDate: '10/10/2025', documentRequested: 'Loan Amount', loanCategory: 'Loan Info', loanPurpose: 'Purchase', loanStage: 'Active', requestedBy: 'System', clearedBy: 'Confirmed', attachedDoc: '-' }] },
    { name: 'Interest Rate', subtitle: '6.5%', colorIndex: 1, customLabel: 'Detail', tableData: [{ requestDate: '10/10/2025', documentRequested: 'Interest Rate', loanCategory: 'Loan Info', loanPurpose: 'Purchase', loanStage: 'Active', requestedBy: 'System', clearedBy: 'Confirmed', attachedDoc: '-' }] },
    { name: 'Down Payment', subtitle: '$90,000', colorIndex: 2, customLabel: 'Detail', tableData: [{ requestDate: '10/10/2025', documentRequested: 'Down Payment', loanCategory: 'Loan Info', loanPurpose: 'Purchase', loanStage: 'Active', requestedBy: 'System', clearedBy: 'Confirmed', attachedDoc: '-' }] },
    { name: 'Loan Term', subtitle: '30 Years', colorIndex: 3, customLabel: 'Detail', tableData: [{ requestDate: '10/10/2025', documentRequested: 'Loan Term', loanCategory: 'Loan Info', loanPurpose: 'Purchase', loanStage: 'Active', requestedBy: 'System', clearedBy: 'Confirmed', attachedDoc: '-' }] },
    { name: 'Monthly Payment', subtitle: '$2,847', colorIndex: 4, customLabel: 'Detail', tableData: [{ requestDate: '10/10/2025', documentRequested: 'Monthly Payment', loanCategory: 'Loan Info', loanPurpose: 'Purchase', loanStage: 'Active', requestedBy: 'System', clearedBy: 'Confirmed', attachedDoc: '-' }] },
    { name: 'Property Value', subtitle: '$540,000', colorIndex: 5, customLabel: 'Detail', tableData: [{ requestDate: '10/10/2025', documentRequested: 'Property Value', loanCategory: 'Property Info', loanPurpose: 'Purchase', loanStage: 'Active', requestedBy: 'System', clearedBy: 'Confirmed', attachedDoc: '-' }] },
    { name: 'LTV Ratio', subtitle: '83.3%', colorIndex: 6, customLabel: 'Detail', tableData: [{ requestDate: '10/10/2025', documentRequested: 'LTV Ratio', loanCategory: 'Loan Info', loanPurpose: 'Purchase', loanStage: 'Active', requestedBy: 'System', clearedBy: 'Confirmed', attachedDoc: '-' }] },
    { name: 'Closing Costs', subtitle: '$13,500', colorIndex: 7, customLabel: 'Detail', tableData: [{ requestDate: '10/10/2025', documentRequested: 'Closing Costs', loanCategory: 'Loan Info', loanPurpose: 'Purchase', loanStage: 'Active', requestedBy: 'System', clearedBy: 'Confirmed', attachedDoc: '-' }] },
    { name: 'Property Tax', subtitle: '$450/month', colorIndex: 8, customLabel: 'Detail', tableData: [{ requestDate: '10/10/2025', documentRequested: 'Property Tax', loanCategory: 'Property Info', loanPurpose: 'Purchase', loanStage: 'Active', requestedBy: 'System', clearedBy: 'Confirmed', attachedDoc: '-' }] },
    { name: 'HOA Fees', subtitle: '$250/month', colorIndex: 9, customLabel: 'Detail', tableData: [{ requestDate: '10/10/2025', documentRequested: 'HOA Fees', loanCategory: 'Property Info', loanPurpose: 'Purchase', loanStage: 'Active', requestedBy: 'System', clearedBy: 'Confirmed', attachedDoc: '-' }] }
  ];

  // Current data based on tab
  const getCurrentData = () => {
    switch (currentTab) {
      case 'docs': return documents;
      case 'services': return services;
      case 'ratelock': return rateLock;
      case 'team': return team;
      case 'activity': return activity;
      case 'loandetails': return loandetails;
      default: return documents;
    }
  };

  const currentData = getCurrentData();

  // Get current date
  const getCurrentDate = () => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date().toLocaleDateString('en-US', options);
  };

  // Switch tab handler
  const switchTab = (tab: typeof currentTab) => {
    if (currentTab === tab) return;
    setCurrentTab(tab);
    setExpandedDetailsIndex(null);
    setCurrentOpenTable(null);
    if (isOverviewMode) {
      setIsOverviewMode(false);
    }
  };

  // Toggle view between detail and overview
  const toggleView = () => {
    setIsOverviewMode(!isOverviewMode);
  };

  // Render stacked icon based on current tab
  const renderStackedIcon = () => {
    if (currentTab === 'ratelock') {
      // Lock icon
      return (
        <svg viewBox="0 0 24 24" className="stacked-icon">
          <rect x="5" y="13" width="14" height="10" rx="2" fill="#10b981" stroke="#475569" strokeWidth="1.5" />
          <path d="M8.5 13V9.5C8.5 7.5 9.8 6 12 6C14.2 6 15.5 7.5 15.5 9.5V13" stroke="#475569" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <circle cx="12" cy="17" r="1.5" fill="#475569" />
          <rect x="11.3" y="17.5" width="1.4" height="2.5" rx="0.3" fill="#475569" />
        </svg>
      );
    } else if (currentTab === 'services') {
      // Clipboard checklist icon
      return (
        <svg viewBox="0 0 24 24" className="stacked-icon">
          <rect x="4" y="6" width="16" height="16" rx="2" fill="none" stroke="#3b82f6" strokeWidth="1.5" />
          <rect x="9" y="4" width="6" height="3" rx="1" fill="#f59e0b" stroke="#3b82f6" strokeWidth="1.5" />
          <path d="M7 11L9 13L13 9" stroke="#3b82f6" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M7 15L9 17L13 13" stroke="#3b82f6" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="14" y1="11" x2="17" y2="11" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="14" y1="15" x2="17" y2="15" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    } else {
      // Stacked papers icon for docs, team, activity, loandetails
      const baseY = 8;
      const spacing = 4;
      const displayData = (currentTab === 'team' || currentTab === 'activity' || currentTab === 'loandetails') 
        ? documentColors.slice(0, 3) 
        : currentData;
      
      return (
        <svg viewBox="0 0 24 24" className="stacked-icon">
          {displayData.map((item, index) => {
            const color = (currentTab === 'team' || currentTab === 'activity' || currentTab === 'loandetails')
              ? (item as typeof documentColors[0])
              : documentColors[(item as any).colorIndex];
            const yPos = baseY + (index * spacing);
            
            if (index === 0) {
              return <path key={index} d={`M3 ${yPos}L12 ${yPos - 5}L21 ${yPos}L12 ${yPos + 5}L3 ${yPos}Z`} stroke={color.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />;
            } else {
              return <path key={index} d={`M3 ${yPos}L12 ${yPos + 5}L21 ${yPos}`} stroke={color.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />;
            }
          })}
        </svg>
      );
    }
  };

  // Generate stage cards for overview mode
  const renderStageCards = () => {
    let stages: any[] = [];
    
    if (currentTab === 'ratelock') {
      stages = [
        { title: 'Locked', count: 'Rate Locked', color: '#3b82f6' },
        { title: '18 Days', count: 'Until Expiration', color: '#8b5cf6' },
        { title: 'Perry Paul', count: 'Locked By', color: '#10b981' }
      ];
    } else if (currentTab === 'services') {
      stages = [
        { title: 'Appraisal', count: 'Completed', color: '#3b82f6' },
        { title: 'WDO Inspection', count: 'In Progress', color: '#8b5cf6' },
        { title: 'Water Test', count: 'Pending', color: '#10b981' }
      ];
    } else if (currentTab === 'team') {
      stages = [
        { title: '10 Members', count: 'Active Team', color: '#3b82f6' },
        { title: '8 Roles', count: 'Specialists', color: '#8b5cf6' },
        { title: '100%', count: 'On Track', color: '#10b981' }
      ];
    } else if (currentTab === 'activity') {
      stages = [
        { title: '6 Activities', count: 'Recent', color: '#3b82f6' },
        { title: '3 Uploads', count: 'Documents', color: '#8b5cf6' },
        { title: '3 Reviews', count: 'Completed', color: '#10b981' }
      ];
    } else {
      // docs
      stages = [
        { title: 'Loan Prep', count: '8 Docs Requested', color: '#3b82f6' },
        { title: 'Initial Approval', count: '4 Docs Requested', color: '#8b5cf6' },
        { title: 'Final Approval', count: '2 Docs Requested', color: '#10b981' }
      ];
    }
    
    return stages.map((stage, index) => (
      <div key={index} className="ls-stage-card" data-color={stage.color} style={{ borderLeftColor: stage.color }}>
        <div className="ls-stage-title">{stage.title}</div>
        <div className="ls-stage-count">{stage.count}</div>
      </div>
    ));
  };

  const getButtonText = () => {
    switch (currentTab) {
      case 'docs': return 'Update Docs';
      case 'services': return 'Update Services';
      case 'ratelock': return 'Update Rate Lock';
      case 'team': return 'Update Team';
      case 'activity': return 'Update Activity';
      case 'loandetails': return 'Update Loan Details';
      default: return 'Update Docs';
    }
  };

  return (
    <>
      <style>{`
        /* Loan Status Dashboard Styles */
        .ls-container {
          max-width: 1280px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .ls-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .ls-header h1 {
          font-size: 1.875rem;
          font-weight: bold;
          color: white;
        }

        .ls-client-badge {
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          background: rgba(30, 41, 59, 0.5);
          backdrop-filter: blur(12px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(168, 85, 247, 0.2);
          color: #d1d5db;
          font-size: 0.875rem;
          cursor: pointer;
        }

        .ls-nav-card {
          background: rgba(30, 41, 59, 0.5);
          backdrop-filter: blur(12px);
          border-radius: 1rem;
          padding: 1rem;
          border: 1px solid rgba(168, 85, 247, 0.2);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }

        /* Performance Card Styles */
        .ls-performance-card {
          background: rgba(30, 41, 59, 0.5);
          backdrop-filter: blur(12px);
          border-radius: 1rem;
          padding: 1.5rem;
          border: 1px solid rgba(168, 85, 247, 0.2);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 1rem;
        }

        @media (max-width: 1200px) {
          .ls-performance-card {
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          }
        }

        .ls-metric-item {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .ls-metric-label {
          color: #94a3b8;
          font-size: 0.875rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .ls-metric-value {
          color: white;
          font-size: 1.875rem;
          font-weight: bold;
          display: flex;
          align-items: baseline;
          gap: 0.5rem;
        }

        .ls-metric-unit {
          font-size: 1rem;
          color: #94a3b8;
          font-weight: 500;
        }

        .ls-metric-change {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.875rem;
          font-weight: 600;
          padding: 0.25rem 0.5rem;
          border-radius: 0.375rem;
        }

        .ls-metric-change.positive {
          color: #10b981;
          background: rgba(16, 185, 129, 0.1);
        }

        .ls-metric-change.negative {
          color: #ef4444;
          background: rgba(239, 68, 68, 0.1);
        }

        .ls-metric-change svg {
          width: 14px;
          height: 14px;
        }

        .ls-nav-container {
          display: flex;
          justify-content: center;
        }

        .ls-nav-pills {
          display: inline-flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .ls-nav-pill {
          padding: 0.5rem 1rem;
          border-radius: 9999px;
          font-size: 0.875rem;
          font-weight: 500;
          border: none;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: transparent;
          color: #d8b4fe;
        }

        .ls-nav-pill.active {
          background: linear-gradient(to right, #9333ea, #ec4899);
          color: white;
          box-shadow: 0 10px 15px -3px rgba(147, 51, 234, 0.4);
          transform: scale(1.05);
        }

        .ls-nav-pill:not(.active):hover {
          background: rgba(71, 85, 105, 0.5);
          color: white;
        }

        .ls-two-col-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0;
        }

        .ls-card {
          background: rgba(30, 41, 59, 0.5);
          backdrop-filter: blur(12px);
          padding: 1.5rem;
          border: 1px solid rgba(168, 85, 247, 0.2);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }

        .ls-card:first-child {
          border-radius: 1rem 0 0 1rem;
          border-right: none;
        }

        .ls-card:last-child {
          border-radius: 0 1rem 1rem 0;
        }

        .ls-docs-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .ls-docs-list-scrollable {
          max-height: 280px;
          overflow-y: auto;
          overflow-x: hidden;
          padding-right: 0.5rem;
        }

        .ls-docs-list-scrollable::-webkit-scrollbar {
          width: 6px;
        }

        .ls-docs-list-scrollable::-webkit-scrollbar-track {
          background: rgba(148, 163, 184, 0.1);
          border-radius: 10px;
        }

        .ls-docs-list-scrollable::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #8b5cf6, #ec4899);
          border-radius: 10px;
        }

        .ls-docs-list-scrollable::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #a78bfa, #f472b6);
        }

        .ls-doc-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem 0.5rem;
          cursor: pointer;
          border-radius: 0.5rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }

        .ls-doc-item:hover {
          background: rgba(71, 85, 105, 0.2);
        }

        .ls-doc-item-content {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex: 1;
          transition: all 0.3s;
        }

        .ls-eye-icon {
          position: absolute;
          right: -30px;
          opacity: 0;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          color: #d8b4fe;
          width: 24px;
          height: 24px;
          pointer-events: none;
        }

        .ls-doc-item:hover .ls-eye-icon {
          right: 10px;
          opacity: 1;
        }

        .ls-accent-line {
          width: 4px;
          height: 3rem;
          border-radius: 9999px;
        }

        .ls-accent-blue {
          background: linear-gradient(to bottom, #3b82f6, #2563eb);
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
        }

        .ls-accent-purple {
          background: linear-gradient(to bottom, #8b5cf6, #7c3aed);
          box-shadow: 0 0 10px rgba(168, 85, 247, 0.5);
        }

        .ls-accent-emerald {
          background: linear-gradient(to bottom, #10b981, #059669);
          box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
        }

        .ls-doc-content {
          flex: 1;
        }

        .ls-doc-title {
          color: white;
          font-size: 1.125rem;
          font-weight: 600;
          margin-bottom: 0.25rem;
        }

        .ls-doc-subtitle {
          color: #94a3b8;
          font-size: 0.875rem;
        }

        .ls-icon-card {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 300px;
          position: relative;
        }

        .stacked-icon {
          width: 210px;
          height: 210px;
          flex-shrink: 0;
          transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* View Toggle Button */
        .ls-view-toggle-btn {
          position: absolute;
          top: 1rem;
          right: 1rem;
          width: 40px;
          height: 40px;
          background: rgba(168, 85, 247, 0.2);
          border: 1px solid rgba(168, 85, 247, 0.3);
          border-radius: 0.5rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 10;
        }

        .ls-view-toggle-btn:hover {
          background: rgba(168, 85, 247, 0.3);
          border-color: rgba(168, 85, 247, 0.5);
          transform: scale(1.05);
        }

        .ls-view-toggle-btn svg {
          width: 24px;
          height: 24px;
          color: #d8b4fe;
          transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .ls-view-toggle-btn.active svg {
          transform: rotate(180deg);
        }

        /* Stage Cards for Overview */
        .ls-stage-cards {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .ls-stage-card {
          background: rgba(15, 23, 42, 0.5);
          padding: 1rem 1rem 1rem 1.25rem;
          border-radius: 0.75rem;
          border: 1px solid rgba(168, 85, 247, 0.2);
          border-left: 4px solid;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .ls-stage-card:hover {
          background: rgba(15, 23, 42, 0.7);
          border-color: rgba(168, 85, 247, 0.4);
          transform: translateX(4px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
        }

        .ls-stage-title {
          font-size: 1rem;
          font-weight: 600;
          color: white;
          margin-bottom: 0.25rem;
        }

        .ls-stage-count {
          color: #94a3b8;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .morphing {
          transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .fade-out {
          opacity: 0;
          transform: scale(0.95);
        }

        .fade-in {
          opacity: 1;
          transform: scale(1);
        }

        /* Modal Styles */
        .ls-modal-overlay {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(8px);
          z-index: 1000;
          align-items: center;
          justify-content: center;
        }

        .ls-modal-overlay.active {
          display: flex;
        }

        .ls-modal {
          background: linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(88, 28, 135, 0.95) 100%);
          backdrop-filter: blur(20px);
          border-radius: 1rem;
          padding: 2rem;
          border: 1px solid rgba(168, 85, 247, 0.3);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8);
          max-width: 500px;
          width: 90%;
          position: relative;
        }

        .ls-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .ls-modal-title {
          font-size: 1.5rem;
          font-weight: bold;
          color: white;
        }

        .ls-close-btn {
          background: transparent;
          border: none;
          color: #d8b4fe;
          font-size: 1.5rem;
          cursor: pointer;
          padding: 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 0.5rem;
          transition: all 0.2s;
        }

        .ls-close-btn:hover {
          background: rgba(168, 85, 247, 0.2);
          color: white;
        }

        .ls-modal-date {
          color: #d8b4fe;
          font-size: 0.875rem;
          margin-bottom: 1.5rem;
        }

        .ls-choice-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
        }

        .ls-choice-btn {
          flex: 1;
          padding: 2rem 1rem;
          background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(88, 28, 135, 0.6) 100%);
          border: 1px solid rgba(168, 85, 247, 0.3);
          border-radius: 0.75rem;
          color: white;
          font-size: 3rem;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .ls-choice-btn:hover {
          transform: translateY(-4px);
          box-shadow: 0 15px 30px rgba(147, 51, 234, 0.4);
          border-color: rgba(168, 85, 247, 0.6);
        }

        .ls-choice-btn span {
          font-size: 0.875rem;
          font-weight: 600;
        }
      `}</style>

      <div className="ls-container">
        {/* Header */}
        <div className="ls-header">
          <div>
            <h1>Loan Status</h1>
            <div style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>John Doe • Mary Doe</span>
              <svg 
                onClick={() => setIsLoanTimelineOpen(true)} 
                style={{ width: '18px', height: '18px', cursor: 'pointer', color: '#a78bfa', transition: 'all 0.3s' }} 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
                onMouseOver={(e) => e.currentTarget.style.color = '#d8b4fe'}
                onMouseOut={(e) => e.currentTarget.style.color = '#a78bfa'}
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>
          </div>
          <button className="ls-client-badge" onClick={() => setIsModalOpen(true)}>
            {getButtonText()}
          </button>
        </div>

        {/* Performance Card */}
        <div className="ls-performance-card">
          <div className="ls-metric-item">
            <div className="ls-metric-label">Category</div>
            <div className="ls-metric-value">VA</div>
          </div>
          
          <div className="ls-metric-item">
            <div className="ls-metric-label">Loan Amount</div>
            <div className="ls-metric-value">$425,000</div>
          </div>
          
          <div className="ls-metric-item">
            <div className="ls-metric-label">Interest Rate</div>
            <div className="ls-metric-value">
              6.75<span className="ls-metric-unit">%</span>
              <span className="ls-metric-change positive">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m18 15-6-6-6 6"/>
                </svg>
                0.25%
              </span>
            </div>
          </div>
          
          <div className="ls-metric-item">
            <div className="ls-metric-label">Days to Close</div>
            <div className="ls-metric-value">
              23
              <span className="ls-metric-change negative">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m6 9 6 6 6-6"/>
                </svg>
                3 days
              </span>
            </div>
          </div>
          
          <div className="ls-metric-item">
            <div className="ls-metric-label">Completion</div>
            <div className="ls-metric-value">
              72<span className="ls-metric-unit">%</span>
              <span className="ls-metric-change positive">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m18 15-6-6-6 6"/>
                </svg>
                12%
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Pills */}
        <div className="ls-nav-card">
          <div className="ls-nav-container">
            <div className="ls-nav-pills">
              <button className={`ls-nav-pill ${currentTab === 'docs' ? 'active' : ''}`} onClick={() => switchTab('docs')}>
                Docs Pending
              </button>
              <button className={`ls-nav-pill ${currentTab === 'services' ? 'active' : ''}`} onClick={() => switchTab('services')}>
                Services
              </button>
              <button className={`ls-nav-pill ${currentTab === 'ratelock' ? 'active' : ''}`} onClick={() => switchTab('ratelock')}>
                Rate Lock
              </button>
              <button className={`ls-nav-pill ${currentTab === 'team' ? 'active' : ''}`} onClick={() => switchTab('team')}>
                Team
              </button>
              <button className={`ls-nav-pill ${currentTab === 'loandetails' ? 'active' : ''}`} onClick={() => switchTab('loandetails')}>
                Loan Details
              </button>
              <button className="ls-nav-pill">
                Email
              </button>
              <button className="ls-nav-pill">
                Notes
              </button>
              <button className={`ls-nav-pill ${currentTab === 'activity' ? 'active' : ''}`} onClick={() => switchTab('activity')}>
                Activity
              </button>
            </div>
          </div>
        </div>

        {/* Two Card Layout */}
        <div className="ls-two-col-grid">
          {/* Left Card - Documents/Services/etc */}
          <div className="ls-card">
            {/* Detail View - Document List */}
            <div className={`ls-docs-list morphing ${isOverviewMode ? 'fade-out' : 'fade-in'}`} style={{ display: isOverviewMode ? 'none' : 'flex' }}>
              <div className="ls-docs-list-scrollable">
                {currentData.map((doc: any, index) => {
                  const color = documentColors[doc.colorIndex];
                  const accentClass = doc.colorIndex === 0 ? 'ls-accent-blue' : doc.colorIndex === 1 ? 'ls-accent-purple' : 'ls-accent-emerald';
                  
                  return (
                    <div key={index} className="ls-doc-item" onClick={() => setExpandedDetailsIndex(expandedDetailsIndex === index ? null : index)}>
                      <div className="ls-doc-item-content">
                        <div className={`ls-accent-line ${accentClass}`}></div>
                        <div className="ls-doc-content">
                          <div className="ls-doc-title">{doc.name}</div>
                          <div className="ls-doc-subtitle">{doc.subtitle}</div>
                        </div>
                      </div>
                      <svg className="ls-eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Overview View - Stage Cards */}
            <div className={`ls-stage-cards morphing ${!isOverviewMode ? 'fade-out' : 'fade-in'}`} style={{ display: !isOverviewMode ? 'none' : 'flex' }}>
              {renderStageCards()}
            </div>
          </div>

          {/* Right Card - Icon */}
          <div className="ls-card ls-icon-card">
            {/* Toggle Button */}
            <button className={`ls-view-toggle-btn ${isOverviewMode ? 'active' : ''}`} onClick={toggleView}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 8L12 3L21 8L12 13L3 8Z"/>
                <path d="M3 12L12 17L21 12"/>
                <path d="M3 16L12 21L21 16"/>
              </svg>
            </button>
            
            {/* Stacked Icon */}
            {renderStackedIcon()}
          </div>
        </div>

        {/* Update Docs Modal */}
        <div className={`ls-modal-overlay ${isModalOpen ? 'active' : ''}`} onClick={() => setIsModalOpen(false)}>
          <div className="ls-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ls-modal-header">
              <h2 className="ls-modal-title">{getButtonText()}</h2>
              <button className="ls-close-btn" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            
            <div className="ls-modal-date">{getCurrentDate()}</div>
            
            <div className="ls-choice-buttons">
              <button className="ls-choice-btn" onClick={() => { setIsModalOpen(false); setIsRequestModalOpen(true); }}>
                📝
                <span>{currentTab === 'docs' ? 'Request Docs' : currentTab === 'services' ? 'Request Services' : currentTab === 'ratelock' ? 'Lock Rate' : currentTab === 'team' ? 'Assign Staff' : currentTab === 'activity' ? 'Add Activity' : 'Add Details'}</span>
              </button>
              <button className="ls-choice-btn" onClick={() => { setIsModalOpen(false); setIsClearModalOpen(true); }}>
                ✓
                <span>{currentTab === 'docs' ? 'Clear Docs' : currentTab === 'services' ? 'Clear Services' : currentTab === 'ratelock' ? 'Extend Lock' : currentTab === 'team' ? 'Update Team' : currentTab === 'activity' ? 'View Activity' : 'Edit Details'}</span>
              </button>
              {(currentTab === 'services' || currentTab === 'ratelock') && (
                <button className="ls-choice-btn" onClick={() => { setIsModalOpen(false); setIsTrackModalOpen(true); }}>
                  🔍
                  <span>{currentTab === 'services' ? 'Track Services' : 'Lock History'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

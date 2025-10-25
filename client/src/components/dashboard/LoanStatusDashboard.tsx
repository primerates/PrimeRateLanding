import { useState } from 'react';
import { TrendingUp, TrendingDown, Eye, X, ChevronDown } from 'lucide-react';

export function LoanStatusDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [expandedTable, setExpandedTable] = useState<string | null>(null);

  // Mock data - will be connected to real data later
  const metrics = {
    totalLoans: 142,
    totalValue: 45600000,
    avgLoanSize: 321127,
    closedThisMonth: 23,
    closeRate: 78
  };

  const stages = [
    { id: 'lead', name: 'Lead', count: 28, color: '#3b82f6' },
    { id: 'processing', name: 'Processing', count: 45, color: '#8b5cf6' },
    { id: 'underwriting', name: 'Underwriting', count: 32, color: '#10b981' },
    { id: 'cleared-to-close', name: 'Cleared to Close', count: 14, color: '#f59e0b' },
    { id: 'funded', name: 'Funded', count: 23, color: '#10b981' }
  ];

  const documents = [
    { id: 1, title: 'Application', subtitle: '1003 Form', date: 'Jan 15, 2025', count: 4 },
    { id: 2, title: 'Credit Report', subtitle: 'Experian Tri-Merge', date: 'Jan 16, 2025', count: 1 },
    { id: 3, title: 'Income Documentation', subtitle: 'W-2s & Pay Stubs', date: 'Jan 18, 2025', count: 8 },
    { id: 4, title: 'Appraisal', subtitle: 'Property Valuation', date: 'Jan 20, 2025', count: 2 }
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Performance Metrics Card */}
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20 shadow-2xl">
        <div className="grid grid-cols-5 gap-6">
          <div className="flex flex-col gap-2">
            <div className="text-slate-400 text-sm font-medium uppercase tracking-wide">Total Loans</div>
            <div className="text-white text-3xl font-bold">{metrics.totalLoans}</div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="text-slate-400 text-sm font-medium uppercase tracking-wide">Total Value</div>
            <div className="text-white text-3xl font-bold flex items-baseline gap-2">
              ${(metrics.totalValue / 1000000).toFixed(1)}
              <span className="text-base text-slate-400 font-medium">M</span>
            </div>
            <div className="inline-flex items-center gap-1 text-sm font-semibold px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-500 w-fit">
              <TrendingUp className="w-4 h-4" />
              +12.5%
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="text-slate-400 text-sm font-medium uppercase tracking-wide">Avg Loan Size</div>
            <div className="text-white text-3xl font-bold flex items-baseline gap-2">
              ${(metrics.avgLoanSize / 1000).toFixed(0)}
              <span className="text-base text-slate-400 font-medium">K</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="text-slate-400 text-sm font-medium uppercase tracking-wide">Closed This Month</div>
            <div className="text-white text-3xl font-bold">{metrics.closedThisMonth}</div>
            <div className="inline-flex items-center gap-1 text-sm font-semibold px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-500 w-fit">
              <TrendingUp className="w-4 h-4" />
              +8.2%
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="text-slate-400 text-sm font-medium uppercase tracking-wide">Close Rate</div>
            <div className="text-white text-3xl font-bold flex items-baseline gap-2">
              {metrics.closeRate}
              <span className="text-base text-slate-400 font-medium">%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Pills */}
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-4 border border-purple-500/20 shadow-2xl">
        <div className="flex justify-center">
          <div className="inline-flex gap-4 flex-wrap">
            {['overview', ...stages.map(s => s.id)].map(tab => {
              const stage = stages.find(s => s.id === tab);
              const count = stage?.count || metrics.totalLoans;
              const label = tab === 'overview' ? 'Overview' : stage?.name || tab;
              
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                    activeTab === tab
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/40 scale-105'
                      : 'bg-transparent text-purple-300 hover:bg-slate-700/50 hover:text-white'
                  }`}
                  data-testid={`nav-${tab}`}
                >
                  {label}
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    activeTab === tab
                      ? 'bg-white/20 text-white'
                      : 'bg-purple-500/20 text-purple-300'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-2 gap-0">
        {/* Left Card - Documents */}
        <div className="bg-slate-800/50 backdrop-blur-xl p-6 border border-purple-500/20 shadow-2xl rounded-l-2xl border-r-0">
          <h2 className="text-xl font-bold text-white mb-4">Documents</h2>
          <div className="flex flex-col gap-2">
            {documents.map(doc => (
              <div
                key={doc.id}
                className="flex items-center gap-4 p-4 cursor-pointer rounded-lg transition-all hover:bg-slate-700/20 relative group"
                onClick={() => setSelectedDocument(doc.id.toString())}
                data-testid={`doc-${doc.id}`}
              >
                <div className="w-1 h-12 rounded-full bg-gradient-to-b from-purple-500 to-purple-600 shadow-lg shadow-purple-500/50" />
                <div className="flex-1">
                  <div className="text-white text-lg font-semibold mb-1">{doc.title}</div>
                  <div className="text-slate-400 text-sm">{doc.subtitle}</div>
                </div>
                <div className="text-slate-500 text-sm font-medium transition-all group-hover:mr-12">
                  {doc.date}
                </div>
                <div className="absolute right-4 bg-purple-500/20 border border-purple-500/30 text-purple-300 px-2.5 py-1 rounded-full text-xs font-semibold transition-all group-hover:bg-purple-500/30 group-hover:border-purple-500/50 group-hover:text-white group-hover:right-12 group-hover:scale-105">
                  {doc.count}
                </div>
                <Eye className="w-6 h-6 text-purple-300 absolute -right-8 opacity-0 group-hover:right-4 group-hover:opacity-100 transition-all pointer-events-none" />
              </div>
            ))}
          </div>
        </div>

        {/* Right Card - Stage Overview */}
        <div className="bg-slate-800/50 backdrop-blur-xl p-6 border border-purple-500/20 shadow-2xl rounded-r-2xl">
          <h2 className="text-xl font-bold text-white mb-4">Pipeline Stages</h2>
          <div className="flex flex-col gap-3">
            {stages.map(stage => (
              <div
                key={stage.id}
                className="bg-slate-900/50 p-4 pl-5 rounded-xl border border-purple-500/20 border-l-4 transition-all hover:bg-slate-900/70 hover:border-purple-500/40 hover:translate-x-1 cursor-pointer shadow-md hover:shadow-lg"
                style={{ borderLeftColor: stage.color }}
                onClick={() => setExpandedTable(expandedTable === stage.id ? null : stage.id)}
                data-testid={`stage-${stage.id}`}
              >
                <div className="text-base font-semibold text-white mb-1">{stage.name}</div>
                <div className="text-slate-400 text-sm font-medium">{stage.count} loans</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Expanded Document Details */}
      {selectedDocument && (
        <div className="bg-gradient-to-br from-slate-800/95 to-purple-900/70 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30 shadow-2xl animate-in slide-in-from-top-4 duration-500">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-purple-500/20">
            <h3 className="text-xl font-bold text-white">Document Details</h3>
            <button
              onClick={() => setSelectedDocument(null)}
              className="text-purple-300 hover:text-white hover:bg-purple-500/20 rounded-lg p-2 transition-all"
              data-testid="close-details"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Document Type', value: 'Application' },
              { label: 'Upload Date', value: 'Jan 15, 2025' },
              { label: 'Status', value: 'Complete' },
              { label: 'Pages', value: '4' },
              { label: 'File Size', value: '2.4 MB' },
              { label: 'Last Modified', value: 'Jan 16, 2025' }
            ].map((item, idx) => (
              <div key={idx} className="bg-slate-900/50 p-4 rounded-lg border border-purple-500/20">
                <div className="text-purple-300 text-xs font-semibold uppercase mb-2">{item.label}</div>
                <div className="text-white text-base font-medium">{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expanded Table View */}
      {expandedTable && (
        <div className="bg-gradient-to-br from-slate-800/95 to-purple-900/70 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30 shadow-2xl animate-in slide-in-from-top-4 duration-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">
              {stages.find(s => s.id === expandedTable)?.name} - Loans
            </h3>
            <button
              onClick={() => setExpandedTable(null)}
              className="text-purple-300 hover:text-white hover:bg-purple-500/20 rounded-lg p-2 transition-all"
              data-testid="close-table"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-purple-500/30">
                  <th className="text-left p-3 text-purple-300 text-sm font-semibold cursor-pointer hover:text-white">
                    Borrower
                    <ChevronDown className="w-4 h-4 inline ml-2" />
                  </th>
                  <th className="text-left p-3 text-purple-300 text-sm font-semibold cursor-pointer hover:text-white">
                    Loan Amount
                    <ChevronDown className="w-4 h-4 inline ml-2" />
                  </th>
                  <th className="text-left p-3 text-purple-300 text-sm font-semibold cursor-pointer hover:text-white">
                    Property Address
                    <ChevronDown className="w-4 h-4 inline ml-2" />
                  </th>
                  <th className="text-left p-3 text-purple-300 text-sm font-semibold cursor-pointer hover:text-white">
                    Days in Stage
                    <ChevronDown className="w-4 h-4 inline ml-2" />
                  </th>
                  <th className="text-left p-3 text-purple-300 text-sm font-semibold cursor-pointer hover:text-white">
                    Loan Officer
                    <ChevronDown className="w-4 h-4 inline ml-2" />
                  </th>
                </tr>
              </thead>
              <tbody className="max-h-64 overflow-y-auto">
                {[...Array(8)].map((_, idx) => (
                  <tr key={idx} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-all">
                    <td className="p-3 text-slate-300 text-sm">John Doe</td>
                    <td className="p-3 text-slate-300 text-sm">$325,000</td>
                    <td className="p-3 text-slate-300 text-sm">123 Main St, Miami FL</td>
                    <td className="p-3 text-slate-300 text-sm">12 days</td>
                    <td className="p-3 text-slate-300 text-sm">Sarah Johnson</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

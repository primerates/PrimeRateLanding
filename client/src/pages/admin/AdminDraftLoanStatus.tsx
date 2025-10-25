import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function AdminDraftLoanStatus() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
              Draft Loan Status
            </h1>
            <div className="px-3 py-1 bg-orange-500/20 border border-orange-500/30 rounded-lg">
              <span className="text-xs font-semibold text-orange-300">
                SANDBOX
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={() => setLocation('/admin/dashboard')}
            className="text-purple-200 hover:text-white hover:bg-purple-500/20"
            data-testid="button-back-to-dashboard"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        {/* Main Content */}
        <Card className="backdrop-blur-xl bg-slate-800/50 border-l-4 border-l-orange-500 shadow-2xl">
          <CardHeader className="border-b border-purple-500/20">
            <CardTitle className="text-2xl bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Sandbox Area for Loan Status Development
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="p-8 text-center rounded-lg border-2 border-dashed border-purple-500/30 bg-purple-500/5">
              <p className="text-lg font-medium mb-2 text-purple-200">
                This is your sandbox area for developing updated loan status codes and features.
              </p>
              <p className="text-sm text-purple-300/70 mb-6">
                Add your loan status components and functionality here.
              </p>
              <div className="text-sm text-purple-400 bg-purple-900/30 rounded-lg p-4 border border-purple-500/20">
                <p className="font-semibold mb-2">Getting Started:</p>
                <ul className="text-left space-y-2">
                  <li>• Edit this file at: <code className="text-orange-400">client/src/pages/admin/AdminDraftLoanStatus.tsx</code></li>
                  <li>• Add your components and logic</li>
                  <li>• Test your changes in this isolated environment</li>
                  <li>• When ready, integrate into the main application</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RotateCcw, Monitor, Save, Plus, ArrowUpDown } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

const US_STATES = [
  { value: 'AL', label: 'AL' }, { value: 'AK', label: 'AK' }, { value: 'AZ', label: 'AZ' }, 
  { value: 'AR', label: 'AR' }, { value: 'CA', label: 'CA' }, { value: 'CO', label: 'CO' },
  { value: 'CT', label: 'CT' }, { value: 'DE', label: 'DE' }, { value: 'FL', label: 'FL' },
  { value: 'GA', label: 'GA' }, { value: 'HI', label: 'HI' }, { value: 'ID', label: 'ID' },
  { value: 'IL', label: 'IL' }, { value: 'IN', label: 'IN' }, { value: 'IA', label: 'IA' },
  { value: 'KS', label: 'KS' }, { value: 'KY', label: 'KY' }, { value: 'LA', label: 'LA' },
  { value: 'ME', label: 'ME' }, { value: 'MD', label: 'MD' }, { value: 'MA', label: 'MA' },
  { value: 'MI', label: 'MI' }, { value: 'MN', label: 'MN' }, { value: 'MS', label: 'MS' },
  { value: 'MO', label: 'MO' }, { value: 'MT', label: 'MT' }, { value: 'NE', label: 'NE' },
  { value: 'NV', label: 'NV' }, { value: 'NH', label: 'NH' }, { value: 'NJ', label: 'NJ' },
  { value: 'NM', label: 'NM' }, { value: 'NY', label: 'NY' }, { value: 'NC', label: 'NC' },
  { value: 'ND', label: 'ND' }, { value: 'OH', label: 'OH' }, { value: 'OK', label: 'OK' },
  { value: 'OR', label: 'OR' }, { value: 'PA', label: 'PA' }, { value: 'RI', label: 'RI' },
  { value: 'SC', label: 'SC' }, { value: 'SD', label: 'SD' }, { value: 'TN', label: 'TN' },
  { value: 'TX', label: 'TX' }, { value: 'UT', label: 'UT' }, { value: 'VT', label: 'VT' },
  { value: 'VA', label: 'VA' }, { value: 'WA', label: 'WA' }, { value: 'WV', label: 'WV' },
  { value: 'WI', label: 'WI' }, { value: 'WY', label: 'WY' }
];

export default function AdminAddComment() {
  const [location, setLocation] = useLocation();
  const [showRevertAnimation, setShowRevertAnimation] = useState(false);
  const [screenshareLoading, setScreenshareLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  // Client comment state
  const [clientFirstName, setClientFirstName] = useState('');
  const [clientLastName, setClientLastName] = useState('');
  const [clientState, setClientState] = useState('');
  const [clientSource, setClientSource] = useState('');
  const [clientRating, setClientRating] = useState('');
  const [clientLoanPurpose, setClientLoanPurpose] = useState('');
  const [clientDate, setClientDate] = useState('');
  const [clientLoanDate, setClientLoanDate] = useState('');
  const [clientComment, setClientComment] = useState('');

  // Internal message state (Insight)
  const [postBy, setPostBy] = useState('Admin');
  const [postAuthor, setPostAuthor] = useState('');
  const [insightDate, setInsightDate] = useState('');
  const [insightComment, setInsightComment] = useState('');
  
  // Font control states
  const [fontSize, setFontSize] = useState('');
  const [fontType, setFontType] = useState('');
  const [colorTheme, setColorTheme] = useState('');

  // Preview state
  const [showPreview, setShowPreview] = useState(false);

  // Animation state for circles
  const [animateCircles, setAnimateCircles] = useState(false);

  // Trigger animation when component mounts or tab changes
  useEffect(() => {
    setAnimateCircles(false);
    setTimeout(() => setAnimateCircles(true), 100);
  }, []);

  // Sorting state for All Comments table
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleScreenshare = () => {
    setScreenshareLoading(true);
    setTimeout(() => setScreenshareLoading(false), 2000);
  };

  const handleSave = () => {
    setSaveLoading(true);
    setTimeout(() => setSaveLoading(false), 1000);
  };

  const handleBackToDashboard = () => {
    setShowRevertAnimation(true);
    setTimeout(() => setShowRevertAnimation(false), 600);
    setTimeout(() => setLocation('/admin/dashboard'), 300);
  };

  // Date formatting for MM/DD/YYYY with auto "/"
  const handleDateChange = (value: string, setter: (value: string) => void) => {
    const digitsOnly = value.replace(/\D/g, ''); // Remove non-digits
    let formatted = '';
    if (digitsOnly.length > 0) {
      formatted = digitsOnly.substring(0, 2);
      if (digitsOnly.length > 2) {
        formatted += '/' + digitsOnly.substring(2, 4);
        if (digitsOnly.length > 4) {
          formatted += '/' + digitsOnly.substring(4, 8);
        }
      }
    }
    setter(formatted);
  };

  return (
    <TooltipProvider delayDuration={300}>
      <div className="min-h-screen bg-background">
        {/* Header - Copied from Lead Page */}
        <header className="bg-primary text-primary-foreground shadow-lg border-b transition-shadow duration-300 hover:shadow-2xl hover:shadow-primary/20">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h1 className="text-xl font-black italic" style={{ fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif' }}>
                  Comments & Posts
                </h1>
              </div>
              <div className="flex items-center space-x-3">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleBackToDashboard}
                      className="text-primary-foreground hover:text-white hover:bg-green-600 p-2 transition-colors duration-200"
                      data-testid="button-back-to-dashboard"
                    >
                      <RotateCcw className={`h-6 w-6 ${showRevertAnimation ? 'animate-rotate-360' : ''}`} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left" sideOffset={10} className="text-sm">
                    <p>Back to Dashboard</p>
                  </TooltipContent>
                </Tooltip>
                <Button
                  onClick={handleScreenshare}
                  disabled={screenshareLoading}
                  size="sm"
                  className="bg-primary-foreground text-primary hover:bg-green-600 hover:text-white"
                  data-testid="button-screenshare"
                >
                  <Monitor className={`h-3 w-3 mr-2 transition-transform duration-500 ${screenshareLoading ? 'animate-spin' : ''}`} />
                  {screenshareLoading ? 'Starting...' : 'Screenshare'}
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saveLoading}
                  size="sm"
                  className="bg-white text-primary border hover:bg-green-600 hover:text-white transition-all duration-500"
                  data-testid="button-save-client"
                >
                  <Save className={`h-3 w-3 mr-2 transition-transform duration-500 ${saveLoading ? 'rotate-180' : ''}`} />
                  {saveLoading ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="container mx-auto px-6 py-8">
          <Tabs defaultValue="client" className="space-y-6">
            {/* Tab Menu Bar - Matching Lead Tile Style */}
            <TabsList className="grid w-full grid-cols-5 bg-transparent h-auto p-0 relative border-b border-gray-200 group">
              <TabsTrigger value="client" data-testid="tab-client-comment" className="relative bg-transparent text-gray-700 hover:text-black data-[state=active]:text-blue-900 data-[state=active]:hover:text-blue-900 data-[state=active]:bg-transparent border-0 rounded-none py-3 px-4 font-medium transition-colors duration-200 after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-px hover:after:bg-green-500 data-[state=active]:after:bg-blue-900 data-[state=active]:hover:after:bg-blue-900 after:transition-all after:duration-300 hover:after:w-1/2 data-[state=active]:after:w-1/2 data-[state=active]:group-hover:after:w-0">Client Comment</TabsTrigger>
              <TabsTrigger value="all-comments" data-testid="tab-all-comments" className="relative bg-transparent text-gray-700 hover:text-black data-[state=active]:text-blue-900 data-[state=active]:hover:text-blue-900 data-[state=active]:bg-transparent border-0 rounded-none py-3 px-4 font-medium transition-colors duration-200 after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-px hover:after:bg-green-500 data-[state=active]:after:bg-blue-900 data-[state=active]:hover:after:bg-blue-900 after:transition-all after:duration-300 hover:after:w-1/2 data-[state=active]:after:w-1/2 data-[state=active]:group-hover:after:w-0">All Comments</TabsTrigger>
              <TabsTrigger value="company-post" data-testid="tab-company-post" className="relative bg-transparent text-gray-700 hover:text-black data-[state=active]:text-blue-900 data-[state=active]:hover:text-blue-900 data-[state=active]:bg-transparent border-0 rounded-none py-3 px-4 font-medium transition-colors duration-200 after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-px hover:after:bg-green-500 data-[state=active]:after:bg-blue-900 data-[state=active]:hover:after:bg-blue-900 after:transition-all after:duration-300 hover:after:w-1/2 data-[state=active]:after:w-1/2 data-[state=active]:group-hover:after:w-0">Company Post</TabsTrigger>
              <TabsTrigger value="all-posts" data-testid="tab-all-posts" className="relative bg-transparent text-gray-700 hover:text-black data-[state=active]:text-blue-900 data-[state=active]:hover:text-blue-900 data-[state=active]:bg-transparent border-0 rounded-none py-3 px-4 font-medium transition-colors duration-200 after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-px hover:after:bg-green-500 data-[state=active]:after:bg-blue-900 data-[state=active]:hover:after:bg-blue-900 after:transition-all after:duration-300 hover:after:w-1/2 data-[state=active]:after:w-1/2 data-[state=active]:group-hover:after:w-0">All Posts</TabsTrigger>
              <TabsTrigger value="notes" data-testid="tab-notes" className="relative bg-transparent text-gray-700 hover:text-black data-[state=active]:text-blue-900 data-[state=active]:hover:text-blue-900 data-[state=active]:bg-transparent border-0 rounded-none py-3 px-4 font-medium transition-colors duration-200 after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-px hover:after:bg-green-500 data-[state=active]:after:bg-blue-900 data-[state=active]:hover:after:bg-blue-900 after:transition-all after:duration-300 hover:after:w-1/2 data-[state=active]:after:w-1/2 data-[state=active]:group-hover:after:w-0">Notes</TabsTrigger>
            </TabsList>

            {/* Card with Circular Indicators - Always Visible */}
            <Card>
              <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-6">
                <div className="space-y-2">
                  <Label className="text-lg font-semibold">Last Comment</Label>
                </div>
                
                <div className="space-y-2 flex flex-col items-center">
                  <Label className="text-lg font-semibold">Comments</Label>
                  <div className="min-h-[40px] flex items-center justify-center">
                    <div
                      className="bg-navy-900 text-white rounded-full w-20 h-20 flex items-center justify-center overflow-hidden"
                      style={{
                        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
                        fontSize: '36px',
                        fontWeight: 600,
                        backgroundColor: '#1a3373',
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
                        transform: animateCircles ? 'translateY(0)' : 'translateY(100px)',
                        opacity: animateCircles ? 1 : 0,
                        transition: 'transform 0.6s ease-out, opacity 0.6s ease-out'
                      }}
                      data-testid="circle-client-comment"
                    >
                      <span style={{
                        transform: animateCircles ? 'translateY(0)' : 'translateY(-100px)',
                        transition: 'transform 0.6s ease-out 0.2s',
                        display: 'block'
                      }}>0</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 flex flex-col items-center">
                  <Label className="text-lg font-semibold">States</Label>
                  <div className="min-h-[40px] flex items-center justify-center">
                    <div
                      className="bg-navy-900 text-white rounded-full w-20 h-20 flex items-center justify-center overflow-hidden"
                      style={{
                        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
                        fontSize: '36px',
                        fontWeight: 600,
                        backgroundColor: '#1a3373',
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
                        transform: animateCircles ? 'translateY(0)' : 'translateY(100px)',
                        opacity: animateCircles ? 1 : 0,
                        transition: 'transform 0.6s ease-out 0.1s, opacity 0.6s ease-out 0.1s'
                      }}
                      data-testid="circle-company-post"
                    >
                      <span style={{
                        transform: animateCircles ? 'translateY(0)' : 'translateY(-100px)',
                        transition: 'transform 0.6s ease-out 0.3s',
                        display: 'block'
                      }}>0</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 flex flex-col items-center">
                  <Label className="text-lg font-semibold">Library</Label>
                  <div className="min-h-[40px] flex items-center justify-center">
                    <div
                      className="bg-navy-900 text-white rounded-full w-20 h-20 flex items-center justify-center overflow-hidden"
                      style={{
                        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
                        fontSize: '36px',
                        fontWeight: 600,
                        backgroundColor: '#1a3373',
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
                        transform: animateCircles ? 'translateY(0)' : 'translateY(100px)',
                        opacity: animateCircles ? 1 : 0,
                        transition: 'transform 0.6s ease-out 0.2s, opacity 0.6s ease-out 0.2s'
                      }}
                      data-testid="circle-note"
                    >
                      <span style={{
                        transform: animateCircles ? 'translateY(0)' : 'translateY(-100px)',
                        transition: 'transform 0.6s ease-out 0.4s',
                        display: 'block'
                      }}>0</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Client Comments Tab */}
            <TabsContent value="client" className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle>Client Comment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* First Row */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="client-first-name">First Name</Label>
                      <Input 
                        id="client-first-name" 
                        value={clientFirstName}
                        onChange={(e) => setClientFirstName(e.target.value)}
                        data-testid="input-client-first-name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="client-last-name">Last Name</Label>
                      <Input 
                        id="client-last-name" 
                        value={clientLastName}
                        onChange={(e) => setClientLastName(e.target.value)}
                        data-testid="input-client-last-name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="client-state">State</Label>
                      <Select value={clientState} onValueChange={setClientState}>
                        <SelectTrigger id="client-state" data-testid="select-client-state">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {US_STATES.map((state) => (
                            <SelectItem key={state.value} value={state.value}>
                              {state.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="client-source">Source</Label>
                      <Select value={clientSource} onValueChange={setClientSource}>
                        <SelectTrigger id="client-source" data-testid="select-client-source">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="select">Select</SelectItem>
                          <SelectItem value="direct-mail">Direct Mail</SelectItem>
                          <SelectItem value="social-media">Social Media</SelectItem>
                          <SelectItem value="referral">Referral</SelectItem>
                          <SelectItem value="repeat-client">Repeat Client</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Second Row */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="client-loan-purpose">Loan Purpose</Label>
                      <Select value={clientLoanPurpose} onValueChange={setClientLoanPurpose}>
                        <SelectTrigger id="client-loan-purpose" data-testid="select-client-loan-purpose">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="refinance">Refinance</SelectItem>
                          <SelectItem value="purchase">Purchase</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="client-rating">Rating</Label>
                      <Select value={clientRating} onValueChange={setClientRating}>
                        <SelectTrigger id="client-rating" data-testid="select-client-rating">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5 Stars</SelectItem>
                          <SelectItem value="4">4 Stars</SelectItem>
                          <SelectItem value="3">3 Stars</SelectItem>
                          <SelectItem value="2">2 Stars</SelectItem>
                          <SelectItem value="1">1 Star</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="client-date">Comment Date</Label>
                      <Input 
                        id="client-date" 
                        value={clientDate}
                        onChange={(e) => handleDateChange(e.target.value, setClientDate)}
                        placeholder="MM/DD/YYYY"
                        maxLength={10}
                        data-testid="input-client-date"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="client-loan-date">Loan Date</Label>
                      <Input 
                        id="client-loan-date" 
                        value={clientLoanDate}
                        onChange={(e) => handleDateChange(e.target.value, setClientLoanDate)}
                        placeholder="MM/DD/YYYY"
                        maxLength={10}
                        data-testid="input-client-loan-date"
                      />
                    </div>
                  </div>

                  {/* Comment Text - Wrapped in Grey Card */}
                  <Card className="bg-gray-50 border-gray-200">
                    <CardContent className="pt-6">
                      <div className="space-y-2">
                        <Label htmlFor="client-comment">Client Comment</Label>
                        <Textarea 
                          id="client-comment"
                          className="min-h-[150px] bg-background"
                          value={clientComment}
                          onChange={(e) => setClientComment(e.target.value)}
                          data-testid="textarea-client-comment"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-3 pt-4">
                    <Button 
                      variant="outline"
                      data-testid="button-cancel-client-comment"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={() => setShowPreview(true)}
                      data-testid="button-preview-client-comment"
                    >
                      Preview
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Preview Card */}
              {showPreview && (
                <Card className="mt-8">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <CardTitle>Preview</CardTitle>
                    <Button data-testid="button-post-client-comment">
                      Post Comment
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Name</p>
                          <p className="font-medium">{clientFirstName} {clientLastName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">State</p>
                          <p className="font-medium">{clientState || '-'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Source</p>
                          <p className="font-medium capitalize">{clientSource ? clientSource.replace('-', ' ') : '-'}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Loan Purpose</p>
                          <p className="font-medium capitalize">{clientLoanPurpose || '-'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Rating</p>
                          <p className="font-medium">{clientRating || '-'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Comment Date</p>
                          <p className="font-medium">{clientDate || '-'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Loan Date</p>
                          <p className="font-medium">{clientLoanDate || '-'}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Comment</p>
                        <p className="text-base">{clientComment || '-'}</p>
                      </div>
                    </CardContent>
                  </Card>
              )}
            </TabsContent>

            {/* All Comments Tab */}
            <TabsContent value="all-comments" className="mt-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-gray-300">
                          <th 
                            className="text-left p-3 font-semibold bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => handleSort('commentDate')}
                            data-testid="header-comment-date"
                          >
                            <div className="flex items-center gap-2">
                              Comment Date
                              <ArrowUpDown className="h-4 w-4" />
                            </div>
                          </th>
                          <th 
                            className="text-left p-3 font-semibold bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => handleSort('postedBy')}
                            data-testid="header-posted-by"
                          >
                            <div className="flex items-center gap-2">
                              Posted By
                              <ArrowUpDown className="h-4 w-4" />
                            </div>
                          </th>
                          <th 
                            className="text-left p-3 font-semibold bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => handleSort('loanPurpose')}
                            data-testid="header-loan-purpose"
                          >
                            <div className="flex items-center gap-2">
                              Loan Purpose
                              <ArrowUpDown className="h-4 w-4" />
                            </div>
                          </th>
                          <th 
                            className="text-left p-3 font-semibold bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => handleSort('loanDate')}
                            data-testid="header-loan-date"
                          >
                            <div className="flex items-center gap-2">
                              Loan Date
                              <ArrowUpDown className="h-4 w-4" />
                            </div>
                          </th>
                          <th 
                            className="text-left p-3 font-semibold bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => handleSort('source')}
                            data-testid="header-source"
                          >
                            <div className="flex items-center gap-2">
                              Source
                              <ArrowUpDown className="h-4 w-4" />
                            </div>
                          </th>
                          <th 
                            className="text-left p-3 font-semibold bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => handleSort('state')}
                            data-testid="header-state"
                          >
                            <div className="flex items-center gap-2">
                              State
                              <ArrowUpDown className="h-4 w-4" />
                            </div>
                          </th>
                          <th 
                            className="text-left p-3 font-semibold bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => handleSort('rating')}
                            data-testid="header-rating"
                          >
                            <div className="flex items-center gap-2">
                              Rating
                              <ArrowUpDown className="h-4 w-4" />
                            </div>
                          </th>
                          <th 
                            className="text-left p-3 font-semibold bg-gray-50"
                            data-testid="header-last-name"
                          >
                            Last Name
                          </th>
                          <th 
                            className="text-left p-3 font-semibold bg-gray-50"
                            data-testid="header-first-name"
                          >
                            First Name
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* Empty state - no data rows yet */}
                        <tr>
                          <td colSpan={9} className="text-center py-8 text-muted-foreground">
                            No comments to display
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Company Post Tab (Insight) */}
            <TabsContent value="company-post" className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle>Insight</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* First Row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="post-by">Post by</Label>
                      <Select value={postBy} onValueChange={setPostBy}>
                        <SelectTrigger id="post-by" data-testid="select-post-by">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Select">Select</SelectItem>
                          <SelectItem value="Admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="post-author">Post Author</Label>
                      <Input 
                        id="post-author" 
                        value={postAuthor}
                        onChange={(e) => setPostAuthor(e.target.value)}
                        data-testid="input-post-author"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="insight-date">Date</Label>
                      <Input 
                        id="insight-date" 
                        value={insightDate}
                        onChange={(e) => handleDateChange(e.target.value, setInsightDate)}
                        placeholder="MM/DD/YYYY"
                        maxLength={10}
                        data-testid="input-insight-date"
                      />
                    </div>
                  </div>

                  {/* Comment Section with Font Controls - Wrapped in Grey Card */}
                  <Card className="bg-gray-50 border-gray-200">
                    <CardContent className="pt-6 space-y-4">
                      {/* Font Controls */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="font-size">Font Size</Label>
                          <Select value={fontSize} onValueChange={setFontSize}>
                            <SelectTrigger id="font-size" data-testid="select-font-size">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="small">Small</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="large">Large</SelectItem>
                              <SelectItem value="xlarge">Extra Large</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="font-type">Font Type</Label>
                          <Select value={fontType} onValueChange={setFontType}>
                            <SelectTrigger id="font-type" data-testid="select-font-type">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="sans">Sans Serif</SelectItem>
                              <SelectItem value="serif">Serif</SelectItem>
                              <SelectItem value="mono">Monospace</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="color-theme">Color Theme</Label>
                          <Select value={colorTheme} onValueChange={setColorTheme}>
                            <SelectTrigger id="color-theme" data-testid="select-color-theme">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="default">Default</SelectItem>
                              <SelectItem value="blue">Blue</SelectItem>
                              <SelectItem value="green">Green</SelectItem>
                              <SelectItem value="purple">Purple</SelectItem>
                              <SelectItem value="orange">Orange</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Comment Textarea */}
                      <div className="space-y-2">
                        <Label htmlFor="insight-comment">Comment</Label>
                        <Textarea 
                          id="insight-comment"
                          className="min-h-[150px] bg-background"
                          value={insightComment}
                          onChange={(e) => setInsightComment(e.target.value)}
                          data-testid="textarea-insight-comment"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-3 pt-4">
                    <Button 
                      variant="outline"
                      data-testid="button-cancel-insight"
                    >
                      Cancel
                    </Button>
                    <Button 
                      data-testid="button-post-insight"
                    >
                      Post
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* All Posts Tab */}
            <TabsContent value="all-posts" className="mt-8">
              <Card>
                <CardContent className="space-y-6 pt-6">
                  <p className="text-muted-foreground">All Posts will be displayed here.</p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notes Tab */}
            <TabsContent value="notes" className="mt-8">
              <Card>
                <CardContent className="space-y-6 pt-6">
                  <p className="text-muted-foreground">Notes will be displayed here.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </TooltipProvider>
  );
}

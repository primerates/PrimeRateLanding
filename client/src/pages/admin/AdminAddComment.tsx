import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RotateCcw, Monitor, Save, Plus } from 'lucide-react';
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
  const [clientRating, setClientRating] = useState('');
  const [clientLoanPurpose, setClientLoanPurpose] = useState('');
  const [clientDate, setClientDate] = useState('');
  const [clientComment, setClientComment] = useState('');

  // Internal message state
  const [messageTitle, setMessageTitle] = useState('');
  const [messageCategory, setMessageCategory] = useState('');
  const [messagePriority, setMessagePriority] = useState('');
  const [messageStatus, setMessageStatus] = useState('');
  const [messageStartDate, setMessageStartDate] = useState('');
  const [messageEndDate, setMessageEndDate] = useState('');
  const [messageContent, setMessageContent] = useState('');

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
                  Comments Management
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
          <Tabs defaultValue="client" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="client" data-testid="tab-client-comments">Client Comments</TabsTrigger>
              <TabsTrigger value="internal" data-testid="tab-internal-messages">Internal Messages</TabsTrigger>
            </TabsList>

            {/* Client Comments Tab */}
            <TabsContent value="client">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
                  <CardTitle>Client Testimonial</CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm"
                    data-testid="button-add-client-comment"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Comment
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* First Row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="client-first-name">First Name</Label>
                      <Input 
                        id="client-first-name" 
                        placeholder="Enter first name"
                        value={clientFirstName}
                        onChange={(e) => setClientFirstName(e.target.value)}
                        data-testid="input-client-first-name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="client-last-name">Last Name</Label>
                      <Input 
                        id="client-last-name" 
                        placeholder="Enter last name"
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
                  </div>

                  {/* Second Row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      <Label htmlFor="client-date">Date</Label>
                      <Input 
                        id="client-date" 
                        value={clientDate}
                        onChange={(e) => handleDateChange(e.target.value, setClientDate)}
                        placeholder="MM/DD/YYYY"
                        maxLength={10}
                        data-testid="input-client-date"
                      />
                    </div>
                  </div>

                  {/* Comment Text - Wrapped in Grey Card */}
                  <Card className="bg-muted/30 border-muted">
                    <CardContent className="pt-6">
                      <div className="space-y-2">
                        <Label htmlFor="client-comment">Client Comment</Label>
                        <Textarea 
                          id="client-comment"
                          placeholder="Enter client testimonial or comment here..."
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
                      data-testid="button-save-client-comment"
                    >
                      Save Comment
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Internal Messages Tab */}
            <TabsContent value="internal">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
                  <CardTitle>Internal Message</CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm"
                    data-testid="button-add-internal-message"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Message
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* First Row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="message-title">Message Title</Label>
                      <Input 
                        id="message-title" 
                        placeholder="Enter message title"
                        value={messageTitle}
                        onChange={(e) => setMessageTitle(e.target.value)}
                        data-testid="input-message-title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message-category">Category</Label>
                      <Select value={messageCategory} onValueChange={setMessageCategory}>
                        <SelectTrigger id="message-category" data-testid="select-message-category">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="motivation">Motivation</SelectItem>
                          <SelectItem value="announcement">Announcement</SelectItem>
                          <SelectItem value="update">Company Update</SelectItem>
                          <SelectItem value="reminder">Reminder</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message-priority">Priority</Label>
                      <Select value={messagePriority} onValueChange={setMessagePriority}>
                        <SelectTrigger id="message-priority" data-testid="select-message-priority">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Second Row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="message-status">Status</Label>
                      <Select value={messageStatus} onValueChange={setMessageStatus}>
                        <SelectTrigger id="message-status" data-testid="select-message-status">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message-start-date">Start Date</Label>
                      <Input 
                        id="message-start-date" 
                        value={messageStartDate}
                        onChange={(e) => handleDateChange(e.target.value, setMessageStartDate)}
                        placeholder="MM/DD/YYYY"
                        maxLength={10}
                        data-testid="input-message-start-date"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message-end-date">End Date</Label>
                      <Input 
                        id="message-end-date" 
                        value={messageEndDate}
                        onChange={(e) => handleDateChange(e.target.value, setMessageEndDate)}
                        placeholder="MM/DD/YYYY"
                        maxLength={10}
                        data-testid="input-message-end-date"
                      />
                    </div>
                  </div>

                  {/* Message Text - Wrapped in Grey Card */}
                  <Card className="bg-muted/30 border-muted">
                    <CardContent className="pt-6">
                      <div className="space-y-2">
                        <Label htmlFor="message-content">Message Content</Label>
                        <Textarea 
                          id="message-content"
                          placeholder="Enter internal message or motivation content here..."
                          className="min-h-[150px] bg-background"
                          value={messageContent}
                          onChange={(e) => setMessageContent(e.target.value)}
                          data-testid="textarea-message-content"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-3 pt-4">
                    <Button 
                      variant="outline"
                      data-testid="button-cancel-internal-message"
                    >
                      Cancel
                    </Button>
                    <Button 
                      data-testid="button-save-internal-message"
                    >
                      Save Message
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </TooltipProvider>
  );
}

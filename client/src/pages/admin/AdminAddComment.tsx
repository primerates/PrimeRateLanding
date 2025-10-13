import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RotateCcw, Monitor, Save, Plus, ArrowUpDown, Star, Edit, Trash2, Pin, Minimize2, Maximize2, User } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';

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
  const [shortcutDropdownOpen, setShortcutDropdownOpen] = useState(false);

  // Client comment state
  const [clientFirstName, setClientFirstName] = useState('');
  const [clientLastName, setClientLastName] = useState('');
  const [clientState, setClientState] = useState('');
  const [clientCity, setClientCity] = useState('');
  const [clientSource, setClientSource] = useState('');
  const [clientRating, setClientRating] = useState('');
  const [clientLoanPurpose, setClientLoanPurpose] = useState('');
  const [clientDate, setClientDate] = useState('');
  const [clientComment, setClientComment] = useState('');

  // Internal message state (Insight)
  const [postBy, setPostBy] = useState('Admin');
  const [postCategory, setPostCategory] = useState('Select');
  const [postAuthor, setPostAuthor] = useState('');
  const [insightDate, setInsightDate] = useState('');
  const [insightComment, setInsightComment] = useState('');
  
  // Font control states
  const [fontSize, setFontSize] = useState('');
  const [fontType, setFontType] = useState('');
  const [colorTheme, setColorTheme] = useState('');

  // Preview state
  const [showPreview, setShowPreview] = useState(false);
  const [showInsightPreview, setShowInsightPreview] = useState(false);

  // Animation state for circles - only animate on mount
  const [animateCircles, setAnimateCircles] = useState(false);
  
  // Active tab state
  const [activeTab, setActiveTab] = useState('posts');
  
  // Quick access checkboxes state
  const [quickAccessClientComment, setQuickAccessClientComment] = useState(false);
  const [quickAccessAllComments, setQuickAccessAllComments] = useState(false);
  const [quickAccessCompanyPost, setQuickAccessCompanyPost] = useState(false);
  const [quickAccessAllPosts, setQuickAccessAllPosts] = useState(false);
  const [quickAccessNotes, setQuickAccessNotes] = useState(false);

  // Posted comments storage
  const [postedComments, setPostedComments] = useState<any[]>([]);
  const [lastCommentDate, setLastCommentDate] = useState('');
  const [totalComments, setTotalComments] = useState(0);
  const [uniqueStates, setUniqueStates] = useState(0);
  
  // Posted company posts storage
  const [postedCompanyPosts, setPostedCompanyPosts] = useState<any[]>([]);
  
  // Category counts for circles
  const [insightCount, setInsightCount] = useState(0); // "I wish I had said that"
  const [eventsCount, setEventsCount] = useState(0); // "Policy", "Events", "Announcement"
  
  // Notes state - always have a blank template note at index 0
  const [blankNoteText, setBlankNoteText] = useState('');
  const [pinnedNotes, setPinnedNotes] = useState<any[]>([]);
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [editingNoteText, setEditingNoteText] = useState('');
  const [minimizedNotes, setMinimizedNotes] = useState<Set<number>>(new Set());

  // Dashboard shortcuts menu items
  const dashboardMenuItems = [
    // Row 1
    { label: 'Lead', path: '/admin/add-client' },
    { label: 'Quote', path: '/admin/quotes' },
    { label: 'Loan Prep', path: '/admin/loan-prep' },
    { label: 'Loan', path: '/admin/pipeline' },
    { label: 'Funded', path: '/admin/funded' },
    // Row 2
    { label: 'Closed', path: '/admin/records' },
    { label: 'Library', path: '/admin/library' },
    { label: 'Marketing', path: '/admin/marketing' },
    { label: 'Dashboard', path: '/admin/reports' },
    // Row 3
    { label: 'Vendors', path: '/admin/add-vendor' },
    { label: 'Staff', path: '/admin/add-staff' },
    { label: 'Settings', path: '/admin/add-comment' },
  ];

  // Trigger circle animation only on mount
  useEffect(() => {
    setAnimateCircles(false);
    const timer = setTimeout(() => setAnimateCircles(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Load existing testimonials from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('postedTestimonials');
    if (stored) {
      const parsed = JSON.parse(stored);
      setPostedComments(parsed);
      
      // Update statistics
      setTotalComments(parsed.length);
      
      // Get last comment date
      if (parsed.length > 0) {
        const lastComment = parsed[parsed.length - 1];
        setLastCommentDate(lastComment.date || '');
      }
      
      // Calculate unique states
      const states = new Set(parsed.map((c: any) => c.state).filter((s: string) => s));
      setUniqueStates(states.size);
    }
    
    // Load company posts
    const storedPosts = localStorage.getItem('postedCompanyPosts');
    if (storedPosts) {
      const parsed = JSON.parse(storedPosts);
      setPostedCompanyPosts(parsed);
      
      // Calculate category counts
      let insightTotal = 0;
      let eventsTotal = 0;
      
      parsed.forEach((post: any) => {
        const category = post.category || '';
        
        if (category === 'I wish I had said that') {
          insightTotal++;
        } else if (category === 'Policy' || category === 'Events' || category === 'Announcement') {
          eventsTotal++;
        }
      });
      
      setInsightCount(insightTotal);
      setEventsCount(eventsTotal);
    }
    
    // Load pinned notes
    const storedNotes = localStorage.getItem('pinnedNotes');
    if (storedNotes) {
      setPinnedNotes(JSON.parse(storedNotes));
    }
  }, []);

  // Sorting state for All Comments table
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Dialog state for viewing/editing comments
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [selectedComment, setSelectedComment] = useState<any>(null);
  const [selectedCommentIndex, setSelectedCommentIndex] = useState<number>(-1);
  const [isEditMode, setIsEditMode] = useState(false);

  // Sorting state for All Posts table
  const [sortPostColumn, setSortPostColumn] = useState<string>('');
  const [sortPostDirection, setSortPostDirection] = useState<'asc' | 'desc'>('asc');

  // Dialog state for viewing/editing posts
  const [showPostDialog, setShowPostDialog] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [selectedPostIndex, setSelectedPostIndex] = useState<number>(-1);
  const [isPostEditMode, setIsPostEditMode] = useState(false);

  // Sorted comments array
  const sortedComments = useMemo(() => {
    if (!sortColumn) return postedComments;
    
    return [...postedComments].sort((a, b) => {
      let aVal: any = '';
      let bVal: any = '';
      
      switch (sortColumn) {
        case 'commentDate':
          // Parse dates for proper chronological sorting
          aVal = new Date(a.date || '01/01/1900').getTime();
          bVal = new Date(b.date || '01/01/1900').getTime();
          break;
        case 'postedBy':
          aVal = `${a.firstName} ${a.lastName}`.toLowerCase();
          bVal = `${b.firstName} ${b.lastName}`.toLowerCase();
          break;
        case 'city':
          aVal = (a.city || '').toLowerCase();
          bVal = (b.city || '').toLowerCase();
          break;
        case 'state':
          aVal = (a.state || '').toLowerCase();
          bVal = (b.state || '').toLowerCase();
          break;
        case 'source':
          aVal = (a.source || '').toLowerCase();
          bVal = (b.source || '').toLowerCase();
          break;
        case 'rating':
          // Parse rating as number for proper numeric sorting
          aVal = parseInt(a.rating || '0', 10);
          bVal = parseInt(b.rating || '0', 10);
          break;
        default:
          return 0;
      }
      
      if (aVal === bVal) return 0;
      
      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
  }, [postedComments, sortColumn, sortDirection]);

  // Sorted posts array
  const sortedPosts = useMemo(() => {
    if (!sortPostColumn) return postedCompanyPosts;
    
    return [...postedCompanyPosts].sort((a, b) => {
      let aVal: any = '';
      let bVal: any = '';
      
      switch (sortPostColumn) {
        case 'postDate':
          // Parse dates for proper chronological sorting
          aVal = new Date(a.date || '01/01/1900').getTime();
          bVal = new Date(b.date || '01/01/1900').getTime();
          break;
        case 'postBy':
          aVal = (a.postBy || '').toLowerCase();
          bVal = (b.postBy || '').toLowerCase();
          break;
        case 'category':
          aVal = (a.category || '').toLowerCase();
          bVal = (b.category || '').toLowerCase();
          break;
        case 'author':
          aVal = (a.postAuthor || '').toLowerCase();
          bVal = (b.postAuthor || '').toLowerCase();
          break;
        default:
          return 0;
      }
      
      if (aVal === bVal) return 0;
      
      if (sortPostDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
  }, [postedCompanyPosts, sortPostColumn, sortPostDirection]);

  // Calculate category counts for circles
  const calculateCategoryCounts = (posts: any[]) => {
    let insightTotal = 0;
    let eventsTotal = 0;
    
    posts.forEach(post => {
      const category = post.category || '';
      
      if (category === 'I wish I had said that') {
        insightTotal++;
      } else if (category === 'Policy' || category === 'Events' || category === 'Announcement') {
        eventsTotal++;
      }
    });
    
    setInsightCount(insightTotal);
    setEventsCount(eventsTotal);
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleCommentClick = (comment: any, index: number) => {
    setSelectedComment(comment);
    setSelectedCommentIndex(index);
    setIsEditMode(false);
    setShowCommentDialog(true);
  };

  const handleDeleteComment = () => {
    if (selectedCommentIndex === -1) return;
    
    const updatedComments = postedComments.filter((_, i) => i !== selectedCommentIndex);
    setPostedComments(updatedComments);
    localStorage.setItem('postedTestimonials', JSON.stringify(updatedComments));
    
    // Update statistics
    setTotalComments(updatedComments.length);
    if (updatedComments.length > 0) {
      setLastCommentDate(updatedComments[updatedComments.length - 1].date || '');
    } else {
      setLastCommentDate('');
    }
    const states = new Set(updatedComments.map(c => c.state).filter(s => s));
    setUniqueStates(states.size);
    
    setShowCommentDialog(false);
    alert('Comment deleted successfully!');
  };

  const handleEditComment = () => {
    setIsEditMode(true);
  };

  const handleSaveEdit = () => {
    if (selectedCommentIndex === -1) return;
    
    const updatedComments = [...postedComments];
    updatedComments[selectedCommentIndex] = selectedComment;
    setPostedComments(updatedComments);
    localStorage.setItem('postedTestimonials', JSON.stringify(updatedComments));
    
    // Update statistics
    setTotalComments(updatedComments.length);
    if (updatedComments.length > 0) {
      setLastCommentDate(updatedComments[updatedComments.length - 1].date || '');
    } else {
      setLastCommentDate('');
    }
    const states = new Set(updatedComments.map(c => c.state).filter(s => s));
    setUniqueStates(states.size);
    
    setShowCommentDialog(false);
    setIsEditMode(false);
    alert('Comment updated successfully!');
  };

  // Post handlers
  const handlePostSort = (column: string) => {
    if (sortPostColumn === column) {
      setSortPostDirection(sortPostDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortPostColumn(column);
      setSortPostDirection('asc');
    }
  };

  const handlePostClick = (post: any, index: number) => {
    setSelectedPost(post);
    setSelectedPostIndex(index);
    setIsPostEditMode(false);
    setShowPostDialog(true);
  };

  const handleDeletePost = () => {
    if (selectedPostIndex === -1) return;
    
    const updatedPosts = postedCompanyPosts.filter((_, i) => i !== selectedPostIndex);
    setPostedCompanyPosts(updatedPosts);
    localStorage.setItem('postedCompanyPosts', JSON.stringify(updatedPosts));
    
    // Update category counts
    calculateCategoryCounts(updatedPosts);
    
    setShowPostDialog(false);
    alert('Post deleted successfully!');
  };

  const handleEditPost = () => {
    setIsPostEditMode(true);
  };

  const handleSavePostEdit = () => {
    if (selectedPostIndex === -1) return;
    
    const updatedPosts = [...postedCompanyPosts];
    updatedPosts[selectedPostIndex] = selectedPost;
    setPostedCompanyPosts(updatedPosts);
    localStorage.setItem('postedCompanyPosts', JSON.stringify(updatedPosts));
    
    // Update category counts
    calculateCategoryCounts(updatedPosts);
    
    setShowPostDialog(false);
    setIsPostEditMode(false);
    alert('Post updated successfully!');
  };

  const handleRepublishPost = (index: number) => {
    const now = new Date();
    const formattedDate = `${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}/${now.getFullYear()}`;
    
    // Get the post to republish
    const postToRepublish = {
      ...postedCompanyPosts[index],
      date: formattedDate
    };
    
    // Remove the post from its current position and add it to the end
    const updatedPosts = [...postedCompanyPosts];
    updatedPosts.splice(index, 1);
    updatedPosts.push(postToRepublish);
    
    setPostedCompanyPosts(updatedPosts);
    localStorage.setItem('postedCompanyPosts', JSON.stringify(updatedPosts));
    
    alert('Post republished and moved to dashboard!');
  };

  const handlePinBlankNote = () => {
    if (!blankNoteText.trim()) {
      alert('Please write a note before pinning!');
      return;
    }
    
    // Create a new pinned note from blank note text
    const newNote = {
      id: Date.now(),
      text: blankNoteText,
      createdAt: new Date().toISOString()
    };
    
    const updatedPinnedNotes = [...pinnedNotes, newNote];
    setPinnedNotes(updatedPinnedNotes);
    localStorage.setItem('pinnedNotes', JSON.stringify(updatedPinnedNotes));
    
    // Clear the blank note
    setBlankNoteText('');
  };

  const handleUnpinNote = (id: number) => {
    const updatedNotes = pinnedNotes.filter(n => n.id !== id);
    setPinnedNotes(updatedNotes);
    localStorage.setItem('pinnedNotes', JSON.stringify(updatedNotes));
  };

  const handleEditNote = (id: number, text: string) => {
    setEditingNoteId(id);
    setEditingNoteText(text);
  };

  const handleSaveNoteEdit = (id: number) => {
    const updatedNotes = pinnedNotes.map(note => 
      note.id === id ? { ...note, text: editingNoteText } : note
    );
    setPinnedNotes(updatedNotes);
    localStorage.setItem('pinnedNotes', JSON.stringify(updatedNotes));
    
    setEditingNoteId(null);
    setEditingNoteText('');
  };

  const handleNoteTextChange = (id: number, text: string) => {
    const updatedNotes = pinnedNotes.map(note => 
      note.id === id ? { ...note, text } : note
    );
    setPinnedNotes(updatedNotes);
  };

  const handleToggleMinimize = (id: number) => {
    const newMinimized = new Set(minimizedNotes);
    if (newMinimized.has(id)) {
      newMinimized.delete(id);
    } else {
      newMinimized.add(id);
    }
    setMinimizedNotes(newMinimized);
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

  const handlePostComment = () => {
    // Create comment object
    const newComment = {
      firstName: clientFirstName,
      lastName: clientLastName,
      state: clientState,
      city: clientCity,
      source: clientSource,
      rating: clientRating,
      loanPurpose: clientLoanPurpose,
      date: clientDate,
      comment: clientComment,
      postedAt: new Date().toISOString()
    };
    
    // Update posted comments
    const updatedComments = [...postedComments, newComment];
    setPostedComments(updatedComments);
    
    // Save to localStorage for homepage
    localStorage.setItem('postedTestimonials', JSON.stringify(updatedComments));
    
    // Update last comment date
    setLastCommentDate(clientDate);
    
    // Update total comments
    const newTotal = updatedComments.length;
    setTotalComments(newTotal);
    
    // Calculate unique states
    const states = new Set(updatedComments.map(c => c.state).filter(s => s));
    const stateCount = states.size;
    setUniqueStates(stateCount);
    
    // Show success message
    alert(`Comment posted successfully!\nTotal: ${newTotal}, States: ${stateCount}, Date: ${clientDate}`);
    
    // Reset form
    setClientFirstName('');
    setClientLastName('');
    setClientState('');
    setClientCity('');
    setClientSource('');
    setClientRating('');
    setClientLoanPurpose('');
    setClientDate('');
    setClientComment('');
    setShowPreview(false);
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

  // Cancel client comment - reset all fields and hide preview
  const handleCancelClientComment = () => {
    setClientFirstName('');
    setClientLastName('');
    setClientState('');
    setClientCity('');
    setClientSource('');
    setClientRating('');
    setClientLoanPurpose('');
    setClientDate('');
    setClientComment('');
    setShowPreview(false);
  };

  // Set today's date in MM/DD/YYYY format
  const handleSetTodayDate = (setter: (value: string) => void) => {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const year = today.getFullYear();
    setter(`${month}/${day}/${year}`);
  };

  // Cancel insight/company post - reset all fields and hide preview
  const handleCancelInsight = () => {
    setPostBy('Admin');
    setPostCategory('Select');
    setPostAuthor('');
    setInsightDate('');
    setInsightComment('');
    setFontSize('');
    setFontType('');
    setColorTheme('');
    setShowInsightPreview(false);
  };

  // Post insight/company post
  const handlePostInsight = () => {
    const newPost = {
      postBy,
      category: postCategory,
      postAuthor,
      date: insightDate,
      comment: insightComment,
      fontSize,
      fontType,
      colorTheme,
      postedAt: new Date().toISOString()
    };
    
    // Update posted company posts
    const updatedPosts = [...postedCompanyPosts, newPost];
    setPostedCompanyPosts(updatedPosts);
    
    // Save to localStorage
    localStorage.setItem('postedCompanyPosts', JSON.stringify(updatedPosts));
    
    // Update category counts
    calculateCategoryCounts(updatedPosts);
    
    // Show success message
    alert(`Company post published successfully!\nTotal posts: ${updatedPosts.length}`);
    
    // Reset form
    handleCancelInsight();
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
                  LOANVIEW GPT
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
                <DropdownMenu open={shortcutDropdownOpen} onOpenChange={setShortcutDropdownOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary-foreground hover:text-white hover:bg-green-600 p-2 transition-colors duration-200"
                      data-testid="button-shortcut"
                    >
                      <User className="h-6 w-6" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {dashboardMenuItems.map((item, index) => (
                      <div key={item.path}>
                        <DropdownMenuItem
                          onClick={() => setLocation(item.path)}
                          className="cursor-pointer hover:!bg-blue-400 dark:hover:!bg-blue-700"
                          data-testid={`shortcut-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                        >
                          {item.label}
                        </DropdownMenuItem>
                        {(index === 4 || index === 8) && <DropdownMenuSeparator />}
                      </div>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
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
          <Tabs defaultValue="post" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            {/* Tab Menu Bar - Matching Lead Tile Style */}
            <TabsList className="grid w-full grid-cols-10 bg-transparent h-auto p-0 relative border-b border-gray-200 group">
              <TabsTrigger value="lead" data-testid="tab-lead" className="relative bg-transparent text-gray-700 hover:text-black data-[state=active]:text-blue-900 data-[state=active]:hover:text-blue-900 data-[state=active]:bg-transparent border-0 rounded-none py-3 px-4 font-medium transition-colors duration-200 after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-px hover:after:bg-green-500 data-[state=active]:after:bg-blue-900 data-[state=active]:hover:after:bg-blue-900 after:transition-all after:duration-300 hover:after:w-1/2 data-[state=active]:after:w-1/2 data-[state=active]:group-hover:after:w-0">Lead</TabsTrigger>
              <TabsTrigger value="marketing" data-testid="tab-marketing" className="relative bg-transparent text-gray-700 hover:text-black data-[state=active]:text-blue-900 data-[state=active]:hover:text-blue-900 data-[state=active]:bg-transparent border-0 rounded-none py-3 px-4 font-medium transition-colors duration-200 after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-px hover:after:bg-green-500 data-[state=active]:after:bg-blue-900 data-[state=active]:hover:after:bg-blue-900 after:transition-all after:duration-300 hover:after:w-1/2 data-[state=active]:after:w-1/2 data-[state=active]:group-hover:after:w-0">Marketing</TabsTrigger>
              <TabsTrigger value="snapshot" data-testid="tab-snapshot" className="relative bg-transparent text-gray-700 hover:text-black data-[state=active]:text-blue-900 data-[state=active]:hover:text-blue-900 data-[state=active]:bg-transparent border-0 rounded-none py-3 px-4 font-medium transition-colors duration-200 after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-px hover:after:bg-green-500 data-[state=active]:after:bg-blue-900 data-[state=active]:hover:after:bg-blue-900 after:transition-all after:duration-300 hover:after:w-1/2 data-[state=active]:after:w-1/2 data-[state=active]:group-hover:after:w-0">Snapshot</TabsTrigger>
              <TabsTrigger value="library" data-testid="tab-library" className="relative bg-transparent text-gray-700 hover:text-black data-[state=active]:text-blue-900 data-[state=active]:hover:text-blue-900 data-[state=active]:bg-transparent border-0 rounded-none py-3 px-4 font-medium transition-colors duration-200 after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-px hover:after:bg-green-500 data-[state=active]:after:bg-blue-900 data-[state=active]:hover:after:bg-blue-900 after:transition-all after:duration-300 hover:after:w-1/2 data-[state=active]:after:w-1/2 data-[state=active]:group-hover:after:w-0">Library</TabsTrigger>
              <TabsTrigger value="settings" data-testid="tab-settings" className="relative bg-transparent text-gray-700 hover:text-black data-[state=active]:text-blue-900 data-[state=active]:hover:text-blue-900 data-[state=active]:bg-transparent border-0 rounded-none py-3 px-4 font-medium transition-colors duration-200 after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-px hover:after:bg-green-500 data-[state=active]:after:bg-blue-900 data-[state=active]:hover:after:bg-blue-900 after:transition-all after:duration-300 hover:after:w-1/2 data-[state=active]:after:w-1/2 data-[state=active]:group-hover:after:w-0">Settings</TabsTrigger>
              <TabsTrigger value="vendors" data-testid="tab-vendors" className="relative bg-transparent text-gray-700 hover:text-black data-[state=active]:text-blue-900 data-[state=active]:hover:text-blue-900 data-[state=active]:bg-transparent border-0 rounded-none py-3 px-4 font-medium transition-colors duration-200 after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-px hover:after:bg-green-500 data-[state=active]:after:bg-blue-900 data-[state=active]:hover:after:bg-blue-900 after:transition-all after:duration-300 hover:after:w-1/2 data-[state=active]:after:w-1/2 data-[state=active]:group-hover:after:w-0">Vendors</TabsTrigger>
              <TabsTrigger value="staff" data-testid="tab-staff" className="relative bg-transparent text-gray-700 hover:text-black data-[state=active]:text-blue-900 data-[state=active]:hover:text-blue-900 data-[state=active]:bg-transparent border-0 rounded-none py-3 px-4 font-medium transition-colors duration-200 after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-px hover:after:bg-green-500 data-[state=active]:after:bg-blue-900 data-[state=active]:hover:after:bg-blue-900 after:transition-all after:duration-300 hover:after:w-1/2 data-[state=active]:after:w-1/2 data-[state=active]:group-hover:after:w-0">Staff</TabsTrigger>
              <TabsTrigger value="partners" data-testid="tab-partners" className="relative bg-transparent text-gray-700 hover:text-black data-[state=active]:text-blue-900 data-[state=active]:hover:text-blue-900 data-[state=active]:bg-transparent border-0 rounded-none py-3 px-4 font-medium transition-colors duration-200 after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-px hover:after:bg-green-500 data-[state=active]:after:bg-blue-900 data-[state=active]:hover:after:bg-blue-900 after:transition-all after:duration-300 hover:after:w-1/2 data-[state=active]:after:w-1/2 data-[state=active]:group-hover:after:w-0">Partners</TabsTrigger>
              <TabsTrigger value="vault" data-testid="tab-vault" className="relative bg-transparent text-gray-700 hover:text-black data-[state=active]:text-blue-900 data-[state=active]:hover:text-blue-900 data-[state=active]:bg-transparent border-0 rounded-none py-3 px-4 font-medium transition-colors duration-200 after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-px hover:after:bg-green-500 data-[state=active]:after:bg-blue-900 data-[state=active]:hover:after:bg-blue-900 after:transition-all after:duration-300 hover:after:w-1/2 data-[state=active]:after:w-1/2 data-[state=active]:group-hover:after:w-0">Vault</TabsTrigger>
              <TabsTrigger value="post" data-testid="tab-post" className="relative bg-transparent text-gray-700 hover:text-black data-[state=active]:text-blue-900 data-[state=active]:hover:text-blue-900 data-[state=active]:bg-transparent border-0 rounded-none py-3 px-4 font-medium transition-colors duration-200 after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-px hover:after:bg-green-500 data-[state=active]:after:bg-blue-900 data-[state=active]:hover:after:bg-blue-900 after:transition-all after:duration-300 hover:after:w-1/2 data-[state=active]:after:w-1/2 data-[state=active]:group-hover:after:w-0">Post</TabsTrigger>
            </TabsList>

            {/* Post Tab Content */}
            <TabsContent value="post" className="mt-8">
            {/* Cards with Circular Indicators - Visible in Post tab */}
            <>
            <Card>
              <CardContent className="grid grid-cols-1 md:grid-cols-5 gap-4 pt-6">
                <div className="space-y-2">
                  <Label className="text-lg font-semibold">Last Comment</Label>
                  {lastCommentDate && (
                    <div className="text-xl font-medium">{lastCommentDate}</div>
                  )}
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
                      }}>{totalComments}</span>
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
                      }}>{uniqueStates}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 flex flex-col items-center">
                  <Label className="text-lg font-semibold">Insight</Label>
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
                      data-testid="circle-insight"
                    >
                      <span style={{
                        transform: animateCircles ? 'translateY(0)' : 'translateY(-100px)',
                        transition: 'transform 0.6s ease-out 0.4s',
                        display: 'block'
                      }}>{insightCount}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 flex flex-col items-center">
                  <Label className="text-lg font-semibold">Events</Label>
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
                        transition: 'transform 0.6s ease-out 0.3s, opacity 0.6s ease-out 0.3s'
                      }}
                      data-testid="circle-events"
                    >
                      <span style={{
                        transform: animateCircles ? 'translateY(0)' : 'translateY(-100px)',
                        transition: 'transform 0.6s ease-out 0.5s',
                        display: 'block'
                      }}>{eventsCount}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Access Card */}
            <Card className="transition-all duration-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Post</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="quick-access-client-comment"
                        checked={quickAccessClientComment}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setQuickAccessClientComment(true);
                            setQuickAccessAllComments(false);
                            setQuickAccessCompanyPost(false);
                            setQuickAccessAllPosts(false);
                            setQuickAccessNotes(false);
                          } else {
                            setQuickAccessClientComment(false);
                          }
                        }}
                        className="transition-transform duration-500 hover:scale-105 data-[state=checked]:rotate-[360deg]"
                        data-testid="checkbox-quick-access-client-comment"
                      />
                      <Label htmlFor="quick-access-client-comment" className="font-medium">
                        Client Comment
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="quick-access-all-comments"
                        checked={quickAccessAllComments}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setQuickAccessClientComment(false);
                            setQuickAccessAllComments(true);
                            setQuickAccessCompanyPost(false);
                            setQuickAccessAllPosts(false);
                            setQuickAccessNotes(false);
                          } else {
                            setQuickAccessAllComments(false);
                          }
                        }}
                        className="transition-transform duration-500 hover:scale-105 data-[state=checked]:rotate-[360deg]"
                        data-testid="checkbox-quick-access-all-comments"
                      />
                      <Label htmlFor="quick-access-all-comments" className="font-medium">
                        All Comments
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="quick-access-company-post"
                        checked={quickAccessCompanyPost}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setQuickAccessClientComment(false);
                            setQuickAccessAllComments(false);
                            setQuickAccessCompanyPost(true);
                            setQuickAccessAllPosts(false);
                            setQuickAccessNotes(false);
                          } else {
                            setQuickAccessCompanyPost(false);
                          }
                        }}
                        className="transition-transform duration-500 hover:scale-105 data-[state=checked]:rotate-[360deg]"
                        data-testid="checkbox-quick-access-company-post"
                      />
                      <Label htmlFor="quick-access-company-post" className="font-medium">
                        Company Post
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="quick-access-all-posts"
                        checked={quickAccessAllPosts}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setQuickAccessClientComment(false);
                            setQuickAccessAllComments(false);
                            setQuickAccessCompanyPost(false);
                            setQuickAccessAllPosts(true);
                            setQuickAccessNotes(false);
                          } else {
                            setQuickAccessAllPosts(false);
                          }
                        }}
                        className="transition-transform duration-500 hover:scale-105 data-[state=checked]:rotate-[360deg]"
                        data-testid="checkbox-quick-access-all-posts"
                      />
                      <Label htmlFor="quick-access-all-posts" className="font-medium">
                        All Posts
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="quick-access-notes"
                        checked={quickAccessNotes}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setQuickAccessClientComment(false);
                            setQuickAccessAllComments(false);
                            setQuickAccessCompanyPost(false);
                            setQuickAccessAllPosts(false);
                            setQuickAccessNotes(true);
                          } else {
                            setQuickAccessNotes(false);
                          }
                        }}
                        className="transition-transform duration-500 hover:scale-105 data-[state=checked]:rotate-[360deg]"
                        data-testid="checkbox-quick-access-notes"
                      />
                      <Label htmlFor="quick-access-notes" className="font-medium">
                        Notes
                      </Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Client Comment Card - Conditionally shown in Posts tab */}
            {quickAccessClientComment && (
              <div 
                className="overflow-hidden transition-all duration-500 ease-out mt-8"
                style={{
                  maxHeight: quickAccessClientComment ? '2000px' : '0',
                  opacity: quickAccessClientComment ? 1 : 0,
                  animation: 'slideDownCard 0.5s ease-out'
                }}
              >
              <Card className="border-l-4 border-l-green-500 hover:border-green-500 focus-within:border-green-500 transition-colors duration-200 mt-0">
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
                      <Label htmlFor="client-city">City</Label>
                      <Input 
                        id="client-city" 
                        value={clientCity}
                        onChange={(e) => setClientCity(e.target.value)}
                        data-testid="input-client-city"
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
                    <div className="space-y-2">
                      <Label 
                        htmlFor="client-date" 
                        className="cursor-pointer hover:text-primary transition-colors"
                        onClick={() => handleSetTodayDate(setClientDate)}
                        data-testid="label-client-date"
                      >
                        Comment Date
                      </Label>
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
                  <Card 
                    key={`client-${activeTab}`} 
                    className="bg-gray-50 border-gray-200"
                    style={{
                      animation: activeTab === 'client' ? 'slideDownComment 0.5s ease-out' : 'none'
                    }}
                  >
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
                      onClick={handleCancelClientComment}
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
                <div className="mt-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Preview</h3>
                    <Button 
                      onClick={handlePostComment}
                      data-testid="button-post-client-comment"
                    >
                      Post Comment
                    </Button>
                  </div>
                  
                  {/* Testimonial Style Preview - Matching Website Design */}
                  <div className="max-w-2xl mx-auto">
                    <Card className="hover-elevate">
                      <CardContent className="p-6">
                        <div className="flex items-center mb-4">
                          <div className="flex items-center mr-4">
                            {[...Array(parseInt(clientRating) || 0)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 fill-warning text-warning" />
                            ))}
                          </div>
                          <Badge variant="secondary">
                            {clientRating || '0'} stars
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mb-4 italic">
                          "{clientComment || 'No comment provided'}"
                        </p>
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                            <span className="text-primary font-semibold">
                              {clientFirstName && clientLastName 
                                ? `${clientFirstName[0]}${clientLastName[0]}` 
                                : '--'}
                            </span>
                          </div>
                          <div>
                            <div className="font-semibold">
                              {clientFirstName} {clientLastName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {clientCity && clientState ? `${clientCity}, ${clientState}` : clientCity || clientState || 'Location not specified'}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
              </div>
            )}

            {/* All Comments Table - Conditionally shown in Posts tab */}
            {quickAccessAllComments && (
              <div 
                className="overflow-hidden transition-all duration-500 ease-out mt-8"
                style={{
                  maxHeight: quickAccessAllComments ? '2000px' : '0',
                  opacity: quickAccessAllComments ? 1 : 0,
                  animation: 'slideDownCard 0.5s ease-out'
                }}
              >
              <Card>
                <CardContent className="pt-6">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-gray-300">
                          <th 
                            className="text-left p-3 font-semibold bg-gray-200 dark:bg-gray-700 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                            onClick={() => handleSort('commentDate')}
                            data-testid="header-comment-date"
                          >
                            <div className="flex items-center gap-2">
                              Comment Date
                              <ArrowUpDown className="h-4 w-4" />
                            </div>
                          </th>
                          <th 
                            className="text-left p-3 font-semibold bg-gray-200 dark:bg-gray-700 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                            onClick={() => handleSort('postedBy')}
                            data-testid="header-posted-by"
                          >
                            <div className="flex items-center gap-2">
                              Posted By
                              <ArrowUpDown className="h-4 w-4" />
                            </div>
                          </th>
                          <th 
                            className="text-left p-3 font-semibold bg-gray-200 dark:bg-gray-700 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                            onClick={() => handleSort('city')}
                            data-testid="header-city"
                          >
                            <div className="flex items-center gap-2">
                              City
                              <ArrowUpDown className="h-4 w-4" />
                            </div>
                          </th>
                          <th 
                            className="text-left p-3 font-semibold bg-gray-200 dark:bg-gray-700 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                            onClick={() => handleSort('state')}
                            data-testid="header-state"
                          >
                            <div className="flex items-center gap-2">
                              State
                              <ArrowUpDown className="h-4 w-4" />
                            </div>
                          </th>
                          <th 
                            className="text-left p-3 font-semibold bg-gray-200 dark:bg-gray-700 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                            onClick={() => handleSort('source')}
                            data-testid="header-source"
                          >
                            <div className="flex items-center gap-2">
                              Source
                              <ArrowUpDown className="h-4 w-4" />
                            </div>
                          </th>
                          <th 
                            className="text-left p-3 font-semibold bg-gray-200 dark:bg-gray-700 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                            onClick={() => handleSort('rating')}
                            data-testid="header-rating"
                          >
                            <div className="flex items-center gap-2">
                              Rating
                              <ArrowUpDown className="h-4 w-4" />
                            </div>
                          </th>
                          <th 
                            className="text-left p-3 font-semibold bg-gray-200 dark:bg-gray-700"
                            data-testid="header-last-name"
                          >
                            Last Name
                          </th>
                          <th 
                            className="text-left p-3 font-semibold bg-gray-200 dark:bg-gray-700"
                            data-testid="header-first-name"
                          >
                            First Name
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedComments.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="text-center py-8 text-muted-foreground">
                              No comments to display
                            </td>
                          </tr>
                        ) : (
                          sortedComments.map((comment, sortedIndex) => {
                            const originalIndex = postedComments.findIndex(c => c === comment);
                            return (
                            <tr key={sortedIndex} className={`border-b hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${sortedIndex % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-800/30'}`}>
                              <td className="p-3" data-testid={`cell-comment-date-${sortedIndex}`}>{comment.date}</td>
                              <td className="p-3" data-testid={`cell-posted-by-${sortedIndex}`}>{comment.firstName} {comment.lastName}</td>
                              <td className="p-3" data-testid={`cell-city-${sortedIndex}`}>{comment.city}</td>
                              <td className="p-3" data-testid={`cell-state-${sortedIndex}`}>{comment.state}</td>
                              <td className="p-3" data-testid={`cell-source-${sortedIndex}`}>{comment.source}</td>
                              <td className="p-3" data-testid={`cell-rating-${sortedIndex}`}>
                                <div className="flex items-center gap-1">
                                  {[...Array(parseInt(comment.rating) || 0)].map((_, i) => (
                                    <Star key={i} className="w-3 h-3 fill-warning text-warning" />
                                  ))}
                                </div>
                              </td>
                              <td className="p-3" data-testid={`cell-last-name-${sortedIndex}`}>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <button 
                                        onClick={() => handleCommentClick(comment, originalIndex)}
                                        className="text-primary hover:underline cursor-pointer font-medium"
                                        data-testid={`button-edit-comment-${sortedIndex}`}
                                      >
                                        {comment.lastName}
                                      </button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Edit Post</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </td>
                              <td className="p-3" data-testid={`cell-first-name-${sortedIndex}`}>{comment.firstName}</td>
                            </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
              </div>
            )}

            {/* All Posts Table - Conditionally shown in Posts tab */}
            {quickAccessAllPosts && (
              <div 
                className="overflow-hidden transition-all duration-500 ease-out mt-8"
                style={{
                  maxHeight: quickAccessAllPosts ? '2000px' : '0',
                  opacity: quickAccessAllPosts ? 1 : 0,
                  animation: 'slideDownCard 0.5s ease-out'
                }}
              >
              <Card>
                <CardContent className="pt-6">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-gray-300">
                          <th 
                            className="text-left p-3 font-semibold bg-gray-200 dark:bg-gray-700"
                            data-testid="header-republish"
                          >
                            Publish
                          </th>
                          <th 
                            className="text-left p-3 font-semibold bg-gray-200 dark:bg-gray-700 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                            onClick={() => handlePostSort('postDate')}
                            data-testid="header-post-date"
                          >
                            <div className="flex items-center gap-2">
                              Post Date
                              <ArrowUpDown className="h-4 w-4" />
                            </div>
                          </th>
                          <th 
                            className="text-left p-3 font-semibold bg-gray-200 dark:bg-gray-700 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                            onClick={() => handlePostSort('postBy')}
                            data-testid="header-post-by"
                          >
                            <div className="flex items-center gap-2">
                              Post By
                              <ArrowUpDown className="h-4 w-4" />
                            </div>
                          </th>
                          <th 
                            className="text-left p-3 font-semibold bg-gray-200 dark:bg-gray-700 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                            onClick={() => handlePostSort('category')}
                            data-testid="header-category"
                          >
                            <div className="flex items-center gap-2">
                              Category
                              <ArrowUpDown className="h-4 w-4" />
                            </div>
                          </th>
                          <th 
                            className="text-left p-3 font-semibold bg-gray-200 dark:bg-gray-700 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                            onClick={() => handlePostSort('author')}
                            data-testid="header-author"
                          >
                            <div className="flex items-center gap-2">
                              Author
                              <ArrowUpDown className="h-4 w-4" />
                            </div>
                          </th>
                          <th 
                            className="text-left p-3 font-semibold bg-gray-200 dark:bg-gray-700"
                            data-testid="header-post-content"
                          >
                            Post Content
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedPosts.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="text-center py-8 text-muted-foreground">
                              No posts to display
                            </td>
                          </tr>
                        ) : (
                          sortedPosts.map((post, sortedIndex) => {
                            const originalIndex = postedCompanyPosts.findIndex(p => p === post);
                            return (
                            <tr 
                              key={sortedIndex} 
                              className={`border-b hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${sortedIndex % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-800/30'}`}
                              data-testid={`row-post-${sortedIndex}`}
                            >
                              <td className="p-3" data-testid={`cell-republish-${sortedIndex}`}>
                                <Button
                                  size="sm"
                                  className="bg-green-600 text-white hover:bg-green-700"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRepublishPost(originalIndex);
                                  }}
                                  data-testid={`button-republish-${sortedIndex}`}
                                >
                                  Publish
                                </Button>
                              </td>
                              <td 
                                className="p-3 cursor-pointer" 
                                onClick={() => handlePostClick(post, originalIndex)}
                                data-testid={`cell-post-date-${sortedIndex}`}
                              >
                                {post.date}
                              </td>
                              <td 
                                className="p-3 cursor-pointer" 
                                onClick={() => handlePostClick(post, originalIndex)}
                                data-testid={`cell-post-by-${sortedIndex}`}
                              >
                                {post.postBy}
                              </td>
                              <td 
                                className="p-3 cursor-pointer" 
                                onClick={() => handlePostClick(post, originalIndex)}
                                data-testid={`cell-category-${sortedIndex}`}
                              >
                                {post.category}
                              </td>
                              <td 
                                className="p-3 cursor-pointer" 
                                onClick={() => handlePostClick(post, originalIndex)}
                                data-testid={`cell-author-${sortedIndex}`}
                              >
                                {post.postAuthor}
                              </td>
                              <td 
                                className="p-3 max-w-md truncate cursor-pointer" 
                                onClick={() => handlePostClick(post, originalIndex)}
                                data-testid={`cell-content-${sortedIndex}`}
                              >
                                {post.comment}
                              </td>
                            </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
              </div>
            )}

            {/* Company Post Insight Card - Conditionally shown in Posts tab */}
            {quickAccessCompanyPost && (
              <div 
                className="overflow-hidden transition-all duration-500 ease-out mt-8"
                style={{
                  maxHeight: quickAccessCompanyPost ? '2000px' : '0',
                  opacity: quickAccessCompanyPost ? 1 : 0,
                  animation: 'slideDownCard 0.5s ease-out'
                }}
              >
              <Card className="border-l-4 border-l-blue-500 hover:border-blue-500 focus-within:border-blue-500 transition-colors duration-200">
                <CardHeader>
                  <CardTitle>Insight</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* First Row */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                      <Label htmlFor="post-category">Category</Label>
                      <Select value={postCategory} onValueChange={setPostCategory}>
                        <SelectTrigger id="post-category" data-testid="select-post-category">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Select">Select</SelectItem>
                          <SelectItem value="I wish I had said that">I wish I had said that</SelectItem>
                          <SelectItem value="Policy">Policy</SelectItem>
                          <SelectItem value="Events">Events</SelectItem>
                          <SelectItem value="Announcement">Announcement</SelectItem>
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
                      <Label 
                        htmlFor="insight-date"
                        className="cursor-pointer hover:text-primary transition-colors"
                        onClick={() => handleSetTodayDate(setInsightDate)}
                        data-testid="label-insight-date"
                      >
                        Post Date
                      </Label>
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
                  <Card 
                    className="bg-gray-50 border-gray-200"
                  >
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
                              <SelectItem value="16px">16px</SelectItem>
                              <SelectItem value="18px">18px</SelectItem>
                              <SelectItem value="20px">20px</SelectItem>
                              <SelectItem value="24px">24px</SelectItem>
                              <SelectItem value="28px">28px</SelectItem>
                              <SelectItem value="32px">32px</SelectItem>
                              <SelectItem value="36px">36px</SelectItem>
                              <SelectItem value="40px">40px</SelectItem>
                              <SelectItem value="48px">48px</SelectItem>
                              <SelectItem value="56px">56px</SelectItem>
                              <SelectItem value="64px">64px</SelectItem>
                              <SelectItem value="72px">72px</SelectItem>
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
                              <SelectItem value="cursive">Cursive</SelectItem>
                              <SelectItem value="italic">Italic</SelectItem>
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
                      onClick={handleCancelInsight}
                      data-testid="button-cancel-insight"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={() => setShowInsightPreview(true)}
                      data-testid="button-preview-insight"
                    >
                      Preview
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Preview Card */}
              {showInsightPreview && (
                <div className="mt-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Preview</h3>
                    <Button 
                      onClick={handlePostInsight}
                      data-testid="button-post-company-post"
                    >
                      Post
                    </Button>
                  </div>
                  
                  {/* Company Post Preview Card */}
                  <div className="max-w-4xl mx-auto">
                    <Card className="hover-elevate">
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          {/* Header with Author */}
                          <div className="flex items-center gap-3 border-b pb-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                              <span className="text-primary font-semibold">
                                {postAuthor ? postAuthor[0].toUpperCase() : 'A'}
                              </span>
                            </div>
                            <div>
                              <div className="font-semibold">
                                {postAuthor || 'No author specified'}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {postBy || 'Admin'}
                              </div>
                            </div>
                          </div>

                          {/* Comment Content with Font Styling */}
                          <div 
                            className={`
                              ${fontType === 'sans' ? 'font-sans' : ''}
                              ${fontType === 'serif' ? 'font-serif' : ''}
                              ${fontType === 'mono' ? 'font-mono' : ''}
                              ${fontType === 'cursive' ? 'font-[cursive]' : ''}
                              ${fontType === 'italic' ? 'italic' : ''}
                              ${colorTheme === 'blue' ? 'text-blue-700' : ''}
                              ${colorTheme === 'green' ? 'text-green-700' : ''}
                              ${colorTheme === 'purple' ? 'text-purple-700' : ''}
                              ${colorTheme === 'orange' ? 'text-orange-700' : ''}
                              ${!colorTheme || colorTheme === 'default' ? 'text-foreground' : ''}
                            `}
                            style={{
                              fontSize: fontSize || '16px'
                            }}
                          >
                            {insightComment || 'No comment provided'}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
              </div>
            )}

            {/* Sticky Notes - Conditionally shown in Post tab */}
            {quickAccessNotes && (
              <div 
                className="overflow-hidden transition-all duration-500 ease-out mt-8"
                style={{
                  maxHeight: quickAccessNotes ? '2000px' : '0',
                  opacity: quickAccessNotes ? 1 : 0,
                  animation: 'slideDownCard 0.5s ease-out'
                }}
              >
              <div className="space-y-4 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Blank Template Note - Always First */}
                  <Card 
                    className="bg-yellow-100 dark:bg-yellow-900 border-yellow-300 dark:border-yellow-700 relative max-w-md"
                    data-testid="card-blank-note"
                  >
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Pin className="h-6 w-6 text-red-500 rotate-45" />
                    </div>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Pin className="h-5 w-5 text-yellow-700 dark:text-yellow-300" />
                          Sticky Note
                        </CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleMinimize(0)}
                          className="h-6 w-6 p-0"
                          data-testid="button-toggle-minimize-blank"
                        >
                          {minimizedNotes.has(0) ? (
                            <Maximize2 className="h-4 w-4" />
                          ) : (
                            <Minimize2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </CardHeader>
                    {!minimizedNotes.has(0) && (
                      <CardContent className="space-y-4">
                        <Textarea
                          value={blankNoteText}
                          onChange={(e) => setBlankNoteText(e.target.value)}
                          placeholder="Type your note here..."
                          className="min-h-[120px] bg-yellow-50 dark:bg-yellow-950 border-yellow-300 dark:border-yellow-700 resize-none"
                          data-testid="textarea-blank-note"
                        />
                        <div className="grid grid-cols-3 gap-2">
                          <Button
                            variant="outline"
                            disabled
                            className="bg-yellow-50 dark:bg-yellow-950 border-yellow-300 dark:border-yellow-700 opacity-50"
                            data-testid="button-edit-blank"
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            onClick={handlePinBlankNote}
                            className="bg-yellow-50 dark:bg-yellow-950 border-yellow-300 dark:border-yellow-700"
                            data-testid="button-pin-blank"
                          >
                            Pin
                          </Button>
                          <Button
                            variant="outline"
                            disabled
                            className="bg-yellow-50 dark:bg-yellow-950 border-yellow-300 dark:border-yellow-700 opacity-50"
                            data-testid="button-unpin-blank"
                          >
                            Unpin
                          </Button>
                        </div>
                      </CardContent>
                    )}
                  </Card>

                  {/* Pinned Notes */}
                  {pinnedNotes.map((note) => {
                    const isMinimized = minimizedNotes.has(note.id);
                    return (
                      <Card 
                        key={note.id}
                        className="bg-yellow-100 dark:bg-yellow-900 border-yellow-300 dark:border-yellow-700 relative max-w-md"
                        data-testid={`card-note-${note.id}`}
                      >
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                          <Pin className="h-6 w-6 text-red-500 rotate-45" />
                        </div>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg flex items-center gap-2">
                              <Pin className="h-5 w-5 text-yellow-700 dark:text-yellow-300" />
                              Sticky Note
                            </CardTitle>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleMinimize(note.id)}
                              className="h-6 w-6 p-0"
                              data-testid={`button-toggle-minimize-${note.id}`}
                            >
                              {isMinimized ? (
                                <Maximize2 className="h-4 w-4" />
                              ) : (
                                <Minimize2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </CardHeader>
                        {!isMinimized && (
                          <CardContent className="space-y-4">
                            {editingNoteId === note.id ? (
                              <Textarea
                                value={editingNoteText}
                                onChange={(e) => setEditingNoteText(e.target.value)}
                                className="min-h-[120px] bg-yellow-50 dark:bg-yellow-950 border-yellow-300 dark:border-yellow-700 resize-none"
                                data-testid={`textarea-edit-note-${note.id}`}
                              />
                            ) : (
                              <Textarea
                                value={note.text}
                                onChange={(e) => handleNoteTextChange(note.id, e.target.value)}
                                placeholder="Type your note here..."
                                className="min-h-[120px] bg-yellow-50 dark:bg-yellow-950 border-yellow-300 dark:border-yellow-700 resize-none"
                                data-testid={`textarea-note-${note.id}`}
                              />
                            )}
                            <div className="grid grid-cols-3 gap-2">
                              {editingNoteId === note.id ? (
                                <Button
                                  onClick={() => handleSaveNoteEdit(note.id)}
                                  className="col-span-3"
                                  data-testid={`button-save-note-${note.id}`}
                                >
                                  Save
                                </Button>
                              ) : (
                                <>
                                  <Button
                                    variant="outline"
                                    onClick={() => handleEditNote(note.id, note.text)}
                                    className="bg-yellow-50 dark:bg-yellow-950 border-yellow-300 dark:border-yellow-700"
                                    data-testid={`button-edit-note-${note.id}`}
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    variant="outline"
                                    disabled
                                    className="bg-yellow-50 dark:bg-yellow-950 border-yellow-300 dark:border-yellow-700 opacity-50"
                                    data-testid={`button-pin-note-${note.id}`}
                                  >
                                    Pin
                                  </Button>
                                  <Button
                                    variant="outline"
                                    onClick={() => handleUnpinNote(note.id)}
                                    className="bg-yellow-50 dark:bg-yellow-950 border-yellow-300 dark:border-yellow-700"
                                    data-testid={`button-unpin-note-${note.id}`}
                                  >
                                    Unpin
                                  </Button>
                                </>
                              )}
                            </div>
                          </CardContent>
                        )}
                      </Card>
                    );
                  })}
                </div>
              </div>
              </div>
            )}
            </>
            </TabsContent>

            {/* Lead Tab */}
            <TabsContent value="lead" className="mt-8">
              <div className="text-center py-12 text-muted-foreground">
                Lead content coming soon
              </div>
            </TabsContent>

            {/* Marketing Tab */}
            <TabsContent value="marketing" className="mt-8">
              <div className="text-center py-12 text-muted-foreground">
                Marketing content coming soon
              </div>
            </TabsContent>

            {/* Snapshot Tab */}
            <TabsContent value="snapshot" className="mt-8">
              <div className="text-center py-12 text-muted-foreground">
                Snapshot content coming soon
              </div>
            </TabsContent>

            {/* Library Tab */}
            <TabsContent value="library" className="mt-8">
              <div className="text-center py-12 text-muted-foreground">
                Library content coming soon
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="mt-8">
              <div className="text-center py-12 text-muted-foreground">
                Settings content coming soon
              </div>
            </TabsContent>

            {/* Vendors Tab */}
            <TabsContent value="vendors" className="mt-8">
              <div className="text-center py-12 text-muted-foreground">
                Vendors content coming soon
              </div>
            </TabsContent>

            {/* Staff Tab */}
            <TabsContent value="staff" className="mt-8">
              <div className="text-center py-12 text-muted-foreground">
                Staff content coming soon
              </div>
            </TabsContent>

            {/* Partners Tab */}
            <TabsContent value="partners" className="mt-8">
              <div className="text-center py-12 text-muted-foreground">
                Partners content coming soon
              </div>
            </TabsContent>

            {/* Vault Tab */}
            <TabsContent value="vault" className="mt-8">
              <div className="text-center py-12 text-muted-foreground">
                Vault content coming soon
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Comment View/Edit Dialog */}
      <Dialog open={showCommentDialog} onOpenChange={setShowCommentDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Comment' : 'View Comment'}</DialogTitle>
          </DialogHeader>
          
          {selectedComment && (
            <div className="space-y-4 py-4">
              {isEditMode ? (
                // Edit Mode
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>First Name</Label>
                      <Input 
                        value={selectedComment.firstName}
                        onChange={(e) => setSelectedComment({...selectedComment, firstName: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Last Name</Label>
                      <Input 
                        value={selectedComment.lastName}
                        onChange={(e) => setSelectedComment({...selectedComment, lastName: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>City</Label>
                      <Input 
                        value={selectedComment.city}
                        onChange={(e) => setSelectedComment({...selectedComment, city: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>State</Label>
                      <Select 
                        value={selectedComment.state} 
                        onValueChange={(value) => setSelectedComment({...selectedComment, state: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
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
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Loan Purpose</Label>
                      <Select 
                        value={selectedComment.loanPurpose} 
                        onValueChange={(value) => setSelectedComment({...selectedComment, loanPurpose: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="refinance">Refinance</SelectItem>
                          <SelectItem value="purchase">Purchase</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Rating</Label>
                      <Select 
                        value={selectedComment.rating} 
                        onValueChange={(value) => setSelectedComment({...selectedComment, rating: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
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
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Source</Label>
                      <Input 
                        value={selectedComment.source}
                        onChange={(e) => setSelectedComment({...selectedComment, source: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Comment Date</Label>
                      <Input 
                        value={selectedComment.date}
                        onChange={(e) => setSelectedComment({...selectedComment, date: e.target.value})}
                        placeholder="MM/DD/YYYY"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Comment</Label>
                    <Textarea 
                      value={selectedComment.comment}
                      onChange={(e) => setSelectedComment({...selectedComment, comment: e.target.value})}
                      className="min-h-[150px]"
                    />
                  </div>
                </>
              ) : (
                // View Mode
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-muted-foreground">First Name</Label>
                      <p className="font-medium">{selectedComment.firstName}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Last Name</Label>
                      <p className="font-medium">{selectedComment.lastName}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-muted-foreground">City</Label>
                      <p className="font-medium">{selectedComment.city}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">State</Label>
                      <p className="font-medium">{selectedComment.state}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-muted-foreground">Loan Purpose</Label>
                      <p className="font-medium">{selectedComment.loanPurpose || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Rating</Label>
                      <div className="flex items-center gap-2">
                        {[...Array(parseInt(selectedComment.rating) || 0)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-warning text-warning" />
                        ))}
                        <span className="font-medium">({selectedComment.rating} stars)</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-muted-foreground">Source</Label>
                      <p className="font-medium">{selectedComment.source || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Comment Date</Label>
                      <p className="font-medium">{selectedComment.date}</p>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm text-muted-foreground">Comment</Label>
                    <p className="font-medium mt-2">{selectedComment.comment}</p>
                  </div>
                </>
              )}
            </div>
          )}
          
          <DialogFooter>
            {isEditMode ? (
              <>
                <Button variant="outline" onClick={() => setIsEditMode(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit} data-testid="button-save-edit">
                  Save Changes
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={handleDeleteComment} className="mr-auto" data-testid="button-delete-comment">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
                <Button onClick={handleEditComment} data-testid="button-edit-mode">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Post Dialog */}
      <Dialog open={showPostDialog} onOpenChange={setShowPostDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isPostEditMode ? 'Edit Post' : 'View Post'}</DialogTitle>
          </DialogHeader>
          
          {selectedPost && (
            <div className="space-y-4 py-4">
              {isPostEditMode ? (
                // Edit Mode
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Post By</Label>
                      <Select 
                        value={selectedPost.postBy} 
                        onValueChange={(value) => setSelectedPost({...selectedPost, postBy: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Select">Select</SelectItem>
                          <SelectItem value="Admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select 
                        value={selectedPost.category} 
                        onValueChange={(value) => setSelectedPost({...selectedPost, category: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Select">Select</SelectItem>
                          <SelectItem value="I wish I had said that">I wish I had said that</SelectItem>
                          <SelectItem value="Policy">Policy</SelectItem>
                          <SelectItem value="Events">Events</SelectItem>
                          <SelectItem value="Announcement">Announcement</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Author</Label>
                      <Input 
                        value={selectedPost.postAuthor}
                        onChange={(e) => setSelectedPost({...selectedPost, postAuthor: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Post Date</Label>
                      <Input 
                        value={selectedPost.date}
                        onChange={(e) => setSelectedPost({...selectedPost, date: e.target.value})}
                        placeholder="MM/DD/YYYY"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Post Content</Label>
                    <Textarea 
                      value={selectedPost.comment}
                      onChange={(e) => setSelectedPost({...selectedPost, comment: e.target.value})}
                      className="min-h-[150px]"
                    />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Font Size</Label>
                      <Select 
                        value={selectedPost.fontSize || ''} 
                        onValueChange={(value) => setSelectedPost({...selectedPost, fontSize: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="16px">16px</SelectItem>
                          <SelectItem value="18px">18px</SelectItem>
                          <SelectItem value="20px">20px</SelectItem>
                          <SelectItem value="24px">24px</SelectItem>
                          <SelectItem value="28px">28px</SelectItem>
                          <SelectItem value="32px">32px</SelectItem>
                          <SelectItem value="36px">36px</SelectItem>
                          <SelectItem value="40px">40px</SelectItem>
                          <SelectItem value="48px">48px</SelectItem>
                          <SelectItem value="56px">56px</SelectItem>
                          <SelectItem value="64px">64px</SelectItem>
                          <SelectItem value="72px">72px</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Font Type</Label>
                      <Select 
                        value={selectedPost.fontType || ''} 
                        onValueChange={(value) => setSelectedPost({...selectedPost, fontType: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sans">Sans Serif</SelectItem>
                          <SelectItem value="serif">Serif</SelectItem>
                          <SelectItem value="mono">Monospace</SelectItem>
                          <SelectItem value="cursive">Cursive</SelectItem>
                          <SelectItem value="italic">Italic</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Color Theme</Label>
                      <Select 
                        value={selectedPost.colorTheme || ''} 
                        onValueChange={(value) => setSelectedPost({...selectedPost, colorTheme: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="blue">Blue</SelectItem>
                          <SelectItem value="green">Green</SelectItem>
                          <SelectItem value="purple">Purple</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </>
              ) : (
                // View Mode
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-muted-foreground">Post By</Label>
                      <p className="font-medium">{selectedPost.postBy}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Category</Label>
                      <p className="font-medium">{selectedPost.category}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-muted-foreground">Author</Label>
                      <p className="font-medium">{selectedPost.postAuthor}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Post Date</Label>
                      <p className="font-medium">{selectedPost.date}</p>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm text-muted-foreground">Post Content</Label>
                    <p className="font-medium mt-2">{selectedPost.comment}</p>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm text-muted-foreground">Font Size</Label>
                      <p className="font-medium">{selectedPost.fontSize || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Font Type</Label>
                      <p className="font-medium">{selectedPost.fontType || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Color Theme</Label>
                      <p className="font-medium">{selectedPost.colorTheme || 'N/A'}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
          
          <DialogFooter>
            {isPostEditMode ? (
              <>
                <Button variant="outline" onClick={() => setIsPostEditMode(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSavePostEdit} data-testid="button-save-post-edit">
                  Save Changes
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={handleDeletePost} className="mr-auto" data-testid="button-delete-post">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
                <Button onClick={handleEditPost} data-testid="button-edit-post">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}

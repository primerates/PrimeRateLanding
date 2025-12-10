import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  FileText, 
  Calculator, 
  UserPlus, 
  MessageSquare, 
  Building2, 
  Search,
  LogOut,
  User,
  BarChart3,
  UserCheck,
  Handshake,
  Monitor,
  Settings,
  ShieldCheck,
  Plus,
  Minus
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useBackground, backgroundPresets } from '@/contexts/BackgroundContext';
import primeRateLogo from '@assets/Loanview GPT - Image Oct 12, 2025, 03_38_40 PM_1760308805575.png';

export default function AdminDashboard() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const { getBackgroundStyle, isAnimated, isPulsing, isDarkBackground, selectedBackground, loginBackground, setBackground, setLoginBackground, getCurrentPreset } = useBackground();
  
  // Check if current background is a glowing cube animated type
  const isGlowingCubeAnimated = () => {
    return selectedBackground === 'glowing-cube-animated';
  };
  const [isLoaded, setIsLoaded] = useState(false);
  const [backgroundFocusProgress, setBackgroundFocusProgress] = useState(0);
  const [showUsername, setShowUsername] = useState(false);
  const [isBackgroundSelectorOpen, setIsBackgroundSelectorOpen] = useState(false);
  const [backgroundMode, setBackgroundMode] = useState<'dashboard' | 'login'>('dashboard');
  const [companyPosts, setCompanyPosts] = useState<any[]>([]);
  const [isRow1Visible, setIsRow1Visible] = useState(true);
  const [isRow2Visible, setIsRow2Visible] = useState(true);
  const [isRow3Visible, setIsRow3Visible] = useState(true);
  const animationRef = useRef<number | null>(null);
  const timerRefs = useRef<{ start?: NodeJS.Timeout }>({});
  const isMountedRef = useRef(true);

  useEffect(() => {
    // Trigger animations after component mounts
    const timer = setTimeout(() => {
      if (isMountedRef.current) {
        setIsLoaded(true);
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Load company posts from localStorage
    const storedPosts = localStorage.getItem('postedCompanyPosts');
    if (storedPosts) {
      const parsed = JSON.parse(storedPosts);
      setCompanyPosts(parsed);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    if (isAnimated()) {
      // Reset animation state for animated backgrounds
      setBackgroundFocusProgress(0);
      
      // Cancel any pending animations first
      if (timerRefs.current.start) clearTimeout(timerRefs.current.start);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);

      // Start background focus animation slightly before tiles finish (only for animated backgrounds)
      const startTime = 400; // Start just before first tiles
      const duration = 1800; // Complete as last tiles finish (around 2000ms total)
      const startAnimationTime = Date.now();
      
      timerRefs.current.start = setTimeout(() => {
        if (!isMountedRef.current) return;

        const animate = () => {
          if (!isMountedRef.current) return;

          const elapsed = Date.now() - startAnimationTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          
          setBackgroundFocusProgress(progress);

          if (progress < 1) {
            animationRef.current = requestAnimationFrame(animate);
          } else {
            setBackgroundFocusProgress(1);
          }
        };

        animationRef.current = requestAnimationFrame(animate);
      }, startTime);
    }

    return () => {
      // Cleanup all timers and animations
      if (timerRefs.current.start) clearTimeout(timerRefs.current.start);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isLoaded, isAnimated]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const menuItems = [
    // Row 1
    { id: 'stats', label: 'Lead', icon: UserPlus, path: '/admin/add-client' },
    { id: 'quotes', label: 'Quote', icon: Calculator, path: '/admin/quotes' },
    { id: 'loan-prep', label: 'Loan Prep', icon: FileText, path: '/admin/loan-prep' },
    // Row 2
    { id: 'reports', label: 'Dashboard', icon: BarChart3, path: '/admin/reports' },
    { id: 'settings', label: 'Client Post', icon: Settings, path: '/admin/add-comment' },
  ];

  const handleLogout = async () => {
    try {
      await apiRequest('POST', '/api/admin/logout');
      
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      setLocation('/admin/login');
    } catch (error) {
      // Even if logout fails, redirect to login
      setLocation('/admin/login');
    }
  };

  const handleMenuClick = (path: string) => {
    setLocation(path);
  };

  const getTileHoverClass = (itemId: string, rowNumber: number = 1) => {
    let baseHoverClass = '';
    
    if (rowNumber === 1) {
      baseHoverClass = 'border-l-4 border-l-green-500 hover:border-green-500';
    } else if (rowNumber === 2) {
      baseHoverClass = 'border-l-4 border-l-blue-500 hover:border-blue-500';
    } else if (rowNumber === 3) {
      baseHoverClass = 'border-l-4 border-l-purple-500 hover:border-purple-500';
    }
    
    // Add shadow effects to all tiles
    return `${baseHoverClass} hover:shadow-lg hover:shadow-primary/20`;
  };

  return (
    <div 
      className="min-h-screen bg-background relative"
      style={getBackgroundStyle()}
    >
      {/* Faded overlay to make background subtle - only for animated backgrounds */}
      {isAnimated() && (
        <div 
          className="absolute inset-0 bg-background/85 transition-opacity duration-75 ease-out" 
          style={{
            // For glowing cube animated, fade this overlay away completely
            opacity: isGlowingCubeAnimated() ? Math.max(0, 1 - backgroundFocusProgress) : 1
          }}
        />
      )}
      
      {/* Progressive focus overlay - only for animated backgrounds */}
      {isAnimated() && (
        <div 
          className="absolute inset-0 transition-all duration-75 ease-out"
          style={{
            background: `linear-gradient(to bottom, 
              rgba(255, 255, 255, 0.8) 0%, 
              rgba(255, 255, 255, 0.3) ${Math.max(0, 60 - (backgroundFocusProgress * 60))}%, 
              transparent ${Math.max(0, 80 - (backgroundFocusProgress * 80))}%
            )`,
            backdropFilter: `blur(${Math.max(0, 8 - (backgroundFocusProgress * 8))}px)`,
            WebkitBackdropFilter: `blur(${Math.max(0, 8 - (backgroundFocusProgress * 8))}px)`,
            opacity: Math.max(0, 1 - backgroundFocusProgress),
            willChange: 'backdrop-filter, opacity'
          }}
        />
      )}
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-lg border-b transition-shadow duration-300 hover:shadow-2xl hover:shadow-primary/20 relative z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-black italic" style={{ fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif' }} data-testid="text-admin-header">
                LOANVIEW GPT
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation('/')}
                className="text-primary-foreground hover:bg-orange-500 hover:text-white hover:border-orange-500"
                data-testid="button-back-to-website"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Back to Website
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-primary-foreground hover:bg-orange-500 hover:text-white hover:border-orange-500"
                data-testid="button-admin-logout"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
              
              {/* Background Selector */}
              <Popover open={isBackgroundSelectorOpen} onOpenChange={setIsBackgroundSelectorOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary-foreground"
                    data-testid="button-background-selector"
                    aria-label="Change Background"
                  >
                    <Monitor className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4" align="end">
                  <div className="space-y-4">
                    {/* Mode Selection */}
                    <div className="flex gap-2 p-1 bg-muted rounded-lg">
                      <Button
                        variant={backgroundMode === 'dashboard' ? 'default' : 'ghost'}
                        size="sm"
                        className="flex-1"
                        onClick={() => setBackgroundMode('dashboard')}
                        data-testid="button-background-mode-dashboard"
                      >
                        Dashboard Background
                      </Button>
                      <Button
                        variant={backgroundMode === 'login' ? 'default' : 'ghost'}
                        size="sm"
                        className="flex-1"
                        onClick={() => setBackgroundMode('login')}
                        data-testid="button-background-mode-login"
                      >
                        Log In Page
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">
                        {backgroundMode === 'dashboard' ? 'Dashboard Background' : 'Login Page Background'}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {backgroundMode === 'dashboard' 
                          ? 'Choose your preferred background for the dashboard' 
                          : 'Choose background for the login page (right side)'}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-3">
                      {backgroundPresets.map((preset) => {
                        const isSelected = backgroundMode === 'dashboard' 
                          ? selectedBackground === preset.id 
                          : loginBackground === preset.id;
                        
                        return (
                          <Button
                            key={preset.id}
                            variant="ghost"
                            size="lg"
                            className={`justify-start transition-all duration-200 ${
                              isSelected 
                                ? 'ring-2 ring-primary ring-offset-2 bg-accent' 
                                : ''
                            }`}
                            onClick={() => {
                              if (backgroundMode === 'dashboard') {
                                setBackground(preset.id);
                              } else {
                                setLoginBackground(preset.id);
                              }
                            }}
                            data-testid={`button-background-${preset.id}`}
                            aria-label={`Select ${preset.label} background`}
                          >
                            <div className="flex items-center space-x-3 w-full">
                              <div 
                                className="w-12 h-8 rounded-md border bg-cover bg-center flex-shrink-0"
                                style={{ 
                                  backgroundImage: preset.assetPath ? `url(${preset.assetPath})` : 'none',
                                  backgroundColor: preset.assetPath ? 'transparent' : '#ffffff'
                                }}
                              />
                              <div className="flex-1 min-w-0 text-left">
                                <p className="text-sm font-medium truncate">{preset.label}</p>
                                <p className="text-xs text-muted-foreground truncate">{preset.description}</p>
                                {preset.type === 'animated' && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                                    Focus Effect
                                  </span>
                                )}
                                {preset.type === 'pulsing' && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 mt-1">
                                    Pulsing Glow
                                  </span>
                                )}
                              </div>
                            </div>
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              
              <Button
                variant="ghost"
                size="sm"
                className="text-primary-foreground"
                data-testid="button-search"
                aria-label="Search"
              >
                <Search className="h-4 w-4" />
              </Button>
              
              <div 
                className="relative flex items-center cursor-pointer"
                onMouseEnter={() => setShowUsername(true)}
                onMouseLeave={() => setShowUsername(false)}
              >
                <User className="h-4 w-4 z-10" />
                <span 
                  className={`text-sm text-primary absolute top-6 -left-6 whitespace-nowrap transition-all duration-300 ease-out z-20 ${
                    showUsername 
                      ? 'transform translate-y-4 opacity-100' 
                      : 'transform translate-y-0 opacity-0'
                  }`}
                >
                  polo.perry@yahoo.com
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div 
        className={`container mx-auto px-6 py-8 relative z-10 transition-all duration-1000 ease-out ${
          isLoaded 
            ? 'transform translate-y-0 opacity-100' 
            : 'transform -translate-y-full opacity-0'
        }`}
        style={{
          transformOrigin: 'top'
        }}
      >
        <div className="mb-16"></div>
        
        {/* Menu Grid - First Row */}
        <div className="flex items-start gap-4">
          <div 
            className={`grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 flex-1 transition-all duration-500 ${
              isRow1Visible ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'
            }`}
          >
            {menuItems.slice(0, 5).map((item, index) => {
              const Icon = item.icon;
              return (
                <Card 
                  key={item.id}
                  className={`cursor-pointer transition-all duration-500 ${getTileHoverClass(item.id, 1)} group ${
                    isLoaded 
                      ? 'transform scale-x-100 opacity-100' 
                      : 'transform scale-x-0 opacity-0'
                  } bg-gradient-to-br from-card to-card/80`}
                  style={{
                    transformOrigin: 'left',
                    transitionDelay: `${500 + (index * 150)}ms`
                  }}
                  onClick={() => handleMenuClick(item.path)}
                  data-testid={`card-admin-${item.id}`}
                >
                  <CardHeader className="text-center pb-8 pt-8">
                    <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                      <Icon className="h-6 w-6 text-primary transition-transform duration-300 group-hover:rotate-[360deg]" />
                    </div>
                    <CardTitle className="text-lg">{item.label}</CardTitle>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
          
          {/* Toggle Button for Row 1 */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsRow1Visible(!isRow1Visible)}
            className="h-8 w-8 rounded-full hover:bg-primary/10 transition-all duration-300"
            data-testid="button-toggle-row1"
          >
            {isRow1Visible ? (
              <Minus className="h-4 w-4 text-primary" />
            ) : (
              <Plus className="h-4 w-4 text-primary" />
            )}
          </Button>
        </div>

        {/* Menu Grid - Second Row with extra spacing */}
        <div className="flex items-start gap-4 mt-16">
          <div 
            className={`grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 flex-1 transition-all duration-500 ${
              isRow2Visible ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'
            }`}
          >
            {menuItems.slice(5, 7).map((item, index) => {
              const Icon = item.icon;
              return (
                <Card 
                  key={item.id}
                  className={`cursor-pointer transition-all duration-500 ${getTileHoverClass(item.id, 2)} group ${
                    isLoaded 
                      ? 'transform scale-x-100 opacity-100' 
                      : 'transform scale-x-0 opacity-0'
                  } bg-gradient-to-br from-card to-card/80`}
                  style={{
                    transformOrigin: 'left',
                    transitionDelay: `${1250 + (index * 150)}ms`
                  }}
                  onClick={() => handleMenuClick(item.path)}
                  data-testid={`card-admin-${item.id}`}
                >
                  <CardHeader className="text-center pb-8 pt-8">
                    <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                      <Icon className="h-6 w-6 text-primary transition-transform duration-300 group-hover:rotate-[360deg]" />
                    </div>
                    <CardTitle className="text-lg">{item.label}</CardTitle>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
          
          {/* Toggle Button for Row 2 */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsRow2Visible(!isRow2Visible)}
            className="h-8 w-8 rounded-full hover:bg-primary/10 transition-all duration-300"
            data-testid="button-toggle-row2"
          >
            {isRow2Visible ? (
              <Minus className="h-4 w-4 text-primary" />
            ) : (
              <Plus className="h-4 w-4 text-primary" />
            )}
          </Button>
        </div>

        {/* Menu Grid - Third Row with extra spacing */}
        <div className="flex items-start gap-4 mt-16">
          <div 
            className={`grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 flex-1 transition-all duration-500 ${
              isRow3Visible ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'
            }`}
          >
            {menuItems.slice(7).map((item, index) => {
              const Icon = item.icon;
              return (
                <Card 
                  key={item.id}
                  className={`cursor-pointer transition-all duration-500 ${getTileHoverClass(item.id, 3)} group ${
                    isLoaded 
                      ? 'transform scale-x-100 opacity-100' 
                      : 'transform scale-x-0 opacity-0'
                  } bg-gradient-to-br from-card to-card/80 relative`}
                  style={{
                    transformOrigin: 'left',
                    transitionDelay: `${1850 + (index * 150)}ms`
                  }}
                  onClick={() => handleMenuClick(item.path)}
                  data-testid={`card-admin-${item.id}`}
                >
                  <CardHeader className="text-center pb-8 pt-8">
                    <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                      <Icon className="h-6 w-6 text-primary transition-transform duration-300 group-hover:rotate-[360deg]" />
                    </div>
                    <CardTitle className="text-lg">{item.label}</CardTitle>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
          
          {/* Toggle Button for Row 3 */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsRow3Visible(!isRow3Visible)}
            className="h-8 w-8 rounded-full hover:bg-primary/10 transition-all duration-300"
            data-testid="button-toggle-row3"
          >
            {isRow3Visible ? (
              <Minus className="h-4 w-4 text-primary" />
            ) : (
              <Plus className="h-4 w-4 text-primary" />
            )}
          </Button>
        </div>

        {/* Company Posts Display - Centered below tiles */}
        {companyPosts.length > 0 && (() => {
          // Get the most recent post (last one in the array)
          const mostRecentPost = companyPosts[companyPosts.length - 1];
          
          // Calculate margin to keep post in same position
          // When rows are hidden, ADD margin to compensate for missing row height
          let topMargin = 128; // Base 8rem = 128px when all visible
          if (!isRow1Visible) topMargin += 200; // Add row height + gap
          if (!isRow2Visible) topMargin += 200; // Add row height + gap
          if (!isRow3Visible) topMargin += 200; // Add row height + gap
          
          return (
            <div className="flex justify-center transition-all duration-500" style={{ marginTop: `${topMargin}px` }}>
              <div className="max-w-3xl w-full">
                <div 
                  data-testid="company-post-0"
                >
                  {/* Post Content */}
                  <div 
                    className={`
                      whitespace-pre-wrap mb-2
                      ${mostRecentPost.fontType === 'sans' ? 'font-sans' : ''}
                      ${mostRecentPost.fontType === 'serif' ? 'font-serif' : ''}
                      ${mostRecentPost.fontType === 'mono' ? 'font-mono' : ''}
                      ${mostRecentPost.fontType === 'cursive' ? 'font-[cursive]' : ''}
                      ${mostRecentPost.fontType === 'italic' ? 'italic' : ''}
                      ${isDarkBackground() ? 'text-white' : 'text-foreground'}
                    `}
                    style={{
                      fontSize: mostRecentPost.fontSize || '16px',
                      color: mostRecentPost.colorTheme || 'inherit'
                    }}
                  >
                    {mostRecentPost.comment}
                  </div>

                  {/* Author at bottom left */}
                  <div className={`text-sm ${isDarkBackground() ? 'text-white/70' : 'text-muted-foreground'}`}>
                    — {mostRecentPost.postAuthor || 'Anonymous'}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

      </div>
    </div>
  );
}
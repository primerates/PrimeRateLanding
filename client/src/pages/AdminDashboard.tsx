import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  LayoutDashboard, 
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
  Handshake
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import futuristicGridBackground from '@assets/A_digital_image_presents_a_futuristic,_abstract_3D_1758993474405.png';

export default function AdminDashboard() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoaded, setIsLoaded] = useState(false);
  const [backgroundFocusProgress, setBackgroundFocusProgress] = useState(0);
  const [showUsername, setShowUsername] = useState(false);
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
    if (!isLoaded) return;

    // Start background focus animation slightly before tiles finish
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

    return () => {
      // Cleanup all timers and animations
      if (timerRefs.current.start) clearTimeout(timerRefs.current.start);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isLoaded]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const menuItems = [
    // Line 1
    { id: 'pipeline', label: 'Pipeline', icon: LayoutDashboard, path: '/admin/pipeline' },
    { id: 'loan-prep', label: 'Loan Prep', icon: FileText, path: '/admin/loan-prep' },
    { id: 'quotes', label: 'Quotes', icon: Calculator, path: '/admin/quotes' },
    { id: 'stats', label: 'Stats', icon: BarChart3, path: '/admin/stats' },
    { id: 'search', label: 'Search', icon: Search, path: '/admin/search' },
    // Line 2
    { id: 'add-client', label: 'Add Client', icon: UserPlus, path: '/admin/add-client' },
    { id: 'add-comment', label: 'Add Comment', icon: MessageSquare, path: '/admin/add-comment' },
    { id: 'add-staff', label: 'Add Staff', icon: UserCheck, path: '/admin/add-staff' },
    { id: 'add-vendor', label: 'Add Vendor', icon: Building2, path: '/admin/add-vendor' },
    { id: 'add-partner', label: 'Add Partner', icon: Handshake, path: '/admin/add-partner' },
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

  const getTileHoverClass = (itemId: string, isSecondRow: boolean = false) => {
    const baseHoverClass = isSecondRow 
      ? 'border-l-4 border-l-blue-500 hover:border-blue-500'
      : 'border-l-4 border-l-green-500 hover:border-green-500';
    
    // Add shadow effects to all tiles
    return `${baseHoverClass} hover:shadow-lg hover:shadow-primary/20`;
  };

  return (
    <div 
      className="min-h-screen bg-background relative"
      style={{
        backgroundImage: `url(${futuristicGridBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Light overlay to maintain text readability */}
      <div className="absolute inset-0 bg-background/25" />
      
      {/* Progressive focus overlay - starts blurred at top, gradually reveals sharp background */}
      <div 
        className="absolute inset-0 transition-all duration-75 ease-out"
        style={{
          background: `linear-gradient(to bottom, 
            rgba(255, 255, 255, 0.3) 0%, 
            rgba(255, 255, 255, 0.1) ${Math.max(0, 60 - (backgroundFocusProgress * 60))}%, 
            transparent ${Math.max(0, 80 - (backgroundFocusProgress * 80))}%
          )`,
          backdropFilter: `blur(${Math.max(0, 8 - (backgroundFocusProgress * 8))}px)`,
          WebkitBackdropFilter: `blur(${Math.max(0, 8 - (backgroundFocusProgress * 8))}px)`,
          opacity: Math.max(0, 1 - backgroundFocusProgress),
          willChange: 'backdrop-filter, opacity'
        }}
      />
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-lg border-b transition-shadow duration-300 hover:shadow-2xl hover:shadow-primary/20 relative z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-black italic" style={{ fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif' }} data-testid="text-admin-header">
                PRIME RATE HOME LOANS
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
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-2" data-testid="text-dashboard-welcome">
            Dashboard
          </h2>
        </div>

        {/* Menu Grid - First Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {menuItems.slice(0, 5).map((item, index) => {
            const Icon = item.icon;
            return (
              <Card 
                key={item.id}
                className={`cursor-pointer transition-all duration-500 ${getTileHoverClass(item.id, false)} group ${
                  isLoaded 
                    ? 'transform scale-x-100 opacity-100' 
                    : 'transform scale-x-0 opacity-0'
                }`}
                style={{
                  transformOrigin: 'left',
                  transitionDelay: `${500 + (index * 150)}ms`
                }}
                onClick={() => handleMenuClick(item.path)}
                data-testid={`card-admin-${item.id}`}
              >
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                    <Icon className="h-6 w-6 text-primary transition-transform duration-300 group-hover:rotate-[360deg]" />
                  </div>
                  <CardTitle className="text-lg">{item.label}</CardTitle>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        {/* Menu Grid - Second Row with extra spacing */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-16">
          {menuItems.slice(5).map((item, index) => {
            const Icon = item.icon;
            return (
              <Card 
                key={item.id}
                className={`cursor-pointer transition-all duration-500 ${getTileHoverClass(item.id, true)} group ${
                  isLoaded 
                    ? 'transform scale-x-100 opacity-100' 
                    : 'transform scale-x-0 opacity-0'
                }`}
                style={{
                  transformOrigin: 'left',
                  transitionDelay: `${1250 + (index * 150)}ms`
                }}
                onClick={() => handleMenuClick(item.path)}
                data-testid={`card-admin-${item.id}`}
              >
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                    <Icon className="h-6 w-6 text-primary transition-transform duration-300 group-hover:rotate-[360deg]" />
                  </div>
                  <CardTitle className="text-lg">{item.label}</CardTitle>
                </CardHeader>
              </Card>
            );
          })}
        </div>

      </div>
    </div>
  );
}
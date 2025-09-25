import { useState, useEffect } from 'react';
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
import cubesBackground from '@assets/stock_images/abstract_geometric_c_b9135c5b.jpg';

export default function AdminDashboard() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();

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
        backgroundImage: `url(${cubesBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Faded overlay to make background subtle */}
      <div className="absolute inset-0 bg-background/85" />
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-lg border-b transition-shadow duration-300 hover:shadow-2xl hover:shadow-primary/20 relative z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-black italic" style={{ fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif' }} data-testid="text-admin-header">
                PRIME RATE HOME LOANS
              </h1>
              <Separator orientation="vertical" className="h-6 bg-primary-foreground/20" />
              <button 
                onClick={() => setLocation('/')}
                className="text-primary-foreground/80 hover:bg-orange-500 hover:text-white hover:border-orange-500 px-3 py-1 rounded cursor-pointer transition-colors"
                data-testid="button-back-to-website"
              >
                Back to Website
              </button>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span className="text-sm">polo.perry@yahoo.com</span>
              </div>
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
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8 relative z-10">
        <div className="mb-16 flex justify-center">
          {/* Wooden Plank Dashboard Sign */}
          <div 
            className="relative inline-block"
            style={{
              background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 25%, #CD853F 50%, #DEB887 75%, #F5DEB3 100%)',
              backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)`,
              padding: '24px 48px',
              borderRadius: '8px',
              boxShadow: `
                inset -15px -10px 25px rgba(0,0,0,0.3),
                inset 20px 8px 25px rgba(255,255,255,0.1),
                6px 4px 12px rgba(0,0,0,0.4),
                0 0 0 2px rgba(139, 69, 19, 0.8)
              `,
              border: '1px solid #654321'
            }}
            data-testid="text-dashboard-welcome"
          >
            {/* Screw in top-left */}
            <div 
              className="absolute -top-2 -left-2 w-4 h-4 rounded-full"
              style={{
                background: 'radial-gradient(circle, #C0C0C0 20%, #808080 50%, #404040 100%)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.3)'
              }}
            >
              <div className="absolute inset-1 flex items-center justify-center">
                <div className="w-1 h-3 bg-gray-600 rounded-full"></div>
                <div className="w-3 h-1 bg-gray-600 rounded-full absolute"></div>
              </div>
            </div>
            
            {/* Screw in top-right */}
            <div 
              className="absolute -top-2 -right-2 w-4 h-4 rounded-full"
              style={{
                background: 'radial-gradient(circle, #C0C0C0 20%, #808080 50%, #404040 100%)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.3)'
              }}
            >
              <div className="absolute inset-1 flex items-center justify-center">
                <div className="w-1 h-3 bg-gray-600 rounded-full"></div>
                <div className="w-3 h-1 bg-gray-600 rounded-full absolute"></div>
              </div>
            </div>
            
            {/* Engraved Dashboard Text */}
            <h2 
              className="text-4xl font-bold tracking-wider"
              style={{
                background: '#654321',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
                textShadow: '2px 4px 3px rgba(245, 245, 245, 0.4)',
                fontFamily: '"Georgia", serif',
                letterSpacing: '3px'
              }}
            >
              DASHBOARD
            </h2>
          </div>
        </div>

        {/* Menu Grid - First Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {menuItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            return (
              <Card 
                key={item.id}
                className={`cursor-pointer transition-all duration-200 ${getTileHoverClass(item.id, false)} group`}
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
          {menuItems.slice(5).map((item) => {
            const Icon = item.icon;
            return (
              <Card 
                key={item.id}
                className={`cursor-pointer transition-all duration-200 ${getTileHoverClass(item.id, true)} group`}
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
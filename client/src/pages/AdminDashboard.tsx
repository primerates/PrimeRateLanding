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

  const getTileHoverClass = (itemId: string) => {
    return 'hover:border-orange-500 hover:border-2';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-sm border-b">
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
      <div className="container mx-auto px-6 py-8">
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-2" data-testid="text-dashboard-welcome">
            Dashboard
          </h2>
        </div>

        {/* Menu Grid - First Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {menuItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            return (
              <Card 
                key={item.id}
                className={`cursor-pointer transition-all duration-200 ${getTileHoverClass(item.id)}`}
                onClick={() => handleMenuClick(item.path)}
                data-testid={`card-admin-${item.id}`}
              >
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                    <Icon className="h-6 w-6 text-primary" />
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
                className={`cursor-pointer transition-all duration-200 ${getTileHoverClass(item.id)}`}
                onClick={() => handleMenuClick(item.path)}
                data-testid={`card-admin-${item.id}`}
              >
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                    <Icon className="h-6 w-6 text-primary" />
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
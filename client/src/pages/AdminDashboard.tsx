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
  User
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export default function AdminDashboard() {
  const [location, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const menuItems = [
    { id: 'pipeline', label: 'Pipeline', icon: LayoutDashboard, path: '/admin/pipeline' },
    { id: 'loan-prep', label: 'Loan Prep', icon: FileText, path: '/admin/loan-prep' },
    { id: 'quotes', label: 'Quotes', icon: Calculator, path: '/admin/quotes' },
    { id: 'add-client', label: 'Add Client', icon: UserPlus, path: '/admin/add-client' },
    { id: 'add-comment', label: 'Add Comment', icon: MessageSquare, path: '/admin/add-comment' },
    { id: 'add-vendor', label: 'Add Vendor', icon: Building2, path: '/admin/add-vendor' },
    { id: 'search', label: 'Search', icon: Search, path: '/admin/search' },
  ];

  useEffect(() => {
    // Check if user is authenticated
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      const response = await apiRequest('GET', '/api/admin/verify');

      if (!response.ok) {
        toast({
          title: "Session Expired",
          description: "Please log in again to continue.",
          variant: "destructive",
        });
        setLocation('/admin/login');
        return;
      }
      setIsLoading(false);
    } catch (error) {
      toast({
        title: "Authentication Error",
        description: "Please log in again to continue.",
        variant: "destructive",
      });
      setLocation('/admin/login');
    }
  };

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

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
              <span className="text-primary-foreground/80">Admin Dashboard</span>
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
                className="text-primary-foreground hover:text-primary-foreground hover:bg-primary-foreground/10"
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
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2" data-testid="text-dashboard-welcome">
            Welcome to Admin Dashboard
          </h2>
          <p className="text-muted-foreground">
            Select an option below to manage your loan operations
          </p>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Card 
                key={item.id}
                className="hover-elevate cursor-pointer transition-all duration-200"
                onClick={() => handleMenuClick(item.path)}
                data-testid={`card-admin-${item.id}`}
              >
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{item.label}</CardTitle>
                </CardHeader>
                <CardContent className="text-center pt-0">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full"
                    data-testid={`button-admin-${item.id}`}
                  >
                    Access {item.label}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mt-12">
          <h3 className="text-xl font-semibold mb-6" data-testid="text-quick-actions">
            Quick Actions
          </h3>
          <div className="flex flex-wrap gap-4">
            <Button 
              onClick={() => setLocation('/admin/add-client')}
              className="bg-green-600 hover:bg-green-700"
              data-testid="button-quick-add-client"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add New Client
            </Button>
            <Button 
              onClick={() => setLocation('/admin/search')}
              variant="outline"
              data-testid="button-quick-search"
            >
              <Search className="h-4 w-4 mr-2" />
              Search Records
            </Button>
            <Button 
              onClick={() => setLocation('/')}
              variant="outline"
              data-testid="button-back-to-site"
            >
              ← Back to Website
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
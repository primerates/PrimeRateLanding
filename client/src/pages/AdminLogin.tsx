import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export default function AdminLogin() {
  const [location, setLocation] = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: boolean}>({});
  const { toast } = useToast();

  const validateForm = () => {
    const newErrors: {[key: string]: boolean} = {};
    
    if (!email.trim()) {
      newErrors.email = true;
    }
    if (!password.trim()) {
      newErrors.password = true;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await apiRequest('POST', '/api/admin/login', { email, password });

      if (response.ok) {
        toast({
          title: "Login Successful",
          description: "Welcome to the admin dashboard.",
        });
        setLocation('/admin/dashboard');
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid email or password.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = () => {
    toast({
      title: "Password Reset",
      description: "Password reset functionality is not yet implemented. Please contact support.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center p-6">
      <Card className="w-full max-w-md hover:shadow-2xl transition-shadow duration-300">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-black italic text-center" style={{ fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif' }}>
            PRIME RATE HOME LOANS
          </CardTitle>
          <p className="text-sm text-muted-foreground text-center">
            Admin Portal Access
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" data-testid="label-admin-email">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`transition-colors ${
                  errors.email 
                    ? 'border-red-500 focus:border-red-500' 
                    : email.trim() 
                      ? 'border-green-600 focus:border-green-600'
                      : ''
                }`}
                data-testid="input-admin-email"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" data-testid="label-admin-password">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`pr-10 transition-colors ${
                    errors.password 
                      ? 'border-red-500 focus:border-red-500' 
                      : password.trim() 
                        ? 'border-green-600 focus:border-green-600'
                        : ''
                  }`}
                  data-testid="input-admin-password"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  data-testid="button-toggle-password"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="ghost"
                className="px-0 text-primary hover:bg-transparent"
                onClick={handleForgotPassword}
                data-testid="button-forgot-password"
              >
                Forgot password?
              </Button>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90"
              disabled={isSubmitting}
              data-testid="button-admin-login"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Button
              variant="ghost"
              onClick={() => setLocation('/')}
              className="text-muted-foreground hover:bg-transparent"
              data-testid="button-back-to-home"
            >
              ← Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
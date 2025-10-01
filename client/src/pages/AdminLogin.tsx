import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useBackground } from '@/contexts/BackgroundContext';
import threeGlowingCubesBackground from '@assets/Three Glowing Cubes_1759260151137.png';

export default function AdminLogin() {
  const [location, setLocation] = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: boolean}>({});
  const { toast } = useToast();
  const { getCurrentPreset } = useBackground();

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
    <div className="min-h-screen flex">
      {/* Left Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Logo/Title */}
          <div className="space-y-2">
            <h1 className="text-3xl font-black italic tracking-tight" style={{ fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif' }}>
              PRIME RATE
            </h1>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-base" data-testid="label-admin-email">
                Username
              </Label>
              <Input
                id="email"
                type="email"
                placeholder=""
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`h-12 text-base transition-colors border-0 border-b-2 rounded-none px-0 focus-visible:ring-0 ${
                  errors.email 
                    ? 'border-b-red-500' 
                    : email.trim() 
                      ? 'border-b-green-600'
                      : 'border-b-border'
                }`}
                data-testid="input-admin-email"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-base" data-testid="label-admin-password">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder=""
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`h-12 text-base pr-10 transition-colors border-0 border-b-2 rounded-none px-0 focus-visible:ring-0 ${
                    errors.password 
                      ? 'border-b-red-500' 
                      : password.trim() 
                        ? 'border-b-green-600'
                        : 'border-b-border'
                  }`}
                  data-testid="input-admin-password"
                  required
                />
                <button
                  type="button"
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-2 rounded hover-elevate active-elevate-2 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  data-testid="button-toggle-password"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <Eye className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <Button
                type="button"
                variant="ghost"
                className="px-0 h-auto text-primary hover:bg-transparent"
                onClick={handleForgotPassword}
                data-testid="button-forgot-password"
              >
                Forgot Password?
              </Button>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base bg-primary hover:bg-primary/90"
              disabled={isSubmitting}
              data-testid="button-admin-login"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          {/* Back to Home */}
          <div className="pt-4">
            <Button
              variant="ghost"
              onClick={() => setLocation('/')}
              className="text-muted-foreground px-0 hover:bg-transparent"
              data-testid="button-back-to-home"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </div>
        </div>
      </div>

      {/* Right Side - Background Artwork */}
      <div 
        className="hidden lg:block lg:w-1/2 relative bg-white bg-cover bg-center"
        style={{
          backgroundImage: `url(${threeGlowingCubesBackground})`,
          backgroundSize: '50%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
      </div>
    </div>
  );
}

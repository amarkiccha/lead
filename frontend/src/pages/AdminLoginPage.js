import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

const AdminLoginPage = () => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate slight delay for UX
    await new Promise(resolve => setTimeout(resolve, 500));

    const success = login(password);
    
    if (success) {
      toast.success('Login successful', {
        description: 'Redirecting to dashboard...'
      });
      navigate('/admin/dashboard');
    } else {
      toast.error('Invalid password', {
        description: 'Please check your password and try again.'
      });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex" data-testid="admin-login-page">
      {/* Left Side - Image */}
      <div 
        className="hidden lg:flex lg:w-1/2 login-image-side relative overflow-hidden"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1665760670979-708eb9626d73?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2Mzl8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhcmNoaXRlY3R1cmFsJTIwZGV0YWlsJTIwd2FybSUyMGJlaWdlfGVufDB8fHx8MTc3MjAxNTA2OXww&ixlib=rb-4.1.0&q=85)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-primary/80"></div>
        <div className="relative z-10 flex flex-col justify-between p-12 text-primary-foreground">
          <div>
            <h2 className="font-heading text-4xl font-bold">Propz CRM</h2>
            <p className="mt-2 font-body text-primary-foreground/80">Lead Management System</p>
          </div>
          <div>
            <p className="font-body text-sm text-primary-foreground/70">
              Streamline your lead tracking with precision and elegance.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col bg-background">
        {/* Back Link */}
        <div className="p-6">
          <Link 
            to="/"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors font-body"
            data-testid="back-to-leads-link"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Leads
          </Link>
        </div>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center px-8 sm:px-16">
          <div className="w-full max-w-md animate-fade-in-up">
            {/* Header */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 mb-6">
                <Lock className="w-8 h-8 text-primary" strokeWidth={1.5} />
              </div>
              <h1 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">
                Admin Login
              </h1>
              <p className="mt-3 text-muted-foreground font-body">
                Enter your password to access the dashboard
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-2">
                <Label 
                  htmlFor="password" 
                  className="font-body uppercase tracking-widest text-xs font-semibold text-primary/70"
                >
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password"
                    className="input-underline pr-10 font-body"
                    required
                    data-testid="password-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-primary transition-colors"
                    data-testid="toggle-password-visibility"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading || !password}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 btn-primary-sharp py-6"
                data-testid="login-submit-btn"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent animate-spin rounded-full"></div>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            {/* Mobile branding */}
            <div className="lg:hidden mt-12 text-center">
              <h2 className="font-heading text-xl font-bold text-primary">Propz CRM</h2>
              <p className="mt-1 font-body text-sm text-muted-foreground">Lead Management System</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 text-center">
          <p className="text-xs text-muted-foreground font-body">
            Secure admin access only
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;

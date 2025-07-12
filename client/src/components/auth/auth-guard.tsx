import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { authService } from '@/lib/auth';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const user = await authService.getCurrentUser();
          if (user) {
            setIsAuthenticated(true);
          } else {
            setLocation('/login');
          }
        } else {
          setLocation('/login');
        }
      } catch (error) {
        setLocation('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

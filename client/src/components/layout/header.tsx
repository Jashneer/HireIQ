import { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { Bot, ChevronDown, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { authService } from '@/lib/auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { User } from '@shared/schema';

export function Header() {
  const [user, setUser] = useState<Omit<User, 'password'> | null>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const handleLogout = () => {
    authService.logout();
    setLocation('/login');
  };

  if (!user) return null;

  const getUsageLimit = () => {
    const limits = { free: 3, starter: 50, pro: 'unlimited' };
    return limits[user.plan as keyof typeof limits] || limits.free;
  };

  const getPlanColor = () => {
    switch (user.plan) {
      case 'starter': return 'bg-blue-500';
      case 'pro': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Bot className="h-8 w-8 text-primary mr-2" />
              <span className="text-xl font-bold text-slate-900">HireIQ</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-600">Plan:</span>
              <Badge className={`${getPlanColor()} text-white text-xs font-medium`}>
                {user.plan.charAt(0).toUpperCase() + user.plan.slice(1)}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-600">Usage:</span>
              <span className="text-sm font-medium text-slate-900">
                {user.usageCount}/{getUsageLimit()}
              </span>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={`https://avatar.vercel.sh/${user.email}`} />
                    <AvatarFallback>
                      {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-slate-900">
                    {user.firstName} {user.lastName}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center w-full">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}

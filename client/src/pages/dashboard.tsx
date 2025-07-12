import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, Download, History, TrendingUp } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { AnalysisForm } from '@/components/dashboard/analysis-form';
import { AnalysisResults } from '@/components/dashboard/analysis-results';
import { RecentAnalyses } from '@/components/dashboard/recent-analyses';
import { UpgradeModal } from '@/components/dashboard/upgrade-modal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/lib/auth';
import type { Analysis } from '@shared/schema';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [currentAnalysis, setCurrentAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const { toast } = useToast();

  // Fetch user stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/stats'],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      return data.stats;
    },
  });

  // Fetch recent analyses
  const { data: analyses, isLoading: analysesLoading, refetch: refetchAnalyses } = useQuery({
    queryKey: ['/api/analyses'],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/analyses?limit=5', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch analyses');
      const data = await response.json();
      return data.analyses;
    },
  });

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const handleAnalysisComplete = (result: any) => {
    setCurrentAnalysis(result);
    setIsAnalyzing(false);
    refetchAnalyses();
  };

  const handleAnalysisStart = () => {
    setIsAnalyzing(true);
    setCurrentAnalysis(null);
  };

  const handleViewDetails = (analysis: Analysis) => {
    setCurrentAnalysis({
      id: analysis.id,
      overallScore: analysis.matchScore,
      technicalScore: analysis.technicalScore,
      experienceScore: analysis.experienceScore,
      domainScore: analysis.domainScore,
      matchingSkills: analysis.matchingSkills,
      missingSkills: analysis.missingSkills,
      outreachMessage: analysis.outreachMessage,
      improvementSuggestions: analysis.improvementSuggestions,
      timestamp: analysis.createdAt.toISOString(),
    });
  };

  const quickActions = [
    {
      icon: FileText,
      label: 'Load Sample Data',
      onClick: () => {
        // This will be handled by the AnalysisForm component
        toast({
          title: "Sample data",
          description: "Click 'Load Sample Data' in the analysis form below",
        });
      },
    },
    {
      icon: History,
      label: 'View Analysis History',
      onClick: () => {
        // Scroll to recent analyses section
        document.getElementById('recent-analyses')?.scrollIntoView({ behavior: 'smooth' });
      },
    },
    {
      icon: Download,
      label: 'Export Results',
      onClick: () => {
        toast({
          title: "Export feature",
          description: "Export functionality coming soon!",
        });
      },
    },
  ];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Welcome back, {user.firstName}!
          </h1>
          <p className="text-slate-600 mb-6">
            Analyze resumes and generate personalized outreach messages with AI.
          </p>
          
          {/* Stats Cards */}
          {!statsLoading && stats && <StatsCards stats={stats} />}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Analysis Form */}
          <div className="lg:col-span-2">
            <AnalysisForm
              onAnalysisComplete={handleAnalysisComplete}
              isLoading={isAnalyzing}
            />
          </div>
          
          {/* Quick Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {quickActions.map((action, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={action.onClick}
                    >
                      <action.icon className="h-4 w-4 mr-3" />
                      {action.label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Upgrade CTA */}
            <Card className="bg-gradient-to-r from-primary to-secondary text-white">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2">Upgrade to Pro</h3>
                <p className="text-sm opacity-90 mb-4">
                  Unlock unlimited analyses and advanced features.
                </p>
                <Button
                  variant="secondary"
                  onClick={() => setShowUpgradeModal(true)}
                  className="bg-white text-primary hover:bg-slate-50"
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Upgrade Now
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Analysis Results */}
        {currentAnalysis && (
          <AnalysisResults results={currentAnalysis} />
        )}
        
        {/* Recent Analyses */}
        <div id="recent-analyses" className="mt-8">
          {!analysesLoading && analyses && (
            <RecentAnalyses
              analyses={analyses}
              onViewDetails={handleViewDetails}
            />
          )}
        </div>
      </div>
      
      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentPlan={user.plan}
      />
    </div>
  );
}

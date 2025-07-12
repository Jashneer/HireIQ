import { Eye, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import type { Analysis } from '@shared/schema';

interface RecentAnalysesProps {
  analyses: Analysis[];
  onViewDetails: (analysis: Analysis) => void;
}

export function RecentAnalyses({ analyses, onViewDetails }: RecentAnalysesProps) {
  const { toast } = useToast();

  const copyOutreach = async (outreachMessage: string) => {
    try {
      await navigator.clipboard.writeText(outreachMessage);
      toast({
        title: "Copied!",
        description: "Outreach message copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'High';
    if (score >= 60) return 'Medium';
    return 'Low';
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return date.toLocaleDateString();
  };

  if (analyses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Analyses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-slate-500">No analyses yet. Create your first analysis above!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Analyses</CardTitle>
          <Button variant="ghost" size="sm">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium text-slate-700">Candidate</th>
                <th className="text-left py-3 px-4 font-medium text-slate-700">Position</th>
                <th className="text-left py-3 px-4 font-medium text-slate-700">Company</th>
                <th className="text-left py-3 px-4 font-medium text-slate-700">Match Score</th>
                <th className="text-left py-3 px-4 font-medium text-slate-700">Date</th>
                <th className="text-left py-3 px-4 font-medium text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {analyses.map((analysis) => (
                <tr key={analysis.id} className="border-b table-row">
                  <td className="py-4 px-4">
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 mr-3">
                        <AvatarImage 
                          src={analysis.candidateEmail ? `https://avatar.vercel.sh/${analysis.candidateEmail}` : undefined}
                        />
                        <AvatarFallback>
                          {analysis.candidateName 
                            ? analysis.candidateName.split(' ').map(n => n[0]).join('').substring(0, 2)
                            : 'C'
                          }
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm font-medium text-slate-900">
                          {analysis.candidateName || 'Anonymous'}
                        </div>
                        <div className="text-sm text-slate-500">
                          {analysis.candidateEmail || 'No email'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm text-slate-900">
                    {analysis.jobTitle}
                  </td>
                  <td className="py-4 px-4 text-sm text-slate-900">
                    {analysis.companyName}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-slate-900 mr-2">
                        {analysis.matchScore}%
                      </span>
                      <Badge className={getScoreColor(analysis.matchScore)}>
                        {getScoreLabel(analysis.matchScore)}
                      </Badge>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm text-slate-500">
                    {formatDate(analysis.createdAt)}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewDetails(analysis)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyOutreach(analysis.outreachMessage)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

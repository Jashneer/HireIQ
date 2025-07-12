import { useState } from 'react';
import { Copy, CheckCircle, Lightbulb, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

interface AnalysisResultsProps {
  results: {
    id: number;
    overallScore: number;
    technicalScore: number;
    experienceScore: number;
    domainScore: number;
    matchingSkills: string[];
    missingSkills: string[];
    outreachMessage: string;
    improvementSuggestions: string[];
    timestamp: string;
  };
}

export function AnalysisResults({ results }: AnalysisResultsProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(results.outreachMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'High';
    if (score >= 60) return 'Medium';
    return 'Low';
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card className="mt-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Analysis Results</CardTitle>
          <div className="flex items-center space-x-2 text-sm text-slate-600">
            <Clock className="h-4 w-4" />
            <span>Analyzed: {formatTimestamp(results.timestamp)}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Match Score Section */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Match Score</h3>
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-slate-900">Overall Match</span>
                  <span className={`text-2xl font-bold ${getScoreColor(results.overallScore)}`}>
                    {results.overallScore}%
                  </span>
                </div>
                <Progress value={results.overallScore} className="h-3" />
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-700">Technical Skills</span>
                  <span className={`font-medium ${getScoreColor(results.technicalScore)}`}>
                    {results.technicalScore}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-700">Experience Level</span>
                  <span className={`font-medium ${getScoreColor(results.experienceScore)}`}>
                    {results.experienceScore}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-700">Domain Relevance</span>
                  <span className={`font-medium ${getScoreColor(results.domainScore)}`}>
                    {results.domainScore}%
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <h4 className="font-medium text-slate-900 mb-3">Skills Analysis</h4>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-slate-600 mb-2">Matching Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {results.matchingSkills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="skill-badge-matching">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-2">Missing Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {results.missingSkills.map((skill, index) => (
                      <Badge key={index} variant="destructive" className="skill-badge-missing">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Outreach Message Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Personalized Outreach</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                className="flex items-center space-x-2"
              >
                {copied ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span>Copy Message</span>
                  </>
                )}
              </Button>
            </div>
            
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                {results.outreachMessage}
              </p>
            </div>
            
            {results.improvementSuggestions.length > 0 && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Improvement Suggestions
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  {results.improvementSuggestions.map((suggestion, index) => (
                    <li key={index}>• {suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

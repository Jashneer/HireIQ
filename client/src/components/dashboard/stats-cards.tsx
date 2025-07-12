import { TrendingUp, Target, Mail, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface StatsCardsProps {
  stats: {
    monthlyAnalyses: number;
    avgMatchScore: number;
    messagesGenerated: number;
    activeCandidates: number;
  };
}

export function StatsCards({ stats }: StatsCardsProps) {
  const statCards = [
    {
      title: 'Analyses This Month',
      value: stats.monthlyAnalyses,
      icon: TrendingUp,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Avg. Match Score',
      value: `${stats.avgMatchScore}%`,
      icon: Target,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
    },
    {
      title: 'Messages Generated',
      value: stats.messagesGenerated,
      icon: Mail,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      title: 'Active Candidates',
      value: stats.activeCandidates,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat, index) => (
        <Card key={index} className="stats-card">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className={`p-3 ${stat.bgColor} rounded-lg`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm text-slate-600">{stat.title}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

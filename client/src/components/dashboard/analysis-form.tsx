import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { FileUpload } from '@/components/ui/file-upload';
import { useToast } from '@/hooks/use-toast';
import { analysisRequestSchema, type AnalysisRequest } from '@shared/schema';

interface AnalysisFormProps {
  onAnalysisComplete: (result: any) => void;
  isLoading: boolean;
}

export function AnalysisForm({ onAnalysisComplete, isLoading }: AnalysisFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const form = useForm<AnalysisRequest>({
    resolver: zodResolver(analysisRequestSchema),
    defaultValues: {
      companyName: '',
      jobTitle: '',
      jobDescription: '',
      resumeText: '',
      outreachTone: 'professional',
      candidateName: '',
      candidateEmail: '',
    },
  });

  const handleSubmit = async (data: AnalysisRequest) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast({
          title: "Authentication required",
          description: "Please login to continue",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Analysis failed');
      }

      const result = await response.json();
      onAnalysisComplete(result.analysis);
      
      toast({
        title: "Analysis completed!",
        description: "Your resume analysis is ready.",
      });
    } catch (error: any) {
      toast({
        title: "Analysis failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file);
    if (file) {
      toast({
        title: "PDF upload not supported yet",
        description: "Please copy and paste the resume text manually",
        variant: "destructive",
      });
    }
  };

  const loadSampleData = () => {
    form.setValue('companyName', 'Google');
    form.setValue('jobTitle', 'Senior Software Engineer');
    form.setValue('jobDescription', `We are looking for a Senior Software Engineer to join our team. 

Key Requirements:
- 5+ years of experience in full-stack development
- Strong expertise in React, Node.js, and Python
- Experience with cloud platforms (AWS, GCP)
- Knowledge of containerization (Docker, Kubernetes)
- Experience with CI/CD pipelines
- Strong problem-solving skills
- Excellent communication and teamwork abilities

Responsibilities:
- Design and develop scalable web applications
- Collaborate with cross-functional teams
- Mentor junior developers
- Participate in code reviews
- Drive technical decisions and architecture`);
    form.setValue('resumeText', `John Doe
Senior Software Engineer

Experience:
• 6 years of full-stack development experience
• Expert in React, Node.js, and Python
• 3 years of experience with AWS services
• Built and deployed multiple web applications
• Led development teams of 3-5 developers
• Experience with agile methodologies

Technical Skills:
• Frontend: React, TypeScript, JavaScript, HTML, CSS
• Backend: Node.js, Python, Express.js, FastAPI
• Databases: PostgreSQL, MongoDB, Redis
• Cloud: AWS (EC2, S3, Lambda, RDS)
• Tools: Git, Docker, Jenkins, Jira

Education:
• Bachelor's in Computer Science from Stanford University

Recent Projects:
• E-commerce platform serving 100k+ users
• Real-time chat application with WebSocket
• Microservices architecture with Docker deployment`);
    form.setValue('candidateName', 'John Doe');
    form.setValue('candidateEmail', 'john.doe@email.com');
    form.setValue('outreachTone', 'professional');
    
    toast({
      title: "Sample data loaded",
      description: "You can now analyze this sample resume",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Sparkles className="h-5 w-5 text-primary mr-2" />
          New Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Google" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="jobTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Senior Software Engineer" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="candidateName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Candidate Name (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="candidateEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Candidate Email (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., john@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="resumeText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resume Text</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={8}
                      placeholder="Paste the resume text here..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Resume Upload (Coming Soon)
              </label>
              <FileUpload
                onFileSelect={handleFileSelect}
                accept=".pdf"
                maxSize={5 * 1024 * 1024}
              />
            </div>

            <FormField
              control={form.control}
              name="jobDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Description</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={6}
                      placeholder="Paste the complete job description here..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="outreachTone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Outreach Tone</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select tone" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                      <SelectItem value="direct">Direct</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                type="submit"
                className="flex-1"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Analyze Resume & Generate Outreach
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={loadSampleData}
                disabled={isLoading}
              >
                Load Sample Data
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

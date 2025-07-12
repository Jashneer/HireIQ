import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Settings as SettingsIcon } from 'lucide-react';
import { Link } from 'wouter';

export default function Settings() {
  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <SettingsIcon className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
              <p className="text-slate-600 mt-1">Manage your account preferences and settings</p>
            </div>
          </div>
        </div>

        {/* Settings Content */}
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Coming Soon!</CardTitle>
              <CardDescription>
                We're working on bringing you comprehensive settings to customize your HireIQ experience.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-900 mb-2">Upcoming Features</h3>
                  <ul className="text-blue-800 space-y-1 text-sm">
                    <li>• Profile management and avatar upload</li>
                    <li>• Notification preferences</li>
                    <li>• Default analysis settings</li>
                    <li>• API integrations</li>
                    <li>• Export and data management</li>
                  </ul>
                </div>
                
                <div className="flex gap-3">
                  <Link href="/dashboard">
                    <Button>Return to Dashboard</Button>
                  </Link>
                  <Button variant="outline" disabled>
                    Request a Feature
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Info Cards */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Account Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Plan</span>
                    <span className="font-medium">Free</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Daily Analyses</span>
                    <span className="font-medium">3 remaining</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 text-sm mb-3">
                  Need help? We're here to assist you with any questions about HireIQ.
                </p>
                <Button variant="outline" size="sm" disabled>
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
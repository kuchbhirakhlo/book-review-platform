'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface EnvVar {
  key: string;
  isSet: boolean;
}

export default function SetupPage() {
  const [envVars, setEnvVars] = useState<EnvVar[]>([]);
  const [allReady, setAllReady] = useState(false);

  useEffect(() => {
    // Check which env vars are set (this is client-side, so we're just checking if the app initialized)
    const vars: EnvVar[] = [
      { key: 'NEXT_PUBLIC_FIREBASE_API_KEY', isSet: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY },
      { key: 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', isSet: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN },
      { key: 'NEXT_PUBLIC_FIREBASE_PROJECT_ID', isSet: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID },
      { key: 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET', isSet: !!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET },
      { key: 'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID', isSet: !!process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID },
      { key: 'NEXT_PUBLIC_FIREBASE_APP_ID', isSet: !!process.env.NEXT_PUBLIC_FIREBASE_APP_ID },
    ];

    setEnvVars(vars);
    setAllReady(vars.every((v) => v.isSet));
  }, []);

  if (allReady) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="w-16 h-16 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">All Set!</h1>
          <p className="text-muted-foreground mb-6">Your Firebase environment variables are configured correctly.</p>
          <Button asChild className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
            <a href="/">Go to Home</a>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <AlertCircle className="w-6 h-6 text-amber-600" />
          <h1 className="text-2xl font-bold text-foreground">Setup Required</h1>
        </div>

        <p className="text-muted-foreground mb-6">
          To run the Literary Reviews platform, you need to configure your Firebase environment variables. Follow these steps:
        </p>

        <div className="space-y-4 mb-8">
          <h2 className="font-semibold text-foreground">1. Create a Firebase Project</h2>
          <ol className="list-decimal list-inside text-muted-foreground space-y-2 ml-2">
            <li>Go to <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Firebase Console</a></li>
            <li>Click "Create a new project" or select an existing one</li>
            <li>Enable Authentication (Email/Password and Google)</li>
            <li>Create a Firestore database</li>
            <li>Enable Cloud Storage</li>
          </ol>

          <h2 className="font-semibold text-foreground mt-6">2. Get Your Configuration</h2>
          <ol className="list-decimal list-inside text-muted-foreground space-y-2 ml-2">
            <li>In Firebase Console, go to Project Settings</li>
            <li>Scroll to "Your apps" section and click the web app (&lt;&gt; icon)</li>
            <li>Copy your Firebase configuration</li>
          </ol>

          <h2 className="font-semibold text-foreground mt-6">3. Add Environment Variables</h2>
          <p className="text-muted-foreground mb-3">
            Click "Vars" in the left sidebar to add these environment variables:
          </p>

          <div className="space-y-2">
            {[
              'NEXT_PUBLIC_FIREBASE_API_KEY',
              'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
              'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
              'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
              'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
              'NEXT_PUBLIC_FIREBASE_APP_ID',
            ].map((key) => (
              <div
                key={key}
                className="flex items-center gap-2 p-3 rounded-lg bg-muted text-sm font-mono"
              >
                <div className="text-muted-foreground">•</div>
                <code>{key}</code>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-muted p-4 rounded-lg mb-6">
          <h3 className="font-semibold text-foreground mb-2">Environment Variables Status</h3>
          <div className="space-y-2">
            {envVars.map((env) => (
              <div key={env.key} className="flex items-center gap-2 text-sm">
                <div className={`w-2 h-2 rounded-full ${env.isSet ? 'bg-green-600' : 'bg-red-600'}`} />
                <span className={env.isSet ? 'text-green-600' : 'text-red-600'}>
                  {env.key}
                </span>
              </div>
            ))}
          </div>
        </div>

        <Button asChild className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
          <a href="/">Refresh & Go Home</a>
        </Button>
      </Card>
    </div>
  );
}

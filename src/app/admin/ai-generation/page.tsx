'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Square, RefreshCw, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AIGenerationPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'unknown' | 'running' | 'stopped'>('unknown');
  const { toast } = useToast();

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/ai/background?action=stats');
      const data = await response.json();
      if (data.stats) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchStats();
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleStart = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/background', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start', intervalMinutes: 30 }),
      });
      const data = await response.json();
      if (response.ok) {
        setStatus('running');
        toast({
          title: 'Background generation started',
          description: 'AI will now generate conspiracy theories every 30 minutes',
        });
        fetchStats();
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to start generation',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to start generation',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/background', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'stop' }),
      });
      const data = await response.json();
      if (response.ok) {
        setStatus('stopped');
        toast({
          title: 'Background generation stopped',
        });
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to stop generation',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to stop generation',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTrigger = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/background', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'trigger' }),
      });
      const data = await response.json();
      if (response.ok) {
        toast({
          title: data.success ? 'Generation triggered' : 'Generation skipped',
          description: data.message,
        });
        fetchStats();
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to trigger generation',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to trigger generation',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-4xl font-headline font-bold mb-6">AI Generation Control</h1>
        
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Background Generation</CardTitle>
              <CardDescription>
                Automatically generate conspiracy theories continuously
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Button 
                  onClick={handleStart} 
                  disabled={loading || status === 'running'}
                  className="flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Start (Every 30 min)
                </Button>
                <Button 
                  onClick={handleStop} 
                  disabled={loading || status === 'stopped'}
                  variant="destructive"
                  className="flex items-center gap-2"
                >
                  <Square className="w-4 h-4" />
                  Stop
                </Button>
                <Button 
                  onClick={handleTrigger} 
                  disabled={loading}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Generate Now
                </Button>
              </div>
              
              {status !== 'unknown' && (
                <Badge variant={status === 'running' ? 'default' : 'secondary'}>
                  Status: {status === 'running' ? 'Running' : 'Stopped'}
                </Badge>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Generated</p>
                      <p className="text-2xl font-bold">{stats.totalGenerated || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Errors</p>
                      <p className="text-2xl font-bold text-destructive">{stats.errors || 0}</p>
                    </div>
                  </div>
                  {stats.lastGeneration && (
                    <div>
                      <p className="text-sm text-muted-foreground">Last Generation</p>
                      <p className="text-lg">
                        {new Date(stats.lastGeneration).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">No statistics available</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}



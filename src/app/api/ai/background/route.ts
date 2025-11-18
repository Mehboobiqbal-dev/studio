import { NextRequest, NextResponse } from 'next/server';
import { 
  startBackgroundGeneration, 
  stopBackgroundGeneration, 
  getGenerationStats,
  triggerGeneration 
} from '@/lib/ai/background-generator';

// API route to manage background AI generation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { action, intervalMinutes } = body;

    switch (action) {
      case 'start':
        const interval = intervalMinutes || 30; // Default 30 minutes
        startBackgroundGeneration(interval);
        return NextResponse.json({
          message: `Background generation started (every ${interval} minutes)`,
          status: 'running',
        });

      case 'stop':
        stopBackgroundGeneration();
        return NextResponse.json({
          message: 'Background generation stopped',
          status: 'stopped',
        });

      case 'trigger':
        const success = await triggerGeneration();
        return NextResponse.json({
          message: success ? 'Generation triggered successfully' : 'Generation skipped (already running or no topics)',
          success,
        });

      case 'stats':
        const stats = getGenerationStats();
        return NextResponse.json({
          stats,
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: start, stop, trigger, or stats' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('Error in background generation API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    if (action === 'stats') {
      const stats = getGenerationStats();
      return NextResponse.json({ stats });
    }
    
    const stats = getGenerationStats();
    return NextResponse.json({
      stats,
      message: 'Use POST with action: start, stop, trigger, or GET ?action=stats',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}


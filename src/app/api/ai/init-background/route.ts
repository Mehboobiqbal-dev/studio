import { NextRequest, NextResponse } from 'next/server';
import { startBackgroundGeneration } from '@/lib/ai/background-generator';

/**
 * Initialize background generation on server startup
 * This endpoint should be called when the server starts
 * You can call it from a startup script or use a service like Vercel Cron
 */
export async function GET(request: NextRequest) {
  try {
    // Verify it's an authorized request (optional - can be removed for internal use)
    const authHeader = request.headers.get('authorization');
    const apiKey = process.env.AI_GENERATION_API_KEY;
    
    if (apiKey && authHeader !== `Bearer ${apiKey}`) {
      // If API key is set, require it. Otherwise allow unauthenticated (for internal use)
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Start background generation (every 30 minutes by default)
    const intervalMinutes = 30;
    startBackgroundGeneration(intervalMinutes);

    return NextResponse.json({
      message: `Background AI generation initialized (every ${intervalMinutes} minutes)`,
      status: 'started',
      intervalMinutes,
    });
  } catch (error: any) {
    console.error('Error initializing background generation:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}




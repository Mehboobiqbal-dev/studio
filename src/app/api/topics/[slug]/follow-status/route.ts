import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/db/mongodb';
import { Topic } from '@/lib/models/topic';
import { UserStats } from '@/lib/models/user-activity';
import { verifyAccessToken } from '@/lib/auth/jwt';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const authHeader = request.headers.get('authorization');
    const cookieToken = request.cookies.get('accessToken')?.value;
    
    let following = false;
    let userId = null;

    // Check if user is authenticated
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.substring(7)
      : cookieToken;

    if (token) {
      try {
        const payload = verifyAccessToken(token);
        userId = payload.userId;
      } catch (error) {
        // User not authenticated
      }
    }

    if (!userId) {
      return NextResponse.json({ following: false });
    }

    const topicsCollection = await getCollection<Topic>('topics');
    const topic = await topicsCollection.findOne({ slug });

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic not found' },
        { status: 404 }
      );
    }

    const statsCollection = await getCollection<UserStats>('user_stats');
    const userStats = await statsCollection.findOne({ userId: userId as any });

    if (userStats) {
      following = userStats.followedTopics.some(
        (id) => id.toString() === topic._id?.toString()
      );
    }

    return NextResponse.json({ following });
  } catch (error) {
    console.error('Error checking follow status:', error);
    return NextResponse.json({ following: false });
  }
}

